import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  assetCategories,
  assets,
  assetSpecs,
  assetLicenses,
  assetMovements,
  type Asset,
  type InsertAsset,
  type AssetCategory,
  type InsertAssetCategory,
  type AssetSpec,
  type InsertAssetSpec,
  type AssetLicense,
  type InsertAssetLicense,
  type AssetMovement,
  type InsertAssetMovement,
} from "@shared/schema_assets";

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
export async function getAssetCategories(): Promise<AssetCategory[]> {
  return db.select().from(assetCategories).orderBy(assetCategories.nombre);
}

export async function createAssetCategory(data: InsertAssetCategory): Promise<AssetCategory> {
  const [cat] = await db.insert(assetCategories).values(data).returning();
  return cat;
}

export async function deleteAssetCategory(id: number): Promise<void> {
  await db.delete(assetCategories).where(eq(assetCategories.id, id));
}

// ─── ASSETS ──────────────────────────────────────────────────────────────────
export async function getAssets(): Promise<any[]> {
  const all = await db.select().from(assets).orderBy(desc(assets.createdAt));
  const cats = await db.select().from(assetCategories);
  const catMap = new Map(cats.map(c => [c.id, c]));
  return all.map(a => ({ ...a, categoria: a.categoriaId ? catMap.get(a.categoriaId) : null }));
}

export async function getAsset(id: number): Promise<any | undefined> {
  const [asset] = await db.select().from(assets).where(eq(assets.id, id));
  if (!asset) return undefined;

  const [specs] = await db.select().from(assetSpecs).where(eq(assetSpecs.activoId, id));
  const licenses = await db.select().from(assetLicenses).where(eq(assetLicenses.activoId, id));
  const movements = await db.select().from(assetMovements).where(eq(assetMovements.activoId, id)).orderBy(desc(assetMovements.fecha));
  const [cat] = asset.categoriaId
    ? await db.select().from(assetCategories).where(eq(assetCategories.id, asset.categoriaId))
    : [null];

  return { ...asset, categoria: cat, specs: specs || null, licenses, movements };
}

export async function createAsset(data: InsertAsset): Promise<Asset> {
  const [asset] = await db.insert(assets).values(data).returning();
  return asset;
}

export async function updateAsset(id: number, data: Partial<InsertAsset>): Promise<Asset> {
  const [asset] = await db
    .update(assets)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(assets.id, id))
    .returning();
  return asset;
}

export async function deleteAsset(id: number): Promise<void> {
  await db.delete(assets).where(eq(assets.id, id));
}

// ─── SPECS ───────────────────────────────────────────────────────────────────
export async function getAssetSpecs(activoId: number): Promise<AssetSpec | null> {
  const [specs] = await db.select().from(assetSpecs).where(eq(assetSpecs.activoId, activoId));
  return specs || null;
}

export async function upsertAssetSpecs(activoId: number, data: Omit<InsertAssetSpec, "activoId">): Promise<AssetSpec> {
  const existing = await getAssetSpecs(activoId);
  if (existing) {
    const [updated] = await db
      .update(assetSpecs)
      .set(data)
      .where(eq(assetSpecs.activoId, activoId))
      .returning();
    return updated;
  }
  const [created] = await db.insert(assetSpecs).values({ ...data, activoId }).returning();
  return created;
}

// ─── LICENSES ────────────────────────────────────────────────────────────────
export async function getAssetLicenses(activoId: number): Promise<AssetLicense[]> {
  return db.select().from(assetLicenses).where(eq(assetLicenses.activoId, activoId));
}

export async function createAssetLicense(activoId: number, data: Omit<InsertAssetLicense, "activoId">): Promise<AssetLicense> {
  const [lic] = await db.insert(assetLicenses).values({ ...data, activoId }).returning();
  return lic;
}

export async function deleteAssetLicense(id: number): Promise<void> {
  await db.delete(assetLicenses).where(eq(assetLicenses.id, id));
}

// ─── MOVEMENTS ───────────────────────────────────────────────────────────────
export async function getAssetMovements(activoId: number): Promise<AssetMovement[]> {
  return db.select().from(assetMovements)
    .where(eq(assetMovements.activoId, activoId))
    .orderBy(desc(assetMovements.fecha));
}

export async function createAssetMovement(activoId: number, data: Omit<InsertAssetMovement, "activoId">): Promise<AssetMovement> {
  const [mov] = await db.insert(assetMovements).values({ ...data, activoId }).returning();
  // Update responsable on the asset itself
  await db.update(assets).set({ responsable: data.responsable, updatedAt: new Date() }).where(eq(assets.id, activoId));
  return mov;
}
