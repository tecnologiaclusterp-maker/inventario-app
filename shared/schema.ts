import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ZONES = ['Proto', 'Palmera Pess', 'Palmera Silla', 'Palmera Oca', 'Palmera Sam', 'Pachaquiaro'] as const;
export const CATEGORIES = ['Hardware', 'Software', 'Redes', 'Otro'] as const;
export const TICKET_STATUS = ['abierto', 'asignado', 'resuelto', 'cerrado'] as const;
export const USER_ROLES = ['usuario', 'analista', 'admin'] as const;
export const INVENTORY_TYPES = ['computo', 'redes', 'pantalla', 'celular', 'tablet', 'licencia', 'otro'] as const;

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), 
  zone: text("zone").notNull(),
  status: text("status").notNull().default('abierto'),
  createdById: text("created_by_id").notNull(),
  assignedToId: text("assigned_to_id"),
  damageEvidenceUrl: text("damage_evidence_url"),
  solutionEvidenceUrl: text("solution_evidence_url"),
  resolutionNotes: text("resolution_notes"),
  resolutionType: text("resolution_type"), // 'remoto' | 'sitio'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  serialNumber: text("serial_number").notNull(),
  zone: text("zone").notNull(),
  assignedToId: text("assigned_to_id"),
  lastSupportDate: timestamp("last_support_date"),
  supportHistory: jsonb("support_history").default([]), // Array of {date, technician, description}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod schemas
export const insertTicketSchema = createInsertSchema(tickets).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  status: true,
  createdById: true,
  solutionEvidenceUrl: true,
});

export const updateTicketSchema = createInsertSchema(tickets).partial();

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  supportHistory: true,
  lastSupportDate: true,
});

export const updateInventorySchema = createInsertSchema(inventory).partial();

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type UpdateTicket = z.infer<typeof updateTicketSchema>;

export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type UpdateInventory = z.infer<typeof updateInventorySchema>;

// Support history record
export type SupportRecord = {
  date: string;
  technician: string;
  description: string;
  ticketId?: number;
};

// Shared Types for responses
export type UserData = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  profileImageUrl: string | null;
};

export type TicketWithUsers = Ticket & {
  creator?: UserData;
  assignee?: UserData;
};

export type InventoryWithAssignee = InventoryItem & {
  assignee?: UserData;
};
