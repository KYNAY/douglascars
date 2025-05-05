import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";

interface Brand {
  id: number;
  name: string;
  logoUrl: string;
}

export function SearchSection() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(`/estoque?search=${encodeURIComponent(searchTerm)}`);
  };
  
  return (
    <section id="buscar" className="py-8">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-poppins font-semibold mb-6">Qual veículo você está buscando?</h2>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="glass-search flex items-center rounded-lg overflow-hidden text-white">
                <Input 
                  type="text" 
                  placeholder="Marca ou modelo" 
                  className="w-full bg-transparent border-none px-4 py-3 focus:outline-none" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-red-700 p-3 transition-colors"
                >
                  <FaSearch />
                </Button>
              </div>
            </div>
            <Button 
              asChild 
              variant="outline"
              className="bg-white/10 hover:bg-white/15 px-6 py-3 rounded-lg text-white font-medium transition-all"
            >
              <Link href="/estoque">Ver todo estoque</Link>
            </Button>
          </form>
          
          {/* Car brands */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3 py-4">
            {isLoading ? (
              // Placeholder loaders for brands
              Array(9).fill(0).map((_, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-center p-3 rounded-lg animate-pulse"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                  <div className="w-12 h-2 bg-white/10 rounded mt-2"></div>
                </div>
              ))
            ) : (
              brands?.map((brand) => (
                <Link 
                  key={brand.id} 
                  href={`/estoque?brandId=${brand.id}`}
                  className="brand-card flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className="w-12 h-12 flex items-center justify-center brand-logo">
                    <img 
                      src={brand.logoUrl} 
                      alt={brand.name} 
                      className="max-w-full max-h-full" 
                    />
                  </div>
                  <span className="text-xs mt-2 text-gray-300">{brand.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
