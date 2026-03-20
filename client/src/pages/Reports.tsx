import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Package, Loader2, Filter } from "lucide-react";
import { useExportTickets } from "@/hooks/use-reports";
import { useTickets } from "@/hooks/use-tickets";
import { useAssets } from "@/hooks/use-assets";
import { useExportAssetsExcel } from "@/hooks/use-assets";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Reports() {
  const { user } = useAuth();
  const { exportCSV } = useExportTickets();
  const { exportExcel } = useExportAssetsExcel();
  const { toast } = useToast();
  const { data: tickets } = useTickets();
  const { data: assets = [] } = useAssets();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  if (user?.role !== 'admin') return <Redirect to="/" />;

  // Get unique companies from tickets
  const companies = useMemo(() => {
    if (!tickets) return [];
    const uniqueCompanies = new Set<string>();
    tickets.forEach(t => {
      if (t.creator?.company) uniqueCompanies.add(t.creator.company);
    });
    return Array.from(uniqueCompanies).sort();
  }, [tickets]);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      await exportCSV(selectedCompany);
      toast({
        title: "Éxito",
        description: "Reporte exportado correctamente",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo exportar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" /> Reportes
        </h1>
        <p className="text-muted-foreground mt-1">Exporta datos de tickets en formato CSV.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Exportar Tickets
            </CardTitle>
            <CardDescription>
              Descarga tickets en formato CSV para análisis en Excel o Sheets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtrar por Empresa
              </label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Todas las empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Todas las empresas</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-slate-400">
              Incluye: ID, título, descripción, categoría, zona, empresa, estado, creador, asignado a, fechas.
            </p>
            <Button
              onClick={handleExport}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Descargar CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Exportar Inventario
            </CardTitle>
            <CardDescription>
              Descarga el inventario de activos en formato CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Incluye: ID, categoría, tipo, marca, modelo, serie, zona, responsable, estado y observaciones.
            </p>
            <div className="text-sm text-slate-300 mb-2">
              Total de activos: <span className="font-semibold text-primary">{assets.length}</span>
            </div>
            <Button
              onClick={() => exportExcel(assets)}
              disabled={isLoading || assets.length === 0}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Inventario (CSV)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
