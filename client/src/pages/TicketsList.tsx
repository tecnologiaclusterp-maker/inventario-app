import { useState, useEffect, useRef } from "react";
import { useTickets, useCreateTicket } from "@/hooks/use-tickets";
import { useUpload } from "@/hooks/use-upload";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link, useSearch } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Loader2, Bell } from "lucide-react";
import { ZONES, CATEGORIES } from "@shared/schema";

export default function TicketsList() {
  const { user } = useAuth();
  const { data: tickets, isLoading } = useTickets();
  const createTicket = useCreateTicket();
  const upload = useUpload();
  const { toast } = useToast();
  const searchParams = useSearch();
  
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const prevTicketCountRef = useRef<number>(0);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [zone, setZone] = useState("");

  // Check if viewing "Mis Tickets" (for analysts)
  const showOnlyAssigned = searchParams?.includes("my=true");

  // Notify admins/analysts of new tickets
  useEffect(() => {
    if (!tickets || user?.role === "usuario") return;
    const currentCount = tickets.length;
    if (prevTicketCountRef.current > 0 && currentCount > prevTicketCountRef.current) {
      const newTicketCount = currentCount - prevTicketCountRef.current;
      toast({
        title: "⏰ Nuevo ticket",
        description: `${newTicketCount} nuevo${newTicketCount > 1 ? "s" : ""} ticket${newTicketCount > 1 ? "s" : ""} requiere${newTicketCount > 1 ? "n" : ""} atención.`,
      });
    }
    prevTicketCountRef.current = currentCount;
  }, [tickets, user?.role, toast]);

  if (isLoading) return <div className="text-center py-20 text-muted-foreground animate-pulse">Cargando tickets...</div>;

  const relevantTickets = 
    user?.role === 'usuario' 
      ? tickets?.filter(t => t.createdById === user.id)
      : user?.role === 'analista' && showOnlyAssigned
      ? tickets?.filter(t => t.assignedToId === user.id)
      : user?.role === 'analista'
      ? tickets // Show all tickets so analyst can take one
      : tickets;

  const filteredTickets = relevantTickets?.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toString().includes(search)
  ) || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !zone) return;
    
    let url = undefined;
    if (file) {
      const uploadRes = await upload.mutateAsync(file);
      url = uploadRes.url;
    }

    createTicket.mutate({
      title,
      description,
      category,
      zone,
      damageEvidenceUrl: url
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setTitle(""); setDescription(""); setCategory(""); setZone(""); setFile(null);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            {showOnlyAssigned ? "Mis Tickets Asignados" : "Tickets"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {showOnlyAssigned 
              ? "Tickets que tienes asignados." 
              : "Gestión de incidentes y solicitudes de soporte."}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all hover:-translate-y-0.5">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-white">Crear Solicitud de Soporte</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del problema</Label>
                <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required className="bg-black/20 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sede / Zona</Label>
                  <Select value={zone} onValueChange={setZone} required>
                    <SelectTrigger className="bg-black/20 border-white/10">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción detallada</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="bg-black/20 border-white/10 resize-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Evidencia del Daño (Opcional)</Label>
                <Input id="file" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="bg-black/20 border-white/10 text-muted-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:hover:bg-primary/90 cursor-pointer" />
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={createTicket.isPending || upload.isPending} className="w-full">
                  {(createTicket.isPending || upload.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar Ticket"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Buscar por ID o título..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-black/20 border-white/5 focus-visible:ring-primary/50 max-w-md h-12 rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTickets.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground border border-dashed border-white/10 rounded-2xl">
            No se encontraron tickets.
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
              <div className="glass-card p-6 rounded-2xl hover:bg-white/5 transition-all cursor-pointer hover-lift flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-md">#{ticket.id}</span>
                    <h3 className="font-semibold text-lg text-white mt-2 line-clamp-1">{ticket.title}</h3>
                  </div>
                  <StatusBadge status={ticket.status} />
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                  {ticket.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-4 border-t border-white/5 mt-auto">
                  <div className="flex gap-4">
                    <span>{ticket.category}</span>
                    <span>•</span>
                    <span>{ticket.zone}</span>
                  </div>
                  <span>{format(new Date(ticket.createdAt ?? Date.now()), "d MMM yyyy", { locale: es })}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
