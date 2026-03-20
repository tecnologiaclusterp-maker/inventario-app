import { useMemo } from "react";
import { useAssets } from "@/hooks/use-assets";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HardDrive, Monitor, Wifi, Package, TrendingUp, AlertCircle, Eye,
} from "lucide-react";
import { ZONES } from "@shared/schema";
import { CATEGORY_CONFIG, CATEGORY_NAMES, ESTADO_BADGE } from "@/lib/asset-category-fields";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444"];

export default function InventoryDashboard() {
  const { user } = useAuth();
  const { data: assets = [], isLoading } = useAssets();

  if (user?.role === "usuario") return <Redirect to="/" />;

  // ─── Stats ───────────────────────────────────────────────────────────────
  const totalActivos = assets.filter((a) => a.estado === "activo" || !a.estado).length;
  const enMantenimiento = assets.filter((a) => a.estado === "mantenimiento").length;
  const dados_de_baja = assets.filter((a) => a.estado === "baja").length;
  const sinResponsable = assets.filter((a) => !a.responsable).length;

  const summaryStats = [
    { label: "Total Equipos", value: assets.length, icon: Package, color: "from-blue-500 to-blue-600" },
    { label: "Activos", value: totalActivos, icon: HardDrive, color: "from-green-500 to-green-600" },
    { label: "Mantenimiento", value: enMantenimiento, icon: Monitor, color: "from-yellow-500 to-yellow-600" },
    { label: "Sin responsable", value: sinResponsable, icon: Wifi, color: "from-red-500 to-red-600" },
  ];

  // ─── Chart data ───────────────────────────────────────────────────────────
  const typeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    CATEGORY_NAMES.forEach((n) => (stats[n] = 0));
    assets.forEach((a) => {
      const cat = a.categoria?.nombre || "Sin categoría";
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return CATEGORY_NAMES.map((name) => ({ type: name, count: stats[name] || 0 }))
      .filter((s) => s.count > 0);
  }, [assets]);

  const zoneStats = useMemo(() => {
    const stats: Record<string, number> = {};
    assets.forEach((a) => {
      const zona = a.sedeZona || "Sin zona";
      stats[zona] = (stats[zona] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count);
  }, [assets]);

  const estadoStats = useMemo(() => {
    const stats: Record<string, number> = {
      activo: 0, inactivo: 0, mantenimiento: 0, baja: 0,
    };
    assets.forEach((a) => {
      const estado = a.estado || "activo";
      stats[estado] = (stats[estado] || 0) + 1;
    });
    return [
      { name: "Activo", value: stats.activo },
      { name: "Inactivo", value: stats.inactivo },
      { name: "Mantenimiento", value: stats.mantenimiento },
      { name: "Dado de baja", value: stats.baja },
    ].filter((s) => s.value > 0);
  }, [assets]);

  // ─── Alerts ───────────────────────────────────────────────────────────────
  const enMantenimientoList = assets.filter((a) => a.estado === "mantenimiento");
  const bajaList = assets.filter((a) => a.estado === "baja");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-primary" /> Dashboard de Inventario
        </h1>
        <p className="text-muted-foreground mt-1">
          Vista completa del estado y distribución de activos.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass-card border-white/5 overflow-hidden">
              <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
              <div className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alerts */}
      {(enMantenimientoList.length > 0 || dados_de_baja > 0) && (
        <div className="space-y-2">
          {enMantenimientoList.length > 0 && (
            <Card className="glass-card border-yellow-500/30 bg-yellow-500/5 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white">
                    {enMantenimientoList.length} equipo{enMantenimientoList.length > 1 ? "s" : ""} en mantenimiento
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {enMantenimientoList.map((a) => `${a.marca || ""} ${a.modelo || ""}`.trim() || "Sin nombre").join(", ")}
                  </p>
                </div>
              </div>
            </Card>
          )}
          {dados_de_baja > 0 && (
            <Card className="glass-card border-red-500/30 bg-red-500/5 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="font-semibold text-white">
                  {dados_de_baja} equipo{dados_de_baja > 1 ? "s" : ""} dado{dados_de_baja > 1 ? "s" : ""} de baja
                </span>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="type" className="w-full">
        <TabsList className="glass-card border border-white/5 bg-black/20">
          <TabsTrigger value="type" className="data-[state=active]:bg-primary/20">Por Tipo</TabsTrigger>
          <TabsTrigger value="zone" className="data-[state=active]:bg-primary/20">Por Zona</TabsTrigger>
          <TabsTrigger value="estado" className="data-[state=active]:bg-primary/20">Por Estado</TabsTrigger>
        </TabsList>

        <TabsContent value="type" className="mt-4">
          <Card className="glass-card border-white/5 p-4">
            {typeStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No hay datos para mostrar.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeStats} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="type" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.4)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8 }}
                    labelStyle={{ color: "white" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="count" name="Equipos" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="zone" className="mt-4">
          <Card className="glass-card border-white/5 p-4">
            {zoneStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No hay datos para mostrar.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={zoneStats} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="zone" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="rgba(255,255,255,0.4)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8 }}
                    labelStyle={{ color: "white" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar dataKey="count" name="Equipos" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="estado" className="mt-4">
          <Card className="glass-card border-white/5 p-4 flex justify-center">
            {estadoStats.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No hay datos para mostrar.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={estadoStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={110}
                    dataKey="value"
                  >
                    {estadoStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8 }}
                    labelStyle={{ color: "white" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Asset List */}
      <Card className="glass-card border-white/5 p-6">
        <h3 className="font-semibold text-white mb-4">Activos registrados ({assets.length})</h3>
        {assets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No hay activos registrados aún.</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {assets.slice(0, 20).map((asset) => {
              const estadoClass = ESTADO_BADGE[asset.estado || "activo"] || ESTADO_BADGE.activo;
              const nombre = [asset.marca, asset.modelo].filter(Boolean).join(" ") || "Sin nombre";
              return (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors border border-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{nombre}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {asset.categoria?.nombre && (
                        <Badge variant="outline" className="capitalize text-xs">
                          {asset.categoria.nombre}
                        </Badge>
                      )}
                      {asset.tipo && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">{asset.tipo}</Badge>
                      )}
                      {asset.sedeZona && (
                        <Badge variant="outline" className="text-xs">{asset.sedeZona}</Badge>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${estadoClass}`}>
                        {asset.estado || "activo"}
                      </span>
                    </div>
                    {asset.responsable && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Responsable: {asset.responsable}
                      </div>
                    )}
                  </div>
                  <Link href={`/inventory/${asset.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 ml-2 flex-shrink-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              );
            })}
            {assets.length > 20 && (
              <div className="text-center pt-2">
                <Link href="/inventory">
                  <Button variant="outline" size="sm" className="border-white/10 text-xs">
                    Ver todos los activos ({assets.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
