import { pgTable, text, serial, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── 1. CATEGORÍAS DE ACTIVOS ────────────────────────────────────────────────
export const assetCategories = pgTable("asset_categories", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull().unique(),
});

// ─── 2. ACTIVOS PRINCIPALES ──────────────────────────────────────────────────
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  categoriaId: integer("categoria_id").references(() => assetCategories.id),
  tipo: text("tipo"),
  marca: text("marca"),
  modelo: text("modelo"),
  numeroSerie: text("numero_serie"),
  sedeZona: text("sede_zona"),
  responsable: text("responsable"),
  fechaCompra: date("fecha_compra"),
  estado: text("estado").default("activo"),
  observacion: text("observacion"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── 3. ESPECIFICACIONES TÉCNICAS ────────────────────────────────────────────
export const assetSpecs = pgTable("asset_specs", {
  id: serial("id").primaryKey(),
  activoId: integer("activo_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  ram: text("ram"),
  procesador: text("procesador"),
  sistemaOperativo: text("sistema_operativo"),
  capacidadDisco: text("capacidad_disco"),
  macWifi: text("mac_wifi"),
  direccionIp: text("direccion_ip"),
  imei1: text("imei1"),
  imei2: text("imei2"),
  numeroSim: text("numero_sim"),
  red: text("red"),
  ubicacion: text("ubicacion"),
  pulgadas: text("pulgadas"),
  cargador: text("cargador"),
  correoGmail: text("correo_gmail"),
  soporte: text("soporte"),
  wifiBackup: text("wifi_backup"),
  contrasena: text("contrasena"),
  fechaVencimiento: date("fecha_vencimiento"),
});

// ─── 4. LICENCIAS ────────────────────────────────────────────────────────────
export const assetLicenses = pgTable("asset_licenses", {
  id: serial("id").primaryKey(),
  activoId: integer("activo_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  serie: text("serie"),
  fechaCompra: date("fecha_compra"),
  fechaVencimiento: date("fecha_vencimiento"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── 5. MOVIMIENTOS DE INVENTARIO ────────────────────────────────────────────
export const assetMovements = pgTable("asset_movements", {
  id: serial("id").primaryKey(),
  activoId: integer("activo_id").notNull().references(() => assets.id, { onDelete: "cascade" }),
  tipoMovimiento: text("tipo_movimiento").notNull(), // 'entrega' | 'devolucion' | 'cambio'
  responsable: text("responsable").notNull(),
  fecha: timestamp("fecha").defaultNow(),
  observacion: text("observacion"),
});

// ─── ZOD / INSERT SCHEMAS ────────────────────────────────────────────────────
export const insertAssetCategorySchema = createInsertSchema(assetCategories).omit({ id: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssetSpecSchema = createInsertSchema(assetSpecs).omit({ id: true });
export const insertAssetLicenseSchema = createInsertSchema(assetLicenses).omit({ id: true, createdAt: true });
export const insertAssetMovementSchema = createInsertSchema(assetMovements).omit({ id: true, fecha: true });

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type AssetCategory = typeof assetCategories.$inferSelect;
export type InsertAssetCategory = z.infer<typeof insertAssetCategorySchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type AssetSpec = typeof assetSpecs.$inferSelect;
export type InsertAssetSpec = z.infer<typeof insertAssetSpecSchema>;

export type AssetLicense = typeof assetLicenses.$inferSelect;
export type InsertAssetLicense = z.infer<typeof insertAssetLicenseSchema>;

export type AssetMovement = typeof assetMovements.$inferSelect;
export type InsertAssetMovement = z.infer<typeof insertAssetMovementSchema>;
