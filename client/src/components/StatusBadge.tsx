import { Badge } from "@/components/ui/badge";

const statusMap: Record<string, { label: string, classes: string }> = {
  abierto: { label: "Abierto", classes: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20" },
  asignado: { label: "Asignado", classes: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" },
  resuelto: { label: "Resuelto", classes: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" },
  cerrado: { label: "Cerrado", classes: "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/20" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status.toLowerCase()] || statusMap.abierto;
  
  return (
    <Badge variant="outline" className={`font-medium tracking-wide border ${config.classes}`}>
      {config.label}
    </Badge>
  );
}
