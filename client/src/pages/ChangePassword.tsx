import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useChangePassword } from "@/hooks/use-auth-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ChangePassword() {
  const { user, logout } = useAuth();
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // If user is not forced to change password, redirect
  if (user && !user.mustChangePassword) {
    window.location.href = "/";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          // Logout and force re-login
          logout();
          setTimeout(() => {
            window.location.href = "/";
          }, 500);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Cambiar Contraseña</CardTitle>
          <CardDescription>
            Por favor, cambia tu contraseña temporal por una permanente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Contraseña Actual
              </label>
              <Input
                type="password"
                placeholder="Ingresa tu contraseña temporal"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Nueva Contraseña
              </label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Confirmar Contraseña
              </label>
              <Input
                type="password"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                minLength={6}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-red-400">Las contraseñas no coinciden</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                changePassword.isPending ||
                !currentPassword ||
                !newPassword ||
                newPassword !== confirmPassword
              }
              className="w-full bg-primary hover:bg-primary/90"
            >
              {changePassword.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cambiar Contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
