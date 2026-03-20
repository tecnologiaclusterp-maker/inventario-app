import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

// Components & Pages
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import TicketsList from "@/pages/TicketsList";
import TicketDetail from "@/pages/TicketDetail";
import InventoryList from "@/pages/InventoryList";
import InventoryDashboard from "@/pages/InventoryDashboard";
import InventoryDetail from "@/pages/InventoryDetail";
import UsersList from "@/pages/UsersList";
import ChangePassword from "@/pages/ChangePassword";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/not-found";

// Require Auth Wrapper
function RequireAuth({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, user, error } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  // If there's an error loading auth, still show login
  if (error || !isAuthenticated) {
    return <Login />;
  }

  // Force password change if user has mustChangePassword flag
  if (user && user.mustChangePassword) {
    return <ChangePassword />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <RequireAuth component={Dashboard} />} />
      <Route path="/tickets" component={() => <RequireAuth component={TicketsList} />} />
      <Route path="/tickets/:id" component={() => <RequireAuth component={TicketDetail} />} />
      <Route path="/inventory" component={() => <RequireAuth component={InventoryList} />} />
      <Route path="/inventory/dashboard" component={() => <RequireAuth component={InventoryDashboard} />} />
      <Route path="/inventory/:id" component={() => <RequireAuth component={InventoryDetail} />} />
      <Route path="/users" component={() => <RequireAuth component={UsersList} />} />
      <Route path="/reports" component={() => <RequireAuth component={Reports} />} />
      <Route path="/change-password" component={() => <RequireAuth component={ChangePassword} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
          <PwaInstallBanner />
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("App error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar la aplicación</h1>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}

export default App;
