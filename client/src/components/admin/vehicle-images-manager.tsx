import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2, Upload, Loader2, MoveVertical, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VehicleImage } from "@shared/schema";

interface VehicleImagesManagerProps {
  vehicleId: number;
}

export function VehicleImagesManager({ vehicleId }: VehicleImagesManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [reorderMode, setReorderMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Buscar imagens existentes
  const { data: vehicleImages, isLoading } = useQuery<VehicleImage[]>({
    queryKey: [`/api/vehicles/${vehicleId}/images`],
    enabled: !!vehicleId
  });

  // Adicionar imagem
  const addImageMutation = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest(`/api/vehicles/${vehicleId}/images`, "POST", {
        imageUrl: url,
        order: vehicleImages?.length || 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/images`] });
      toast({
        title: "Imagem adicionada",
        description: "A imagem foi adicionada com sucesso."
      });
      setImageUrl("");
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar imagem",
        description: error.message || "Ocorreu um erro ao adicionar a imagem.",
        variant: "destructive"
      });
    }
  });

  // Excluir imagem
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: number) => {
      return apiRequest(`/api/vehicles/${vehicleId}/images/${imageId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/images`] });
      toast({
        title: "Imagem excluída",
        description: "A imagem foi excluída com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir imagem",
        description: error.message || "Ocorreu um erro ao excluir a imagem.",
        variant: "destructive"
      });
    }
  });

  // Atualizar ordem
  const updateOrderMutation = useMutation({
    mutationFn: async ({ imageId, newOrder }: { imageId: number; newOrder: number }) => {
      return apiRequest(`/api/vehicles/${vehicleId}/images/${imageId}`, "PATCH", {
        order: newOrder
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/vehicles/${vehicleId}/images`] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar ordem",
        description: error.message || "Ocorreu um erro ao atualizar a ordem das imagens.",
        variant: "destructive"
      });
    }
  });

  const handleAddImage = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL de imagem válida.",
        variant: "destructive"
      });
      return;
    }

    addImageMutation.mutate(imageUrl);
  };

  const handleDeleteImage = (imageId: number) => {
    if (confirm("Tem certeza que deseja excluir esta imagem?")) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const handleMoveImage = (imageId: number, currentOrder: number, direction: "up" | "down") => {
    if (!vehicleImages) return;
    
    const newOrder = direction === "up" 
      ? Math.max(0, currentOrder - 1) 
      : Math.min(vehicleImages.length - 1, currentOrder + 1);
    
    if (newOrder !== currentOrder) {
      updateOrderMutation.mutate({ imageId, newOrder });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Imagens Adicionais</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setReorderMode(!reorderMode)}
        >
          {reorderMode ? "Concluir" : "Reordenar"}
          <MoveVertical className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Formulário de adição de imagem */}
      <div className="glass-card p-4 rounded-lg">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="imageUrl">URL da Imagem</Label>
            <div className="flex mt-1 space-x-2">
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button 
                onClick={handleAddImage}
                disabled={addImageMutation.isPending}
              >
                {addImageMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de imagens */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-400">Imagens do Veículo ({vehicleImages?.length || 0})</h4>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !vehicleImages?.length ? (
          <div className="text-center py-8 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400">Nenhuma imagem adicional encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {vehicleImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                  <img
                    src={image.imageUrl}
                    alt={`Imagem ${image.id}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Botões de ação */}
                <div className={`absolute inset-0 flex ${reorderMode ? 'justify-center' : 'justify-end'} items-end p-2`}>
                  {reorderMode ? (
                    <div className="flex space-x-1">
                      <Button
                        variant="default"
                        size="icon"
                        className="w-8 h-8 bg-black/70 hover:bg-black"
                        onClick={() => handleMoveImage(image.id, image.order, "up")}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="icon"
                        className="w-8 h-8 bg-black/70 hover:bg-black"
                        onClick={() => handleMoveImage(image.id, image.order, "down")}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Ordem da imagem */}
                <div className="absolute top-2 left-2 bg-black/70 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {image.order + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}