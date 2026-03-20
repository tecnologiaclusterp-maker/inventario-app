import { db } from "./db";
import {
  tickets,
  inventory,
  type InsertTicket,
  type UpdateTicket,
  type InsertInventory,
  type UpdateInventory,
  type Ticket,
  type InventoryItem,
  type SupportRecord
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { eq, desc, asc, and } from "drizzle-orm";

// Helper to safely return user data without password
const sanitizeUser = (user: any) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

export interface IStorage {
  // Tickets
  getTickets(): Promise<any[]>;
  getTicket(id: number): Promise<any | undefined>;
  createTicket(ticket: InsertTicket, userId: string): Promise<Ticket>;
  updateTicket(id: number, updates: UpdateTicket): Promise<Ticket>;

  // Inventory
  getInventoryItems(): Promise<any[]>;
  getInventoryItem(id: number): Promise<any | undefined>;
  createInventoryItem(item: InsertInventory): Promise<InventoryItem>;
  updateInventoryItem(id: number, updates: UpdateInventory): Promise<InventoryItem>;
  deleteInventoryItem(id: number): Promise<void>;
  addSupportRecord(id: number, record: SupportRecord): Promise<InventoryItem>;

  // Users
  getUsers(): Promise<any[]>;
  updateUserRole(id: string, role: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getTickets(): Promise<any[]> {
    const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
    
    // Manual join to keep it simple and match expected output format
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(u => [u.id, sanitizeUser(u)]));

    return allTickets.map(t => ({
      ...t,
      creator: userMap.get(t.createdById),
      assignee: t.assignedToId ? userMap.get(t.assignedToId) : null
    }));
  }

  async getTicket(id: number): Promise<any | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    if (!ticket) return undefined;

    const [creator] = await db.select().from(users).where(eq(users.id, ticket.createdById));
    const [assignee] = ticket.assignedToId ? await db.select().from(users).where(eq(users.id, ticket.assignedToId)) : [null];

    return {
      ...ticket,
      creator: sanitizeUser(creator),
      assignee: sanitizeUser(assignee)
    };
  }

  async createTicket(insertTicket: InsertTicket, userId: string): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values({ ...insertTicket, createdById: userId })
      .returning();
    return ticket;
  }

  async updateTicket(id: number, updates: UpdateTicket): Promise<Ticket> {
    const [ticket] = await db
      .update(tickets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async getInventoryItems(): Promise<any[]> {
    const items = await db.select().from(inventory).orderBy(desc(inventory.createdAt));
    
    const allUsers = await db.select().from(users);
    const userMap = new Map(allUsers.map(u => [u.id, sanitizeUser(u)]));

    return items.map(item => ({
      ...item,
      assignee: item.assignedToId ? userMap.get(item.assignedToId) : null
    }));
  }

  async getInventoryItem(id: number): Promise<any | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    if (!item) return undefined;

    const assignee = item.assignedToId ? await db.select().from(users).where(eq(users.id, item.assignedToId)).then(r => r[0]) : null;

    return {
      ...item,
      assignee: sanitizeUser(assignee)
    };
  }

  async createInventoryItem(insertInventory: InsertInventory): Promise<InventoryItem> {
    const [item] = await db.insert(inventory).values(insertInventory).returning();
    return item;
  }

  async updateInventoryItem(id: number, updates: UpdateInventory): Promise<InventoryItem> {
    const [item] = await db
      .update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async addSupportRecord(id: number, record: SupportRecord): Promise<InventoryItem> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    if (!item) throw new Error("Item not found");

    const currentHistory = (item.supportHistory as SupportRecord[]) || [];
    const newHistory = [...currentHistory, record];

    const [updated] = await db
      .update(inventory)
      .set({ 
        supportHistory: newHistory,
        lastSupportDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(inventory.id, id))
      .returning();
    return updated;
  }

  async getUsers(): Promise<any[]> {
    return await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      profileImageUrl: users.profileImageUrl
    }).from(users);
  }

  async updateUserRole(id: string, role: string): Promise<any> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        profileImageUrl: users.profileImageUrl
      });
    return user;
  }
}

export const storage = new DatabaseStorage();
