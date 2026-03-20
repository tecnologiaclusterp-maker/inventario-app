import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { UserData } from "@shared/schema";

export function useUsers() {
  return useQuery<UserData[]>({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      return api.users.list.responses[200].parse(data);
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'usuario' | 'analista' | 'admin' }) => {
      const validated = api.users.updateRole.input.parse({ role });
      const url = buildUrl(api.users.updateRole.path, { id });
      const res = await fetch(url, {
        method: api.users.updateRole.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al actualizar rol");
      }
      return api.users.updateRole.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ title: "Éxito", description: "Rol de usuario actualizado." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      const url = buildUrl(api.users.resetPassword.path, { id: userId });
      const res = await fetch(url, {
        method: api.users.resetPassword.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al resetear contraseña");
      }
      return api.users.resetPassword.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      toast({ 
        title: "Contraseña Reseteada", 
        description: `Contraseña temporal: ${data.temporaryPassword}`,
        duration: 10000
      });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}
