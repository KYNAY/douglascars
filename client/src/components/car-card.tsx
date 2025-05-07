import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FaHeart, FaWhatsapp } from "react-icons/fa";
import { formatPrice, formatMileage } from "@/lib/utils";

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
  brand?: Brand;
}

interface CarCardProps {
  vehicle: Vehicle;
  featured?: boolean;
}

export function CarCard({ vehicle, featured = false }: CarCardProps) {
  const price = typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : vehicle.price;
  const originalPrice = vehicle.originalPrice 
    ? (typeof vehicle.originalPrice === 'string' 
      ? parseFloat(vehicle.originalPrice) 
      : vehicle.originalPrice)
    : null;
  
  const brandName = vehicle.brand?.name || '';
  const brandLogo = vehicle.brand?.logoUrl || '';
  
  return (
    <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 car-card group">
      <div className="relative">
        <img 
          src={vehicle.imageUrl} 
          alt={`${brandName} ${vehicle.model}`} 
          className="w-full h-56 object-cover" 
        />
        
        {featured && (
          <div className="absolute top-4 left-4 flex items-center">
            <img 
              src="https://images.emojiterra.com/google/noto-emoji/animated-emoji/1f525.gif" 
              alt="Fire" 
              className="w-7 h-7 mr-1"
            />
            <div className="bg-primary/80 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full">
              DESTAQUE ESPECIAL
            </div>
          </div>
        )}
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <FaHeart className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            asChild
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <a href={`https://wa.me/5533991990303?text=Olá, tenho interesse no veículo ${brandName} ${vehicle.model} ${vehicle.year}`}>
              <FaWhatsapp className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center mb-2">
          {brandLogo && (
            <img src={brandLogo} alt={brandName} className="w-6 h-6 mr-2" />
          )}
          <h3 className="font-poppins font-semibold">{brandName} {vehicle.model}</h3>
        </div>
        
        <p className="text-gray-300 mb-4">
          {vehicle.description || `${brandName} ${vehicle.model} - ${vehicle.color} - ${vehicle.year}`}
        </p>
        
        <div className="flex justify-between mb-4">
          <div className="flex items-center text-sm text-gray-300">
            <img 
              src="https://static.autoconf.com.br/common/template-2/ano.svg" 
              alt="Ano" 
              className="w-4 h-4 mr-1 opacity-70" 
            />
            <span>{vehicle.year}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-300">
            <img 
              src="https://static.autoconf.com.br/common/template-2/km.svg" 
              alt="Km" 
              className="w-4 h-4 mr-1 opacity-70" 
            />
            <span>{formatMileage(vehicle.mileage)}</span>
          </div>
        </div>
        
        <div className="flex flex-col">
          {originalPrice && originalPrice > price && (
            <span className="text-gray-400 text-sm line-through">
              de {formatPrice(originalPrice)}
            </span>
          )}
          <div className="flex items-end">
            <span className="text-sm mr-1">por</span>
            <span className="text-2xl font-bold text-white">{formatPrice(price)}</span>
          </div>
        </div>
        
        <Button 
          asChild 
          variant="outline"
          className="mt-4 w-full text-center bg-white/10 hover:bg-white/15 py-3 rounded-lg text-white font-medium transition-all"
        >
          <Link href={`/estoque/${vehicle.id}`}>
            Ver mais
          </Link>
        </Button>
      </div>
    </div>
  );
}
