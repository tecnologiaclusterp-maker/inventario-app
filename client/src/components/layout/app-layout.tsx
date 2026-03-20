import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 relative">
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 z-20 sticky top-0">
            <SidebarTrigger className="-ml-2 hover-elevate active-elevate-2 text-muted-foreground hover:text-foreground transition-colors" />
            <div className="flex-1" />
            
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                   <span className="text-sm font-semibold">{user.firstName} {user.lastName}</span>
                   <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
                <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {user.firstName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </header>
          
          <main className="flex-1 overflow-auto p-4 md:p-8 relative z-10">
             {/* Decorative ambient background */}
             <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
             <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3" />
             
             <div className="relative z-10 max-w-7xl mx-auto h-full">
               {children}
             </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
