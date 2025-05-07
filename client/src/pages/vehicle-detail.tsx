import { useEffect, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
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
  FaPhone,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { formatPrice, formatMileage } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Vehicle, VehicleImage } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function VehicleDetail() {
  // Checar ambas as rotas possíveis: /estoque/:id e /veiculos/:id
  const [matchEstoque, paramsEstoque] = useRoute("/estoque/:id");
  const [matchVeiculos, paramsVeiculos] = useRoute("/veiculos/:id");
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  
  // Usar o parâmetro correto, dependendo de qual rota foi acessada
  const params = matchEstoque ? paramsEstoque : paramsVeiculos;
  
  // Usar uma função de consulta explícita para maior controle
  const { data: vehicle, isLoading, error } = useQuery<Vehicle & { 
    brand: { name: string; logoUrl: string },
    additionalImages: VehicleImage[] 
  }>({
    queryKey: [`/api/vehicles/${params?.id}`],
    enabled: !!params?.id,
    retry: 3,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      console.log("Fetching vehicle with ID:", params?.id);
      if (!params?.id) throw new Error("ID do veículo não fornecido");
      
      try {
        const response = await fetch(`/api/vehicles/${params.id}`);
        if (!response.ok) {
          console.error("API error:", response.status);
          throw new Error(`Erro ao buscar veículo: ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        throw err;
      }
    }
  });
  
  // Função para ir para a próxima imagem
  const goToNextImage = () => {
    if (!vehicle) return;
    
    const allImages = [vehicle.imageUrl, ...(vehicle.additionalImages?.map(img => img.imageUrl) || [])];
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setCurrentImageIndex(0); // Volta para a primeira imagem
    }
  };
  
  // Função para ir para a imagem anterior
  const goToPrevImage = () => {
    if (!vehicle) return;
    
    const allImages = [vehicle.imageUrl, ...(vehicle.additionalImages?.map(img => img.imageUrl) || [])];
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    } else {
      setCurrentImageIndex(allImages.length - 1); // Vai para a última imagem
    }
  };
  
  // Função para ir para uma imagem específica
  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  if (!matchEstoque && !matchVeiculos) {
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
          {/* Vehicle Image Gallery */}
          <div className="relative h-[400px] md:h-[500px]">
            {/* Carrossel Principal */}
            {(() => {
              // Para cada imagem principal + imagens adicionais
              const allImages = [
                vehicle.imageUrl,
                ...(vehicle.additionalImages?.map(img => img.imageUrl) || [])
              ];
              
              return (
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={`${vehicle.brand.name} ${vehicle.model} - Imagem ${currentImageIndex + 1}`} 
                  className="w-full h-full object-cover transition-opacity duration-300" 
                />
              );
            })()}
            
            {/* Botões de navegação */}
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white"
            >
              <FaChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white"
            >
              <FaChevronRight className="h-5 w-5" />
            </Button>
            
            {/* Miniaturas das imagens */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 px-4">
              {(() => {
                const allImages = [
                  vehicle.imageUrl,
                  ...(vehicle.additionalImages?.map(img => img.imageUrl) || [])
                ];
                
                return allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={cn(
                      "w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                      currentImageIndex === index
                        ? "border-primary scale-110 z-10"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ));
              })()}
            </div>
            
            {/* Compartilhar e favoritos */}
            <div className="absolute top-4 right-4 flex space-x-2 z-10">
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
            
            {/* Indicador de posição */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-md px-3 py-1 text-sm">
              {(() => {
                const allImages = [
                  vehicle.imageUrl,
                  ...(vehicle.additionalImages?.map(img => img.imageUrl) || [])
                ];
                return `${currentImageIndex + 1} / ${allImages.length}`;
              })()}
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
