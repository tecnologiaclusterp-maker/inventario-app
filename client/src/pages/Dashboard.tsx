import { useAuth } from "@/hooks/use-auth";
import { useTickets } from "@/hooks/use-tickets";
import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2, Ticket as TicketIcon, Users, Timer, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { StatusBadge } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tickets = [], isLoading: ticketsLoading } = useTickets();
  const { data: users = [], isLoading: usersLoading } = useUsers();

  if (ticketsLoading || usersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl glass-card" />)}
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isAnalista = user?.role === 'analista';
  const myTickets = tickets.filter(t => t.createdById === user?.id);
  const myAssignedTickets = tickets.filter(t => t.assignedToId === user?.id);
  const relevantTickets = user?.role === 'usuario' ? myTickets : tickets;

  const abiertos = relevantTickets.filter(t => t.status === 'abierto');
  const resueltos = relevantTickets.filter(t => t.status === 'resuelto' || t.status === 'cerrado');

  // Technician Specific Stats
  const mySolvedCount = tickets.filter(t => t.assignedToId === user?.id && (t.status === 'resuelto' || t.status === 'cerrado')).length;
  const myActiveCount = tickets.filter(t => t.assignedToId === user?.id && t.status === 'asignado').length;
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sinSolucion = relevantTickets.filter(
    t => new Date(t.createdAt ?? Date.now()) < twentyFourHoursAgo && t.status !== 'resuelto' && t.status !== 'cerrado'
  );

  // Technician Performance Data
  const technicians = users.filter(u => u.role === 'analista' || u.role === 'admin');
  const techStats = technicians.map(tech => {
    const assignedTickets = tickets.filter(t => t.assignedToId === tech.id);
    const activeTickets = assignedTickets.filter(t => t.status === 'asignado');
    const solvedTickets = assignedTickets.filter(t => t.status === 'resuelto' || t.status === 'cerrado');
    
    let avgHours = 0;
    if (solvedTickets.length > 0) {
      const totalHours = solvedTickets.reduce((acc, t) => {
        const start = new Date(t.createdAt ?? Date.now()).getTime();
        const end = new Date(t.updatedAt ?? Date.now()).getTime();
        return acc + (end - start) / (1000 * 60 * 60);
      }, 0);
      avgHours = totalHours / solvedTickets.length;
    }

    return {
      ...tech,
      activeCount: activeTickets.length,
      solvedCount: solvedTickets.length,
      avgResolutionTime: avgHours.toFixed(1)
    };
  }).sort((a, b) => b.solvedCount - a.solvedCount);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">
            Hola, {user?.firstName || user?.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? "Panel de control administrativo e indicadores de gestión." : "Aquí tienes un resumen de la actividad de soporte."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover-lift border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Tickets Abiertos
            </CardTitle>
            <TicketIcon className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-white">{abiertos.length}</div>
            <p className="text-xs text-muted-foreground mt-1 text-primary">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Retrasados {'>'} 24h
            </CardTitle>
            <Clock className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-white">{sinSolucion.length}</div>
            <p className="text-xs text-muted-foreground mt-1 text-amber-500">Tickets estancados</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {isAnalista && !isAdmin ? "Mis Resueltos" : "Total Resueltos"}
            </CardTitle>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-white">
              {isAnalista && !isAdmin ? mySolvedCount : resueltos.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-500">
              {isAnalista && !isAdmin ? "Tu historial personal" : "Total acumulado"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Promedio Res.
            </CardTitle>
            <Timer className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-display font-bold text-white">
              {resueltos.length > 0 
                ? (resueltos.reduce((acc, t) => acc + (new Date(t.updatedAt ?? Date.now()).getTime() - new Date(t.createdAt ?? Date.now()).getTime()) / (1000 * 60 * 60), 0) / resueltos.length).toFixed(1)
                : "0"}h
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-purple-500">Tiempo medio</p>
          </CardContent>
        </Card>
      </div>

      {/* My Assigned Tickets for Analysts - Below Stats */}
      {isAnalista && (
        <div className="mt-12 animate-in fade-in duration-500 delay-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <TicketIcon className="w-6 h-6 text-purple-500" /> Mis Tickets Asignados
            </h2>
          </div>
          
          {myAssignedTickets.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-white/5 hover-lift">
              <TicketIcon className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
              <p className="text-lg text-muted-foreground">No tienes tickets asignados todavía.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">Los tickets que te asignen aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myAssignedTickets.map(ticket => (
                <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                  <div className="glass-card p-5 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer group border border-purple-500/20 hover:border-purple-500/40 hover-lift">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">{ticket.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          <span className="px-2 py-1 bg-white/5 rounded">#{ticket.id}</span>
                          <span>{ticket.zone}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(ticket.createdAt ?? Date.now()), { addSuffix: true, locale: es })}</span>
                        </div>
                      </div>
                      <StatusBadge status={ticket.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Technician Performance Table for Admin */}
      {isAdmin && (
        <section className="space-y-4 mt-12">
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Rendimiento de Analistas
          </h2>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Analista</TableHead>
                  <TableHead className="text-center text-muted-foreground font-medium">Tickets Activos</TableHead>
                  <TableHead className="text-center text-muted-foreground font-medium">Resueltos</TableHead>
                  <TableHead className="text-right text-muted-foreground font-medium">Tiempo Promedio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {techStats.map((tech) => (
                  <TableRow key={tech.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={tech.profileImageUrl || ''} />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {tech.firstName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{tech.firstName} {tech.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tech.activeCount > 3 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {tech.activeCount}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-white">{tech.solvedCount}</TableCell>
                    <TableCell className="text-right text-primary font-mono">{tech.avgResolutionTime}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {/* Critical Alerts Dashboard */}
      {(user?.role === 'admin' || user?.role === 'analista') && (abiertos.length > 0 || sinSolucion.length > 0) && (
        <div className="mt-12">
          <h2 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Atención Requerida
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Por Asignar */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b border-white/10 pb-2">Tickets por Asignar</h3>
              {abiertos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay tickets pendientes.</p>
              ) : (
                <div className="space-y-3">
                  {abiertos.slice(0, 5).map(ticket => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                      <div className="glass-card p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white group-hover:text-primary transition-colors">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ticket.zone} • {formatDistanceToNow(new Date(ticket.createdAt ?? Date.now()), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sin Solucion */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-amber-500/80 border-b border-white/10 pb-2">Retrasados ({'>'} 24h)</h3>
              {sinSolucion.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay tickets retrasados.</p>
              ) : (
                <div className="space-y-3">
                  {sinSolucion.slice(0, 5).map(ticket => (
                    <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                      <div className="glass-card border-amber-500/30 p-4 rounded-xl hover:bg-amber-500/5 transition-colors cursor-pointer group flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{ticket.title}</p>
                          <p className="text-xs text-amber-500/70 mt-1">
                            {formatDistanceToNow(new Date(ticket.createdAt ?? Date.now()), { addSuffix: true, locale: es })}
                          </p>
                        </div>
                        <StatusBadge status={ticket.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
