import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";

// Pages
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { LivestockDetailPage } from "./pages/LivestockDetailPage";
import { BuyerDashboard } from "./pages/BuyerDashboard";
import { SellerDashboard } from "./pages/SellerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

function ProtectedRoute({ component: Component, allowedRoles }: { component: any, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/marketplace" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/marketplace" component={MarketplacePage} />
      <Route path="/livestock/:id" component={LivestockDetailPage} />
      
      {/* Protected Dashboards */}
      <Route path="/dashboard/buyer">
        {() => <ProtectedRoute component={BuyerDashboard} allowedRoles={["buyer", "admin"]} />}
      </Route>
      <Route path="/dashboard/seller">
        {() => <ProtectedRoute component={SellerDashboard} allowedRoles={["seller", "admin"]} />}
      </Route>
      <Route path="/dashboard/admin">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
