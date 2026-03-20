import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Ticket, Server, Users, LogOut, Loader2, TrendingUp, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout, isLoggingOut } = useAuth();
  const [location] = useLocation();

  if (!user) return <>{children}</>;

  const isAdmin = user.role === "admin";
  const isAnalista = user.role === "analista";

  const navigation = [
    { name: "Inicio", href: "/", icon: LayoutDashboard, visible: true },
    { name: isAnalista ? "Mis Tickets" : isAdmin ? "Todos los Tickets" : "Mis Tickets", href: isAnalista ? "/tickets?my=true" : "/tickets", icon: Ticket, visible: true },
    { name: "Todos los Tickets", href: "/tickets", icon: Ticket, visible: isAnalista },
    { name: "Inventario", href: "/inventory", icon: Server, visible: isAdmin || isAnalista },
    { name: "Usuarios", href: "/users", icon: Users, visible: isAdmin },
    { name: "Reportes", href: "/reports", icon: FileText, visible: isAdmin },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20">
        <Sidebar variant="inset" className="border-r border-white/5 bg-sidebar">
          <SidebarContent>
            <div className="p-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">IT Desk</span>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-muted-foreground/70 uppercase text-xs tracking-wider">Menú Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.filter(n => n.visible).map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.href}
                        className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium transition-all"
                      >
                        <Link href={item.href} className="flex items-center gap-3 py-5">
                          <item.icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4">
              <div className="glass-card rounded-2xl p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-white/10">
                    <AvatarImage src={user.profileImageUrl || ''} />
                    <AvatarFallback className="bg-primary/20 text-primary font-medium">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-white truncate">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                    </span>
                    <span className="text-xs text-primary uppercase font-bold tracking-wide">
                      {user.role}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start text-muted-foreground hover:text-white"
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-16 flex items-center px-4 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <SidebarTrigger className="text-muted-foreground hover:text-white" />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
