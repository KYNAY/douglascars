import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Inventory from "@/pages/inventory";
import VehicleDetail from "@/pages/vehicle-detail";
import SellYourCar from "@/pages/sell-your-car";
import Finance from "@/pages/finance";
import About from "@/pages/about";
import Avaliacao from "@/pages/avaliacao";
import AdminDashboard from "@/pages/admin/dashboard";
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
      <Route path="/venda-seu-carro" component={SellYourCar} />
      <Route path="/financie" component={Finance} />
      <Route path="/sobre" component={About} />
      <Route path="/admin" component={AdminDashboard} />
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
