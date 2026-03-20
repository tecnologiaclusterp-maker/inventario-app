import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Asset, AssetCategory, AssetSpec, AssetLicense, AssetMovement } from "@shared/schema_assets";

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type AssetWithCategory = Asset & { categoria: AssetCategory | null };
export type AssetDetail = Asset & {
  categoria: AssetCategory | null;
  specs: AssetSpec | null;
  licenses: AssetLicense[];
  movements: AssetMovement[];
};

// ─── QUERIES ─────────────────────────────────────────────────────────────────
export function useAssets() {
  return useQuery<AssetWithCategory[]>({ queryKey: ["/api/assets"] });
}

export function useAsset(id: number) {
  return useQuery<AssetDetail>({
    queryKey: ["/api/assets", id],
    queryFn: async () => {
      const res = await fetch(`/api/assets/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Error al obtener el activo");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useAssetCategories() {
  return useQuery<AssetCategory[]>({ queryKey: ["/api/assets/categories"] });
}

// ─── MUTATIONS ───────────────────────────────────────────────────────────────
export function useCreateAsset() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/assets", data);
      return res.json() as Promise<Asset>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({ title: "Activo creado", description: "El equipo fue registrado correctamente." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      try {
        const res = await apiRequest("PATCH", `/api/assets/${id}`, data);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Error ${res.status}: No se pudo actualizar el activo`);
        }
        return res.json() as Promise<Asset>;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido al actualizar";
        throw new Error(message);
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/assets"] });
      qc.invalidateQueries({ queryKey: ["/api/assets", vars.id] });
      toast({ title: "Actualizado", description: "Equipo actualizado correctamente." });
    },
    onError: (err: Error) => {
      toast({ title: "Error al actualizar", description: err.message || "No se pudo guardar los cambios", variant: "destructive" });
    },
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/assets/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({ title: "Eliminado", description: "El equipo fue eliminado." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpsertAssetSpecs() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await apiRequest("PUT", `/api/assets/${id}/specs`, data);
      return res.json() as Promise<AssetSpec>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/assets", vars.id] });
      toast({ title: "Especificaciones guardadas" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useCreateAssetLicense() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await apiRequest("POST", `/api/assets/${id}/licenses`, data);
      return res.json() as Promise<AssetLicense>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/assets", vars.id] });
      toast({ title: "Licencia agregada" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteAssetLicense() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ licenseId, assetId }: { licenseId: number; assetId: number }) => {
      await apiRequest("DELETE", `/api/asset-licenses/${licenseId}`);
      return assetId;
    },
    onSuccess: (assetId) => {
      qc.invalidateQueries({ queryKey: ["/api/assets", assetId] });
      toast({ title: "Licencia eliminada" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useCreateAssetMovement() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await apiRequest("POST", `/api/assets/${id}/movements`, data);
      return res.json() as Promise<AssetMovement>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/assets", vars.id] });
      qc.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({ title: "Movimiento registrado" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

// Export to Excel
export function useExportAssetsExcel() {
  const { toast } = useToast();
  return {
    exportExcel: async (assets: AssetWithCategory[]) => {
      try {
        // CSV format - Excel-compatible
        const headers = ["ID", "Categoría", "Tipo", "Marca", "Modelo", "N° Serie", "Zona", "Responsable", "Estado", "Observación"];
        const rows = assets.map(a => [
          a.id,
          a.categoria?.nombre || "Sin categoría",
          a.tipo || "",
          a.marca || "",
          a.modelo || "",
          a.numeroSerie || "",
          a.sedeZona || "",
          a.responsable || "",
          a.estado || "activo",
          (a.observacion || "").replace(/"/g, '""') // Escape quotes for CSV
        ]);

        const csv = [
          headers.join(","),
          ...rows.map(row => row.map(cell => typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell).join(","))
        ].join("\n");

        // Create blob and download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `activos-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);

        toast({ title: "Exportado", description: "Activos exportados a Excel correctamente" });
      } catch (err) {
        toast({ title: "Error", description: "No se pudo exportar los activos", variant: "destructive" });
      }
    }
  };
}
