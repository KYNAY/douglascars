import { HeroSection } from "@/components/hero-section";
import { SearchSection } from "@/components/search-section";
import { CarCard } from "@/components/car-card";
import { ServicesSection } from "@/components/services-section";

import { IntegrationsSection } from "@/components/integrations-section";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: featuredVehicles = [], isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['/api/vehicles?featured=true'],
  });
  
  const { data: specialFeaturedVehicles = [], isLoading: isLoadingSpecial } = useQuery({
    queryKey: ['/api/vehicles?specialFeatured=true'],
  });
  
  return (
    <>
      <HeroSection />
      <SearchSection />
      
      {/* Destaques Especiais - Seção dinâmica para veículos com especialFeatured=true */}
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
            {isLoadingSpecial ? (
              // Loading skeletons para destaques especiais
              Array(2).fill(0).map((_, index) => (
                <div key={index} className="glass-card rounded-xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-white/10"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-8 w-40 bg-white/10 rounded"></div>
                      <div className="h-8 w-24 bg-white/10 rounded"></div>
                    </div>
                    <div className="h-4 bg-white/10 rounded mb-3 w-full"></div>
                    <div className="h-10 bg-white/10 rounded"></div>
                  </div>
                </div>
              ))
            ) : specialFeaturedVehicles && specialFeaturedVehicles.length > 0 ? (
              // Renderizar todos os veículos com specialFeatured=true
              specialFeaturedVehicles.map((vehicle) => (
                <div key={vehicle.id} className="glass-card rounded-xl overflow-hidden featured-card group transition-all duration-500 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                  <div className="relative overflow-hidden h-64">
                    <img 
                      src={vehicle.imageUrl} 
                      alt={`${vehicle.brand?.name} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-600/90 to-amber-500/60 text-white px-3 py-1 text-sm font-bold rounded-br-lg">
                      DESTAQUE ESPECIAL
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        {vehicle.brand?.logoUrl && (
                          <img 
                            src={vehicle.brand.logoUrl} 
                            alt={vehicle.brand.name} 
                            className="w-8 h-8 mr-2"
                          />
                        )}
                        <span className="text-sm font-medium">{vehicle.brand?.name} {vehicle.model}</span>
                      </div>
                      <span className="text-primary font-bold text-xl">
                        {typeof vehicle.price === 'string'
                          ? `R$ ${parseFloat(vehicle.price).toLocaleString('pt-BR')}`
                          : `R$ ${vehicle.price.toLocaleString('pt-BR')}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-3">
                      <span>{vehicle.year}</span>
                      {vehicle.fuel && (
                        <>
                          <span>•</span>
                          <span>{vehicle.fuel}</span>
                        </>
                      )}
                      {vehicle.mileage !== undefined && (
                        <>
                          <span>•</span>
                          <span>{vehicle.mileage.toLocaleString('pt-BR')} km</span>
                        </>
                      )}
                    </div>
                    <Button asChild className="w-full bg-primary hover:bg-red-700">
                      <Link href={`/estoque/${vehicle.id}`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              // Caso não haja veículos com specialFeatured=true
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-400">Nenhum veículo em destaque especial no momento.</p>
              </div>
            )}
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
            {isLoadingFeatured ? (
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
      <IntegrationsSection />
    </>
  );
}
