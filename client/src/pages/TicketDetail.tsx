import { useParams, Link } from "wouter";
import { useState, useEffect } from "react";
import { useTicket, useUpdateTicket } from "@/hooks/use-tickets";
import { useUpload } from "@/hooks/use-upload";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, UserPlus, XCircle, Clock, Loader2, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserData } from "@shared/schema";

export default function TicketDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { data: ticket, isLoading } = useTicket(id);
  const updateTicket = useUpdateTicket();
  const upload = useUpload();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionType, setResolutionType] = useState("sitio");
  const [analysts, setAnalysts] = useState<UserData[]>([]);
  const [selectedAnalyst, setSelectedAnalyst] = useState("");

  // Load analysts list
  useEffect(() => {
    fetch("/api/users", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const analystsList = (data || []).filter((u: UserData) => u.role === "analista");
        setAnalysts(analystsList);
      })
      .catch(() => setAnalysts([]));
  }, []);

  if (isLoading) return <div className="p-8"><Skeleton className="h-64 rounded-3xl" /></div>;
  if (!ticket) return <div className="p-20 text-center text-xl text-white">Ticket no encontrado</div>;

  const isAdmin = user?.role === 'admin';
  const isAnalista = user?.role === 'analista';
  const isCreator = user?.id === ticket.createdById;
  const isAssignee = user?.id === ticket.assignedToId;

  const handleAssignToMe = () => {
    if (!user) return;
    updateTicket.mutate({ id, status: 'asignado', assignedToId: user.id });
  };

  const handleAssignToAnalyst = () => {
    if (!selectedAnalyst) return;
    updateTicket.mutate({ id, status: 'asignado', assignedToId: selectedAnalyst }, {
      onSuccess: () => {
        toast({ title: "✓ Asignado", description: `Ticket asignado al analista.` });
        setIsAssignOpen(false);
      }
    });
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = undefined;
    if (file) {
      const uploadRes = await upload.mutateAsync(file);
      url = uploadRes.url;
    }
    updateTicket.mutate({ 
      id, 
      status: 'resuelto', 
      solutionEvidenceUrl: url,
      resolutionNotes,
      resolutionType
    }, {
      onSuccess: () => setIsResolveOpen(false)
    });
  };

  const handleClose = () => {
    updateTicket.mutate({ id, status: 'cerrado' });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <Link href="/tickets">
        <Button variant="ghost" className="text-muted-foreground hover:text-white -ml-4 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Tickets
        </Button>
      </Link>

      <div className="glass-card rounded-3xl p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                Ticket #{ticket.id}
              </span>
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
              {ticket.title}
            </h1>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            {/* Quick Actions based on state/role */}
            {ticket.status === 'abierto' && isAdmin && (
              <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20">
                    <UserPlus className="w-4 h-4 mr-2" /> Asignar a Analista
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-display text-white">Asignar Ticket a Analista</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="analyst-select">Seleccionar Analista</Label>
                      <Select value={selectedAnalyst} onValueChange={setSelectedAnalyst}>
                        <SelectTrigger className="bg-black/20 border-white/10">
                          <SelectValue placeholder="Elige un analista..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10">
                          {analysts.map(analyst => (
                            <SelectItem key={analyst.id} value={analyst.id} className="text-white cursor-pointer hover:bg-white/10">
                              {analyst.firstName} {analyst.lastName} ({analyst.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAssignToAnalyst} disabled={!selectedAnalyst || updateTicket.isPending} className="w-full bg-purple-600 hover:bg-purple-700">
                        {updateTicket.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Asignar
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {ticket.status === 'abierto' && (isAnalista || (isAdmin && !selectedAnalyst)) && (
              <Button onClick={handleAssignToMe} disabled={updateTicket.isPending} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                <UserPlus className="w-4 h-4 mr-2" /> Asignarme este ticket
              </Button>
            )}

            {ticket.status === 'asignado' && (isAdmin || isAssignee) && (
              <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Marcar como Resuelto
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-display text-white">Resolver Ticket</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleResolve} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="resType">Tipo de Soporte</Label>
                      <select 
                        id="resType"
                        value={resolutionType} 
                        onChange={e => setResolutionType(e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="sitio" className="bg-[#1a1a1a]">Presencial (En sitio)</option>
                        <option value="remoto" className="bg-[#1a1a1a]">Remoto</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Observaciones del Cierre</Label>
                      <textarea 
                        id="notes"
                        value={resolutionNotes}
                        onChange={e => setResolutionNotes(e.target.value)}
                        placeholder="Describe brevemente cómo se resolvió el problema..."
                        className="w-full min-h-[100px] p-3 rounded-md bg-black/20 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="solution">Evidencia de Solución (Opcional)</Label>
                      <Input id="solution" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-black/20 border-white/10 text-muted-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:hover:bg-primary/90" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={updateTicket.isPending || upload.isPending} className="w-full">
                        {(updateTicket.isPending || upload.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Solución"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {ticket.status === 'resuelto' && (isCreator || isAdmin) && (
              <Button onClick={handleClose} disabled={updateTicket.isPending} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/10">
                <XCircle className="w-4 h-4 mr-2" /> Cerrar Ticket (Confirmar)
              </Button>
            )}

            {ticket.status === 'cerrado' && isAdmin && (
              <Button 
                onClick={() => updateTicket.mutate({ id, status: 'abierto' })} 
                disabled={updateTicket.isPending} 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Clock className="w-4 h-4 mr-2" /> Reabrir Ticket
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-lg font-semibold text-white mb-3">Descripción del Problema</h3>
              <div className="p-6 rounded-2xl bg-black/20 border border-white/5 text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {ticket.description}
              </div>
            </section>

            {ticket.damageEvidenceUrl && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2"><ImageIcon className="w-5 h-5"/> Evidencia Inicial</h3>
                <img src={ticket.damageEvidenceUrl} alt="Evidencia daño" className="rounded-2xl border border-white/10 max-h-96 object-contain bg-black/50" />
              </section>
            )}

            {ticket.solutionEvidenceUrl && (
              <section>
                <h3 className="text-lg font-semibold text-emerald-500 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Evidencia de Solución</h3>
                <img src={ticket.solutionEvidenceUrl} alt="Evidencia solución" className="rounded-2xl border border-emerald-500/20 max-h-96 object-contain bg-black/50" />
              </section>
            )}

            {ticket.resolutionNotes && (
              <section>
                <h3 className="text-lg font-semibold text-white mb-3">Notas de Resolución</h3>
                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-100 italic">
                  <div className="flex items-center gap-2 mb-2 not-italic">
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                      {ticket.resolutionType === 'remoto' ? '🌐 Soporte Remoto' : '📍 Soporte en Sitio'}
                    </span>
                  </div>
                  "{ticket.resolutionNotes}"
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Categoría</p>
                <p className="font-medium text-white">{ticket.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Zona</p>
                <p className="font-medium text-white">{ticket.zone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Fecha de Creación</p>
                <p className="font-medium text-white">{format(new Date(ticket.createdAt ?? Date.now()), "PPp", { locale: es })}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-black/20 border border-white/5 space-y-6">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Reportado por</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ticket.creator?.profileImageUrl || ''} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">{ticket.creator?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-white">{ticket.creator?.firstName} {ticket.creator?.lastName}</p>
                </div>
              </div>

              {ticket.assignee && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Analista Asignado</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ticket.assignee?.profileImageUrl || ''} />
                      <AvatarFallback className="bg-blue-500/20 text-blue-500 text-xs">{ticket.assignee?.firstName?.charAt(0) || 'T'}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium text-white">{ticket.assignee?.firstName} {ticket.assignee?.lastName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
