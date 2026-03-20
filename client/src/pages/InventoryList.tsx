import { useState, useMemo } from "react";
import {
  useAssets,
  useAssetCategories,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
  useUpsertAssetSpecs,
  useExportAssetsExcel,
} from "@/hooks/use-assets";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Plus, Server, Search, Trash2, Edit2, Loader2, Eye, Package,
  ChevronRight, ChevronLeft, Download,
} from "lucide-react";
import { ZONES } from "@shared/schema";
import {
  CATEGORY_CONFIG, CATEGORY_NAMES, ESTADOS, ESTADO_BADGE, type FieldDef,
} from "@/lib/asset-category-fields";

function emptyAsset() {
  return {
    tipo: "", marca: "", modelo: "", numeroSerie: "", sedeZona: "Proto",
    responsable: "", estado: "activo", observacion: "", fechaCompra: "",
  };
}

function emptySpecs(): Record<string, string> {
  return {
    ram: "", procesador: "", sistemaOperativo: "", capacidadDisco: "",
    macWifi: "", direccionIp: "", imei1: "", imei2: "", numeroSim: "",
    red: "", ubicacion: "", pulgadas: "", cargador: "", correoGmail: "",
    soporte: "", wifiBackup: "", contrasena: "", fechaVencimiento: "",
  };
}

