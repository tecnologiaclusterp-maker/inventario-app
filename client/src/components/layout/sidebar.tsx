import { LayoutDashboard, Ticket, Box, Users, HelpCircle, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  const navItems = [
    { title: "Tablero", url: "/", icon: LayoutDashboard, roles: ['usuario', 'analista', 'admin'] },
    { title: "Tickets", url: "/tickets", icon: Ticket, roles: ['usuario', 'analista', 'admin'] },
    { title: "Inventario", url: "/inventory", icon: Box, roles: ['analista', 'admin'] },
    { title: "Usuarios", url: "/users", icon: Users, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(item => user && item.roles.includes(user.role || ''));

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-sidebar-foreground leading-tight">Helpdesk IT</h2>
              <p className="text-xs text-sidebar-foreground/60 font-medium tracking-wide uppercase">{user?.role || 'Invitado'}</p>
            </div>
          </div>
          <SidebarGroupLabel className="mt-4 text-xs font-semibold text-sidebar-foreground/50">NAVEGACIÓN</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url || location.startsWith(item.url + '/')}>
                    <Link href={item.url} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
         <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
         </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
