import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Loader2, Trophy, ArrowDown, ArrowUp, Home, LogOut, Plus, Pencil, Trash2, Car, ImageIcon, Calendar, Filter, Eye, Search, FileText, CreditCard, Settings, Tag, ShoppingCart, Calculator, DollarSign } from "lucide-react";
import { getInitial, formatPrice } from "@/lib/utils";
import { VehicleImagesManager } from "@/components/admin/vehicle-images-manager";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";
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
  sold: boolean;
  imageUrl: string;
  transmission?: string;
  fuel?: string;
  bodyType?: string;
  vehicleType?: 'car' | 'motorcycle';
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
  
  // Mutação para excluir vendedor
  const deleteDealerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/dealers/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Vendedor excluído",
        description: "O vendedor foi excluído com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/ranking'] });
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
  
  // Função para marcar veículo como vendido
  const handleMarkAsSold = (vehicle: Vehicle) => {
    setVehicleToMarkAsSold(vehicle);
    setIsMarkAsAsSoldDialogOpen(true);
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
  const { data: sales, isLoading: isLoadingSales } = useQuery({
    queryKey: ['/api/sales'],
    enabled: isAuthenticated
  });
  
  // Buscar dados dos veículos
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
    enabled: isAuthenticated
  });
  
  // Buscar dados das marcas
  const { data: brands, isLoading: isLoadingBrands } = useQuery<Brand[]>({
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
      <div className="mb-6">
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
            <TabsTrigger value="featured" className="whitespace-nowrap">Destaques</TabsTrigger>
            <TabsTrigger value="hero" className="whitespace-nowrap">Carousel</TabsTrigger>
            <TabsTrigger value="settings" className="whitespace-nowrap">Configurações</TabsTrigger>
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
              <Button className="flex items-center gap-2">
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
                            ) : vehicle.featured ? (
                              <Badge variant="default">Destaque</Badge>
                            ) : (
                              <Badge variant="outline">Disponível</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  // Implementar edição de veículo
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  // Implementar gerenciamento de imagens
                                }}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                              {!vehicle.sold && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleMarkAsSold(vehicle)}
                                >
                                  <ShoppingCart className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
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
            <DialogContent>
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
            <DialogContent>
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
            <DialogContent>
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
            <DialogContent>
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
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Adicionar Marca
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingBrands ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brands?.map((brand) => (
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
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4 mr-1" /> Editar
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

        <TabsContent value="featured" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Veículos em Destaque</CardTitle>
              <CardDescription>
                Gerencie os veículos que aparecem em destaque na página inicial.
              </CardDescription>
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
                        <TableHead>Modelo</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Em destaque</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles?.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.model}</TableCell>
                          <TableCell>{brands?.find(b => b.id === vehicle.brandId)?.name || "-"}</TableCell>
                          <TableCell>{formatPrice(vehicle.price)}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={vehicle.featured}
                              onCheckedChange={() => {
                                // Implementar mudança de destaque
                              }}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // Implementar visualização
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" /> Visualizar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!vehicles || vehicles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
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

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Carousel da Página Inicial</CardTitle>
              <CardDescription>
                Adicione, edite ou remova os slides do carousel exibido na página inicial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroSlidesManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Configurações gerais do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Email para Recebimento de Contatos</h3>
                  <div className="flex gap-2">
                    <Input defaultValue="caiquewm@gmail.com" />
                    <Button>Salvar</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Configurações de Notificações</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notification-email" />
                      <Label htmlFor="notification-email">Receber notificações por email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notification-sms" />
                      <Label htmlFor="notification-sms">Receber notificações por SMS</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
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
                                    <div className="max-w-[200px] truncate" title={request.vehicleInfo}>
                                      {request.vehicleInfo}
                                    </div>
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
                                    <div className="max-w-[200px] truncate" title={request.vehicleInfo}>
                                      {request.vehicleInfo}
                                    </div>
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
            <DialogContent>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Detalhes do Financiamento</DialogTitle>
                <DialogDescription>
                  Informações sobre a solicitação de financiamento.
                </DialogDescription>
              </DialogHeader>
              
              {selectedFinancing && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Nome do Cliente</h3>
                      <p>{selectedFinancing.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Data da Solicitação</h3>
                      <p>{selectedFinancing.requestDate}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Email</h3>
                      <p>{selectedFinancing.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Telefone</h3>
                      <p>{selectedFinancing.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Veículo de Interesse</h3>
                      <p>{selectedFinancing.vehicleInfo}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-1">Renda Declarada</h3>
                      <p>{selectedFinancing.income}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Status da Solicitação</h3>
                    <Select 
                      defaultValue={selectedFinancing.status}
                      onValueChange={(value) => {
                        setSelectedFinancing(prev => prev ? {...prev, status: value as any} : null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_review">Em Análise</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="denied">Negado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Observações</h3>
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
    </div>
  );
}