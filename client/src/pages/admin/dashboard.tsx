import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useReviewMutations, useInstagramPostMutations } from "@/lib/mutations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Trophy, ArrowDown, ArrowUp, Home, LogOut, Plus, Pencil, Trash2, Car, ImageIcon, Calendar, Filter, Eye, Search, FileText, CreditCard, Settings, Tag, ShoppingCart, Calculator, DollarSign, Star, Heart, Info } from "lucide-react";
import { getInitial, formatPrice, getRatingStars } from "@/lib/utils";
import { VehicleImagesManager } from "@/components/admin/vehicle-images-manager";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Dealer {
  id: number;
  name: string;
  username: string;
  email: string;
  startDate: string;
  points: number;
  sales: number;
}

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
  specialFeatured?: boolean;
  sold: boolean;
  imageUrl: string;
  transmission?: string;
  fuel?: string;
  bodyType?: string;
  vehicleType?: 'car' | 'motorcycle';
  doors?: number | null;
  enginePower?: string | null;
  engineTorque?: string | null;
  warranty?: string | null;
  optionals?: string | null;
  createdAt?: string;
  brand?: Brand;
}

interface EvaluationRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicleInfo: string;
  requestDate: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  notes?: string | null;
  createdAt?: string;
}

interface FinancingRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicleInfo: string;
  income: string;
  requestDate: string;
  status: 'pending' | 'in_review' | 'approved' | 'denied';
  notes?: string | null;
  createdAt?: string;
}

interface Review {
  id: number;
  name: string;
  avatarInitial: string;
  rating: number;
  comment: string;
  date: string;
  createdAt?: string;
}

