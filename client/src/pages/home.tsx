import { HeroSection } from "@/components/hero-section";
import { SearchSection } from "@/components/search-section";
import { CarCard } from "@/components/car-card";
import { ServicesSection } from "@/components/services-section";
import { DealerDashboard } from "@/components/dealer-dashboard";
import { IntegrationsSection } from "@/components/integrations-section";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: featuredVehicles, isLoading } = useQuery({
    queryKey: ['/api/vehicles?featured=true'],
  });
  
  return (
    <>
      <HeroSection />
      <SearchSection />
      
      {/* Featured Vehicles */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-poppins font-bold">Últimas novidades</h2>
            <Link href="/estoque" className="text-primary hover:underline flex items-center">
              Ver todas <span className="ml-2">→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeletons
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="glass-card rounded-xl overflow-hidden animate-pulse">
                  <div className="h-56 bg-white/10"></div>
                  <div className="p-5">
                    <div className="h-6 bg-white/10 rounded mb-2 w-2/3"></div>
                    <div className="h-4 bg-white/10 rounded mb-4"></div>
                    <div className="flex justify-between mb-4">
                      <div className="h-4 bg-white/10 rounded w-20"></div>
                      <div className="h-4 bg-white/10 rounded w-20"></div>
                    </div>
                    <div className="h-8 bg-white/10 rounded mb-4"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredVehicles?.slice(0, 3).map((vehicle) => (
                <CarCard key={vehicle.id} vehicle={vehicle} featured={true} />
              ))
            )}
          </div>
          
          <div className="flex justify-center mt-12">
            <Button 
              asChild
              variant="outline"
              className="bg-white/10 hover:bg-white/15 px-8 py-3 rounded-lg text-white font-medium transition-all"
            >
              <Link href="/estoque">
                Veja todas as novidades
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <ServicesSection />
      <DealerDashboard />
      <IntegrationsSection />
    </>
  );
}
