import { useState } from "react";
import { Ticket, ArrowRight, User, Lock, ShieldCheck, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForgotPassword } from "@/hooks/use-auth-password";

export default function Login() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const forgotPassword = useForgotPassword();
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgotForm, setShowForgotForm] = useState(false);
  
  // Login State
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // Register State
  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regCode, setRegCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        toast({ title: "Error", description: "Usuario o contraseña incorrectos", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Ocurrió un problema al conectar con el servidor", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: regUser, 
          password: regPass,
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          company: regCompany,
          adminCode: regCode
        }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message || "Error al registrarse", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Ocurrió un problema al conectar con el servidor", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] opacity-50 pointer-events-none" />

      <div className="glass-card max-w-md w-full p-8 rounded-3xl relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-xl shadow-primary/30 mb-6">
          <Ticket className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-white mb-6">IT Helpdesk</h1>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/20 mb-6">
            <TabsTrigger value="login">Ingresar</TabsTrigger>
            <TabsTrigger value="register">Registro</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="user" 
                    value={loginUser} 
                    onChange={e => setLoginUser(e.target.value)} 
                    className="pl-10 bg-black/20 border-white/10" 
                    placeholder="Tu usuario"
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="pass">Contraseña</Label>
                  <Button variant="ghost" className="p-0 h-auto text-xs text-primary" type="button" onClick={() => setShowForgotForm(true)}>
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="pass" 
                    type="password" 
                    value={loginPass} 
                    onChange={e => setLoginPass(e.target.value)} 
                    className="pl-10 bg-black/20 border-white/10" 
                    placeholder="••••••••"
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Cargando..." : "Iniciar Sesión"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="regFirst">Nombre</Label>
                  <Input id="regFirst" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} className="bg-black/20 border-white/10" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="regLast">Apellido</Label>
                  <Input id="regLast" value={regLastName} onChange={e => setRegLastName(e.target.value)} className="bg-black/20 border-white/10" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="regEmail">Correo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="regEmail" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} className="pl-10 bg-black/20 border-white/10" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="regCompany">Empresa</Label>
                <Select value={regCompany} onValueChange={setRegCompany}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue placeholder="Selecciona tu empresa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="SILLATAVA">SILLATAVA</SelectItem>
                    <SelectItem value="OPLA">OPLA</SelectItem>
                    <SelectItem value="PESS">PESS</SelectItem>
                    <SelectItem value="OCARRAVA">OCARRAVA</SelectItem>
                    <SelectItem value="PROTO">PROTO</SelectItem>
                    <SelectItem value="PROTO II">PROTO II</SelectItem>
                    <SelectItem value="SAMANI">SAMANI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="regUser">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="regUser" value={regUser} onChange={e => setRegUser(e.target.value)} className="pl-10 bg-black/20 border-white/10" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="regPass">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="regPass" type="password" value={regPass} onChange={e => setRegPass(e.target.value)} className="pl-10 bg-black/20 border-white/10" required />
                </div>
              </div>
              <div className="space-y-1 pt-2">
                <Label htmlFor="regCode" className="text-primary flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Código de Aprobación
                </Label>
                <Input 
                  id="regCode" 
                  value={regCode} 
                  onChange={e => setRegCode(e.target.value)} 
                  className="bg-primary/5 border-primary/20 focus:border-primary placeholder:text-primary/20" 
                  placeholder="Solicita el código al Admin"
                  required 
                />
              </div>
              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear Usuario"}
                <UserPlus className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Forgot Password Modal */}
        {showForgotForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm">
              <h2 className="text-xl font-bold text-white mb-4">Recuperar Contraseña</h2>
              <p className="text-sm text-slate-400 mb-4">
                Ingresa tu correo electrónico y te enviaremos una contraseña temporal.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="forgot-email" className="text-slate-300">Correo</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="bg-slate-700/50 border-slate-600 text-white mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      forgotPassword.mutate(forgotEmail, {
                        onSuccess: () => {
                          setForgotEmail("");
                          setShowForgotForm(false);
                        }
                      });
                    }}
                    disabled={forgotPassword.isPending || !forgotEmail}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {forgotPassword.isPending ? "Enviando..." : "Enviar"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForgotForm(false);
                      setForgotEmail("");
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
