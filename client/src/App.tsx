import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import VehicleDetail from "@/pages/vehicle-detail";
import Finance from "@/pages/finance";
import About from "@/pages/about";
import Avaliacao from "@/pages/avaliacao";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminLogin from "@/pages/admin/login";
import DealerLogin from "@/pages/vendedor";
import DealerDashboard from "@/pages/dealer-dashboard";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingButtons } from "@/components/floating-buttons";
import { AuthProvider } from "@/lib/auth-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/estoque" component={Inventory} />
      <Route path="/estoque/:id" component={VehicleDetail} />
      <Route path="/financie" component={Finance} />
      <Route path="/avaliacao" component={Avaliacao} />
      <Route path="/sobre" component={About} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/vendedor" component={DealerLogin} />
      <Route path="/vendedor/dashboard" component={DealerDashboard} />
      <Route path="/dealer-login" component={DealerLogin} />
      <Route path="/dealer-dashboard" component={DealerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
          <FloatingButtons />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
