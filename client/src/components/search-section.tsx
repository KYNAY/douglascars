import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface Brand {
  id: number;
  name: string;
  logoUrl: string;
}

// Opções de filtros
const transmissionOptions = ["Automatizado", "Automático", "Manual"];
const fuelOptions = ["Diesel", "Flex", "Gasolina", "Gasolina e Elétrico"];
const bodyTypeOptions = [
  "Ciclomotor",
  "Conversível/Cupê",
  "Esportiva",
  "Hatch",
  "Minivan",
  "Picapes",
  "SUV / Utilitário Esportivo",
  "Sedã",
  "Street",
  "Utilitária",
  "Van/Utilitário",
  "Wagon/Perua"
];

const colorOptions = [
  "Amarelo",
  "Azul",
  "Bege",
  "Branco",
  "Cinza",
  "Dourado",
  "Laranja",
  "Marrom",
  "Prata",
  "Preto",
  "Verde",
  "Vermelho",
  "Vinho",
  "Outro"
];

export function SearchSection() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Estados para filtros
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construir parâmetros de busca
    const params = new URLSearchParams();
    
    if (searchTerm) {
      params.append("search", searchTerm);
    }
    
    if (priceRange[0] > 0) {
      params.append("minPrice", priceRange[0].toString());
    }
    
    if (priceRange[1] < 500000) {
      params.append("maxPrice", priceRange[1].toString());
    }
    
    if (selectedTransmissions.length > 0) {
      selectedTransmissions.forEach(t => params.append("transmission", t));
    }
    
    if (selectedFuels.length > 0) {
      selectedFuels.forEach(f => params.append("fuel", f));
    }
    
    if (selectedBodyTypes.length > 0) {
      selectedBodyTypes.forEach(b => params.append("bodyType", b));
    }
    
    if (selectedColors.length > 0) {
      selectedColors.forEach(c => params.append("color", c));
    }
    
    setLocation(`/estoque?${params.toString()}`);
  };
  
  const toggleTransmission = (value: string) => {
    setSelectedTransmissions(prev => 
      prev.includes(value) 
        ? prev.filter(t => t !== value) 
        : [...prev, value]
    );
  };
  
  const toggleFuel = (value: string) => {
    setSelectedFuels(prev => 
      prev.includes(value) 
        ? prev.filter(f => f !== value) 
        : [...prev, value]
    );
  };
  
  const toggleBodyType = (value: string) => {
    setSelectedBodyTypes(prev => 
      prev.includes(value) 
        ? prev.filter(b => b !== value) 
        : [...prev, value]
    );
  };
  
  const toggleColor = (value: string) => {
    setSelectedColors(prev => 
      prev.includes(value) 
        ? prev.filter(c => c !== value) 
        : [...prev, value]
    );
  };
  
  // Formatador de preço
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    <section id="buscar" className="py-8">
      <div className="container mx-auto px-4">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-poppins font-semibold mb-6">Qual veículo você está buscando?</h2>
          
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
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
            </div>
            
            {/* Botão para expandir/recolher filtros avançados */}
            <Button 
              type="button"
              variant="ghost" 
              className="flex items-center justify-center gap-2 text-primary mt-2 self-start hover:bg-white/5"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              {showAdvancedSearch ? 'Menos filtros' : 'Mais filtros'} 
              {showAdvancedSearch ? <FaChevronUp /> : <FaChevronDown />}
            </Button>
            
            {/* Filtros avançados */}
            {showAdvancedSearch && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {/* Faixa de Preço */}
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-lg">Preço</h3>
                  <div className="mt-2">
                    <div className="flex justify-between mb-2">
                      <span>De: {formatPrice(priceRange[0])}</span>
                      <span>Até: {formatPrice(priceRange[1])}</span>
                    </div>
                    <Slider
                      className="my-6"
                      defaultValue={[0, 500000]}
                      max={500000}
                      step={5000}
                      value={priceRange}
                      onValueChange={(value: [number, number]) => setPriceRange(value)}
                    />
                  </div>
                </div>

                {/* Tipo de Câmbio */}
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-lg">Câmbio</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {transmissionOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`transmission-${option}`} 
                          checked={selectedTransmissions.includes(option)}
                          onCheckedChange={() => toggleTransmission(option)}
                        />
                        <Label 
                          htmlFor={`transmission-${option}`}
                          className="cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Combustível */}
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-lg">Combustível</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {fuelOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`fuel-${option}`} 
                          checked={selectedFuels.includes(option)}
                          onCheckedChange={() => toggleFuel(option)}
                        />
                        <Label 
                          htmlFor={`fuel-${option}`}
                          className="cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Cores */}
                <div className="bg-white/5 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-lg">Cores</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {colorOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`color-${option}`} 
                          checked={selectedColors.includes(option)}
                          onCheckedChange={() => toggleColor(option)}
                        />
                        <Label 
                          htmlFor={`color-${option}`}
                          className="cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Carroceria */}
                <div className="bg-white/5 p-4 rounded-lg lg:col-span-4">
                  <h3 className="font-semibold mb-3 text-lg">Carroceria</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {bodyTypeOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`bodyType-${option}`} 
                          checked={selectedBodyTypes.includes(option)}
                          onCheckedChange={() => toggleBodyType(option)}
                        />
                        <Label 
                          htmlFor={`bodyType-${option}`}
                          className="cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Botão de buscar visível apenas quando os filtros estão expandidos */}
            {showAdvancedSearch && (
              <Button 
                type="submit"
                className="bg-primary hover:bg-red-700 text-white px-6 py-3 mt-4 self-center"
              >
                Buscar Veículos
              </Button>
            )}
          </form>
          
          {/* Car brands */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3 py-4 mt-2">
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
                  className="brand-logo-card flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 hover:scale-105"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <img 
                      src={brand.logoUrl} 
                      alt={brand.name} 
                      className="max-w-full max-h-full transition-all duration-300 brightness-90 hover:brightness-125" 
                    />
                  </div>
                  <span className="text-xs mt-2 text-gray-300 transition-colors duration-300 hover:text-primary">{brand.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
