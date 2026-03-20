import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

// Setup multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), "client/public/uploads"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- TICKETS ---
  app.get(api.tickets.list.path, async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ message: "Error fetching tickets" });
    }
  });

  app.get(api.tickets.get.path, async (req, res) => {
    try {
      const ticket = await storage.getTicket(Number(req.params.id));
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }
      res.json(ticket);
    } catch (err) {
      res.status(500).json({ message: "Error fetching ticket" });
    }
  });

  app.post(api.tickets.create.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autorizado" });
      }
      
      const input = api.tickets.create.input.parse(req.body);
      // @ts-ignore - req.user is populated by passport
      const userId = req.user.id;
      
      const ticket = await storage.createTicket(input, userId);
      res.status(201).json(ticket);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Error creando ticket" });
    }
  });

  app.patch(api.tickets.update.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "No autorizado" });
      }

      // @ts-ignore
      const user = req.user;
      
      const ticketId = Number(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket no encontrado' });
      }

      const input = api.tickets.update.input.parse(req.body);
      
      // Authorization checks based on rules
      // 1. Only 'usuario' (creator) or 'admin' can close the ticket
      if (input.status === 'cerrado') {
        const canClose = ticket.createdById === user.id || user.role === 'admin';
        if (!canClose) {
          return res.status(403).json({ message: "Solo el creador o el administrador pueden cerrar el ticket" });
        }
      }

      // 2. Only assigned analista or admin can resolve
      if (input.status === 'resuelto' && ticket.assignedToId !== user.id && user.role !== 'admin') {
         return res.status(403).json({ message: "Solo el analista asignado puede resolver el ticket" });
      }

      // 3. Admin can reopen (set back to abierto or asignado)
      if (ticket.status === 'cerrado' && input.status !== 'cerrado' && user.role !== 'admin') {
        return res.status(403).json({ message: "Solo el administrador puede reabrir un ticket cerrado" });
      }

      // Update updatedAt for accurate resolution time
      const updatedTicket = await storage.updateTicket(ticketId, { 
        ...input,
        updatedAt: new Date()
      });
      res.json(updatedTicket);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Error actualizando ticket" });
    }
  });

  // --- INVENTORY ---
  app.get(api.inventory.list.path, async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Error fetching inventory" });
    }
  });

  app.get(api.inventory.get.path, async (req, res) => {
    try {
      const item = await storage.getInventoryItem(Number(req.params.id));
      if (!item) {
        return res.status(404).json({ message: 'Equipo no encontrado' });
      }
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: "Error fetching inventory item" });
    }
  });

  app.post(api.inventory.create.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
      
      const input = api.inventory.create.input.parse(req.body);
      const item = await storage.createInventoryItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Error creando item de inventario" });
    }
  });

  app.patch(api.inventory.update.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
      
      const itemId = Number(req.params.id);
      const input = api.inventory.update.input.parse(req.body);
      
      const item = await storage.updateInventoryItem(itemId, input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Error actualizando item" });
    }
  });

  app.delete(api.inventory.delete.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
      
      await storage.deleteInventoryItem(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Error eliminando item" });
    }
  });

  app.post(api.inventory.addSupport.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
      
      // @ts-ignore
      const user = req.user;
      
      const itemId = Number(req.params.id);
      const input = api.inventory.addSupport.input.parse(req.body);
      
      const record = {
        date: new Date().toISOString(),
        technician: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'Unknown',
        description: input.description,
        ...(input.ticketId && { ticketId: input.ticketId })
      };
      
      const item = await storage.addSupportRecord(itemId, record);
      res.json(item);
    } catch (err) {
      res.status(500).json({ message: "Error adding support record" });
    }
  });

  // --- USERS ---
  app.get(api.users.list.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
      const users = await storage.getUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.patch(api.users.updateRole.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
      
      const input = api.users.updateRole.input.parse(req.body);
      const user = await storage.updateUserRole(req.params.id, input.role);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Error actualizando rol de usuario" });
    }
  });

  app.post(api.users.resetPassword.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
      const user = req.user as any;
      if (user.role !== 'admin') return res.status(403).json({ message: "Solo admins pueden resetear contraseñas" });

      const userId = req.params.id;
      const temporaryPassword = Math.random().toString(36).slice(2, 12).toUpperCase();
      
      // Import hashPassword function
      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(temporaryPassword, salt, 64)) as Buffer;
      const hashedPassword = `${buf.toString("hex")}.${salt}`;
      
      const [updatedUser] = await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId)).returning();
      if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });
      
      res.json({ temporaryPassword });
    } catch (err) {
      console.error("Error resetting password:", err);
      res.status(500).json({ message: "Error reseteando contraseña" });
    }
  });

  // --- REPORTS ---
  app.get(api.reports.exportTickets.path, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "No autorizado" });
      const user = req.user as any;
      if (user.role !== 'admin') return res.status(403).json({ message: "Solo admins pueden exportar reportes" });

      const allTickets = await storage.getTickets();
      const companyFilter = req.query.company as string | undefined;

      // Filter by company if provided
      const filteredTickets = companyFilter 
        ? allTickets.filter(t => t.creator?.company === companyFilter)
        : allTickets;

      // Convert to CSV
      const headers = ["ID", "Título", "Descripción", "Categoría", "Zona", "Empresa", "Estado", "Creador", "Asignado a", "Fecha Creación", "Última Actualización"];
      const rows = filteredTickets.map(t => [
        t.id,
        `"${t.title}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.category,
        t.zone,
        t.creator?.company || 'N/A',
        t.status,
        t.creator?.firstName + " " + t.creator?.lastName || t.creator?.email || 'N/A',
        t.assignee?.firstName + " " + t.assignee?.lastName || t.assignee?.email || 'Sin asignar',
        new Date(t.createdAt).toLocaleString("es-ES"),
        new Date(t.updatedAt).toLocaleString("es-ES")
      ]);

      const csv = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="tickets-${new Date().toISOString().split("T")[0]}.csv"`);
      res.send(csv);
    } catch (err) {
      console.error("Error exporting tickets:", err);
      res.status(500).json({ message: "Error exportando reporte" });
    }
  });

  // --- UPLOADS ---
  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), "client/public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  app.post("/api/uploads", upload.single("file"), (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autorizado" });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ningún archivo" });
    }
    
    // Return the URL that the frontend can use to access the file
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  });

  return httpServer;
}
