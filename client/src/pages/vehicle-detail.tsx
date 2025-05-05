import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaTachometerAlt, 
  FaGasPump, 
  FaCog, 
  FaWhatsapp, 
  FaHeart, 
  FaShare, 
  FaPhone 
} from "react-icons/fa";
import { formatPrice, formatMileage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";

export default function VehicleDetail() {
  const [match, params] = useRoute("/estoque/:id");
  
  const { data: vehicle, isLoading, error } = useQuery<Vehicle & { brand: { name: string; logoUrl: string } }>({
    queryKey: [`/api/vehicles/${params?.id}`],
    enabled: !!params?.id
  });
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  if (!match) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link href="/estoque" className="flex items-center text-sm text-gray-400 hover:text-white mb-6">
            <FaArrowLeft className="mr-2" /> Voltar para o estoque
          </Link>
          
          <div className="glass-card rounded-xl p-8 animate-pulse">
            <div className="h-[400px] bg-white/10 rounded-lg mb-8"></div>
            <div className="h-8 bg-white/10 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-white/10 rounded w-full mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="h-20 bg-white/10 rounded"></div>
              ))}
            </div>
            <div className="h-12 bg-white/10 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-12 bg-white/10 rounded"></div>
              <div className="h-12 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !vehicle) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link href="/estoque" className="flex items-center text-sm text-gray-400 hover:text-white mb-6">
            <FaArrowLeft className="mr-2" /> Voltar para o estoque
          </Link>
          
          <div className="glass-card rounded-xl p-8 text-center">
            <h1 className="text-2xl font-medium mb-4">Veículo não encontrado</h1>
            <p className="text-gray-400 mb-6">
              O veículo que você está procurando não está disponível ou foi removido.
            </p>
            <Button asChild>
              <Link href="/estoque">Ver outros veículos</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  const price = typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : vehicle.price;
  const originalPrice = vehicle.originalPrice 
    ? (typeof vehicle.originalPrice === 'string' 
      ? parseFloat(vehicle.originalPrice) 
      : vehicle.originalPrice)
    : null;
  
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link href="/estoque" className="flex items-center text-sm text-gray-400 hover:text-white mb-6">
          <FaArrowLeft className="mr-2" /> Voltar para o estoque
        </Link>
        
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Vehicle Image */}
          <div className="relative h-[400px] md:h-[500px]">
            <img 
              src={vehicle.imageUrl} 
              alt={`${vehicle.brand.name} ${vehicle.model}`} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
              >
                <FaHeart className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
              >
                <FaShare className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-8">
            {/* Vehicle Title */}
            <div className="flex items-center mb-2">
              <img src={vehicle.brand.logoUrl} alt={vehicle.brand.name} className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-poppins font-bold">
                {vehicle.brand.name} {vehicle.model}
              </h1>
            </div>
            
            <p className="text-gray-300 text-lg mb-8">
              {vehicle.description || `${vehicle.color} · ${vehicle.year}`}
            </p>
            
            {/* Vehicle Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-4 rounded-lg flex flex-col items-center text-center">
                <FaCalendarAlt className="text-primary mb-2 text-xl" />
                <span className="text-gray-400 text-sm">Ano</span>
                <span className="font-medium">{vehicle.year}</span>
              </div>
              
              <div className="glass-card p-4 rounded-lg flex flex-col items-center text-center">
                <FaTachometerAlt className="text-primary mb-2 text-xl" />
                <span className="text-gray-400 text-sm">Quilometragem</span>
                <span className="font-medium">{formatMileage(vehicle.mileage)}</span>
              </div>
              
              <div className="glass-card p-4 rounded-lg flex flex-col items-center text-center">
                <FaGasPump className="text-primary mb-2 text-xl" />
                <span className="text-gray-400 text-sm">Combustível</span>
                <span className="font-medium">Flex</span>
              </div>
              
              <div className="glass-card p-4 rounded-lg flex flex-col items-center text-center">
                <FaCog className="text-primary mb-2 text-xl" />
                <span className="text-gray-400 text-sm">Câmbio</span>
                <span className="font-medium">Automático</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="mb-8">
              {originalPrice && originalPrice > price && (
                <p className="text-gray-400 text-lg line-through">
                  De {formatPrice(originalPrice)}
                </p>
              )}
              <div className="flex items-end">
                <span className="text-lg mr-2">Por</span>
                <span className="text-4xl font-bold text-white">{formatPrice(price)}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                asChild
                className="bg-primary hover:bg-red-700 h-12 text-lg font-medium"
              >
                <a href="tel:(33)3241-1507" className="flex items-center justify-center">
                  <FaPhone className="mr-2" /> Ligar agora
                </a>
              </Button>
              
              <Button 
                asChild
                className="bg-green-600 hover:bg-green-700 h-12 text-lg font-medium"
              >
                <a 
                  href={`https://wa.me/5533991990303?text=Olá, tenho interesse no veículo ${vehicle.brand.name} ${vehicle.model} ${vehicle.year} (${formatPrice(vehicle.price)})`}
                  className="flex items-center justify-center"
                >
                  <FaWhatsapp className="mr-2" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
