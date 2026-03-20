import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { users, type User } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import sgMail from "@sendgrid/mail";

const scryptAsync = promisify(scrypt);

// ✅ Configurar SendGrid UNA SOLA VEZ
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY no configurada");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Helper to safely return user data without password
const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

// No fallar el endpoint - la contraseña temporal ya está en BD

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const PostgresStore = connectPg(session);
  const sessionStore = new PostgresStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "sessions",
  });

  const isProduction = process.env.NODE_ENV === "production";

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "helpdesk-secret-dev",
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
      cookie: {
        maxAge: sessionTtl,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        httpOnly: true,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username));
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, (user as User).id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res) => {
    const { username, password, firstName, lastName, email, company, adminCode } =
      req.body;

    // Registration codes: different codes for different roles
    const ADMIN_CODES = [
      process.env.ADMIN_REGISTRATION_CODE || "DESK2026",
      process.env.ADMIN_REGISTRATION_CODE_2 || "HELPDESK2026",
    ];
    const ANALYST_CODES = [
      process.env.ANALYST_REGISTRATION_CODE || "ANALYST2026",
    ];

    // Check if a code was provided (cannot register without one)
    if (!adminCode) {
      return res
        .status(400)
        .json({ message: "Se requiere código de registro" });
    }

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashedPassword = await hashPassword(password);
    // Assign role based on code: admin > analyst > usuario
    let role = "usuario";
    if (ADMIN_CODES.includes(adminCode)) {
      role = "admin";
    } else if (ANALYST_CODES.includes(adminCode)) {
      role = "analista";
    }
    const [user] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        company,
        role,
      })
      .returning();

    req.login(user, (err) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Error al iniciar sesión después del registro" });
      res.status(201).json(sanitizeUser(user));
    });
  });

  app.post(
    "/api/login",
    passport.authenticate("local", { failureMessage: true }),
    (req, res) => {
      if (!req.user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      const user = req.user as User;
      const safeUser = sanitizeUser(user);
      // Include mustChangePassword flag in response so frontend can force password change
      res.json({
        ...safeUser,
        mustChangePassword: user.mustChangePassword === "true",
      });
    },
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err)
        return res.status(500).json({ message: "Error al cerrar sesión" });
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as User;
    const safeUser = sanitizeUser(user);
    res.json({
      ...safeUser,
      mustChangePassword: user.mustChangePassword === "true",
    });
  });

  // One-time endpoint: promote current user to admin using DESK2026 code
  app.post("/api/auth/promote-admin", async (req, res) => {
    if (!req.isAuthenticated())
      return res.status(401).json({ message: "No autorizado" });
    const { code } = req.body;
    const VALID_ADMIN_CODE = process.env.ADMIN_REGISTRATION_CODE || "DESK2026";
    if (code !== VALID_ADMIN_CODE) {
      return res.status(403).json({ message: "Código inválido" });
    }
    const userId = (req.user as User).id;
    const [updated] = await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId))
      .returning();
    res.json(sanitizeUser(updated));
  });

  // Forgot password: send temporary password to email
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Se requiere correo" });
      }

      console.log("🔐 Password reset solicitado para:", email);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return res.status(200).json({
          message: "Si el correo existe, recibirá una contraseña temporal",
        });
      }

      const temporaryPassword = Math.random()
        .toString(36)
        .slice(2, 12)
        .toUpperCase();

      const hashedPassword = await hashPassword(temporaryPassword);

      await db
        .update(users)
        .set({ password: hashedPassword, mustChangePassword: "true" })
        .where(eq(users.id, user.id));

      console.log("📧 Enviando correo a:", email);

      await sgMail.send({
        to: email,
        from: "habeasdata@protosas.co",
        subject: "Recuperación de contraseña - IT Helpdesk",
        text: `Tu contraseña temporal es: ${temporaryPassword}`,
        html: `
          <div style="font-family: Arial;">
            <h2>🔐 Recuperación de contraseña</h2>
            <p>Tu contraseña temporal es:</p>
            <h3>${temporaryPassword}</h3>
            <p>Debes cambiarla al iniciar sesión.</p>
          </div>
        `,
      });

      console.log("✅ EMAIL ENVIADO");

      res.json({
        message: "Si el correo existe, recibirá una contraseña temporal",
      });
    } catch (err: any) {
      console.error("❌ ERROR forgot-password:", err.response?.body || err);

      res.status(500).json({ message: "Error procesando solicitud" });
    }
  });

  // Change password
  app.post("/api/auth/change-password", async (req, res) => {
    try {
      if (!req.isAuthenticated())
        return res.status(401).json({ message: "No autorizado" });

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Se requieren ambas contraseñas" });
      }

      const userId = (req.user as User).id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res
          .status(400)
          .json({ message: "Contraseña actual incorrecta" });
      }

      const hashedPassword = await hashPassword(newPassword);
      const [updated] = await db
        .update(users)
        .set({ password: hashedPassword, mustChangePassword: "false" })
        .where(eq(users.id, userId))
        .returning();

      res.json({ message: "Contraseña cambiada exitosamente" });
    } catch (err) {
      console.error("Error changing password:", err);
      res.status(500).json({ message: "Error cambiando contraseña" });
    }
  });
}