interface InstagramPost {
  id: number;
  imageUrl: string;
  likes: number;
  postUrl: string;
  createdAt?: string;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vehicles");
  const [salesDataTimeRange, setSalesDataTimeRange] = useState("all_time");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "points",
    direction: "desc"
  });
  const { toast } = useToast();
  const vehicleFormRef = useRef<HTMLFormElement>(null);
  
  // Estado para o diálogo de criação/edição de veículos
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false);
  const [isDeleteVehicleDialogOpen, setIsDeleteVehicleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchVehicle, setSearchVehicle] = useState("");
  const [brandFilter, setBrandFilter] = useState<number | null>(null);
  
  // Estado para o diálogo de criação/edição de marcas
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [isDeleteBrandDialogOpen, setIsDeleteBrandDialogOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [searchBrand, setSearchBrand] = useState("");
  
  // Estados para a aba de integrações
  const [integrationTab, setIntegrationTab] = useState<"reviews" | "instagram">("reviews");
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDeleteReviewDialogOpen, setIsDeleteReviewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isInstagramPostDialogOpen, setIsInstagramPostDialogOpen] = useState(false);
  const [isDeleteInstagramPostDialogOpen, setIsDeleteInstagramPostDialogOpen] = useState(false);
  const [selectedInstagramPost, setSelectedInstagramPost] = useState<InstagramPost | null>(null);
  
  // Estados para a gestão de vendedores
  const [isNewDealerDialogOpen, setIsNewDealerDialogOpen] = useState(false);
  const [isEditDealerDialogOpen, setIsEditDealerDialogOpen] = useState(false);
  const [isDeleteAllDealersDialogOpen, setIsDeleteAllDealersDialogOpen] = useState(false);
  const [isMarkAsAsSoldDialogOpen, setIsMarkAsAsSoldDialogOpen] = useState(false);
  const [vehicleToMarkAsSold, setVehicleToMarkAsSold] = useState<Vehicle | null>(null);
  const [selectedDealerForSale, setSelectedDealerForSale] = useState<number | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [newDealerName, setNewDealerName] = useState("");
  const [newDealerUsername, setNewDealerUsername] = useState("");
  const [newDealerEmail, setNewDealerEmail] = useState("");
  const [newDealerPassword, setNewDealerPassword] = useState("");
  
  // Estados para a aba de solicitações
  const [requestsTab, setRequestsTab] = useState<"evaluations" | "financing">("evaluations");
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationRequest | null>(null);
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingRequest | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [evaluationStatusFilter, setEvaluationStatusFilter] = useState<string>("all");
  const [financingStatusFilter, setFinancingStatusFilter] = useState<string>("all");
  const [evaluationSearchTerm, setEvaluationSearchTerm] = useState<string>("");
  const [financingSearchTerm, setFinancingSearchTerm] = useState<string>("");
  const [notesText, setNotesText] = useState<string>("");
  
  // Estado para notificações
  const [hasNewEvaluations, setHasNewEvaluations] = useState(false);
  const [hasNewFinancings, setHasNewFinancings] = useState(false);
  const [lastCheckedEvaluationCount, setLastCheckedEvaluationCount] = useState(0);
  const [lastCheckedFinancingCount, setLastCheckedFinancingCount] = useState(0);
  

  
  // Mutação para atualizar veículo
  const updateVehicleMutation = useMutation({
    mutationFn: async (updatedVehicle: Vehicle) => {
      return await apiRequest(`/api/vehicles/${updatedVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVehicle),
      });
    },
    onSuccess: () => {
      toast({
        title: "Veículo atualizado",
        description: "O veículo foi atualizado com sucesso.",
      });
      setIsVehicleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar veículo",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para criar veículo
  const createVehicleMutation = useMutation({
    mutationFn: async (newVehicle: Omit<Vehicle, 'id'>) => {
      return await apiRequest('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVehicle),
      });
    },
    onSuccess: () => {
      toast({
        title: "Veículo adicionado",
        description: "O veículo foi adicionado com sucesso.",
      });
      setIsVehicleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar veículo",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para excluir veículo
  const deleteVehicleMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Veículo excluído",
        description: "O veículo foi excluído com sucesso.",
      });
      setIsDeleteVehicleDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir veículo",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para atualizar status de solicitação de avaliação
  const updateEvaluationStatusMutation = useMutation({
    mutationFn: async (data: { id: number, status: string, notes: string | null }) => {
      return await apiRequest(`/api/evaluation-requests/${data.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: data.status,
          notes: data.notes
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "A solicitação de avaliação foi atualizada com sucesso.",
      });
      setIsStatusDialogOpen(false);
      setSelectedEvaluation(null);
      setNotesText("");
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation-requests'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para atualizar status de solicitação de financiamento
  const updateFinancingStatusMutation = useMutation({
    mutationFn: async (data: { id: number, status: string, notes: string | null }) => {
      return await apiRequest(`/api/financing-requests/${data.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: data.status,
          notes: data.notes
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Status atualizado",
        description: "A solicitação de financiamento foi atualizada com sucesso.",
      });
      setIsStatusDialogOpen(false);
      setSelectedFinancing(null);
      setNotesText("");
      queryClient.invalidateQueries({ queryKey: ['/api/financing-requests'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para excluir solicitação de avaliação
  const deleteEvaluationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/evaluation-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Solicitação excluída",
        description: "A solicitação de avaliação foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/evaluation-requests'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir solicitação",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para excluir solicitação de financiamento
  const deleteFinancingMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/financing-requests/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Solicitação excluída",
        description: "A solicitação de financiamento foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/financing-requests'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir solicitação",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutação para adicionar vendedor
  const addDealerMutation = useMutation({
    mutationFn: async (newDealer: { name: string, username: string, email: string, password: string }) => {
      return await apiRequest('/api/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDealer.name,
          username: newDealer.username,
          email: newDealer.email,
          password: newDealer.password,
          startDate: new Date().toLocaleDateString('pt-BR'),
          points: 0,
          sales: 0
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Vendedor adicionado",
        description: "O vendedor foi adicionado com sucesso."
      });
      setIsNewDealerDialogOpen(false);
      setNewDealerName("");
      setNewDealerUsername("");
      setNewDealerEmail("");
      setNewDealerPassword("");
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/ranking'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar vendedor",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutação para editar vendedor
  const updateDealerMutation = useMutation({
    mutationFn: async (updatedDealer: { id: number, name: string, username: string, email: string, password?: string }) => {
      return await apiRequest(`/api/dealers/${updatedDealer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedDealer.name,
          username: updatedDealer.username,
          email: updatedDealer.email,
          ...(updatedDealer.password ? { password: updatedDealer.password } : {})
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Vendedor atualizado",
        description: "As credenciais do vendedor foram atualizadas com sucesso."
      });
      setIsEditDealerDialogOpen(false);
      setSelectedDealer(null);
      setNewDealerName("");
      setNewDealerUsername("");
      setNewDealerEmail("");
      setNewDealerPassword("");
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/ranking'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar vendedor",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutação para excluir vendedor e todas suas vendas, recalculando relatórios
  const deleteDealerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/dealers/${id}/complete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Vendedor excluído",
        description: "O vendedor e todas as suas vendas foram excluídos. Os relatórios foram recalculados."
      });
      // Invalidar todas as consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/ranking'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir vendedor",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutação para excluir todos os vendedores
  const deleteAllDealersMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/dealers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Vendedores excluídos",
        description: "Todos os vendedores foram excluídos com sucesso."
      });
      setIsDeleteAllDealersDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/ranking'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir vendedores",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutação para criar marca
  const createBrandMutation = useMutation({
    mutationFn: async (brandData: { name: string, logoUrl: string }) => {
      return await apiRequest('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Marca adicionada",
        description: "A nova marca foi adicionada com sucesso."
      });
      setIsBrandDialogOpen(false);
      setSelectedBrand(null);
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar marca",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutação para atualizar marca
  const updateBrandMutation = useMutation({
    mutationFn: async (updatedBrand: { id: number, name: string, logoUrl: string }) => {
      return await apiRequest(`/api/brands/${updatedBrand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedBrand.name,
          logoUrl: updatedBrand.logoUrl
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Marca atualizada",
        description: "As informações da marca foram atualizadas com sucesso."
      });
      setIsBrandDialogOpen(false);
      setSelectedBrand(null);
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar marca",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Mutação para excluir marca
  const deleteBrandMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/brands/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Marca excluída",
        description: "A marca foi excluída com sucesso."
      });
      setIsDeleteBrandDialogOpen(false);
      setSelectedBrand(null);
      queryClient.invalidateQueries({ queryKey: ['/api/brands'] });
    },
    onError: (error: any) => {
      // Verificar se o erro é devido a veículos associados
      if (error.response?.status === 409) {
        toast({
          title: "Não é possível excluir esta marca",
          description: "Esta marca possui veículos associados. Remova ou altere a marca dos veículos primeiro.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao excluir marca",
          description: `Ocorreu um erro: ${error}`,
          variant: "destructive"
        });
      }
    }
  });
  


  // Mutação para marcar veículo como vendido
  const markVehicleAsSoldMutation = useMutation({
    mutationFn: async (data: { vehicleId: number, dealerId: number }) => {
      return await apiRequest(`/api/vehicles/${data.vehicleId}/sold`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dealerId: data.dealerId,
          soldDate: new Date().toISOString()
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Veículo marcado como vendido",
        description: "O veículo foi marcado como vendido com sucesso."
      });
      setIsMarkAsAsSoldDialogOpen(false);
      setVehicleToMarkAsSold(null);
      setSelectedDealerForSale(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/ranking'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao marcar veículo como vendido",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "desc" ? "asc" : "desc"
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_login_time");
    navigate("/");
  };
  
  // Função para adicionar novo vendedor
  const handleAddDealer = () => {
    if (!newDealerName || !newDealerUsername || !newDealerEmail || !newDealerPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para cadastrar um novo vendedor.",
        variant: "destructive"
      });
      return;
    }
    
    addDealerMutation.mutate({
      name: newDealerName,
      username: newDealerUsername,
      email: newDealerEmail,
      password: newDealerPassword
    });
  };
  
  // Função para iniciar edição de vendedor
  const handleEditDealer = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setNewDealerName(dealer.name);
    setNewDealerUsername(dealer.username);
    setNewDealerEmail(dealer.email);
    setNewDealerPassword("");
    setIsEditDealerDialogOpen(true);
  };
  
  // Função para salvar edição de vendedor
  const handleSaveDealer = () => {
    if (!selectedDealer || !newDealerName || !newDealerUsername || !newDealerEmail) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios para editar o vendedor.",
        variant: "destructive"
      });
      return;
    }
    
    updateDealerMutation.mutate({
      id: selectedDealer.id,
      name: newDealerName,
      username: newDealerUsername,
      email: newDealerEmail,
      ...(newDealerPassword ? { password: newDealerPassword } : {})
    });
  };
  
  // Função para excluir vendedor
  const handleDeleteDealer = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este vendedor?")) {
      deleteDealerMutation.mutate(id);
    }
  };
  
  // Função para excluir todos os vendedores
  const handleDeleteAllDealers = () => {
    deleteAllDealersMutation.mutate();
  };
  
  // Função para excluir veículo
  const handleDeleteVehicle = () => {
    if (selectedVehicle) {
      deleteVehicleMutation.mutate(selectedVehicle.id);
    }
  };
  
  // Função para marcar veículo como vendido
  const handleMarkAsSold = (vehicle: Vehicle) => {
    console.log("handleMarkAsSold chamado com veículo:", vehicle);
    setVehicleToMarkAsSold(vehicle);
    console.log("Estado vehicleToMarkAsSold atualizado");
    setIsMarkAsAsSoldDialogOpen(true);
    console.log("Dialog deve estar aberto agora, isMarkAsAsSoldDialogOpen =", true);
  };
  
  // Função para confirmar venda
  const handleConfirmSale = () => {
    if (!vehicleToMarkAsSold || !selectedDealerForSale) {
      toast({
        title: "Informações incompletas",
        description: "Selecione um vendedor para registrar a venda.",
        variant: "destructive"
      });
      return;
    }
    
    markVehicleAsSoldMutation.mutate({
      vehicleId: vehicleToMarkAsSold.id,
      dealerId: selectedDealerForSale
    });
  };

  // Verificar autenticação
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_authenticated") === "true";
    const email = localStorage.getItem("admin_email");
    
    if (!isLoggedIn || email !== "caiquewm@gmail.com") {
      navigate("/admin/login");
      return;
    }
    
    setIsAuthenticated(true);
    setAdminEmail(email || "");
    setIsAuthLoading(false);
  }, [navigate]); // Esta dependência é necessária

  // Buscar dados dos vendedores
  const { data: dealers, isLoading: isLoadingDealers } = useQuery<Dealer[]>({
    queryKey: ['/api/dealers/ranking'],
    enabled: isAuthenticated // Só buscar se estiver autenticado
  });
  
  // Buscar dados de vendas
  const { data: sales = [], isLoading: isLoadingSales } = useQuery<any[]>({
    queryKey: ['/api/sales'],
    enabled: isAuthenticated
  });
  
  // Buscar dados dos veículos
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    enabled: isAuthenticated
  });
  
  // Buscar dados das marcas
  const { data: brands = [], isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
    enabled: isAuthenticated
  });
  
  // Buscar dados de solicitações de avaliação
  const { 
    data: evaluationRequests, 
    isLoading: isLoadingEvaluations,
    refetch: refetchEvaluations
  } = useQuery<EvaluationRequest[]>({
    queryKey: ['/api/evaluation-requests'],
    enabled: isAuthenticated,
    // Refetch a cada 30 segundos para verificar novas solicitações
    refetchInterval: 30000
  });
  
  // Buscar dados de solicitações de financiamento
  const { 
    data: financingRequests, 
    isLoading: isLoadingFinancing,
    refetch: refetchFinancing
  } = useQuery<FinancingRequest[]>({
    queryKey: ['/api/financing-requests'],
    enabled: isAuthenticated,
    // Refetch a cada 30 segundos para verificar novas solicitações
    refetchInterval: 30000
  });
  
  // Buscar avaliações do Google
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ['/api/reviews'],
    enabled: isAuthenticated
  });
  
  // Buscar posts do Instagram
  const { data: instagramPosts, isLoading: isLoadingInstagramPosts } = useQuery<InstagramPost[]>({
    queryKey: ['/api/instagram-posts'],
    enabled: isAuthenticated
  });
  
  // Obtendo as mutações de avaliações
  const { createReviewMutation, updateReviewMutation, deleteReviewMutation } = useReviewMutations(
    setIsReviewDialogOpen,
    setSelectedReview,
    setIsDeleteReviewDialogOpen
  );
  
  // Obtendo as mutações de posts do Instagram
  const { createInstagramPostMutation, updateInstagramPostMutation, deleteInstagramPostMutation } = useInstagramPostMutations(
    setIsInstagramPostDialogOpen,
    setSelectedInstagramPost,
    setIsDeleteInstagramPostDialogOpen
  );
  
  // Verificar novas solicitações
  useEffect(() => {
    // Verificar se há novas solicitações de avaliação
    if (evaluationRequests && evaluationRequests.length > 0) {
      // Inicializar contagem se for a primeira verificação
      if (lastCheckedEvaluationCount === 0) {
        setLastCheckedEvaluationCount(evaluationRequests.length);
      } 
      // Verificar se há novas solicitações
      else if (evaluationRequests.length > lastCheckedEvaluationCount) {
        setHasNewEvaluations(true);
      }
    }
    
    // Verificar se há novas solicitações de financiamento
    if (financingRequests && financingRequests.length > 0) {
      // Inicializar contagem se for a primeira verificação
      if (lastCheckedFinancingCount === 0) {
        setLastCheckedFinancingCount(financingRequests.length);
      } 
      // Verificar se há novas solicitações
      else if (financingRequests.length > lastCheckedFinancingCount) {
        setHasNewFinancings(true);
      }
    }
  }, [evaluationRequests, financingRequests, lastCheckedEvaluationCount, lastCheckedFinancingCount]);
  
  // Resetar notificações quando a aba de solicitações for aberta
  useEffect(() => {
    if (activeTab === 'requests') {
      // Atualizar contagens
      if (evaluationRequests) {
        setLastCheckedEvaluationCount(evaluationRequests.length);
        setHasNewEvaluations(false);
      }
      
      if (financingRequests) {
        setLastCheckedFinancingCount(financingRequests.length);
        setHasNewFinancings(false);
      }
    }
  }, [activeTab, evaluationRequests, financingRequests]);

  // Ordenar vendedores para o ranking
  const sortedDealers = dealers ? [...dealers].sort((a, b) => {
    const key = sortConfig.key as keyof Dealer;
    if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  }) : [];

  if (isAuthLoading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar logado para acessar esta área.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/admin/login")}>Fazer Login</Button>
              <Button variant="outline" onClick={() => navigate("/")}>Voltar para Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      {/* Barra de administrador para desktop */}
      <div className="hidden sm:block mb-6">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white">
                    {adminEmail ? getInitial(adminEmail) : "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Bem-vindo, Administrador</CardTitle>
                  <CardDescription>{adminEmail}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2">
                  <Home size={16} /> Home
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut size={16} /> Sair
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Barra de administrador para mobile - simplificada com botão de sair */}
      <div className="fixed sm:hidden top-0 left-0 right-0 z-50 bg-slate-800 text-white py-3 px-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarFallback className="bg-primary text-white text-sm">
                {adminEmail ? getInitial(adminEmail) : "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">Administrador</div>
              <div className="text-xs text-slate-300">{adminEmail}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/")} 
              className="px-3 h-8 text-xs flex items-center gap-1 rounded-lg bg-transparent text-white border-slate-600"
            >
              <Home className="h-3 w-3" /> Home
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout} 
              className="px-3 h-8 text-xs flex items-center gap-1 rounded-lg"
            >
              <LogOut className="h-3 w-3" /> Sair
            </Button>
          </div>
        </div>
      </div>
      
      {/* Espaço para compensar a barra fixa no mobile */}
      <div className="sm:hidden h-14 mb-4"></div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Área Administrativa</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="flex flex-nowrap w-max">
            <TabsTrigger value="vehicles" className="whitespace-nowrap">Veículos</TabsTrigger>
            <TabsTrigger value="sold_vehicles" className="whitespace-nowrap">Veículos Vendidos</TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap">Relatórios</TabsTrigger>
            <TabsTrigger value="requests" className="relative whitespace-nowrap">
              Solicitações
              {(hasNewEvaluations || hasNewFinancings) && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-primary items-center justify-center">
                    <span className="text-[10px] font-bold text-white">!</span>
                  </span>
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ranking" className="whitespace-nowrap">Vendedores</TabsTrigger>
            <TabsTrigger value="brands" className="whitespace-nowrap">Marcas</TabsTrigger>
            <TabsTrigger value="integrations" className="whitespace-nowrap">Integrações</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Gerenciar Veículos</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova veículos do inventário.
                </CardDescription>
              </div>
              <Button className="flex items-center gap-2" onClick={() => {
                  setSelectedVehicle(null);
                  setIsVehicleDialogOpen(true);
                }}>
                <Plus size={16} /> Adicionar Veículo
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingVehicles ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Veículo</TableHead>
                        <TableHead className="hidden md:table-cell">Marca</TableHead>
                        <TableHead className="hidden sm:table-cell">Ano</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles?.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{vehicle.model}</div>
                              <div className="md:hidden text-xs text-muted-foreground">
                                {brands?.find(b => b.id === vehicle.brandId)?.name || "-"} • {vehicle.year}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{brands?.find(b => b.id === vehicle.brandId)?.name || "-"}</TableCell>
                          <TableCell className="hidden sm:table-cell">{vehicle.year}</TableCell>
                          <TableCell>{formatPrice(vehicle.price)}</TableCell>
                          <TableCell>
                            {vehicle.sold ? (
                              <Badge variant="destructive">Vendido</Badge>
                            ) : vehicle.specialFeatured ? (
                              <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">Destaque Especial</Badge>
                            ) : vehicle.featured ? (
                              <Badge variant="default">Destaque</Badge>
                            ) : (
                              <Badge variant="outline">Disponível</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 px-2 py-1 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                                onClick={() => {
                                  setSelectedVehicle(vehicle);
                                  setIsVehicleDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" /> <span className="text-xs">Editar</span>
                              </Button>
                              {!vehicle.sold && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 px-2 py-1 text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700"
                                  onClick={() => handleMarkAsSold(vehicle)}
                                >
                                  <ShoppingCart className="h-3.5 w-3.5 mr-1" /> <span className="text-xs">Vender</span>
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 px-2 py-1 text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700"
                                onClick={() => {
                                  setSelectedVehicle(vehicle);
                                  setIsDeleteVehicleDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" /> <span className="text-xs">Excluir</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!vehicles || vehicles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Nenhum veículo cadastrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sold_vehicles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Veículos Vendidos</CardTitle>
                <CardDescription>
                  Histórico de vendas com detalhes dos vendedores.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingSales ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Veículo</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales && sales.length > 0 ? (
                        sales.map((sale: any) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {sale.vehicle?.imageUrl && (
                                  <div className="h-10 w-10 rounded-md overflow-hidden">
                                    <img
                                      src={sale.vehicle.imageUrl}
                                      alt={sale.vehicle?.model || 'Veículo'}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{sale.vehicle?.brand?.name} {sale.vehicle?.model}</div>
                                  <div className="text-xs text-muted-foreground">{sale.vehicle?.year}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback>{getInitial(sale.dealer?.name || 'V')}</AvatarFallback>
                                </Avatar>
                                <span>{sale.dealer?.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(sale.saleDate).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{formatPrice(sale.salePrice)}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Concluída
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Não há vendas registradas no sistema.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Relatórios de Desempenho</CardTitle>
                <CardDescription>
                  Análise de vendas, faturamento e desempenho.
                </CardDescription>
              </div>
              <Select
                value={salesDataTimeRange}
                onValueChange={(value) => setSalesDataTimeRange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Período de análise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_30_days">Últimos 30 dias</SelectItem>
                  <SelectItem value="last_90_days">Últimos 90 dias</SelectItem>
                  <SelectItem value="current_year">Ano atual</SelectItem>
                  <SelectItem value="all_time">Todo o período</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Veículos Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">{sales?.length || 0}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">
                        {formatPrice(
                          sales?.reduce((total: number, sale: any) => total + parseFloat(sale.salePrice), 0) || 0
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Calculator className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">
                        {sales && sales.length > 0
                          ? formatPrice(
                              sales.reduce((total: number, sale: any) => total + parseFloat(sale.salePrice), 0) / sales.length
                            )
                          : formatPrice(0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Marcas Mais Vendidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sales && sales.length > 0 ? (
                      <div className="space-y-4">
                        {(() => {
                          // Calcular marcas mais vendidas
                          const brandSales: Record<string, number> = {};
                          sales.forEach((sale: any) => {
                            const brandName = sale.vehicle?.brand?.name || 'Desconhecida';
                            brandSales[brandName] = (brandSales[brandName] || 0) + 1;
                          });
                          
                          // Ordenar por quantidade
                          const sortedBrands = Object.entries(brandSales)
                            .sort(([, countA], [, countB]) => countB - countA)
                            .slice(0, 5);
                          
                          return sortedBrands.map(([brand, count], index) => (
                            <div key={brand} className="flex items-center">
                              <div className="w-12 text-center font-bold">
                                {index + 1}º
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium">{brand}</div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div 
                                    className="bg-primary h-2.5 rounded-full" 
                                    style={{ width: `${(count / sortedBrands[0][1]) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="w-12 text-right font-medium">
                                {count}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        Sem dados de vendas para exibir
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Vendedores Destaque</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sortedDealers && sortedDealers.length > 0 ? (
                      <div className="space-y-4">
                        {sortedDealers.slice(0, 5).map((dealer, index) => (
                          <div key={dealer.id} className="flex items-center">
                            <div className="w-12 text-center">
                              {index === 0 && <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />}
                              {index === 1 && <Trophy className="h-5 w-5 text-gray-400 mx-auto" />}
                              {index === 2 && <Trophy className="h-5 w-5 text-amber-600 mx-auto" />}
                              {index > 2 && <div className="font-bold">{index + 1}º</div>}
                            </div>
                            <div className="flex-1 flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitial(dealer.name)}</AvatarFallback>
                              </Avatar>
                              <div className="text-sm font-medium">{dealer.name}</div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="font-medium">{dealer.sales} vendas</div>
                              <div className="text-xs text-muted-foreground">{dealer.points} pts</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        Sem dados de vendedores para exibir
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Ranking de Vendedores</CardTitle>
                <CardDescription>
                  Desempenho dos vendedores da concessionária.
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button className="flex items-center gap-2" onClick={() => setIsNewDealerDialogOpen(true)}>
                  <Plus size={16} /> Cadastrar Vendedor
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsDeleteAllDealersDialogOpen(true)}>
                  <Trash2 size={16} /> Excluir Todos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDealers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">Pos.</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                          Nome {sortConfig.key === "name" && (
                            sortConfig.direction === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                          )}
                        </TableHead>
                        <TableHead className="cursor-pointer hidden sm:table-cell" onClick={() => handleSort("sales")}>
                          Vendas {sortConfig.key === "sales" && (
                            sortConfig.direction === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                          )}
                        </TableHead>
                        <TableHead className="cursor-pointer hidden md:table-cell" onClick={() => handleSort("points")}>
                          Pontos {sortConfig.key === "points" && (
                            sortConfig.direction === "asc" ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                          )}
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">Data de Início</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedDealers.map((dealer, index) => (
                        <TableRow key={dealer.id}>
                          <TableCell>
                            {index === 0 ? (
                              <Trophy className="h-5 w-5 text-yellow-500" />
                            ) : index === 1 ? (
                              <Trophy className="h-5 w-5 text-gray-400" />
                            ) : index === 2 ? (
                              <Trophy className="h-5 w-5 text-amber-600" />
                            ) : (
                              `${index + 1}º`
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback>{getInitial(dealer.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div>{dealer.name}</div>
                                <div className="text-xs text-muted-foreground">{dealer.email}</div>
                                <div className="sm:hidden text-xs flex items-center gap-2 mt-1">
                                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px]">
                                    {dealer.sales} vendas
                                  </span>
                                  <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[10px]">
                                    {dealer.points} pts
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{dealer.sales}</TableCell>
                          <TableCell className="hidden md:table-cell">{dealer.points}</TableCell>
                          <TableCell className="hidden lg:table-cell">{dealer.startDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditDealer(dealer)}
                                title="Editar credenciais"
                              >
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteDealer(dealer.id)}
                                title="Excluir vendedor"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!dealers || dealers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            Nenhum vendedor cadastrado.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Dialog para adicionar novo vendedor */}
          <Dialog open={isNewDealerDialogOpen} onOpenChange={setIsNewDealerDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Vendedor</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo vendedor para adicioná-lo ao sistema.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dealer-name">Nome</Label>
                  <Input
                    id="dealer-name"
                    placeholder="Nome do vendedor"
                    value={newDealerName}
                    onChange={(e) => setNewDealerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dealer-username">Nome de usuário</Label>
                  <Input
                    id="dealer-username"
                    placeholder="Nome de usuário para login"
                    value={newDealerUsername}
                    onChange={(e) => setNewDealerUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dealer-email">Email</Label>
                  <Input
                    id="dealer-email"
                    placeholder="Email do vendedor"
                    type="email"
                    value={newDealerEmail}
                    onChange={(e) => setNewDealerEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dealer-password">Senha</Label>
                  <Input
                    id="dealer-password"
                    placeholder="Senha de acesso"
                    type="password"
                    value={newDealerPassword}
                    onChange={(e) => setNewDealerPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewDealerDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddDealer}
                  disabled={!newDealerName || !newDealerEmail || !newDealerPassword || addDealerMutation.isPending}
                >
                  {addDealerMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Dialog para confirmar exclusão de todos os vendedores */}
          <Dialog open={isDeleteAllDealersDialogOpen} onOpenChange={setIsDeleteAllDealersDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
              <DialogHeader>
                <DialogTitle>Excluir Todos os Vendedores</DialogTitle>
                <DialogDescription>
                  Você tem certeza que deseja excluir todos os vendedores? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteAllDealersDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAllDealers}
                  disabled={deleteAllDealersMutation.isPending}
                >
                  {deleteAllDealersMutation.isPending ? "Excluindo..." : "Sim, excluir todos"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Dialog para editar vendedor */}
          <Dialog open={isEditDealerDialogOpen} onOpenChange={setIsEditDealerDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
              <DialogHeader>
                <DialogTitle>Editar Vendedor</DialogTitle>
                <DialogDescription>
                  Atualize as credenciais do vendedor para acesso ao sistema.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dealer-name">Nome</Label>
                  <Input
                    id="edit-dealer-name"
                    placeholder="Nome do vendedor"
                    value={newDealerName}
                    onChange={(e) => setNewDealerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-dealer-username">Nome de usuário</Label>
                  <Input
                    id="edit-dealer-username"
                    placeholder="Nome de usuário para login"
                    value={newDealerUsername}
                    onChange={(e) => setNewDealerUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-dealer-email">Email</Label>
                  <Input
                    id="edit-dealer-email"
                    placeholder="Email do vendedor"
                    type="email"
                    value={newDealerEmail}
                    onChange={(e) => setNewDealerEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-dealer-password">Nova Senha (deixe em branco para manter a atual)</Label>
                  <Input
                    id="edit-dealer-password"
                    placeholder="Nova senha de acesso (opcional)"
                    type="password"
                    value={newDealerPassword}
                    onChange={(e) => setNewDealerPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDealerDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveDealer}
                  disabled={!newDealerName || !newDealerUsername || !newDealerEmail || updateDealerMutation.isPending}
                >
                  {updateDealerMutation.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Dialog para marcar veículo como vendido */}
          <Dialog open={isMarkAsAsSoldDialogOpen} onOpenChange={setIsMarkAsAsSoldDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
              <DialogHeader>
                <DialogTitle>Registrar Venda</DialogTitle>
                <DialogDescription>
                  Selecione o vendedor responsável pela venda do veículo {vehicleToMarkAsSold?.model}.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="space-y-2">
                  <Label htmlFor="dealer-select">Vendedor</Label>
                  <Select 
                    onValueChange={(value) => setSelectedDealerForSale(Number(value))}
                    value={selectedDealerForSale?.toString() || ""}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealers?.map((dealer) => (
                        <SelectItem key={dealer.id} value={dealer.id.toString()}>
                          {dealer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {dealers?.length === 0 && (
                    <p className="text-sm text-yellow-500 mt-2">
                      Nenhum vendedor cadastrado. Cadastre um vendedor na aba "Vendedores" antes de registrar uma venda.
                    </p>
                  )}
                </div>
                
                <div className="mt-6">
                  <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-4">
                    <div className="flex items-center gap-4">
                      {vehicleToMarkAsSold?.imageUrl && (
                        <div className="w-16 h-16 rounded-md overflow-hidden">
                          <img 
                            src={vehicleToMarkAsSold.imageUrl}
                            alt={vehicleToMarkAsSold.model}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">{vehicleToMarkAsSold?.model}</h4>
                        <p className="text-sm text-slate-500">{formatPrice(vehicleToMarkAsSold?.price || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMarkAsAsSoldDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmSale}
                  disabled={!selectedDealerForSale || markVehicleAsSoldMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {markVehicleAsSoldMutation.isPending ? "Registrando..." : "Registrar Venda"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Gerenciar Marcas</CardTitle>
                <CardDescription>
                  Adicione, edite ou remova marcas de veículos.
                </CardDescription>
              </div>
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedBrand({id: 0, name: "", logoUrl: ""});
                  setIsBrandDialogOpen(true);
                }}
              >
                <Plus size={16} /> Adicionar Marca
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Buscar marcas..."
                  className="max-w-md"
                  value={searchBrand}
                  onChange={e => setSearchBrand(e.target.value)}
                />
              </div>
              
              {isLoadingBrands ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brands?.filter(brand => 
                    brand.name.toLowerCase().includes(searchBrand.toLowerCase())
                  ).map((brand) => (
                    <Card key={brand.id} className="overflow-hidden">
                      <div className="p-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 flex items-center justify-center mb-4">
                          <img 
                            src={brand.logoUrl} 
                            alt={`Logo da ${brand.name}`} 
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <h3 className="font-semibold">{brand.name}</h3>
                      </div>
                      <CardFooter className="flex justify-center gap-2 p-4 pt-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedBrand(brand);
                            setIsBrandDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500"
                          onClick={() => {
                            setSelectedBrand(brand);
                            setIsDeleteBrandDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Excluir
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  {!brands || brands.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      Nenhuma marca cadastrada.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col space-y-1.5">
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Gerencie avaliações do Google e posts do Instagram.
                </CardDescription>
              </div>
              <Tabs value={integrationTab} onValueChange={(value) => setIntegrationTab(value as "reviews" | "instagram")} className="mt-4">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="reviews" className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" /> Avaliações Google
                  </TabsTrigger>
                  <TabsTrigger value="instagram" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-pink-500" /> Instagram
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="reviews" className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">Avaliações do Google</h3>
                      <Badge className="ml-2 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-yellow-500/20">
                        {reviews?.length || 0} avaliações
                      </Badge>
                    </div>
                    <Button onClick={() => {
                      setSelectedReview({
                        id: 0,
                        name: "",
                        avatarInitial: "",
                        rating: 5,
                        comment: "",
                        date: new Date().toISOString().split('T')[0],
                      });
                      setIsReviewDialogOpen(true);
                    }} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Adicionar Avaliação
                    </Button>
                  </div>
                  
                  {isLoadingReviews ? (
                    <div className="py-10 flex justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {reviews && reviews.length > 0 ? reviews.map(review => (
                        <Card key={review.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-primary text-white">
                                    {review.avatarInitial}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold">{review.name}</div>
                                  <div className="flex items-center text-yellow-500">
                                    {getRatingStars(review.rating).map((star, idx) => (
                                      <span key={idx}>
                                        {star === 'full' ? (
                                          <Star className="h-4 w-4 fill-current" />
                                        ) : star === 'half' ? (
                                          <Star className="h-4 w-4 fill-current opacity-60" />
                                        ) : (
                                          <Star className="h-4 w-4 text-gray-300" />
                                        )}
                                      </span>
                                    ))}
                                    <span className="text-xs text-slate-500 ml-2">
                                      {new Date(review.date).toLocaleDateString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-blue-600"
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setIsReviewDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600"
                                  onClick={() => {
                                    setSelectedReview(review);
                                    setIsDeleteReviewDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-slate-600 line-clamp-4">
                              "{review.comment}"
                            </p>
                          </CardContent>
                        </Card>
                      )) : (
                        <div className="col-span-full py-6 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Star className="h-12 w-12 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-900">Nenhuma avaliação</h3>
                            <p className="text-sm text-slate-500 max-w-md">
                              Adicione avaliações do Google para mostrar aos seus clientes.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="instagram" className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">Posts do Instagram</h3>
                      <Badge className="ml-2 bg-pink-500/10 text-pink-700 hover:bg-pink-500/20 border-pink-500/20">
                        {instagramPosts?.length || 0} posts
                      </Badge>
                    </div>
                    <Button onClick={() => {
                      setSelectedInstagramPost({
                        id: 0,
                        imageUrl: "",
                        postUrl: "",
                        likes: 0
                      });
                      setIsInstagramPostDialogOpen(true);
                    }} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Adicionar Post
                    </Button>
                  </div>
                  
                  {isLoadingInstagramPosts ? (
                    <div className="py-10 flex justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {instagramPosts && instagramPosts.length > 0 ? instagramPosts.map(post => (
                        <Card key={post.id} className="overflow-hidden">
                          <div className="relative">
                            <div className="aspect-square overflow-hidden">
                              <img 
                                src={post.imageUrl} 
                                alt="Instagram post" 
                                className="w-full h-full object-cover transform transition-transform hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = "https://placehold.co/600x600/eee/ccc?text=Imagem+Indisponível";
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                              <div className="flex justify-between w-full">
                                <div className="flex items-center text-white">
                                  <Heart className="h-4 w-4 mr-1 fill-white text-white" /> 
                                  <span className="text-sm">{post.likes}</span>
                                </div>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 bg-white/20 text-white hover:bg-white/40"
                                    onClick={() => {
                                      setSelectedInstagramPost(post);
                                      setIsInstagramPostDialogOpen(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 bg-white/20 text-white hover:bg-red-600 hover:bg-white/40"
                                    onClick={() => {
                                      setSelectedInstagramPost(post);
                                      setIsDeleteInstagramPostDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <CardFooter className="p-3 border-t flex justify-between items-center">
                            <div className="flex items-center text-sm text-pink-600">
                              <Heart className="h-3.5 w-3.5 mr-1 fill-pink-500 text-pink-500" /> {post.likes}
                            </div>
                            <a 
                              href={post.postUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline truncate max-w-[150px]"
                            >
                              Ver no Instagram
                            </a>
                          </CardFooter>
                        </Card>
                      )) : (
                        <div className="col-span-full py-6 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="h-12 w-12 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-900">Nenhum post</h3>
                            <p className="text-sm text-slate-500 max-w-md">
                              Adicione posts do Instagram para mostrar nas integrações da sua página.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </TabsContent>
        

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Gerenciar Solicitações</CardTitle>
                <CardDescription>
                  Gerencie solicitações de avaliação e financiamento.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={requestsTab} onValueChange={(value) => setRequestsTab(value as "evaluations" | "financing")} className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full max-w-md">
                  <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
                  <TabsTrigger value="financing">Financiamentos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="evaluations" className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        placeholder="Buscar solicitações..." 
                        className="pl-9"
                        value={evaluationSearchTerm}
                        onChange={(e) => setEvaluationSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Label htmlFor="evaluation-status-filter" className="whitespace-nowrap">Status:</Label>
                      <Select
                        value={evaluationStatusFilter}
                        onValueChange={setEvaluationStatusFilter}
                      >
                        <SelectTrigger id="evaluation-status-filter" className="w-40">
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="contacted">Contatado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {isLoadingEvaluations ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Contato</TableHead>
                              <TableHead>Veículo</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {evaluationRequests
                              ?.filter(req => 
                                (evaluationStatusFilter === "all" || req.status === evaluationStatusFilter) &&
                                (evaluationSearchTerm === "" || 
                                 req.name.toLowerCase().includes(evaluationSearchTerm.toLowerCase()) ||
                                 req.email.toLowerCase().includes(evaluationSearchTerm.toLowerCase()) ||
                                 req.vehicleInfo.toLowerCase().includes(evaluationSearchTerm.toLowerCase()) ||
                                 req.phone.includes(evaluationSearchTerm))
                              )
                              .map((request) => (
                                <TableRow key={request.id}>
                                  <TableCell className="font-medium">{request.name}</TableCell>
                                  <TableCell>{request.requestDate}</TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p>{request.email}</p>
                                      <p>{request.phone}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {(() => {
                                      try {
                                        const vehicleData = JSON.parse(request.vehicleInfo);
                                        return (
                                          <div className="max-w-[200px]">
                                            <p className="font-medium">{vehicleData.marca} {vehicleData.modelo}</p>
                                            <p className="text-xs text-gray-500">
                                              {vehicleData.ano} • {vehicleData.valor}
                                            </p>
                                          </div>
                                        );
                                      } catch (e) {
                                        return (
                                          <div className="max-w-[200px] truncate" title={request.vehicleInfo}>
                                            {request.vehicleInfo}
                                          </div>
                                        );
                                      }
                                    })()}
                                  </TableCell>
                                  <TableCell>
                                    {request.status === 'pending' && (
                                      <Badge variant="outline" className="bg-yellow-100 hover:bg-yellow-200 border-yellow-500 text-yellow-800">
                                        Pendente
                                      </Badge>
                                    )}
                                    {request.status === 'contacted' && (
                                      <Badge variant="outline" className="bg-blue-100 hover:bg-blue-200 border-blue-500 text-blue-800">
                                        Contatado
                                      </Badge>
                                    )}
                                    {request.status === 'completed' && (
                                      <Badge variant="outline" className="bg-green-100 hover:bg-green-200 border-green-500 text-green-800">
                                        Concluído
                                      </Badge>
                                    )}
                                    {request.status === 'cancelled' && (
                                      <Badge variant="outline" className="bg-red-100 hover:bg-red-200 border-red-500 text-red-800">
                                        Cancelado
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                          setSelectedEvaluation(request);
                                          setIsStatusDialogOpen(true);
                                        }}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => deleteEvaluationMutation.mutate(request.id)}
                                        disabled={deleteEvaluationMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {evaluationRequests?.filter(req => 
                                (evaluationStatusFilter === "all" || req.status === evaluationStatusFilter) &&
                                (evaluationSearchTerm === "" || 
                                 req.name.toLowerCase().includes(evaluationSearchTerm.toLowerCase()) ||
                                 req.email.toLowerCase().includes(evaluationSearchTerm.toLowerCase()) ||
                                 req.vehicleInfo.toLowerCase().includes(evaluationSearchTerm.toLowerCase()) ||
                                 req.phone.includes(evaluationSearchTerm))
                              ).length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhuma solicitação de avaliação encontrada.
                                  </TableCell>
                                </TableRow>
                              )}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="financing" className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input 
                        placeholder="Buscar solicitações..." 
                        className="pl-9"
                        value={financingSearchTerm}
                        onChange={(e) => setFinancingSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <Label htmlFor="financing-status-filter" className="whitespace-nowrap">Status:</Label>
                      <Select
                        value={financingStatusFilter}
                        onValueChange={setFinancingStatusFilter}
                      >
                        <SelectTrigger id="financing-status-filter" className="w-40">
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_review">Em Análise</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="denied">Negado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {isLoadingFinancing ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead>Contato</TableHead>
                              <TableHead>Veículo</TableHead>
                              <TableHead>Renda</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {financingRequests
                              ?.filter(req => 
                                (financingStatusFilter === "all" || req.status === financingStatusFilter) &&
                                (financingSearchTerm === "" || 
                                 req.name.toLowerCase().includes(financingSearchTerm.toLowerCase()) ||
                                 req.email.toLowerCase().includes(financingSearchTerm.toLowerCase()) ||
                                 req.vehicleInfo.toLowerCase().includes(financingSearchTerm.toLowerCase()) ||
                                 req.phone.includes(financingSearchTerm))
                              )
                              .map((request) => (
                                <TableRow key={request.id}>
                                  <TableCell className="font-medium">{request.name}</TableCell>
                                  <TableCell>{request.requestDate}</TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p>{request.email}</p>
                                      <p>{request.phone}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {(() => {
                                      try {
                                        const vehicleData = JSON.parse(request.vehicleInfo);
                                        return (
                                          <div className="max-w-[200px]">
                                            <p className="font-medium">{vehicleData.marca} {vehicleData.modelo}</p>
                                            <p className="text-xs text-muted-foreground">{vehicleData.ano} • {vehicleData.valor}</p>
                                          </div>
                                        );
                                      } catch (e) {
                                        return (
                                          <div className="max-w-[200px] truncate" title={request.vehicleInfo}>
                                            {request.vehicleInfo}
                                          </div>
                                        );
                                      }
                                    })()}
                                  </TableCell>
                                  <TableCell>{request.income}</TableCell>
                                  <TableCell>
                                    {request.status === 'pending' && (
                                      <Badge variant="outline" className="bg-yellow-100 hover:bg-yellow-200 border-yellow-500 text-yellow-800">
                                        Pendente
                                      </Badge>
                                    )}
                                    {request.status === 'in_review' && (
                                      <Badge variant="outline" className="bg-blue-100 hover:bg-blue-200 border-blue-500 text-blue-800">
                                        Em Análise
                                      </Badge>
                                    )}
                                    {request.status === 'approved' && (
                                      <Badge variant="outline" className="bg-green-100 hover:bg-green-200 border-green-500 text-green-800">
                                        Aprovado
                                      </Badge>
                                    )}
                                    {request.status === 'denied' && (
                                      <Badge variant="outline" className="bg-red-100 hover:bg-red-200 border-red-500 text-red-800">
                                        Negado
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => {
                                          setSelectedFinancing(request);
                                          setIsStatusDialogOpen(true);
                                        }}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => deleteFinancingMutation.mutate(request.id)}
                                        disabled={deleteFinancingMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {financingRequests?.filter(req => 
                                (financingStatusFilter === "all" || req.status === financingStatusFilter) &&
                                (financingSearchTerm === "" || 
                                 req.name.toLowerCase().includes(financingSearchTerm.toLowerCase()) ||
                                 req.email.toLowerCase().includes(financingSearchTerm.toLowerCase()) ||
                                 req.vehicleInfo.toLowerCase().includes(financingSearchTerm.toLowerCase()) ||
                                 req.phone.includes(financingSearchTerm))
                              ).length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={7} className="h-24 text-center">
                                    Nenhuma solicitação de financiamento encontrada.
                                  </TableCell>
                                </TableRow>
                              )}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Diálogo para atualizar status de avaliação */}
          <Dialog open={isStatusDialogOpen && selectedEvaluation !== null} onOpenChange={(open) => {
            if (!open) {
              setIsStatusDialogOpen(false);
              setSelectedEvaluation(null);
            }
          }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
              <DialogHeader>
                <DialogTitle>Detalhes da Avaliação</DialogTitle>
                <DialogDescription>
                  Informações sobre a solicitação de avaliação.
                </DialogDescription>
              </DialogHeader>
              
              {selectedEvaluation && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Nome do Cliente</h3>
                      <p>{selectedEvaluation.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Data da Solicitação</h3>
                      <p>{selectedEvaluation.requestDate}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Email</h3>
                      <p>{selectedEvaluation.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Telefone</h3>
                      <p>{selectedEvaluation.phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Veículo para Avaliação</h3>
                    <p>{selectedEvaluation.vehicleInfo}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Status da Solicitação</h3>
                    <Select 
                      defaultValue={selectedEvaluation.status}
                      onValueChange={(value) => {
                        setSelectedEvaluation(prev => prev ? {...prev, status: value as any} : null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="contacted">Contatado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Observações</h3>
                    <Textarea 
                      className="h-24" 
                      placeholder="Observações sobre a solicitação"
                      value={notesText || selectedEvaluation.notes || ""}
                      onChange={(e) => setNotesText(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedEvaluation) {
                      updateEvaluationStatusMutation.mutate({
                        id: selectedEvaluation.id,
                        status: selectedEvaluation.status,
                        notes: notesText || selectedEvaluation.notes || null
                      });
                    }
                  }}
                  disabled={updateEvaluationStatusMutation.isPending}
                >
                  {updateEvaluationStatusMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Diálogo para atualizar status de financiamento */}
          <Dialog open={isStatusDialogOpen && selectedFinancing !== null} onOpenChange={(open) => {
            if (!open) {
              setIsStatusDialogOpen(false);
              setSelectedFinancing(null);
            }
          }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto bg-[#131c2b] text-white border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Detalhes do Financiamento</DialogTitle>
                <DialogDescription className="text-gray-300">
                  Informações sobre a solicitação de financiamento.
                </DialogDescription>
              </DialogHeader>
              
              {selectedFinancing && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-300 mb-1">Nome do Cliente</h3>
                      <p className="p-2 bg-[#1b2639] text-white rounded-md font-medium border border-slate-700">{selectedFinancing.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-300 mb-1">Data da Solicitação</h3>
                      <p className="p-2 bg-[#1b2639] text-white rounded-md font-medium border border-slate-700">
                        {new Date(selectedFinancing.requestDate).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-300 mb-1">Email</h3>
                      <p className="p-2 bg-[#1b2639] text-white rounded-md font-medium border border-slate-700">{selectedFinancing.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-300 mb-1">Telefone</h3>
                      <p className="p-2 bg-[#1b2639] text-white rounded-md font-medium border border-slate-700">{selectedFinancing.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-300 mb-1">Renda Declarada</h3>
                      <p className="p-2 bg-[#1b2639] text-white rounded-md font-medium border border-slate-700">R$ {selectedFinancing.income}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-300 mb-1">Status da Solicitação</h3>
                      <Select 
                        defaultValue={selectedFinancing.status}
                        onValueChange={(value) => {
                          setSelectedFinancing(prev => prev ? {...prev, status: value as any} : null);
                        }}
                      >
                        <SelectTrigger className="w-full bg-[#1b2639] text-white border-slate-700">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1b2639] text-white border-slate-700">
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="in_review">Em Análise</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="denied">Negado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Detalhes do Financiamento</h3>
                    {(() => {
                      try {
                        // Parse dos dados do veículo
                        const vehicleData = JSON.parse(selectedFinancing.vehicleInfo);
                        // Parse dos dados pessoais (armazenados no campo notes)
                        let personalData: any = {};
                        try {
                          if (selectedFinancing.notes) {
                            personalData = JSON.parse(selectedFinancing.notes);
                          }
                        } catch (e) {
                          console.error("Erro ao fazer parse dos dados pessoais", e);
                        }
                        
                        return (
                          <div className="bg-[#1b2639] rounded-md p-4 space-y-4 border border-slate-700">
                            {/* Seção de Dados do Veículo */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="border-r border-slate-700 pr-4">
                                <h4 className="font-semibold text-sm text-white">Veículo</h4>
                                <div className="mt-1 space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-300">Marca:</label>
                                    <p className="font-semibold text-white">{vehicleData.marca}</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-300">Modelo:</label>
                                    <p className="font-semibold text-white">{vehicleData.modelo}</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-300">Ano:</label>
                                    <p className="font-semibold text-white">{vehicleData.ano}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border-r border-slate-700 pr-4">
                                <h4 className="font-semibold text-sm text-white">Valores</h4>
                                <div className="mt-1 space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-300">Valor do veículo:</label>
                                    <p className="font-semibold text-white">{vehicleData.valor}</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-300">Entrada:</label>
                                    <p className="font-semibold text-white">{vehicleData.entrada}</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-300">Valor financiado:</label>
                                    <p className="font-semibold text-white">
                                      {vehicleData.valorFinanciado || "Não informado"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-sm text-white">Parcelamento</h4>
                                <div className="mt-1 space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-300">Parcelas:</label>
                                    <p className="font-semibold text-white">{vehicleData.parcelas}x</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-300">Valor da parcela:</label>
                                    <p className="font-semibold text-white">
                                      {vehicleData.valorParcela ? `R$ ${vehicleData.valorParcela}` : "Não informado"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Dados Pessoais */}
                            {personalData && (
                              <div className="border-t border-slate-700 pt-3 mt-3">
                                <h4 className="font-semibold text-sm text-white">Dados Pessoais</h4>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                  {personalData.cpf && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">CPF:</label>
                                      <p className="font-semibold text-white">{personalData.cpf}</p>
                                    </div>
                                  )}
                                  {personalData.rg && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">RG:</label>
                                      <p className="font-semibold text-white">{personalData.rg}</p>
                                    </div>
                                  )}
                                  {personalData.dataNascimento && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Data de Nascimento:</label>
                                      <p className="font-semibold text-white">{personalData.dataNascimento}</p>
                                    </div>
                                  )}
                                  {personalData.estadoCivil && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Estado Civil:</label>
                                      <p className="font-semibold text-white">{personalData.estadoCivil}</p>
                                    </div>
                                  )}
                                  {personalData.nomeMae && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Nome da Mãe:</label>
                                      <p className="font-semibold text-white">{personalData.nomeMae}</p>
                                    </div>
                                  )}
                                  {personalData.nomePai && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Nome do Pai:</label>
                                      <p className="font-semibold text-white">{personalData.nomePai}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Dados de Endereço */}
                            {personalData && personalData.endereco && (
                              <div className="border-t border-slate-700 pt-3 mt-3">
                                <h4 className="font-semibold text-sm text-white">Endereço</h4>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                  {personalData.endereco.logradouro && (
                                    <div className="col-span-2">
                                      <label className="block text-xs font-medium text-slate-300">Endereço:</label>
                                      <p className="font-semibold text-white">
                                        {personalData.endereco.logradouro}
                                        {personalData.endereco.numero ? `, ${personalData.endereco.numero}` : ''}
                                        {personalData.endereco.complemento ? ` - ${personalData.endereco.complemento}` : ''}
                                      </p>
                                    </div>
                                  )}
                                  {personalData.endereco.bairro && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Bairro:</label>
                                      <p className="font-semibold text-white">{personalData.endereco.bairro}</p>
                                    </div>
                                  )}
                                  {personalData.endereco.cidade && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Cidade:</label>
                                      <p className="font-semibold text-white">{personalData.endereco.cidade}</p>
                                    </div>
                                  )}
                                  {personalData.endereco.estado && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Estado:</label>
                                      <p className="font-semibold text-white">{personalData.endereco.estado}</p>
                                    </div>
                                  )}
                                  {personalData.endereco.cep && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">CEP:</label>
                                      <p className="font-semibold text-white">{personalData.endereco.cep}</p>
                                    </div>
                                  )}
                                  {personalData.endereco.tempoResidencia && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Tempo de Residência:</label>
                                      <p className="font-semibold text-white">{personalData.endereco.tempoResidencia}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Dados Profissionais */}
                            {personalData && personalData.emprego && (
                              <div className="border-t border-slate-700 pt-3 mt-3">
                                <h4 className="font-semibold text-sm text-white">Dados Profissionais</h4>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                  {personalData.emprego.empresa && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Empresa:</label>
                                      <p className="font-semibold text-white">{personalData.emprego.empresa}</p>
                                    </div>
                                  )}
                                  {personalData.emprego.cargo && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Cargo:</label>
                                      <p className="font-semibold text-white">{personalData.emprego.cargo}</p>
                                    </div>
                                  )}
                                  {personalData.emprego.endereco && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Endereço da Empresa:</label>
                                      <p className="font-semibold text-white">{personalData.emprego.endereco}</p>
                                    </div>
                                  )}
                                  {personalData.emprego.telefone && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Telefone da Empresa:</label>
                                      <p className="font-semibold text-white">{personalData.emprego.telefone}</p>
                                    </div>
                                  )}
                                  {personalData.emprego.tempo && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Tempo de Empresa:</label>
                                      <p className="font-semibold text-white">{personalData.emprego.tempo}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Dados Bancários */}
                            {personalData && personalData.banco && (
                              <div className="border-t border-slate-700 pt-3 mt-3">
                                <h4 className="font-semibold text-sm text-white">Dados Bancários</h4>
                                <div className="mt-2 grid grid-cols-3 gap-4">
                                  {personalData.banco.nome && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Banco:</label>
                                      <p className="font-semibold text-white">{personalData.banco.nome}</p>
                                    </div>
                                  )}
                                  {personalData.banco.agencia && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Agência:</label>
                                      <p className="font-semibold text-white">{personalData.banco.agencia}</p>
                                    </div>
                                  )}
                                  {personalData.banco.conta && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Conta:</label>
                                      <p className="font-semibold text-white">{personalData.banco.conta}</p>
                                    </div>
                                  )}
                                  {personalData.banco.tempoConta && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Tempo de Conta:</label>
                                      <p className="font-semibold text-white">{personalData.banco.tempoConta}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Referências */}
                            {personalData && personalData.referencias && (
                              <div className="border-t border-slate-700 pt-3 mt-3">
                                <h4 className="font-semibold text-sm text-white">Referências Pessoais</h4>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                  {personalData.referencias.referencia1 && personalData.referencias.referencia1.nome && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Nome (1ª Referência):</label>
                                      <p className="font-semibold text-white">{personalData.referencias.referencia1.nome}</p>
                                    </div>
                                  )}
                                  {personalData.referencias.referencia1 && personalData.referencias.referencia1.telefone && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Telefone (1ª Referência):</label>
                                      <p className="font-semibold text-white">{personalData.referencias.referencia1.telefone}</p>
                                    </div>
                                  )}
                                  {personalData.referencias.referencia2 && personalData.referencias.referencia2.nome && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Nome (2ª Referência):</label>
                                      <p className="font-semibold text-white">{personalData.referencias.referencia2.nome}</p>
                                    </div>
                                  )}
                                  {personalData.referencias.referencia2 && personalData.referencias.referencia2.telefone && (
                                    <div>
                                      <label className="block text-xs font-medium text-slate-300">Telefone (2ª Referência):</label>
                                      <p className="font-semibold text-white">{personalData.referencias.referencia2.telefone}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Observações */}
                            {personalData && personalData.observacoes && (
                              <div className="border-t border-slate-700 pt-3 mt-3">
                                <h4 className="font-semibold text-sm text-white">Observações</h4>
                                <div className="mt-2">
                                  <p className="font-semibold text-white whitespace-pre-wrap">{personalData.observacoes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } catch (e) {
                        console.error("Erro ao exibir detalhes do financiamento:", e);
                        // Mostra dados brutos formatados em JSON se falhar o parsing
                        return (
                          <div className="bg-[#1b2639] rounded-md p-4 border border-slate-700">
                            <p className="text-sm whitespace-pre-wrap font-mono overflow-auto text-white">
                              <strong className="text-blue-300">Dados do veículo:</strong> 
                              <span className="text-slate-300">
                                {JSON.stringify(JSON.parse(selectedFinancing.vehicleInfo), null, 2)}
                              </span>
                              
                              {selectedFinancing.notes && (
                                <>
                                  <br/><br/>
                                  <strong className="text-blue-300">Dados pessoais:</strong>
                                  <span className="text-slate-300">
                                    {JSON.stringify(JSON.parse(selectedFinancing.notes), null, 2)}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                  
                  <div className="hidden">
                    <Textarea 
                      className="h-24" 
                      placeholder="Observações sobre a solicitação"
                      value={notesText || selectedFinancing.notes || ""}
                      onChange={(e) => setNotesText(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    if (selectedFinancing) {
                      updateFinancingStatusMutation.mutate({
                        id: selectedFinancing.id,
                        status: selectedFinancing.status,
                        notes: notesText || selectedFinancing.notes || null
                      });
                    }
                  }}
                  disabled={updateFinancingStatusMutation.isPending}
                >
                  {updateFinancingStatusMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Abas restantes... */}
      </Tabs>
      
      {/* Diálogo para adicionar/editar veículo */}
      <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? "Editar Veículo" : "Adicionar Veículo"}</DialogTitle>
            <DialogDescription>
              {selectedVehicle ? "Atualize as informações do veículo no inventário." : "Preencha os detalhes para adicionar um novo veículo ao inventário."}
            </DialogDescription>
          </DialogHeader>
          
          <form ref={vehicleFormRef} onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            
            // Processar os opcionais marcados nos checkboxes e os opcionais personalizados
            const selectedOptionals = formData.getAll('selected_optionals') as string[];
            
            // Processar opcionais personalizados do textarea
            const customOptionals = formData.get('custom_optionals') 
              ? (formData.get('custom_optionals') as string)
                  .split('\n')
                  .map(item => item.trim())
                  .filter(Boolean)
              : [];
            
            // Combinar os opcionais selecionados com os personalizados
            const allOptionals = [...selectedOptionals, ...customOptionals];
            
            // Atualizar o campo hidden de optionals para envio
            const optionalsJSON = allOptionals.length > 0 ? JSON.stringify(allOptionals) : null;
            
            // Processar preço e remover formatação R$
            let price = formData.get('price') as string;
            if (price) {
              // Remover R$ e outros caracteres não numéricos exceto ponto e vírgula
              price = price.replace(/[^\d,\.]/g, '');
              // Substituir vírgulas por pontos para valores decimais
              price = price.replace(',', '.');
            }
            
            let originalPrice = formData.get('originalPrice') as string;
            if (originalPrice) {
              originalPrice = originalPrice.replace(/[^\d,\.]/g, '');
              originalPrice = originalPrice.replace(',', '.');
            }
            
            const vehicleData = {
              model: formData.get('model') as string,
              brandId: Number(formData.get('brandId')),
              year: formData.get('year') as string,
              color: formData.get('color') as string,
              price: price,
              originalPrice: originalPrice || null,
              mileage: Number(formData.get('mileage')),
              transmission: formData.get('transmission') as string,
              fuel: formData.get('fuel') as string,
              bodyType: formData.get('bodyType') as string,
              description: formData.get('description') as string || null,
              imageUrl: formData.get('imageUrl') as string,
              featured: formData.get('featured') === 'on',
              specialFeatured: formData.get('specialFeatured') === 'on',
              doors: formData.get('doors') ? Number(formData.get('doors')) : null,
              enginePower: formData.get('enginePower') as string || null,
              warranty: formData.get('warranty') as string || 'Consultar',
              optionals: optionalsJSON,
              sold: false
            };
            
            if (selectedVehicle) {
              // Editar veículo existente
              updateVehicleMutation.mutate({
                ...selectedVehicle,
                ...vehicleData
              });
            } else {
              // Adicionar novo veículo
              createVehicleMutation.mutate(vehicleData);
            }
          }} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input 
                  id="model" 
                  name="model" 
                  placeholder="Ex: Corolla XEI" 
                  defaultValue={selectedVehicle?.model}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="brandId">Marca</Label>
                <Select 
                  name="brandId" 
                  defaultValue={selectedVehicle?.brandId?.toString()}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands?.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Input 
                  id="year" 
                  name="year" 
                  placeholder="Ex: 2020/2021" 
                  defaultValue={selectedVehicle?.year}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input 
                  id="color" 
                  name="color" 
                  placeholder="Ex: Prata Metálico" 
                  defaultValue={selectedVehicle?.color}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input 
                  id="price" 
                  name="price" 
                  type="text"
                  placeholder="Ex: 87900" 
                  defaultValue={selectedVehicle?.price.toString()}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Preço Original (opcional)</Label>
                <Input 
                  id="originalPrice" 
                  name="originalPrice" 
                  type="text"
                  placeholder="Ex: 92900" 
                  defaultValue={selectedVehicle?.originalPrice?.toString() || ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mileage">Quilometragem</Label>
                <Input 
                  id="mileage" 
                  name="mileage" 
                  type="number"
                  placeholder="Ex: 45000" 
                  defaultValue={selectedVehicle?.mileage?.toString()}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmissão</Label>
                <Select 
                  name="transmission" 
                  defaultValue={selectedVehicle?.transmission || "Automático"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automático">Automático</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                    <SelectItem value="Automatizado">Automatizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fuel">Combustível</Label>
                <Select 
                  name="fuel" 
                  defaultValue={selectedVehicle?.fuel || "Flex"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flex">Flex</SelectItem>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Etanol">Etanol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Híbrido">Híbrido</SelectItem>
                    <SelectItem value="Elétrico">Elétrico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bodyType">Tipo de Carroceria</Label>
                <Select 
                  name="bodyType" 
                  defaultValue={selectedVehicle?.bodyType || "Sedan"}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="Hatch">Hatch</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Picape">Picape</SelectItem>
                    <SelectItem value="Minivan">Minivan</SelectItem>
                    <SelectItem value="Coupé">Coupé</SelectItem>
                    <SelectItem value="Conversível">Conversível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="doors">Número de Portas</Label>
                <Input 
                  id="doors" 
                  name="doors" 
                  type="number"
                  placeholder="Ex: 4" 
                  defaultValue={selectedVehicle?.doors?.toString() || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enginePower">Potência do Motor</Label>
                <Input 
                  id="enginePower" 
                  name="enginePower" 
                  placeholder="Ex: 1.0 Turbo 116cv" 
                  defaultValue={selectedVehicle?.enginePower || ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty">Garantia</Label>
                <Input 
                  id="warranty" 
                  name="warranty" 
                  placeholder="Ex: 3 anos de fábrica" 
                  defaultValue={selectedVehicle?.warranty || 'Consultar'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL da Imagem Principal</Label>
                <Input 
                  id="imageUrl" 
                  name="imageUrl" 
                  placeholder="https://exemplo.com/imagem.jpg" 
                  defaultValue={selectedVehicle?.imageUrl}
                  required
                />
                <p className="text-xs text-gray-500">
                  Esta será a imagem principal do veículo. Após salvar, você poderá adicionar até 10 imagens adicionais.
                </p>
              </div>
              
              <div className="flex items-center gap-4 h-10 mt-8">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="featured" 
                    name="featured"
                    defaultChecked={selectedVehicle?.featured}
                  />
                  <Label htmlFor="featured">Destacar este veículo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="specialFeatured" 
                    name="specialFeatured"
                    defaultChecked={selectedVehicle?.specialFeatured}
                  />
                  <Label htmlFor="specialFeatured">Destaque Especial</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Detalhes adicionais sobre o veículo..." 
                className="min-h-[100px]"
                defaultValue={selectedVehicle?.description || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="optionals">Itens de série e opcionais do veículo</Label>
              <div className="border rounded-md p-4 bg-background">
                <p className="text-sm text-gray-600 mb-4">
                  Selecione os itens de série e opcionais do veículo para atrair a atenção dos compradores
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {[
                    "Air bag", "Ar condicionado", "Alarme",
                    "Bancos de couro", "Blindado", "Câmera de ré",
                    "Computador de bordo", "Conexão USB", "Controle automático de velocidade",
                    "Interface bluetooth", "Navegador GPS", "Rodas de liga leve",
                    "Sensor de ré", "Som", "Teto solar",
                    "Tração 4x4", "Trava elétrica", "Vidro elétrico",
                    "Volante multifuncional", "Direção hidráulica", "Freios ABS",
                    "Farol de xenon", "Central multimídia", "Piloto automático"
                  ].map((opcional) => {
                    // Verificar se o opcional está presente na lista do veículo
                    const isChecked = selectedVehicle?.optionals 
                      ? (JSON.parse(selectedVehicle.optionals) as string[]).includes(opcional) 
                      : false;
                    
                    return (
                      <div key={opcional} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`optional-${opcional.toLowerCase().replace(/\s/g, '-')}`} 
                          name="selected_optionals" 
                          value={opcional}
                          defaultChecked={isChecked}
                        />
                        <Label 
                          htmlFor={`optional-${opcional.toLowerCase().replace(/\s/g, '-')}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {opcional}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor="custom_optionals" className="text-sm">Outros opcionais (um por linha)</Label>
                  <Textarea 
                    id="custom_optionals" 
                    name="custom_optionals" 
                    placeholder="Digite outros opcionais não listados acima, um por linha" 
                    className="min-h-[60px] text-sm"
                    defaultValue={selectedVehicle?.optionals 
                      ? (JSON.parse(selectedVehicle.optionals) as string[])
                          .filter((opt: string) => !["Air bag", "Ar condicionado", "Alarme", "Bancos de couro", "Blindado", 
                                           "Câmera de ré", "Computador de bordo", "Conexão USB", "Controle automático de velocidade", 
                                           "Interface bluetooth", "Navegador GPS", "Rodas de liga leve", "Sensor de ré", 
                                           "Som", "Teto solar", "Tração 4x4", "Trava elétrica", "Vidro elétrico", 
                                           "Volante multifuncional", "Direção hidráulica", "Freios ABS", 
                                           "Farol de xenon", "Central multimídia", "Piloto automático"].includes(opt))
                          .join('\n') 
                      : ''
                    }
                  />
                </div>
                
                <input type="hidden" name="optionals" id="optionals" />
              </div>
            </div>
            
            {selectedVehicle && (
              <>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
                  <h4 className="text-sm font-medium mb-2">Status</h4>
                  <div className="flex items-center gap-2">
                    {selectedVehicle.sold ? (
                      <Badge variant="destructive">Vendido</Badge>
                    ) : selectedVehicle.specialFeatured ? (
                      <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">Destaque Especial</Badge>
                    ) : selectedVehicle.featured ? (
                      <Badge variant="default">Destaque</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Disponível</Badge>
                    )}
                    {selectedVehicle.sold && <span className="text-sm text-muted-foreground">Não é possível editar veículos já vendidos</span>}
                  </div>
                </div>
                
                {/* Gerenciador de imagens adicionais - aparece para todos os veículos existentes */}
                <div className="border-t pt-6 mt-6">
                  <VehicleImagesManager vehicleId={selectedVehicle.id} />
                </div>
              </>
            )}
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsVehicleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={selectedVehicle?.sold || (selectedVehicle ? updateVehicleMutation.isPending : createVehicleMutation.isPending)}
              >
                {selectedVehicle ? (
                  updateVehicleMutation.isPending ? "Salvando..." : "Salvar Alterações"
                ) : (
                  createVehicleMutation.isPending ? "Adicionando..." : "Adicionar Veículo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar exclusão de veículo */}
      <AlertDialog open={isDeleteVehicleDialogOpen} onOpenChange={setIsDeleteVehicleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
              {selectedVehicle && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md overflow-hidden">
                    <img 
                      src={selectedVehicle.imageUrl} 
                      alt={selectedVehicle.model} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{brands?.find(b => b.id === selectedVehicle.brandId)?.name} {selectedVehicle.model}</div>
                    <div className="text-sm text-muted-foreground">{selectedVehicle.year} • {formatPrice(selectedVehicle.price)}</div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVehicle}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo para adicionar/editar marca */}
      <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
          <DialogHeader>
            <DialogTitle>{selectedBrand && selectedBrand.id !== 0 ? "Editar Marca" : "Adicionar Nova Marca"}</DialogTitle>
            <DialogDescription>
              {selectedBrand && selectedBrand.id !== 0 
                ? "Edite os detalhes da marca selecionada." 
                : "Preencha as informações para adicionar uma nova marca de veículo."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brandName">Nome da Marca</Label>
              <Input 
                id="brandName" 
                placeholder="Ex: Toyota, Volkswagen, etc."
                value={selectedBrand?.name || ""} 
                onChange={(e) => setSelectedBrand(prev => prev ? {...prev, name: e.target.value} : {id: 0, name: e.target.value, logoUrl: ""})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL do Logo</Label>
              <Input 
                id="logoUrl" 
                placeholder="https://exemplo.com/logo.png"
                value={selectedBrand?.logoUrl || ""} 
                onChange={(e) => setSelectedBrand(prev => prev ? {...prev, logoUrl: e.target.value} : {id: 0, name: "", logoUrl: e.target.value})}
              />
            </div>
            
            {selectedBrand?.logoUrl && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-md flex justify-center">
                <div className="w-24 h-24 flex items-center justify-center">
                  <img 
                    src={selectedBrand.logoUrl}
                    alt="Logo preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      // Substitui a imagem com erro por um ícone de erro
                      e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/1160/1160358.png";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBrandDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedBrand) {
                  if (!selectedBrand.name || !selectedBrand.logoUrl) {
                    toast({
                      title: "Campos incompletos",
                      description: "Preencha todos os campos obrigatórios.",
                      variant: "destructive"
                    });
                    return;
                  }
                  if (selectedBrand.id === 0) {
                    // Criar nova marca
                    createBrandMutation.mutate({
                      name: selectedBrand.name,
                      logoUrl: selectedBrand.logoUrl
                    });
                  } else {
                    // Atualizar marca existente
                    updateBrandMutation.mutate({
                      id: selectedBrand.id,
                      name: selectedBrand.name,
                      logoUrl: selectedBrand.logoUrl
                    });
                  }
                }
              }}
              disabled={!selectedBrand || !selectedBrand.name || !selectedBrand.logoUrl || 
                (selectedBrand.id === 0 ? createBrandMutation.isPending : updateBrandMutation.isPending)}
            >
              {selectedBrand?.id === 0 ? (
                createBrandMutation.isPending ? "Salvando..." : "Salvar Nova Marca"
              ) : (
                updateBrandMutation.isPending ? "Salvando..." : "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar exclusão de marca */}
      <AlertDialog open={isDeleteBrandDialogOpen} onOpenChange={setIsDeleteBrandDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Marca</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta marca? Esta ação não pode ser desfeita.
              {selectedBrand && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center">
                    <img 
                      src={selectedBrand.logoUrl} 
                      alt={selectedBrand.name} 
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="font-medium">{selectedBrand.name}</div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedBrand && deleteBrandMutation.mutate(selectedBrand.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteBrandMutation.isPending}
            >
              {deleteBrandMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo para adicionar/editar avaliação */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
          <DialogHeader>
            <DialogTitle>{selectedReview && selectedReview.id !== 0 ? "Editar Avaliação" : "Adicionar Nova Avaliação"}</DialogTitle>
            <DialogDescription>
              {selectedReview && selectedReview.id !== 0 
                ? "Edite os detalhes da avaliação selecionada." 
                : "Preencha as informações para adicionar uma nova avaliação."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reviewName">Nome do Cliente</Label>
              <Input 
                id="reviewName" 
                placeholder="Ex: João Silva"
                value={selectedReview?.name || ""} 
                onChange={(e) => setSelectedReview(prev => prev ? {...prev, name: e.target.value, avatarInitial: getInitial(e.target.value)} : null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reviewRating">Classificação (1-5 estrelas)</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    type="button"
                    variant={selectedReview?.rating === rating ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() => setSelectedReview(prev => prev ? {...prev, rating} : null)}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
              <div className="flex items-center text-yellow-500 mt-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < (selectedReview?.rating || 0) ? (
                      <Star className="h-5 w-5 fill-current" />
                    ) : (
                      <Star className="h-5 w-5 text-gray-300" />
                    )}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reviewComment">Comentário</Label>
              <Textarea 
                id="reviewComment" 
                placeholder="Digite o comentário do cliente aqui..."
                value={selectedReview?.comment || ""} 
                onChange={(e) => setSelectedReview(prev => prev ? {...prev, comment: e.target.value} : null)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reviewDate">Data</Label>
              <Input 
                id="reviewDate" 
                type="date"
                value={selectedReview?.date || ""} 
                onChange={(e) => setSelectedReview(prev => prev ? {...prev, date: e.target.value} : null)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedReview) {
                  if (!selectedReview.name || !selectedReview.comment || !selectedReview.date) {
                    toast({
                      title: "Campos incompletos",
                      description: "Preencha todos os campos obrigatórios.",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  if (selectedReview.id === 0) {
                    // Criar nova avaliação
                    const { id, ...reviewData } = selectedReview;
                    // Adicionar createdAt para atender ao contrato de tipos
                    const reviewWithCreatedAt = {
                      ...reviewData,
                      createdAt: new Date().toISOString()
                    };
                    createReviewMutation.mutate(reviewWithCreatedAt as any);
                  } else {
                    // Atualizar avaliação existente
                    const reviewWithCreatedAt = {
                      ...selectedReview,
                      createdAt: selectedReview.createdAt || new Date().toISOString()
                    };
                    updateReviewMutation.mutate(reviewWithCreatedAt as any);
                  }
                }
              }}
              disabled={!selectedReview || !selectedReview.name || !selectedReview.comment || !selectedReview.date || 
                (selectedReview.id === 0 ? createReviewMutation.isPending : updateReviewMutation.isPending)}
            >
              {selectedReview?.id === 0 ? (
                createReviewMutation.isPending ? "Salvando..." : "Salvar Avaliação"
              ) : (
                updateReviewMutation.isPending ? "Salvando..." : "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar exclusão de avaliação */}
      <AlertDialog open={isDeleteReviewDialogOpen} onOpenChange={setIsDeleteReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Avaliação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.
              {selectedReview && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg shrink-0">
                    {selectedReview.avatarInitial}
                  </div>
                  <div>
                    <div className="font-medium">{selectedReview.name}</div>
                    <div className="flex items-center text-yellow-500 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {i < selectedReview.rating ? (
                            <Star className="h-4 w-4 fill-current" />
                          ) : (
                            <Star className="h-4 w-4 text-gray-300" />
                          )}
                        </span>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">{selectedReview.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {selectedReview.comment}
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedReview && deleteReviewMutation.mutate(selectedReview.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo para adicionar/editar post do Instagram */}
      <Dialog open={isInstagramPostDialogOpen} onOpenChange={setIsInstagramPostDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-h-[90vh] h-[80vh] sm:h-auto">
          <DialogHeader>
            <DialogTitle>{selectedInstagramPost && selectedInstagramPost.id !== 0 ? "Editar Post" : "Adicionar Novo Post"}</DialogTitle>
            <DialogDescription>
              {selectedInstagramPost && selectedInstagramPost.id !== 0 
                ? "Edite os detalhes do post selecionado." 
                : "Preencha as informações para adicionar um novo post do Instagram."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="postImageUrl">URL da Imagem</Label>
              <Input 
                id="postImageUrl" 
                placeholder="https://exemplo.com/imagem.jpg"
                value={selectedInstagramPost?.imageUrl || ""} 
                onChange={(e) => setSelectedInstagramPost(prev => prev ? {...prev, imageUrl: e.target.value} : null)}
              />
            </div>
            
            {selectedInstagramPost?.imageUrl && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-md flex justify-center">
                <div className="w-40 h-40 overflow-hidden rounded-md">
                  <img 
                    src={selectedInstagramPost.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x600/eee/ccc?text=Imagem+Indisponível";
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="postUrl">Link do Post</Label>
              <Input 
                id="postUrl" 
                placeholder="https://instagram.com/p/abc123"
                value={selectedInstagramPost?.postUrl || ""} 
                onChange={(e) => setSelectedInstagramPost(prev => prev ? {...prev, postUrl: e.target.value} : null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postLikes">Número de Curtidas</Label>
              <Input 
                id="postLikes" 
                type="number"
                min="0"
                placeholder="0"
                value={selectedInstagramPost?.likes || 0} 
                onChange={(e) => setSelectedInstagramPost(prev => prev ? 
                  {...prev, likes: parseInt(e.target.value) || 0} : null)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInstagramPostDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedInstagramPost) {
                  if (!selectedInstagramPost.imageUrl || !selectedInstagramPost.postUrl) {
                    toast({
                      title: "Campos incompletos",
                      description: "Preencha todos os campos obrigatórios.",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  if (selectedInstagramPost.id === 0) {
                    // Criar novo post
                    const { id, ...postData } = selectedInstagramPost;
                    // Adicionar createdAt para atender ao contrato de tipos
                    const postWithCreatedAt = {
                      ...postData,
                      createdAt: new Date().toISOString()
                    };
                    createInstagramPostMutation.mutate(postWithCreatedAt as any);
                  } else {
                    // Atualizar post existente
                    const postWithCreatedAt = {
                      ...selectedInstagramPost,
                      createdAt: selectedInstagramPost.createdAt || new Date().toISOString()
                    };
                    updateInstagramPostMutation.mutate(postWithCreatedAt as any);
                  }
                }
              }}
              disabled={!selectedInstagramPost || !selectedInstagramPost.imageUrl || !selectedInstagramPost.postUrl || 
                (selectedInstagramPost.id === 0 ? 
                  createInstagramPostMutation.isPending : updateInstagramPostMutation.isPending)}
            >
              {selectedInstagramPost?.id === 0 ? (
                createInstagramPostMutation.isPending ? "Salvando..." : "Salvar Post"
              ) : (
                updateInstagramPostMutation.isPending ? "Salvando..." : "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar exclusão de post do Instagram */}
      <AlertDialog open={isDeleteInstagramPostDialogOpen} onOpenChange={setIsDeleteInstagramPostDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Post do Instagram</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
              {selectedInstagramPost && (
                <div className="mt-4 p-3 bg-gray-100 rounded-md flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-md">
                    <img 
                      src={selectedInstagramPost.imageUrl} 
                      alt="Instagram post" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x600/eee/ccc?text=Imagem+Indisponível";
                      }}
                    />
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Heart className="h-3.5 w-3.5 mr-1 fill-red-500 text-red-500" /> {selectedInstagramPost.likes} curtidas
                    </div>
                    <div className="text-sm text-blue-600 mt-1 truncate">
                      {selectedInstagramPost.postUrl}
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedInstagramPost && deleteInstagramPostMutation.mutate(selectedInstagramPost.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteInstagramPostMutation.isPending}
            >
              {deleteInstagramPostMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}