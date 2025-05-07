import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { HeroSlide } from "@shared/schema";
import { Pencil, Trash2, Plus, MoveUp, MoveDown, ImageOff, Image } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function HeroSlidesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
    active: true
  });
  
  // Buscar todos os slides
  const { data: slides, isLoading } = useQuery({
    queryKey: ['/api/hero-slides'],
    queryFn: async () => {
      const res = await fetch('/api/hero-slides');
      if (!res.ok) throw new Error('Failed to fetch hero slides');
      return res.json() as Promise<HeroSlide[]>;
    }
  });
  
  // Mutação para adicionar um novo slide
  const addSlideMutation = useMutation({
    mutationFn: async (newSlide: { imageUrl: string; title: string; subtitle: string; active: boolean }) => {
      const res = await apiRequest("/api/hero-slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlide)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Falha ao adicionar slide");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Slide adicionado com sucesso!",
        description: "O novo slide foi adicionado ao carousel."
      });
      setIsAddDialogOpen(false);
      setFormData({
        imageUrl: "",
        title: "",
        subtitle: "",
        active: true
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar slide",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutação para editar um slide
  const editSlideMutation = useMutation({
    mutationFn: async (slide: HeroSlide) => {
      const res = await apiRequest(`/api/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slide)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Falha ao atualizar slide");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Slide atualizado com sucesso!",
        description: "As alterações foram salvas."
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar slide",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutação para excluir um slide
  const deleteSlideMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/hero-slides/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Falha ao excluir slide");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Slide excluído com sucesso!",
        description: "O slide foi removido do carousel."
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir slide",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Funções para manipular ordem dos slides
  const moveSlideUp = useMutation({
    mutationFn: async (slide: HeroSlide) => {
      if (!slides) return;
      
      // Encontrar o slide anterior
      const currentIndex = slides.findIndex(s => s.id === slide.id);
      if (currentIndex <= 0) return; // Já está no topo
      
      const previousSlide = slides[currentIndex - 1];
      
      // Trocar ordens
      const updatedCurrentSlide = { ...slide, order: previousSlide.order };
      const updatedPreviousSlide = { ...previousSlide, order: slide.order };
      
      // Atualizar ambos os slides
      await Promise.all([
        apiRequest(`/api/hero-slides/${slide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCurrentSlide)
        }),
        apiRequest(`/api/hero-slides/${previousSlide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedPreviousSlide)
        })
      ]);
      
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao reordenar slides",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const moveSlideDown = useMutation({
    mutationFn: async (slide: HeroSlide) => {
      if (!slides) return;
      
      // Encontrar o próximo slide
      const currentIndex = slides.findIndex(s => s.id === slide.id);
      if (currentIndex >= slides.length - 1) return; // Já está no fim
      
      const nextSlide = slides[currentIndex + 1];
      
      // Trocar ordens
      const updatedCurrentSlide = { ...slide, order: nextSlide.order };
      const updatedNextSlide = { ...nextSlide, order: slide.order };
      
      // Atualizar ambos os slides
      await Promise.all([
        apiRequest(`/api/hero-slides/${slide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCurrentSlide)
        }),
        apiRequest(`/api/hero-slides/${nextSlide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedNextSlide)
        })
      ]);
      
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao reordenar slides",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Alternar status ativo do slide
  const toggleActiveStatus = useMutation({
    mutationFn: async (slide: HeroSlide) => {
      const updatedSlide = { ...slide, active: !slide.active };
      const res = await apiRequest(`/api/hero-slides/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSlide)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Falha ao atualizar status do slide");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] });
      toast({
        title: "Status atualizado",
        description: "O status do slide foi alterado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSlideMutation.mutate(formData);
  };
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlide) return;
    
    editSlideMutation.mutate({
      ...selectedSlide,
      imageUrl: formData.imageUrl,
      title: formData.title,
      subtitle: formData.subtitle,
      active: formData.active
    });
  };
  
  const openEditDialog = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setFormData({
      imageUrl: slide.imageUrl,
      title: slide.title,
      subtitle: slide.subtitle,
      active: slide.active ?? true // Fornece um valor padrão caso active seja null
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (slide: HeroSlide) => {
    setSelectedSlide(slide);
    setIsDeleteDialogOpen(true);
  };
  
  if (isLoading) {
    return <div className="p-4 text-center">Carregando slides...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gerenciar Slides do Carousel</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Adicionar Slide
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Slide</DialogTitle>
              <DialogDescription>
                Preencha os detalhes para adicionar um novo slide ao carousel da página inicial.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://exemplo.com/imagem.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    placeholder="Encontre seu próximo carro dos sonhos"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Textarea
                    id="subtitle"
                    placeholder="Fale com nossa equipe especializada. Estamos prontos para te atender!"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">Slide Ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={addSlideMutation.isPending}>
                  {addSlideMutation.isPending ? "Adicionando..." : "Adicionar Slide"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(!slides || slides.length === 0) ? (
          <div className="col-span-full p-8 text-center border rounded-lg">
            <ImageOff className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium">Nenhum slide encontrado</h3>
            <p className="text-sm text-gray-500 mt-1">
              Adicione slides para que apareçam no carousel da página inicial.
            </p>
          </div>
        ) : (
          slides.map((slide) => (
            <Card key={slide.id} className={`overflow-hidden ${!slide.active ? 'opacity-60' : ''}`}>
              <div className="relative h-40 bg-gray-200">
                {slide.imageUrl ? (
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                  <p className="text-white text-sm truncate">{slide.title}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold line-clamp-1">{slide.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{slide.subtitle}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Ordem: {slide.order}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <div className="flex items-center space-x-1">
                      <Switch
                        id={`active-${slide.id}`}
                        checked={slide.active ?? false}
                        onCheckedChange={() => toggleActiveStatus.mutate(slide)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <Label htmlFor={`active-${slide.id}`} className="text-xs">
                        {slide.active ? "Ativo" : "Inativo"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => moveSlideUp.mutate(slide)}
                    disabled={moveSlideUp.isPending || !slides || slides.indexOf(slide) === 0}
                  >
                    <MoveUp size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => moveSlideDown.mutate(slide)}
                    disabled={moveSlideDown.isPending || !slides || slides.indexOf(slide) === slides.length - 1}
                  >
                    <MoveDown size={16} />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(slide)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => openDeleteDialog(slide)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      {/* Diálogo de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Slide</DialogTitle>
            <DialogDescription>
              Atualize os detalhes do slide selecionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-imageUrl">URL da Imagem</Label>
                <Input
                  id="edit-imageUrl"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  placeholder="Encontre seu próximo carro dos sonhos"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subtitle">Subtítulo</Label>
                <Textarea
                  id="edit-subtitle"
                  placeholder="Fale com nossa equipe especializada. Estamos prontos para te atender!"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="edit-active">Slide Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={editSlideMutation.isPending}>
                {editSlideMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este slide? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => selectedSlide && deleteSlideMutation.mutate(selectedSlide.id)}
              disabled={deleteSlideMutation.isPending}
            >
              {deleteSlideMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}