import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MarketplacePage } from "./pages/MarketplacePage";
import { LivestockDetailPage } from "./pages/LivestockDetailPage";
import { SellerDashboard } from "./pages/SellerDashboard";
import { BuyerDashboard } from "./pages/BuyerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Switch, Route } from "wouter";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/marketplace" component={MarketplacePage} />
          <Route path="/livestock/:id" component={LivestockDetailPage} />
          <Route path="/seller/dashboard" component={SellerDashboard} />
          <Route path="/buyer/dashboard" component={BuyerDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;