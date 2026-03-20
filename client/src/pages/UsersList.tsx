import { useState } from "react";
import { useUsers, useUpdateUserRole, useResetUserPassword } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users as UsersIcon, Search, RotateCcw, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { USER_ROLES } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  analista: 'Analista',
  usuario: 'Usuario',
};

export default function UsersList() {
  const { user } = useAuth();
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const resetPassword = useResetUserPassword();
  const [search, setSearch] = useState("");

  if (user?.role !== 'admin') return <Redirect to="/" />;
  if (isLoading) return <div className="text-center py-20 text-muted-foreground">Cargando usuarios...</div>;

  const filtered = users?.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.firstName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-primary" /> Gestión de Usuarios
        </h1>
        <p className="text-muted-foreground mt-1">Administra los roles y permisos del personal.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Buscar por nombre o correo..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 bg-black/20 border-white/5 focus-visible:ring-primary/50 max-w-md h-12 rounded-xl"
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
        <Table>
          <TableHeader className="bg-black/20">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Usuario</TableHead>
              <TableHead className="text-muted-foreground font-medium">Correo</TableHead>
              <TableHead className="text-muted-foreground font-medium">Rol Actual</TableHead>
              <TableHead className="text-right text-muted-foreground font-medium">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.profileImageUrl || ''} />
                      <AvatarFallback className="bg-primary/20 text-primary">{u.firstName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white">{u.firstName} {u.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded font-medium uppercase tracking-wider
                    ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400' : 
                      u.role === 'analista' ? 'bg-blue-500/10 text-blue-400' : 
                      'bg-slate-500/10 text-slate-400'}`}>
                    {ROLE_LABELS[u.role || ''] || u.role}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resetPassword.mutate(u.id)}
                      disabled={resetPassword.isPending || u.id === user?.id}
                      className="h-8 px-2 hover:bg-red-500/10 text-red-400 hover:text-red-300"
                      title="Resetear contraseña"
                    >
                      {resetPassword.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    </Button>
                    <Select 
                      disabled={u.id === user?.id || updateRole.isPending}
                      value={u.role || 'usuario'} 
                      onValueChange={(val: any) => updateRole.mutate({ id: u.id, role: val })}
                    >
                      <SelectTrigger className="w-[140px] bg-black/20 border-white/10 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map(r => <SelectItem key={r} value={r} className="text-sm">{ROLE_LABELS[r] || r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
