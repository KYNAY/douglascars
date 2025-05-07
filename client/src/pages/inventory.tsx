import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaSearch, FaSort, FaCar, FaMotorcycle } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

interface Brand {
  id: number;
  name: string;
  logoUrl: string;
}

interface Vehicle {
  id: number;
  brandId: number;
  model: string;
  year: string;
  color: string;
  price: string | number;
  originalPrice: string | number | null;
  mileage: number;
  description: string | null;
  featured: boolean;
  sold: boolean;
  imageUrl: string;
  transmission?: string;
  fuel?: string;
  bodyType?: string;
  vehicleType?: 'car' | 'motorcycle';
  brand?: Brand;
}

export default function Inventory() {
  const [location] = useLocation();
  const [, params] = useRoute("/estoque/:id");
  const urlParams = new URLSearchParams(window.location.search);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(urlParams.get('search') || "");
  const [selectedBrand, setSelectedBrand] = useState(urlParams.get('brandId') || "all");
  const [sortBy, setSortBy] = useState("newest");
  const [vehicleType, setVehicleType] = useState<'all' | 'car' | 'motorcycle'>(
    (urlParams.get('vehicleType') as 'car' | 'motorcycle' | null) || 'all'
  );
  
  // Query for brands
  const { data: brands } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const response = await fetch('/api/brands');
      if (!response.ok) {
        throw new Error('Erro ao buscar marcas');
      }
      return response.json();
    }
  });
  
  // Build query parameters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    if (selectedBrand && selectedBrand !== 'all') {
      params.append('brandId', selectedBrand);
    }
    
    if (vehicleType !== 'all') {
      params.append('vehicleType', vehicleType);
    }
    
    return params.toString();
  };
  
  // Query for vehicles with filters
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: [`/api/vehicles?${buildQueryString()}`],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles?${buildQueryString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar veículos');
      }
      return response.json();
    }
  });
  
  // Sort vehicles based on selection
  const sortedVehicles = vehicles ? [...vehicles].sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
    
    switch (sortBy) {
      case 'price-asc':
        return priceA - priceB;
      case 'price-desc':
        return priceB - priceA;
      case 'name-asc':
        return `${a.brand?.name} ${a.model}`.localeCompare(`${b.brand?.name} ${b.model}`);
      case 'name-desc':
        return `${b.brand?.name} ${b.model}`.localeCompare(`${a.brand?.name} ${a.model}`);
      case 'newest':
      default:
        return 0; // API already returns newest first
    }
  }) : [];
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = buildQueryString();
    window.history.pushState(
      {},
      '',
      queryString ? `/estoque?${queryString}` : '/estoque'
    );
  };
  
  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-poppins font-bold mb-6">Nosso Estoque</h1>
        
        {/* Filters */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium mb-1">
                Buscar
              </label>
              <div className="glass-search flex items-center rounded-lg overflow-hidden text-white">
                <Input 
                  id="search"
                  type="text" 
                  placeholder="Marca, modelo ou descrição" 
                  className="w-full bg-transparent border-none px-4 py-2 focus:outline-none" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-red-700 p-2 transition-colors"
                >
                  <FaSearch />
                </Button>
              </div>
            </div>
            
            <div>
              <label htmlFor="brand" className="block text-sm font-medium mb-1">
                Marca
              </label>
              <Select 
                value={selectedBrand} 
                onValueChange={(value) => {
                  setSelectedBrand(value);
                  // Auto-submit when brand changes
                  setTimeout(() => {
                    document.querySelector('form')?.dispatchEvent(
                      new Event('submit', { cancelable: true, bubbles: true })
                    );
                  }, 0);
                }}
              >
                <SelectTrigger className="glass-search border-none">
                  <SelectValue placeholder="Todas as marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {brands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="sort" className="block text-sm font-medium mb-1">
                Ordenar por
              </label>
              <Select 
                value={sortBy} 
                onValueChange={setSortBy}
              >
                <SelectTrigger className="glass-search border-none">
                  <SelectValue placeholder="Mais recentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                  <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
          
          {/* Car brands grid */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="text-lg font-medium mb-4">Escolha por marca</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-4">
              {brands?.map((brand) => (
                <div 
                  key={brand.id}
                  onClick={() => {
                    setSelectedBrand(brand.id.toString());
                    setTimeout(() => {
                      document.querySelector('form')?.dispatchEvent(
                        new Event('submit', { cancelable: true, bubbles: true })
                      );
                    }, 0);
                  }}
                  className={`brand-logo-card flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all duration-300 
                    ${selectedBrand === brand.id.toString() ? 'bg-white/15 shadow-lg scale-110' : 'hover:bg-white/10 hover:scale-105'}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={brand.logoUrl} 
                      alt={brand.name} 
                      className={`max-w-full max-h-full transition-all duration-300 
                        ${selectedBrand === brand.id.toString() ? 'brightness-125' : 'brightness-90 hover:brightness-125'}`}
                    />
                  </div>
                  <span className={`text-xs mt-2 transition-colors duration-300 
                    ${selectedBrand === brand.id.toString() ? 'text-primary font-medium' : 'text-gray-300'}`}>
                    {brand.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Tipo de veículo tabs */}
        <Tabs 
          defaultValue={vehicleType} 
          className="mb-8"
          onValueChange={(value) => {
            // Garantir que o valor é um tipo válido
            const validValue = ['all', 'car', 'motorcycle'].includes(value) 
              ? value as 'all' | 'car' | 'motorcycle'
              : 'all';
            
            setVehicleType(validValue);
            // Update URL and load vehicles
            setTimeout(() => {
              const queryString = buildQueryString();
              window.history.pushState(
                {},
                '',
                queryString ? `/estoque?${queryString}` : '/estoque'
              );
              // Refresh vehicles with new filter
              document.querySelector('form')?.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              );
            }, 0);
          }}
        >
          <TabsList className="glass-card w-full mb-4 p-1">
            <TabsTrigger value="all" className="flex items-center gap-2 w-1/3">
              <span>Todos</span>
            </TabsTrigger>
            <TabsTrigger value="car" className="flex items-center gap-2 w-1/3">
              <FaCar className="mr-1" />
              <span>Carros</span>
            </TabsTrigger>
            <TabsTrigger value="motorcycle" className="flex items-center gap-2 w-1/3">
              <FaMotorcycle className="mr-1" />
              <span>Motos</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Results */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-medium">
            {isLoading 
              ? "Carregando veículos..." 
              : `${sortedVehicles?.length || 0} veículos encontrados`
            }
          </h2>
          <div className="flex items-center text-sm text-gray-400">
            <FaSort className="mr-2" /> 
            Ordenado por: {
              sortBy === 'newest' ? 'Mais recentes' :
              sortBy === 'price-asc' ? 'Menor preço' :
              sortBy === 'price-desc' ? 'Maior preço' :
              sortBy === 'name-asc' ? 'Nome (A-Z)' :
              'Nome (Z-A)'
            }
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, index) => (
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
            ))}
          </div>
        ) : sortedVehicles?.length === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center">
            <h3 className="text-xl font-medium mb-2">Nenhum veículo encontrado</h3>
            <p className="text-gray-400 mb-6">
              Não encontramos veículos com os filtros selecionados. Tente outros critérios de busca.
            </p>
            <Button 
              variant="outline"
              className="bg-white/10 hover:bg-white/15"
              onClick={() => {
                setSearchTerm("");
                setSelectedBrand("all");
                setVehicleType("all");
                window.history.pushState({}, '', '/estoque');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedVehicles.map((vehicle) => (
              <CarCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
