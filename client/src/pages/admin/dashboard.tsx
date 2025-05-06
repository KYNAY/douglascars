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
import { Loader2, Trophy, ArrowDown, ArrowUp, Home, LogOut, Plus, Pencil, Trash2, Car, ImageIcon, Calendar, Filter, Eye, Search, FileText, CreditCard, Settings, Tag } from "lucide-react";
import { getInitial, formatPrice } from "@/lib/utils";
import { VehicleImagesManager } from "@/components/admin/vehicle-images-manager";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Dealer {
  id: number;
  name: string;
  username: string;
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
    enabled: isAuthenticated && activeTab === 'requests'
  });
  
  // Buscar dados de solicitações de financiamento
  const { 
    data: financingRequests, 
    isLoading: isLoadingFinancing,
    refetch: refetchFinancing
  } = useQuery<FinancingRequest[]>({
    queryKey: ['/api/financing-requests'],
    enabled: isAuthenticated && activeTab === 'requests'
  });

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Área Administrativa</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2">
            <Home size={16} /> Home
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-3">
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
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap">
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="ranking">Vendedores</TabsTrigger>
          <TabsTrigger value="brands">Marcas</TabsTrigger>
          <TabsTrigger value="featured">Destaques</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>
        
        {/* Conteúdo existente... */}

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