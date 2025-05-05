import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
}

interface FinancingRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicleInfo: string;
  income: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied' | 'in_review';
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
  
  // Mock de dados para solicitações de avaliação - Será substituído pela API real
  const evaluationRequests: EvaluationRequest[] = [
    {
      id: 1,
      name: "Carlos Silva",
      email: "carlos.silva@gmail.com",
      phone: "(28)99988-7766",
      vehicleInfo: "Honda Civic 2020 LX",
      requestDate: "2025-05-04",
      status: "pending"
    },
    {
      id: 2,
      name: "Mariana Oliveira",
      email: "mari.oliveira@hotmail.com",
      phone: "(28)99932-1234",
      vehicleInfo: "Toyota Corolla 2019 XEI",
      requestDate: "2025-05-04",
      status: "contacted"
    },
    {
      id: 3,
      name: "João Mendes",
      email: "joao.mendes@gmail.com",
      phone: "(28)99912-3456",
      vehicleInfo: "Hyundai HB20 2021",
      requestDate: "2025-05-03",
      status: "completed"
    }
  ];
  
  // Mock de dados para solicitações de financiamento - Será substituído pela API real
  const financingRequests: FinancingRequest[] = [
    {
      id: 1,
      name: "Ana Beatriz",
      email: "ana.beatriz@gmail.com",
      phone: "(28)99876-5432",
      vehicleInfo: "Jeep Renegade 2022",
      income: "R$ 5.000,00",
      requestDate: "2025-05-04",
      status: "pending"
    },
    {
      id: 2,
      name: "Roberto Almeida",
      email: "roberto.almeida@hotmail.com",
      phone: "(28)99945-6789",
      vehicleInfo: "Fiat Pulse 2023",
      income: "R$ 7.500,00",
      requestDate: "2025-05-03",
      status: "approved"
    }
  ];

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "desc" ? "asc" : "desc"
    }));
  };

  const sortedDealers = dealers ? [...dealers].sort((a, b) => {
    const key = sortConfig.key as keyof Dealer;
    if (a[key] < b[key]) return sortConfig.direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  }) : [];

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_email");
    localStorage.removeItem("admin_login_time");
    navigate("/");
  };

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
        
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Gerenciar Veículos</CardTitle>
                <CardDescription>
                  Adicione, edite e remova veículos do estoque.
                </CardDescription>
              </div>
              <Button onClick={() => {
                setSelectedVehicle(null);
                setIsVehicleDialogOpen(true);
              }} className="flex items-center gap-2">
                <Plus size={16} /> Adicionar Veículo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Buscar veículos..." 
                    className="pl-9"
                    value={searchVehicle}
                    onChange={(e) => setSearchVehicle(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <Label htmlFor="brand-filter" className="whitespace-nowrap">Filtrar por marca:</Label>
                  <Select
                    value={brandFilter?.toString() || "all"}
                    onValueChange={(value) => setBrandFilter(value === "all" ? null : Number(value))}
                  >
                    <SelectTrigger id="brand-filter" className="w-40">
                      <SelectValue placeholder="Todas as marcas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as marcas</SelectItem>
                      {brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoadingVehicles ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Imagem</TableHead>
                          <TableHead>Modelo</TableHead>
                          <TableHead>Marca</TableHead>
                          <TableHead>Ano</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicles
                          ?.filter(vehicle => 
                            vehicle.model.toLowerCase().includes(searchVehicle.toLowerCase()) &&
                            (brandFilter === null || vehicle.brandId === brandFilter)
                          )
                          .map((vehicle) => {
                            const brandName = brands?.find(b => b.id === vehicle.brandId)?.name || "Desconhecida";
                            return (
                              <TableRow key={vehicle.id}>
                                <TableCell>
                                  <div className="w-12 h-8 rounded bg-gray-100 overflow-hidden">
                                    {vehicle.imageUrl ? (
                                      <img 
                                        src={vehicle.imageUrl} 
                                        alt={vehicle.model} 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                        <ImageIcon size={14} className="text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{vehicle.model}</TableCell>
                                <TableCell>{brandName}</TableCell>
                                <TableCell>{vehicle.year}</TableCell>
                                <TableCell>{formatPrice(vehicle.price)}</TableCell>
                                <TableCell>
                                  {vehicle.sold ? (
                                    <Badge variant="destructive">Vendido</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-green-500 hover:bg-green-600">Disponível</Badge>
                                  )}
                                  {vehicle.featured && (
                                    <Badge variant="outline" className="ml-2">Destaque</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                        setSelectedVehicle(vehicle);
                                        setIsVehicleDialogOpen(true);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => {
                                        setSelectedVehicle(vehicle);
                                        setIsDeleteVehicleDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        {(!vehicles || vehicles.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              Nenhum veículo encontrado.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {vehicles && vehicles.length > 0 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Total: {vehicles.length} veículos
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Diálogo para adicionar/editar veículo */}
          <Dialog open={isVehicleDialogOpen} onOpenChange={setIsVehicleDialogOpen}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedVehicle ? "Editar Veículo" : "Adicionar Novo Veículo"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do veículo para {selectedVehicle ? "atualizar" : "incluir"} no estoque.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="model">Modelo</Label>
                    <Input id="model" placeholder="Ex.: Hilux SRX" defaultValue={selectedVehicle?.model} />
                  </div>
                  <div className="w-full md:w-1/3">
                    <Label htmlFor="year">Ano</Label>
                    <Input id="year" placeholder="Ex.: 2023" defaultValue={selectedVehicle?.year} />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="brand">Marca</Label>
                    <Select defaultValue={selectedVehicle?.brandId?.toString()}>
                      <SelectTrigger id="brand">
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
                  <div className="flex-1">
                    <Label htmlFor="color">Cor</Label>
                    <Input id="color" placeholder="Ex.: Preto Metálico" defaultValue={selectedVehicle?.color} />
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="price">Preço</Label>
                    <Input id="price" placeholder="Ex.: 290900" defaultValue={selectedVehicle?.price} />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="mileage">Kilometragem</Label>
                    <Input id="mileage" placeholder="Ex.: 15000" defaultValue={selectedVehicle?.mileage} />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input id="imageUrl" placeholder="URL da imagem principal" defaultValue={selectedVehicle?.imageUrl} />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descreva o veículo, seus opcionais e características"
                    defaultValue={selectedVehicle?.description || ""}
                    rows={4}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="featured" defaultChecked={selectedVehicle?.featured} />
                    <Label htmlFor="featured" className="cursor-pointer">Veículo em Destaque</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="sold" defaultChecked={selectedVehicle?.sold} />
                    <Label htmlFor="sold" className="cursor-pointer">Vendido</Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsVehicleDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {selectedVehicle ? "Salvar Alterações" : "Adicionar Veículo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo para confirmar exclusão */}
          <Dialog open={isDeleteVehicleDialogOpen} onOpenChange={setIsDeleteVehicleDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir o veículo {selectedVehicle?.model} {selectedVehicle?.year}?
                  Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteVehicleDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    // Implementar exclusão
                    setIsDeleteVehicleDialogOpen(false);
                  }}
                >
                  Excluir
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
                  Adicione, edite e remova marcas de veículos.
                </CardDescription>
              </div>
              <Button onClick={() => {
                setSelectedBrand(null);
                setIsBrandDialogOpen(true);
              }} className="flex items-center gap-2">
                <Plus size={16} /> Adicionar Marca
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Buscar marcas..." 
                    className="pl-9"
                    value={searchBrand}
                    onChange={(e) => setSearchBrand(e.target.value)}
                  />
                </div>
              </div>

              {isLoadingBrands ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {brands
                      ?.filter(brand => brand.name.toLowerCase().includes(searchBrand.toLowerCase()))
                      .map((brand) => (
                        <Card key={brand.id} className="overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{brand.name}</CardTitle>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setSelectedBrand(brand);
                                    setIsBrandDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setSelectedBrand(brand);
                                    setIsDeleteBrandDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="h-16 flex items-center justify-center">
                              {brand.logoUrl ? (
                                <img 
                                  src={brand.logoUrl} 
                                  alt={brand.name} 
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-md">
                                  <ImageIcon size={24} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                    {(!brands || brands.length === 0 || brands.filter(brand => 
                      brand.name.toLowerCase().includes(searchBrand.toLowerCase())).length === 0) && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        Nenhuma marca encontrada.
                      </div>
                    )}
                  </div>
                  
                  {brands && brands.length > 0 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-500">
                        Total: {brands.length} marcas
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Diálogo para adicionar/editar marca */}
          <Dialog open={isBrandDialogOpen} onOpenChange={setIsBrandDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedBrand ? "Editar Marca" : "Adicionar Nova Marca"}</DialogTitle>
                <DialogDescription>
                  {selectedBrand ? "Altere os dados da marca selecionada." : "Informe os dados da nova marca."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="brand-name">Nome da Marca</Label>
                  <Input id="brand-name" placeholder="Ex.: Toyota" defaultValue={selectedBrand?.name} />
                </div>
                
                <div>
                  <Label htmlFor="logo-url">URL do Logo</Label>
                  <Input id="logo-url" placeholder="http://exemplo.com/logo.png" defaultValue={selectedBrand?.logoUrl} />
                </div>
                
                <div>
                  <Label className="block mb-2">Visualização do Logo</Label>
                  <div className="h-24 flex items-center justify-center border rounded-lg p-4">
                    {selectedBrand?.logoUrl ? (
                      <img 
                        src={selectedBrand.logoUrl} 
                        alt={selectedBrand.name} 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon size={24} />
                        <span className="text-sm mt-2">Sem imagem</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBrandDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button>
                  {selectedBrand ? "Salvar Alterações" : "Adicionar Marca"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Diálogo para confirmar exclusão de marca */}
          <Dialog open={isDeleteBrandDialogOpen} onOpenChange={setIsDeleteBrandDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir a marca {selectedBrand?.name}?
                  Esta ação não pode ser desfeita e pode afetar veículos vinculados a esta marca.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteBrandDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    // Implementar exclusão
                    setIsDeleteBrandDialogOpen(false);
                  }}
                >
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Vendedores</CardTitle>
              <CardDescription>
                Vendedores ordenados por pontuação e número de vendas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDealers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("sales")}
                      >
                        <div className="flex items-center">
                          Vendas
                          {sortConfig.key === "sales" && (
                            sortConfig.direction === "asc" ? 
                            <ArrowUp className="h-4 w-4 ml-1" /> : 
                            <ArrowDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("points")}
                      >
                        <div className="flex items-center">
                          Pontos
                          {sortConfig.key === "points" && (
                            sortConfig.direction === "asc" ? 
                            <ArrowUp className="h-4 w-4 ml-1" /> : 
                            <ArrowDown className="h-4 w-4 ml-1" />
                          )}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDealers.map((dealer, index) => (
                      <TableRow key={dealer.id}>
                        <TableCell className="font-medium">
                          {index + 1}
                          {index === 0 && (
                            <Trophy className="h-4 w-4 text-yellow-500 inline ml-1" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-white text-xs">
                                {getInitial(dealer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div>{dealer.name}</div>
                              <div className="text-xs text-gray-500">{dealer.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{dealer.sales}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{dealer.points}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {sortedDealers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          Nenhum vendedor encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Solicitações</CardTitle>
              <CardDescription>
                Acompanhe e gerencie as solicitações de avaliação e financiamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Tabs value={requestsTab} onValueChange={(value) => setRequestsTab(value as any)} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full max-w-md">
                    <TabsTrigger value="evaluations" className="flex items-center gap-2">
                      <FileText size={14} /> Avaliações
                    </TabsTrigger>
                    <TabsTrigger value="financing" className="flex items-center gap-2">
                      <CreditCard size={14} /> Financiamentos
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6">
                    {requestsTab === "evaluations" && (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Contato</TableHead>
                              <TableHead>Veículo</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {evaluationRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell className="whitespace-nowrap">{request.requestDate}</TableCell>
                                <TableCell>{request.name}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>{request.email}</div>
                                    <div>{request.phone}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{request.vehicleInfo}</TableCell>
                                <TableCell>
                                  {request.status === "pending" && (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
                                      Pendente
                                    </Badge>
                                  )}
                                  {request.status === "contacted" && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">
                                      Contatado
                                    </Badge>
                                  )}
                                  {request.status === "completed" && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                                      Concluído
                                    </Badge>
                                  )}
                                  {request.status === "cancelled" && (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">
                                      Cancelado
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedEvaluation(request);
                                        setIsStatusDialogOpen(true);
                                      }}
                                      className="flex items-center gap-1"
                                    >
                                      <Eye size={14} /> Detalhes
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {evaluationRequests.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                  Nenhuma solicitação de avaliação encontrada.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {requestsTab === "financing" && (
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Cliente</TableHead>
                              <TableHead>Contato</TableHead>
                              <TableHead>Veículo</TableHead>
                              <TableHead>Renda</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {financingRequests.map((request) => (
                              <TableRow key={request.id}>
                                <TableCell className="whitespace-nowrap">{request.requestDate}</TableCell>
                                <TableCell>{request.name}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>{request.email}</div>
                                    <div>{request.phone}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{request.vehicleInfo}</TableCell>
                                <TableCell>{request.income}</TableCell>
                                <TableCell>
                                  {request.status === "pending" && (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200">
                                      Pendente
                                    </Badge>
                                  )}
                                  {request.status === "approved" && (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                                      Aprovado
                                    </Badge>
                                  )}
                                  {request.status === "denied" && (
                                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 hover:bg-red-200">
                                      Negado
                                    </Badge>
                                  )}
                                  {request.status === "in_review" && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200">
                                      Em análise
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => {
                                        setSelectedFinancing(request);
                                        setIsStatusDialogOpen(true);
                                      }}
                                      className="flex items-center gap-1"
                                    >
                                      <Eye size={14} /> Detalhes
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {financingRequests.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                  Nenhuma solicitação de financiamento encontrada.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </Tabs>
              </div>
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
                    <Select defaultValue={selectedEvaluation.status}>
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
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button>
                  Salvar Alterações
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
                    <Select defaultValue={selectedFinancing.status}>
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
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>
                Configure integrações e parâmetros do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Instagram API Section */}
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-medium mb-4">Integração Instagram</h3>
                  <p className="text-gray-400 mb-4">
                    Conecte o perfil @douglas.autocar para exibir as postagens mais recentes no site.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="instagram-token" className="text-sm font-medium">
                        Token de Acesso do Instagram
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="instagram-token"
                          type="password"
                          placeholder="Insira o token de acesso"
                          className="flex h-10 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm"
                        />
                        <Button variant="outline" size="sm">
                          Salvar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Obtenha um token do Instagram através do Facebook Developer Portal.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Featured Vehicles Configuration */}
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-medium mb-4">Gerenciar Destaques Especiais</h3>
                  <p className="text-gray-400 mb-4">
                    Configure os veículos exibidos na seção de destaques especiais na página inicial.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Primeiro destaque */}
                    <div className="glass-card p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Destaque 1 - Toyota Hilux 2023</h4>
                      <div className="flex mb-3">
                        <img 
                          src="https://i.pinimg.com/originals/f3/81/f9/f381f9c73492eb5ae0cd14926f174270.jpg" 
                          alt="Toyota Hilux" 
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="ml-3">
                          <p className="text-sm">Toyota Hilux SRX</p>
                          <p className="text-xs text-gray-400">R$ 290.900</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Alterar</Button>
                        <Button size="sm" variant="destructive">Remover</Button>
                      </div>
                    </div>
                    
                    {/* Segundo destaque */}
                    <div className="glass-card p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Destaque 2 - Toyota SW4 2025</h4>
                      <div className="flex mb-3">
                        <img 
                          src="https://www.toyota.com.br/wp-content/themes/toyota-2.0.0/frontend/static/images/swbg/sw4-2024.png" 
                          alt="Toyota SW4" 
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="ml-3">
                          <p className="text-sm">Toyota SW4 Diamond</p>
                          <p className="text-xs text-gray-400">R$ 410.000</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Alterar</Button>
                        <Button size="sm" variant="destructive">Remover</Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="default" size="sm">
                    Adicionar Novo Destaque
                  </Button>
                </div>
                
                {/* Email Configuration Section */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Configuração de Email</h3>
                  <p className="text-gray-400 mb-4">
                    Defina o email para recebimento dos formulários de contato e avaliação.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="contact-email" className="text-sm font-medium">
                        Email para Contato
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="contact-email"
                          type="email"
                          placeholder="exemplo@email.com"
                          defaultValue="caiquewm@gmail.com"
                          className="flex h-10 w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm"
                        />
                        <Button variant="outline" size="sm">
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}