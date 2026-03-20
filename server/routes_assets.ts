import type { Express } from "express";
import { z } from "zod";
import {
  insertAssetSchema,
  insertAssetCategorySchema,
  insertAssetSpecSchema,
  insertAssetLicenseSchema,
  insertAssetMovementSchema,
} from "@shared/schema_assets";
import {
  getAssetCategories,
  createAssetCategory,
  deleteAssetCategory,
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetSpecs,
  upsertAssetSpecs,
  getAssetLicenses,
  createAssetLicense,
  deleteAssetLicense,
  getAssetMovements,
  createAssetMovement,
} from "./storage_assets";

function requireAuth(req: any, res: any): boolean {
  if (!req.isAuthenticated()) {
    res.status(401).json({ message: "No autorizado" });
    return false;
  }
  return true;
}

function requireRole(req: any, res: any, roles: string[]): boolean {
  const userRole = req.user?.role;
  if (!roles.includes(userRole)) {
    res.status(403).json({ message: "Sin permisos suficientes" });
    return false;
  }
  return true;
}

export function registerAssetRoutes(app: Express): void {

  // ── CATEGORIES ─────────────────────────────────────────────────────────────

  // GET /api/assets/categories
  app.get("/api/assets/categories", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      const cats = await getAssetCategories();
      res.json(cats);
    } catch (err) {
      res.status(500).json({ message: "Error obteniendo categorías" });
    }
  });

  // POST /api/assets/categories
  app.post("/api/assets/categories", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin", "analista"])) return;
      const input = insertAssetCategorySchema.parse(req.body);
      const cat = await createAssetCategory(input);
      res.status(201).json(cat);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error creando categoría" });
    }
  });

  // DELETE /api/assets/categories/:id
  app.delete("/api/assets/categories/:id", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin"])) return;
      await deleteAssetCategory(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Error eliminando categoría" });
    }
  });

  // ── ASSETS ─────────────────────────────────────────────────────────────────

  // GET /api/assets
  app.get("/api/assets", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      const list = await getAssets();
      res.json(list);
    } catch (err) {
      res.status(500).json({ message: "Error obteniendo activos" });
    }
  });

  // GET /api/assets/:id
  app.get("/api/assets/:id", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      const asset = await getAsset(Number(req.params.id));
      if (!asset) return res.status(404).json({ message: "Activo no encontrado" });
      res.json(asset);
    } catch (err) {
      res.status(500).json({ message: "Error obteniendo activo" });
    }
  });

  // POST /api/assets
  app.post("/api/assets", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin", "analista"])) return;
      const input = insertAssetSchema.parse(req.body);
      const asset = await createAsset(input);
      res.status(201).json(asset);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error creando activo" });
    }
  });

  // PATCH /api/assets/:id
  app.patch("/api/assets/:id", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin", "analista"])) return;
      const input = insertAssetSchema.partial().parse(req.body);
      const asset = await updateAsset(Number(req.params.id), input);
      res.json(asset);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error actualizando activo" });
    }
  });

  // DELETE /api/assets/:id
  app.delete("/api/assets/:id", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin"])) return;
      await deleteAsset(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Error eliminando activo" });
    }
  });

  // ── SPECS ──────────────────────────────────────────────────────────────────

  // GET /api/assets/:id/specs
  app.get("/api/assets/:id/specs", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      const specs = await getAssetSpecs(Number(req.params.id));
      res.json(specs);
    } catch (err) {
      res.status(500).json({ message: "Error obteniendo especificaciones" });
    }
  });

  // PUT /api/assets/:id/specs  (upsert)
  app.put("/api/assets/:id/specs", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin", "analista"])) return;
      const input = insertAssetSpecSchema.omit({ activoId: true } as any).partial().parse(req.body);
      const specs = await upsertAssetSpecs(Number(req.params.id), input);
      res.json(specs);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error guardando especificaciones" });
    }
  });

  // ── LICENSES ───────────────────────────────────────────────────────────────

  // GET /api/assets/:id/licenses
  app.get("/api/assets/:id/licenses", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      const lics = await getAssetLicenses(Number(req.params.id));
      res.json(lics);
    } catch (err) {
      res.status(500).json({ message: "Error obteniendo licencias" });
    }
  });

  // POST /api/assets/:id/licenses
  app.post("/api/assets/:id/licenses", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin", "analista"])) return;
      const input = insertAssetLicenseSchema.omit({ activoId: true } as any).parse(req.body);
      const lic = await createAssetLicense(Number(req.params.id), input);
      res.status(201).json(lic);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error creando licencia" });
    }
  });

  // DELETE /api/asset-licenses/:id
  app.delete("/api/asset-licenses/:id", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin"])) return;
      await deleteAssetLicense(Number(req.params.id));
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: "Error eliminando licencia" });
    }
  });

  // ── MOVEMENTS ──────────────────────────────────────────────────────────────

  // GET /api/assets/:id/movements
  app.get("/api/assets/:id/movements", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      const movs = await getAssetMovements(Number(req.params.id));
      res.json(movs);
    } catch (err) {
      res.status(500).json({ message: "Error obteniendo movimientos" });
    }
  });

  // POST /api/assets/:id/movements
  app.post("/api/assets/:id/movements", async (req, res) => {
    try {
      if (!requireAuth(req, res)) return;
      if (!requireRole(req, res, ["admin", "analista"])) return;
      const input = insertAssetMovementSchema.omit({ activoId: true } as any).parse(req.body);
      const mov = await createAssetMovement(Number(req.params.id), input);
      res.status(201).json(mov);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Error registrando movimiento" });
    }
  });
}