function DynamicField({
  field, value, onChange, zones,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
  zones: readonly string[];
}) {
  if (field.type === "textarea") {
    return (
      <div className="col-span-2 space-y-1.5">
        <Label className="text-xs text-muted-foreground">{field.label}{field.required && " *"}</Label>
        <Textarea
          data-testid={`input-${field.key}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-black/20 border-white/10 min-h-[70px] text-sm"
          placeholder={field.placeholder}
        />
      </div>
    );
  }
  if (field.type === "select" && field.key === "sedeZona") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{field.label}{field.required && " *"}</Label>
        <Select value={value || "Proto"} onValueChange={onChange}>
          <SelectTrigger data-testid="select-zona" className="bg-black/20 border-white/10 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {zones.map((z) => (
              <SelectItem key={z} value={z}>{z}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === "select" && field.key === "estado") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{field.label}{field.required && " *"}</Label>
        <Select value={value || "activo"} onValueChange={onChange}>
          <SelectTrigger data-testid="select-estado" className="bg-black/20 border-white/10 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === "select" && field.options) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{field.label}{field.required && " *"}</Label>
        <Select value={value || "__none__"} onValueChange={(v) => onChange(v === "__none__" ? "" : v)}>
          <SelectTrigger data-testid={`select-${field.key}`} className="bg-black/20 border-white/10 h-9 text-sm">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Seleccionar...</SelectItem>
            {field.options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.type === "date") {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{field.label}{field.required && " *"}</Label>
        <Input
          data-testid={`input-${field.key}`}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-black/20 border-white/10 h-9 text-sm"
        />
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{field.label}{field.required && " *"}</Label>
      <Input
        data-testid={`input-${field.key}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/20 border-white/10 h-9 text-sm"
        placeholder={field.placeholder}
      />
    </div>
  );
}

export default function InventoryList() {
  const { user } = useAuth();
  const { data: assets = [], isLoading } = useAssets();
  const { data: categories = [] } = useAssetCategories();
  const createMut = useCreateAsset();
  const updateMut = useUpdateAsset();
  const deleteMut = useDeleteAsset();
  const specsMut = useUpsertAssetSpecs();
  const { exportExcel } = useExportAssetsExcel();

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("__all__");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [, navigate] = useLocation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [assetForm, setAssetForm] = useState<Record<string, string>>(emptyAsset());
  const [specsForm, setSpecsForm] = useState<Record<string, string>>(emptySpecs());

  const countByCat = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach((a) => {
      const nombre = a.categoria?.nombre || "Sin categoría";
      counts[nombre] = (counts[nombre] || 0) + 1;
    });
    return counts;
  }, [assets]);

  if (user?.role === "usuario") return <Redirect to="/" />;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2 className="w-6 h-6 animate-spin" /> Cargando inventario...
      </div>
    );
  }

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      (a.marca || "").toLowerCase().includes(q) ||
      (a.modelo || "").toLowerCase().includes(q) ||
      (a.numeroSerie || "").toLowerCase().includes(q) ||
      (a.sedeZona || "").toLowerCase().includes(q) ||
      (a.responsable || "").toLowerCase().includes(q) ||
      (a.tipo || "").toLowerCase().includes(q);
    const matchCat = filterCat === "__all__" || a.categoria?.nombre === filterCat;
    return matchSearch && matchCat;
  });

  const catConfig = selectedCategory ? CATEGORY_CONFIG[selectedCategory] : null;
  const hasSpecsFields = (catConfig?.specsFields?.length ?? 0) > 0;

  function openCreate(catName = "") {
    setEditingId(null);
    setCreatedId(null);
    setAssetForm(emptyAsset());
    setSpecsForm(emptySpecs());
    if (catName) {
      setSelectedCategory(catName);
      setStep(1);
    } else {
      setSelectedCategory("");
      setStep(0);
    }
    setDialogOpen(true);
  }

  function openEdit(id: number) {
    const a = assets.find((x) => x.id === id);
    if (!a) return;
    setEditingId(id);
    setCreatedId(null);
    const catName = a.categoria?.nombre || "";
    setSelectedCategory(catName);
    setAssetForm({
      tipo: a.tipo || "",
      marca: a.marca || "",
      modelo: a.modelo || "",
      numeroSerie: a.numeroSerie || "",
      sedeZona: a.sedeZona || "Proto",
      responsable: a.responsable || "",
      estado: a.estado || "activo",
      observacion: a.observacion || "",
      fechaCompra: a.fechaCompra || "",
    });
    setSpecsForm(emptySpecs());
    setStep(1);
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setCreatedId(null);
    setStep(0);
    setSelectedCategory("");
  }

  function handleSelectCategory(catName: string) {
    setSelectedCategory(catName);
    setAssetForm({ ...emptyAsset() });
    setStep(1);
  }

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    const cat = categories.find((c) => c.nombre === selectedCategory);
    const payload: Record<string, unknown> = {
      ...assetForm,
      categoriaId: cat?.id ?? null,
      tipo: assetForm.tipo || null,
      fechaCompra: assetForm.fechaCompra || null,
    };

    if (editingId) {
      await updateMut.mutateAsync({ id: editingId, ...payload });
      handleCloseDialog();
    } else {
      const asset = await createMut.mutateAsync(payload);
      setCreatedId(asset.id);
      if (hasSpecsFields) {
        setStep(2);
      } else {
        setDialogOpen(false);
        navigate(`/inventory/${asset.id}`);
      }
    }
  }

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault();
    const id = createdId!;
    const filled = Object.fromEntries(
      Object.entries(specsForm).filter(([, v]) => v !== "" && v !== null)
    );
    const catConf = CATEGORY_CONFIG[selectedCategory];
    const allowedKeys = catConf?.specsFields.map((f) => f.key) ?? [];
    const filtered2 = Object.fromEntries(
      Object.entries(filled).filter(([k]) => allowedKeys.includes(k))
    );
    if (Object.keys(filtered2).length > 0) {
      await specsMut.mutateAsync({ id, ...filtered2 });
    }
    setDialogOpen(false);
    navigate(`/inventory/${id}`);
  }

  const isSubmitting = createMut.isPending || updateMut.isPending || specsMut.isPending;
  const totalSteps = hasSpecsFields ? 3 : 2;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" /> Inventario de Activos
          </h1>
          <p className="text-muted-foreground mt-1">
            Registro y control de equipos de la empresa.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            data-testid="button-export-excel"
            onClick={() => exportExcel(assets || [])}
            variant="outline"
            className="border-white/10 hover:bg-white/5 text-white font-semibold"
          >
            <Download className="w-5 h-5 mr-2" /> Exportar Excel
          </Button>
          <Button
            data-testid="button-nuevo-equipo"
            onClick={() => openCreate()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
          >
            <Plus className="w-5 h-5 mr-2" /> Nuevo Equipo
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {CATEGORY_NAMES.map((catName) => {
          const cfg = CATEGORY_CONFIG[catName];
          const Icon = cfg.icon;
          const count = countByCat[catName] || 0;
          return (
            <Card
              key={catName}
              data-testid={`card-category-${catName}`}
              className="glass-card border-white/5 p-4 group cursor-pointer transition-all hover:border-white/10"
              onClick={() => openCreate(catName)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-2xl font-bold text-white">{count}</div>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground leading-tight">{catName}</div>
              <Button size="sm" variant="ghost" className="w-full mt-2 h-6 text-xs border border-white/10 hover:bg-white/5 px-1">
                <Plus className="w-3 h-3 mr-1" /> Agregar
              </Button>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            data-testid="input-search-inventory"
            placeholder="Buscar por marca, modelo, serie, zona o responsable..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-black/20 border-white/5 focus-visible:ring-primary/50 h-12 rounded-xl"
          />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-full md:w-[200px] bg-black/20 border-white/5 h-12 rounded-xl">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las categorías</SelectItem>
            {CATEGORY_NAMES.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Categoría</TableHead>
              <TableHead className="text-muted-foreground font-medium">Marca / Modelo</TableHead>
              <TableHead className="text-muted-foreground font-medium">No. Serie / Tipo</TableHead>
              <TableHead className="text-muted-foreground font-medium">Sede / Zona</TableHead>
              <TableHead className="text-muted-foreground font-medium">Responsable</TableHead>
              <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No hay equipos registrados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const catName = item.categoria?.nombre || "";
                const cfg = catName ? CATEGORY_CONFIG[catName] : null;
                const Icon = cfg?.icon ?? Package;
                const estadoClass = ESTADO_BADGE[item.estado || "activo"] || ESTADO_BADGE.activo;
                return (
                  <TableRow
                    key={item.id}
                    data-testid={`row-asset-${item.id}`}
                    className="border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${cfg?.color ?? "from-gray-500 to-gray-600"} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs text-muted-foreground">{catName || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {item.marca}{item.modelo && <span className="text-muted-foreground font-normal"> {item.modelo}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {item.numeroSerie && (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary block w-fit">
                            {item.numeroSerie}
                          </span>
                        )}
                        {item.tipo && (
                          <span className="text-xs text-muted-foreground">{item.tipo}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.sedeZona}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{item.responsable || "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded border font-medium capitalize ${estadoClass}`}>
                        {ESTADOS.find(e => e.value === item.estado)?.label || item.estado}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/inventory/${item.id}`}>
                          <Button
                            data-testid={`button-view-asset-${item.id}`}
                            variant="ghost" size="icon"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        {(user?.role === "admin" || user?.role === "analista") && (
                          <>
                            <Button
                              data-testid={`button-edit-asset-${item.id}`}
                              variant="ghost" size="icon"
                              onClick={() => openEdit(item.id)}
                              className="text-muted-foreground hover:text-white hover:bg-white/10"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              data-testid={`button-delete-asset-${item.id}`}
                              variant="ghost" size="icon"
                              onClick={() => {
                                if (confirm("¿Seguro que deseas eliminar este equipo?"))
                                  deleteMut.mutate(item.id);
                              }}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ─── Multi-step Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleCloseDialog(); }}>
        <DialogContent className="glass-card border-white/10 sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display text-white">
              {editingId
                ? `Editar — ${selectedCategory}`
                : step === 0
                  ? "Nuevo Equipo — Seleccionar Categoría"
                  : step === 1
                    ? `Nuevo ${selectedCategory} — Datos Generales`
                    : `Nuevo ${selectedCategory} — Especificaciones`}
            </DialogTitle>

            {/* Progress bar */}
            {!editingId && step > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="h-1.5 rounded-full bg-primary flex-1" />
                <div className={`h-1.5 rounded-full flex-1 transition-colors ${step >= 2 ? "bg-primary" : hasSpecsFields ? "bg-white/10" : "hidden"}`} />
              </div>
            )}
          </DialogHeader>

          {/* ─── STEP 0: CATEGORY PICKER ─── */}
          {step === 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                Selecciona el tipo de equipo que deseas registrar:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORY_NAMES.map((catName) => {
                  const cfg = CATEGORY_CONFIG[catName];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={catName}
                      data-testid={`button-category-${catName}`}
                      type="button"
                      onClick={() => handleSelectCategory(catName)}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 hover:border-white/20 transition-all group cursor-pointer"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-white">{catName}</span>
                    </button>
                  );
                })}
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" className="border-white/10" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* ─── STEP 1: ASSET FIELDS ─── */}
          {step === 1 && catConfig && (
            <form onSubmit={handleStep1Submit} className="space-y-4 mt-3">
              {/* Category badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20 border border-white/10">
                {(() => { const Icon = catConfig.icon; return <Icon className="w-4 h-4 text-primary" />; })()}
                <span className="text-sm font-medium text-white">{selectedCategory}</span>
                {!editingId && (
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="ml-auto text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3 h-3" /> Cambiar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {catConfig.assetFields.map((field) => (
                  <DynamicField
                    key={field.key}
                    field={field}
                    value={assetForm[field.key] ?? ""}
                    onChange={(v) => setAssetForm({ ...assetForm, [field.key]: v })}
                    zones={ZONES}
                  />
                ))}
              </div>

              <DialogFooter className="mt-2 gap-2">
                <Button
                  type="button" variant="outline" className="border-white/10"
                  onClick={() => editingId ? handleCloseDialog() : setStep(0)}
                >
                  {editingId ? "Cancelar" : <><ChevronLeft className="w-4 h-4 mr-1" /> Atrás</>}
                </Button>
                <Button
                  data-testid="button-submit-step1"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    editingId
                      ? "Guardar Cambios"
                      : hasSpecsFields
                        ? <><span>Siguiente</span> <ChevronRight className="w-4 h-4 ml-1" /></>
                        : "Guardar Equipo"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* ─── STEP 2: SPECS FIELDS ─── */}
          {step === 2 && catConfig && (
            <form onSubmit={handleStep2Submit} className="space-y-4 mt-3">
              <p className="text-sm text-muted-foreground">
                Especificaciones técnicas de <span className="text-white font-medium">{selectedCategory}</span>. Todos los campos son opcionales.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {catConfig.specsFields.map((field) => (
                  <DynamicField
                    key={field.key}
                    field={field}
                    value={specsForm[field.key] ?? ""}
                    onChange={(v) => setSpecsForm({ ...specsForm, [field.key]: v })}
                    zones={ZONES}
                  />
                ))}
              </div>

              <DialogFooter className="mt-2 gap-2">
                <Button type="button" variant="outline" className="border-white/10" onClick={handleCloseDialog}>
                  Omitir y Guardar
                </Button>
                <Button
                  data-testid="button-submit-step2"
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Equipo"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
