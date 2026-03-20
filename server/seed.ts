import { db } from "./db";
import { users } from "@shared/models/auth";
import { tickets, inventory } from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");

  // Seed Users
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    console.log("Adding seed users...");
    const hashedPass = await hashPassword("admin123");
    
    const [admin] = await db.insert(users).values({
      username: "admin",
      password: await hashPassword("admin123"),
      email: "admin@empresa.com",
      firstName: "Admin",
      lastName: "Principal",
      role: "admin",
    }).returning();

    const [analista] = await db.insert(users).values({
      username: "juan",
      password: await hashPassword("juan123"),
      email: "analista@empresa.com",
      firstName: "Juan",
      lastName: "Analista",
      role: "analista",
    }).returning();

    const [usuario] = await db.insert(users).values({
      username: "maria",
      password: await hashPassword("maria123"),
      email: "user@empresa.com",
      firstName: "Maria",
      lastName: "Usuario",
      role: "usuario",
    }).returning();

    // Seed Tickets
    console.log("Adding seed tickets...");
    await db.insert(tickets).values([
      {
        title: "Impresora no funciona",
        description: "La impresora de la oficina principal no imprime en color.",
        category: "Hardware",
        zone: "Proto",
        status: "abierto",
        createdById: usuario.id,
      },
      {
        title: "No hay internet",
        description: "El switch del piso 2 se reinicia constantemente.",
        category: "Redes",
        zone: "Palmera Pess",
        status: "asignado",
        createdById: usuario.id,
        assignedToId: analista.id,
      },
      {
        title: "Error en Office",
        description: "Excel se cierra solo al abrir archivos grandes.",
        category: "Software",
        zone: "Palmera Silla",
        status: "resuelto",
        createdById: usuario.id,
        assignedToId: analista.id,
      }
    ]);

    // Seed Inventory
    console.log("Adding seed inventory...");
    await db.insert(inventory).values([
      {
        name: "Dell Optiplex 7090",
        type: "computo",
        serialNumber: "SN-DELL-12345-001",
        zone: "Proto",
        assignedToId: analista.id,
        supportHistory: [
          {
            date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
            technician: "Juan Analista",
            description: "Limpieza interna y actualización de drivers"
          }
        ] as any,
        lastSupportDate: new Date(Date.now() - 7*24*60*60*1000),
      },
      {
        name: "Cisco Catalyst 2960",
        type: "redes",
        serialNumber: "SN-CIS-98765-001",
        zone: "Palmera Pess",
      },
      {
        name: "Monitor LG 27 pulgadas",
        type: "pantalla",
        serialNumber: "SN-LG-11111-001",
        zone: "Pachaquiaro",
        assignedToId: usuario.id,
      },
      {
        name: "Impresora HP LaserJet",
        type: "otro",
        serialNumber: "SN-HP-45612-001",
        zone: "Palmera Silla",
      }
    ]);
  } else {
    console.log("Database already seeded");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding:", err);
  process.exit(1);
});
