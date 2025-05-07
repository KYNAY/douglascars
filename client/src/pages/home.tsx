import { HeroSection } from "@/components/hero-section";
import { SearchSection } from "@/components/search-section";
import { CarCard } from "@/components/car-card";
import { ServicesSection } from "@/components/services-section";

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
      
      {/* Destaques Especiais - Adicionado como solicitado */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <img 
              src="https://images.emojiterra.com/google/noto-emoji/animated-emoji/1f525.gif" 
              alt="Fire" 
              className="w-7 h-7 mr-2"
            /> 
            Destaques Especiais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Toyota Hilux 2023 */}
            <div className="glass-card rounded-xl overflow-hidden featured-card group transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
              <div className="relative overflow-hidden h-64">
                <img 
                  src="https://i.pinimg.com/originals/f3/81/f9/f381f9c73492eb5ae0cd14926f174270.jpg" 
                  alt="Toyota Hilux 2023" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-0 left-0 bg-gradient-to-r from-primary/80 to-primary/30 text-white px-3 py-1 text-sm font-bold rounded-br-lg">
                  DESTAQUE
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <img 
                      src="https://static.vecteezy.com/system/resources/previews/022/100/658/original/toyota-logo-transparent-free-png.png" 
                      alt="Toyota" 
                      className="w-8 h-8 mr-2"
                    />
                    <span className="text-sm font-medium">Toyota Hilux SRX 2023</span>
                  </div>
                  <span className="text-primary font-bold text-xl">R$ 290.900</span>
                </div>
                <div className="flex gap-3 text-sm text-gray-300 mb-3">
                  <span>2023/2023</span>
                  <span>•</span>
                  <span>Diesel</span>
                  <span>•</span>
                  <span>12.000 km</span>
                </div>
                <Button asChild className="w-full bg-primary hover:bg-red-700">
                  <Link href="/estoque">Ver detalhes</Link>
                </Button>
              </div>
            </div>
            
            {/* Toyota SW4 2025 */}
            <div className="glass-card rounded-xl overflow-hidden featured-card group transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
              <div className="relative overflow-hidden h-64">
                <img 
                  src="https://www.toyota.com.br/wp-content/themes/toyota-2.0.0/frontend/static/images/swbg/sw4-2024.png" 
                  alt="Toyota SW4 2025" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-0 left-0 bg-gradient-to-r from-primary/80 to-primary/30 text-white px-3 py-1 text-sm font-bold rounded-br-lg">
                  LANÇAMENTO
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <img 
                      src="https://static.vecteezy.com/system/resources/previews/022/100/658/original/toyota-logo-transparent-free-png.png" 
                      alt="Toyota" 
                      className="w-8 h-8 mr-2"
                    />
                    <span className="text-sm font-medium">Toyota SW4 Diamond 2025</span>
                  </div>
                  <span className="text-primary font-bold text-xl">R$ 410.000</span>
                </div>
                <div className="flex gap-3 text-sm text-gray-300 mb-3">
                  <span>2025/2025</span>
                  <span>•</span>
                  <span>Diesel</span>
                  <span>•</span>
                  <span>0 km</span>
                </div>
                <Button asChild className="w-full bg-primary hover:bg-red-700">
                  <Link href="/estoque">Ver detalhes</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
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
              className="btn-gradient px-8 py-3 rounded-lg text-white font-medium transition-all"
            >
              <Link href="/estoque">
                Veja todas as novidades
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <ServicesSection />
      <IntegrationsSection />
    </>
  );
}
