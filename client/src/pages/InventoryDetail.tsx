import { useState } from "react";
import { useRoute, Link, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  useAsset,
  useUpsertAssetSpecs,
  useCreateAssetLicense,
  useDeleteAssetLicense,
  useCreateAssetMovement,
  useUpdateAsset,
} from "@/hooks/use-assets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Loader2, Settings, Key, Truck, Trash2, Cpu, HardDrive, Package,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CATEGORY_CONFIG, ESTADOS, ESTADO_BADGE } from "@/lib/asset-category-fields";
import { ZONES } from "@shared/schema";

const ESTADOS_LABEL: Record<string, string> = {
  activo: "Activo", inactivo: "Inactivo", mantenimiento: "Mantenimiento", baja: "Dado de baja",
};

const MOVIMIENTO_LABEL: Record<string, string> = {
  entrega: "Entrega", devolucion: "Devolución", cambio: "Cambio",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-white break-all">{value}</span>
    </div>
  );
}

export default function InventoryDetail() {
  const { user } = useAuth();
  const [, params] = useRoute("/inventory/:id");
  const id = Number(params?.id);

  const { data: asset, isLoading } = useAsset(id);
  const specsMut = useUpsertAssetSpecs();
  const createLicMut = useCreateAssetLicense();
  const deleteLicMut = useDeleteAssetLicense();
  const createMovMut = useCreateAssetMovement();
  const updateMut = useUpdateAsset();

  const [specsOpen, setSpecsOpen] = useState(false);
  const [licOpen, setLicOpen] = useState(false);
  const [movOpen, setMovOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [specsForm, setSpecsForm] = useState<Record<string, string>>({});
  const [licForm, setLicForm] = useState({ nombre: "", serie: "", fechaVencimiento: "" });
  const [movForm, setMovForm] = useState({ tipoMovimiento: "entrega", responsable: "", observacion: "" });
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  if (user?.role === "usuario") return <Redirect to="/" />;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2 className="w-6 h-6 animate-spin" /> Cargando activo...
      </div>
    );
  }

  if (!asset) {
    return <div className="text-center py-20 text-muted-foreground">Equipo no encontrado.</div>;
  }

  const isAdmin = user?.role === "admin" || user?.role === "analista";
  const estadoClass = ESTADO_BADGE[asset.estado || "activo"] || ESTADO_BADGE.activo;

  const catName = asset.categoria?.nombre || "";
  const catConfig = catName ? CATEGORY_CONFIG[catName] : null;
  const CatIcon = catConfig?.icon ?? Package;
  const specsFieldDefs = catConfig?.specsFields ?? [];
  const hasSpecsSection = specsFieldDefs.length > 0;

  const specs = asset.specs;
  const hasSpecsData = specs && specsFieldDefs.some((f) => !!(specs as Record<string, unknown>)[f.key]);

  function openSpecsDialog() {
    const form: Record<string, string> = {};
    specsFieldDefs.forEach((f) => {
      form[f.key] = (specs as Record<string, unknown> | null)?.[f.key] as string || "";
    });
    setSpecsForm(form);
    setSpecsOpen(true);
  }

  function openEditDialog() {
    setEditForm({
      tipo: asset?.tipo || "",
      marca: asset?.marca || "",
      modelo: asset?.modelo || "",
      numeroSerie: asset?.numeroSerie || "",
      sedeZona: asset?.sedeZona || "Proto",
      responsable: asset?.responsable || "",
      estado: asset?.estado || "activo",
      observacion: asset?.observacion || "",
      fechaCompra: asset?.fechaCompra || "",
    });
    setEditOpen(true);
  }

  async function handleSaveSpecs(e: React.FormEvent) {
    e.preventDefault();
    const filled = Object.fromEntries(Object.entries(specsForm).filter(([, v]) => v !== null));
    await specsMut.mutateAsync({ id, ...filled });
    setSpecsOpen(false);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Convert empty strings to null for all fields
      const payload: Record<string, any> = { id };
      Object.entries(editForm).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          payload[key] = null;
        } else {
          payload[key] = value;
        }
      });
      await updateMut.mutateAsync(payload);
      setEditOpen(false);
    } catch (err) {
      // Error is handled by mutation onError
    }
  }

  async function handleAddLicense(e: React.FormEvent) {
    e.preventDefault();
    if (!licForm.nombre.trim()) return;
    const payload: Record<string, unknown> = {
      nombre: licForm.nombre,
      serie: licForm.serie || null,
      fechaVencimiento: licForm.fechaVencimiento || null,
    };
    await createLicMut.mutateAsync({ id, ...payload });
    setLicForm({ nombre: "", serie: "", fechaVencimiento: "" });
    setLicOpen(false);
  }

  async function handleAddMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movForm.responsable.trim()) return;
    await createMovMut.mutateAsync({ id, ...movForm });
    setMovForm({ tipoMovimiento: "entrega", responsable: "", observacion: "" });
    setMovOpen(false);
  }

  const assetFieldDefs = catConfig?.assetFields ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button data-testid="button-back" variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            {catConfig && (
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${catConfig.color} flex items-center justify-center`}>
                <CatIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <h1 className="text-2xl font-display font-bold text-white">
              {asset.marca} {asset.modelo}
            </h1>
            <span className={`text-xs px-2 py-1 rounded border font-medium capitalize ${estadoClass}`}>
              {ESTADOS_LABEL[asset.estado || "activo"] || asset.estado}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {catName && <span className="mr-2 text-primary/80">{catName}</span>}
            {asset.tipo && <span className="mr-2">{asset.tipo}</span>}
            {asset.numeroSerie && <span className="font-mono text-primary">{asset.numeroSerie}</span>}
          </p>
        </div>
      </div>

      {/* Datos Generales + Especificaciones */}
      <div className={`grid grid-cols-1 ${hasSpecsSection ? "lg:grid-cols-2" : ""} gap-4`}>
        {/* Datos Generales */}
        <Card className="glass-card border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <CatIcon className="w-4 h-4 text-primary" /> Datos Generales
            </h3>
            {isAdmin && (
              <Button
                data-testid="button-edit-asset"
                variant="ghost" size="sm"
                className="text-xs text-muted-foreground hover:text-white"
                onClick={openEditDialog}
              >
                <Settings className="w-3 h-3 mr-1" /> Editar
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {assetFieldDefs.length > 0 ? (
              assetFieldDefs
                .filter((f) => f.key !== "observacion" && f.type !== "textarea")
                .map((f) => {
                  const val = (asset as Record<string, unknown>)[f.key] as string | null;
                  return <InfoRow key={f.key} label={f.label} value={val} />;
                })
            ) : (
              <>
                <InfoRow label="Tipo" value={asset.tipo} />
                <InfoRow label="Marca" value={asset.marca} />
                <InfoRow label="Modelo" value={asset.modelo} />
                <InfoRow label="N° Serie" value={asset.numeroSerie} />
                <InfoRow label="Sede / Zona" value={asset.sedeZona} />
                <InfoRow label="Responsable" value={asset.responsable} />
              </>
            )}
            <InfoRow label="Fecha de compra" value={asset.fechaCompra || undefined} />
            <InfoRow
              label="Registrado"
              value={asset.createdAt ? format(new Date(asset.createdAt), "dd MMM yyyy", { locale: es }) : undefined}
            />
            {asset.observacion && (
              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Observación</span>
                <span className="text-sm text-white whitespace-pre-wrap">{asset.observacion}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Especificaciones Técnicas (solo si la categoría tiene specs) */}
        {hasSpecsSection && (
          <Card className="glass-card border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" /> Especificaciones
              </h3>
              {isAdmin && (
                <Button
                  data-testid="button-edit-specs"
                  variant="ghost" size="sm"
                  className="text-xs text-muted-foreground hover:text-white"
                  onClick={openSpecsDialog}
                >
                  <Settings className="w-3 h-3 mr-1" /> {hasSpecsData ? "Editar" : "Agregar"}
                </Button>
              )}
            </div>
            {!hasSpecsData ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No hay especificaciones registradas.
                {isAdmin && (
                  <Button
                    variant="outline" size="sm"
                    className="mt-3 border-white/10 text-xs block mx-auto"
                    onClick={openSpecsDialog}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Agregar Specs
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {specsFieldDefs.map((f) => {
                  const val = (specs as Record<string, unknown> | null)?.[f.key] as string | null;
                  return <InfoRow key={f.key} label={f.label} value={val} />;
                })}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Licencias */}
      <Card className="glass-card border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" /> Licencias ({asset.licenses.length})
          </h3>
          {isAdmin && (
            <Button
              data-testid="button-add-license"
              variant="outline" size="sm"
              className="border-white/10 hover:bg-white/5 text-xs"
              onClick={() => setLicOpen(true)}
            >
              <Plus className="w-3 h-3 mr-1" /> Agregar
            </Button>
          )}
        </div>
        {asset.licenses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No hay licencias registradas para este equipo.
          </div>
        ) : (
          <div className="space-y-2">
            {asset.licenses.map((lic) => (
              <div
                key={lic.id}
                data-testid={`row-license-${lic.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5"
              >
                <div>
                  <div className="font-medium text-white text-sm">{lic.nombre}</div>
                  {lic.serie && (
                    <div className="font-mono text-xs text-primary mt-0.5">{lic.serie}</div>
                  )}
                  {lic.fechaVencimiento && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Vence: {lic.fechaVencimiento}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <Button
                    data-testid={`button-delete-license-${lic.id}`}
                    variant="ghost" size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteLicMut.mutate({ licenseId: lic.id, assetId: id })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Movimientos */}
      <Card className="glass-card border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" /> Movimientos ({asset.movements.length})
          </h3>
          {isAdmin && (
            <Button
              data-testid="button-add-movement"
              variant="outline" size="sm"
              className="border-white/10 hover:bg-white/5 text-xs"
              onClick={() => setMovOpen(true)}
            >
              <Plus className="w-3 h-3 mr-1" /> Registrar
            </Button>
          )}
        </div>
        {asset.movements.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No hay movimientos registrados.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {asset.movements.map((mov) => (
              <div
                key={mov.id}
                data-testid={`row-movement-${mov.id}`}
                className="p-3 rounded-lg bg-black/20 border border-white/5"
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge className="text-xs capitalize bg-primary/20 text-primary border-primary/30">
                    {MOVIMIENTO_LABEL[mov.tipoMovimiento] || mov.tipoMovimiento}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {mov.fecha ? format(new Date(mov.fecha), "dd MMM yyyy - HH:mm", { locale: es }) : "—"}
                  </span>
                </div>
                <div className="text-sm text-white">{mov.responsable}</div>
                {mov.observacion && (
                  <div className="text-xs text-muted-foreground mt-1">{mov.observacion}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── EDIT DIALOG ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Editar — {catName || "Equipo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              {/* Show configured fields or fallback to basic fields */}
              {(catConfig?.assetFields ?? []).length > 0 ? (
                (catConfig?.assetFields ?? []).map((field) => {
                  const val = editForm[field.key] ?? "";
                  const setVal = (v: string) => setEditForm({ ...editForm, [field.key]: v });
                  if (field.type === "textarea") {
                    return (
                      <div key={field.key} className="col-span-2 space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <Textarea
                          value={val} onChange={(e) => setVal(e.target.value)}
                          className="bg-black/20 border-white/10 min-h-[70px] text-sm"
                          placeholder={field.placeholder}
                        />
                      </div>
                    );
                  }
                  if (field.type === "select" && field.key === "sedeZona") {
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <Select value={val || "Proto"} onValueChange={setVal}>
                          <SelectTrigger className="bg-black/20 border-white/10 h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }
                  if (field.type === "select" && field.key === "estado") {
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <Select value={val || "activo"} onValueChange={setVal}>
                          <SelectTrigger className="bg-black/20 border-white/10 h-9 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ESTADOS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }
                  if (field.type === "select" && field.options) {
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <Select value={val || "__none__"} onValueChange={(v) => setVal(v === "__none__" ? "" : v)}>
                          <SelectTrigger className="bg-black/20 border-white/10 h-9 text-sm"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Seleccionar...</SelectItem>
                            {field.options.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }
                  if (field.type === "date") {
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">{field.label}</Label>
                        <Input type="date" value={val} onChange={(e) => setVal(e.target.value)}
                          className="bg-black/20 border-white/10 h-9 text-sm" />
                      </div>
                    );
                  }
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      <Input value={val} onChange={(e) => setVal(e.target.value)}
                        className="bg-black/20 border-white/10 h-9 text-sm" placeholder={field.placeholder} />
                    </div>
                  );
                })
              ) : (
                /* Fallback to basic fields */
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <Input value={editForm.tipo ?? ""} onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                      className="bg-black/20 border-white/10 h-9 text-sm" placeholder="Tipo de equipo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Marca</Label>
                    <Input value={editForm.marca ?? ""} onChange={(e) => setEditForm({ ...editForm, marca: e.target.value })}
                      className="bg-black/20 border-white/10 h-9 text-sm" placeholder="Marca" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Modelo</Label>
                    <Input value={editForm.modelo ?? ""} onChange={(e) => setEditForm({ ...editForm, modelo: e.target.value })}
                      className="bg-black/20 border-white/10 h-9 text-sm" placeholder="Modelo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">N° Serie</Label>
                    <Input value={editForm.numeroSerie ?? ""} onChange={(e) => setEditForm({ ...editForm, numeroSerie: e.target.value })}
                      className="bg-black/20 border-white/10 h-9 text-sm" placeholder="Número de serie" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Zona</Label>
                    <Select value={editForm.sedeZona || "Proto"} onValueChange={(v) => setEditForm({ ...editForm, sedeZona: v })}>
                      <SelectTrigger className="bg-black/20 border-white/10 h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ZONES.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Responsable</Label>
                    <Input value={editForm.responsable ?? ""} onChange={(e) => setEditForm({ ...editForm, responsable: e.target.value })}
                      className="bg-black/20 border-white/10 h-9 text-sm" placeholder="Responsable" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Estado</Label>
                    <Select value={editForm.estado || "activo"} onValueChange={(v) => setEditForm({ ...editForm, estado: v })}>
                      <SelectTrigger className="bg-black/20 border-white/10 h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Observación</Label>
                    <Textarea value={editForm.observacion ?? ""} onChange={(e) => setEditForm({ ...editForm, observacion: e.target.value })}
                      className="bg-black/20 border-white/10 min-h-[70px] text-sm" placeholder="Notas adicionales..." />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-white/10" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button data-testid="button-save-edit" type="submit" disabled={updateMut.isPending} className="bg-primary hover:bg-primary/90">
                {updateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── SPECS DIALOG ── */}
      <Dialog open={specsOpen} onOpenChange={setSpecsOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Especificaciones — {catName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSpecs} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              {specsFieldDefs.map((field) => {
                const val = specsForm[field.key] ?? "";
                const setVal = (v: string) => setSpecsForm({ ...specsForm, [field.key]: v });
                if (field.type === "date") {
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">{field.label}</Label>
                      <Input type="date" value={val} onChange={(e) => setVal(e.target.value)}
                        className="bg-black/20 border-white/10 h-9 text-sm" />
                    </div>
                  );
                }
                return (
                  <div key={field.key} className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{field.label}</Label>
                    <Input
                      data-testid={`input-spec-${field.key}`}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      className="bg-black/20 border-white/10 h-9 text-sm"
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-white/10" onClick={() => setSpecsOpen(false)}>Cancelar</Button>
              <Button data-testid="button-save-specs" type="submit" disabled={specsMut.isPending} className="bg-primary hover:bg-primary/90">
                {specsMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── LICENSE DIALOG ── */}
      <Dialog open={licOpen} onOpenChange={setLicOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-white">Agregar Licencia</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddLicense} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nombre de la Licencia *</Label>
              <Input data-testid="input-license-nombre" value={licForm.nombre}
                onChange={(e) => setLicForm({ ...licForm, nombre: e.target.value })}
                className="bg-black/20 border-white/10" placeholder="Ej: Microsoft Office 365" required />
            </div>
            <div className="space-y-2">
              <Label>Clave / Serie</Label>
              <Input data-testid="input-license-serie" value={licForm.serie}
                onChange={(e) => setLicForm({ ...licForm, serie: e.target.value })}
                className="bg-black/20 border-white/10" placeholder="XXXXX-XXXXX-XXXXX" />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
              <Input data-testid="input-license-vencimiento" type="date" value={licForm.fechaVencimiento}
                onChange={(e) => setLicForm({ ...licForm, fechaVencimiento: e.target.value })}
                className="bg-black/20 border-white/10" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-white/10" onClick={() => setLicOpen(false)}>Cancelar</Button>
              <Button data-testid="button-save-license" type="submit" disabled={createLicMut.isPending} className="bg-primary hover:bg-primary/90">
                {createLicMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MOVEMENT DIALOG ── */}
      <Dialog open={movOpen} onOpenChange={setMovOpen}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="text-white">Registrar Movimiento</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMovement} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Tipo de Movimiento *</Label>
              <Select value={movForm.tipoMovimiento} onValueChange={(v) => setMovForm({ ...movForm, tipoMovimiento: v })}>
                <SelectTrigger data-testid="select-tipo-movimiento" className="bg-black/20 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrega">Entrega</SelectItem>
                  <SelectItem value="devolucion">Devolución</SelectItem>
                  <SelectItem value="cambio">Cambio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsable *</Label>
              <Input data-testid="input-mov-responsable" value={movForm.responsable}
                onChange={(e) => setMovForm({ ...movForm, responsable: e.target.value })}
                className="bg-black/20 border-white/10" placeholder="Nombre del responsable" required />
            </div>
            <div className="space-y-2">
              <Label>Observación</Label>
              <Textarea data-testid="input-mov-observacion" value={movForm.observacion}
                onChange={(e) => setMovForm({ ...movForm, observacion: e.target.value })}
                className="bg-black/20 border-white/10 min-h-[80px]" placeholder="Detalles del movimiento..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-white/10" onClick={() => setMovOpen(false)}>Cancelar</Button>
              <Button data-testid="button-save-movement" type="submit" disabled={createMovMut.isPending} className="bg-primary hover:bg-primary/90">
                {createMovMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
