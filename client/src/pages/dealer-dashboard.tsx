import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getInitial, formatPrice, formatMileage } from "@/lib/utils";
import { LogOut, Car, DollarSign, Award, Clock, Image, ShoppingCart, Timer, AlertCircle, Lock, LockOpen, CheckCircle2, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type DealerData = {
  id: number;
  name: string;
  username: string;
  email: string;
  startDate: string;
  points: number;
  sales: number;
};

type SaleData = {
  id: number;
  vehicleId: number;
  dealerId: number;
  salePrice: number;
  saleDate: string;
  vehicle?: {
    model: string;
    year: string;
    imageUrl: string;
    brand?: {
      name: string;
    };
  };
};

// Interface para veículos com dados de reserva
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
  reserved: boolean;
  reservedBy: number | null;
  reservationTime: string | null;
  reservationExpiresAt: string | null;
  imageUrl: string;
  transmission?: string;
  fuel?: string;
  bodyType?: string;
  vehicleType?: 'car' | 'motorcycle';
  brand?: {
    id: number;
    name: string;
    logoUrl: string;
  };
}

export default function DealerDashboard() {
  const [currentDealer, setCurrentDealer] = useState<DealerData | null>(null);
  const [_, setLocation] = useLocation();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false);
  const [isCancelReservationDialogOpen, setIsCancelReservationDialogOpen] = useState(false);
  const [isMarkAsSoldDialogOpen, setIsMarkAsSoldDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Carregar dados do vendedor do localStorage quando a página carrega
  useEffect(() => {
    // Verificar se o vendedor está autenticado
    const isAuth = localStorage.getItem("dealer_authenticated");
    const dealerData = localStorage.getItem("dealer_data");
    
    if (!isAuth || !dealerData) {
      // Redirecionar para a página de login se não estiver autenticado
      setLocation("/vendedor");
      return;
    }
    
    try {
      const dealer = JSON.parse(dealerData);
      setCurrentDealer(dealer);
    } catch (error) {
      console.error("Error parsing dealer data:", error);
      // Se houver erro, redirecionar para login
      setLocation("/vendedor");
    }
    
    // Verificar se o token expirou (24 horas)
    const loginTime = localStorage.getItem("dealer_login_time");
    if (loginTime) {
      const loginDate = new Date(loginTime);
      const currentDate = new Date();
      const hoursDiff = (currentDate.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        handleLogout();
      }
    }
  }, [setLocation]);

  // Buscar as vendas deste vendedor
  const { data: mySales } = useQuery({
    queryKey: ['/api/dealers/sales', currentDealer?.id],
    queryFn: async () => {
      if (!currentDealer?.id) return [];
      
      try {
        const response = await apiRequest(`/api/dealers/${currentDealer.id}/sales`);
        if (!response.ok) {
          throw new Error("Falha ao buscar vendas");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching sales:", error);
        return [];
      }
    },
    enabled: !!currentDealer?.id
  });

  // Buscar veículos disponíveis
  const { data: availableVehicles } = useQuery({
    queryKey: ['/api/vehicles/available'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/vehicles?sold=false');
        if (!response.ok) {
          throw new Error("Falha ao buscar veículos");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        return [];
      }
    }
  });

  // Tipo para os dados do gráfico
  type ChartDataType = {
    monthIndex: number;
    name: string;
    amount: number;
  };

  // Dados para o gráfico de vendas por mês
  const getChartData = (): ChartDataType[] => {
    if (!mySales || !mySales.length) {
      return [
        { monthIndex: 0, name: 'Jan', amount: 0 },
        { monthIndex: 1, name: 'Fev', amount: 0 },
        { monthIndex: 2, name: 'Mar', amount: 0 },
        { monthIndex: 3, name: 'Abr', amount: 0 },
        { monthIndex: 4, name: 'Mai', amount: 0 },
        { monthIndex: 5, name: 'Jun', amount: 0 },
      ];
    }

    // Em uma implementação real, você agruparia as vendas por mês
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Pegar os últimos 6 meses
    const sixMonths: ChartDataType[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      sixMonths.push({
        monthIndex,
        name: monthNames[monthIndex],
        amount: 0
      });
    }
    
    // Contar vendas por mês
    if (mySales) {
      mySales.forEach((sale: SaleData) => {
        const saleDate = new Date(sale.saleDate);
        const saleMonth = saleDate.getMonth();
        
        const monthData = sixMonths.find(m => m.monthIndex === saleMonth);
        if (monthData) {
          monthData.amount += 1;
        }
      });
    }
    
    return sixMonths;
  };

  // Mutação para reservar um veículo
  const reserveMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      if (!currentDealer?.id) throw new Error("Vendedor não identificado");
      
      const response = await apiRequest(`/api/vehicles/${vehicleId}/reserve`, {
        method: "POST",
        body: JSON.stringify({ dealerId: currentDealer.id }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao reservar veículo");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Veículo reservado com sucesso",
        description: "Você tem 24 horas para marcar como vendido antes que a reserva expire.",
        variant: "default",
      });
      setIsReserveDialogOpen(false);
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles/available'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao reservar veículo",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutação para cancelar uma reserva
  const cancelReservationMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      if (!currentDealer?.id) throw new Error("Vendedor não identificado");
      
      const response = await apiRequest(`/api/vehicles/${vehicleId}/cancel-reservation`, {
        method: "POST",
        body: JSON.stringify({ dealerId: currentDealer.id }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao cancelar reserva");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reserva cancelada com sucesso",
        description: "O veículo está novamente disponível para outros vendedores.",
        variant: "default",
      });
      setIsCancelReservationDialogOpen(false);
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles/available'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar reserva",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutação para marcar veículo como vendido
  const markAsSoldMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      if (!currentDealer?.id) throw new Error("Vendedor não identificado");
      
      const response = await apiRequest(`/api/vehicles/${vehicleId}/sold`, {
        method: "PATCH",
        body: JSON.stringify({
          dealerId: currentDealer.id,
          soldDate: new Date().toISOString()
        }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao marcar como vendido");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Veículo marcado como vendido",
        description: "Venda registrada com sucesso! Seus pontos foram atualizados.",
        variant: "default",
      });
      setIsMarkAsSoldDialogOpen(false);
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles/available'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dealers/sales', currentDealer?.id] });
      
      // Atualizar o número de vendas e pontos do vendedor no localStorage
      if (currentDealer) {
        const updatedDealer = { 
          ...currentDealer, 
          sales: currentDealer.sales + 1,
          points: currentDealer.points + 10 // Adicionando 10 pontos por venda
        };
        localStorage.setItem("dealer_data", JSON.stringify(updatedDealer));
        setCurrentDealer(updatedDealer);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao marcar veículo como vendido",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Formatar tempo restante de reserva
  const formatTimeRemaining = (expiresAt: string | null): string => {
    if (!expiresAt) return "";
    
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffMs = expiration.getTime() - now.getTime();
    
    // Se já expirou
    if (diffMs <= 0) return "Expirada";
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m restantes`;
  };

  // Handler para abrir diálogo de reserva
  const handleReserveClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsReserveDialogOpen(true);
  };

  // Handler para abrir diálogo de cancelamento de reserva
  const handleCancelReservationClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsCancelReservationDialogOpen(true);
  };

  // Handler para abrir diálogo de marcar como vendido
  const handleMarkAsSoldClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsMarkAsSoldDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("dealer_authenticated");
    localStorage.removeItem("dealer_token");
    localStorage.removeItem("dealer_data");
    localStorage.removeItem("dealer_login_time");
    setLocation("/vendedor");
  };

  // Se não tiver dados do vendedor, mostrar carregando
  if (!currentDealer) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      {/* Diálogo de Confirmação para Reserva */}
      <AlertDialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja reservar o veículo {selectedVehicle?.brand?.name} {selectedVehicle?.model} {selectedVehicle?.year}? 
              A reserva é válida por 24 horas e impede que outros vendedores reservem este veículo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedVehicle) {
                  reserveMutation.mutate(selectedVehicle.id);
                }
              }}
              disabled={reserveMutation.isPending}
            >
              {reserveMutation.isPending ? (
                <>
                  <Timer className="mr-2 h-4 w-4 animate-spin" />
                  Reservando...
                </>
              ) : (
                "Confirmar Reserva"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de Confirmação para Cancelar Reserva */}
      <AlertDialog open={isCancelReservationDialogOpen} onOpenChange={setIsCancelReservationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a reserva do veículo {selectedVehicle?.brand?.name} {selectedVehicle?.model} {selectedVehicle?.year}?
              Isso permitirá que outros vendedores possam reservá-lo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter Reserva</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedVehicle) {
                  cancelReservationMutation.mutate(selectedVehicle.id);
                }
              }}
              disabled={cancelReservationMutation.isPending}
            >
              {cancelReservationMutation.isPending ? (
                <>
                  <Timer className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar Cancelamento"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de Confirmação para Marcar como Vendido */}
      <AlertDialog open={isMarkAsSoldDialogOpen} onOpenChange={setIsMarkAsSoldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar Venda</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmar a venda do veículo {selectedVehicle?.brand?.name} {selectedVehicle?.model} {selectedVehicle?.year} por {selectedVehicle ? formatPrice(selectedVehicle.price) : ''}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (selectedVehicle) {
                  markAsSoldMutation.mutate(selectedVehicle.id);
                }
              }}
              disabled={markAsSoldMutation.isPending}
            >
              {markAsSoldMutation.isPending ? (
                <>
                  <Timer className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar Venda"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Removido botão flutuante */}
      
      <header className="border-b bg-gray-800 text-white sticky top-0 z-40 shadow-sm">
        <div className="container flex flex-wrap sm:flex-nowrap items-center justify-between h-auto sm:h-16 py-3 px-4">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between mb-2 sm:mb-0">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Painel do Vendedor</h1>
            </div>
            {/* Botão de logout removido pois foi movido para a barra de contato */}
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitial(currentDealer.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{currentDealer.name}</p>
                <p className="text-xs text-muted-foreground">Vendedor</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout} 
              className="hidden sm:flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </header>
      
      {/* Barra do vendedor com botão de sair */}
      <div className="lg:hidden bg-slate-800 text-white py-2 px-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-primary mr-1" />
            <span className="text-sm font-medium">Painel Vendedor: {currentDealer.name}</span>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout} 
            className="py-1 px-4 h-8 text-sm flex items-center gap-1 rounded-lg"
          >
            <LogOut className="h-4 w-4 mr-1" /> Sair
          </Button>
        </div>
      </div>
      
      <main className="flex-1 p-4 md:p-6">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">{currentDealer.sales || 0}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pontos Acumulados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">{currentDealer.points || 0}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Vendedor desde</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">
                    {new Date(currentDealer.startDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Veículos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Car className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">{availableVehicles?.length || 0}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="sales">Minhas Vendas</TabsTrigger>
              <TabsTrigger value="vehicles">Veículos Disponíveis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho de Vendas</CardTitle>
                  <CardDescription>Suas vendas nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="amount" name="Vendas" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Minhas Vendas</CardTitle>
                  <CardDescription>Histórico de vendas realizadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mySales && mySales.length > 0 ? (
                        mySales.map((sale: SaleData) => (
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
                          <TableCell colSpan={4} className="text-center py-4">
                            Você ainda não realizou nenhuma venda.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vehicles">
              <Card>
                <CardHeader>
                  <CardTitle>Veículos Disponíveis</CardTitle>
                  <CardDescription>Veículos disponíveis para venda</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Veículo</TableHead>
                        <TableHead>Detalhes</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableVehicles && availableVehicles.length > 0 ? (
                        availableVehicles.map((vehicle: any) => (
                          <TableRow key={vehicle.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 rounded-md overflow-hidden">
                                  <img
                                    src={vehicle.imageUrl}
                                    alt={vehicle.model}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <div className="font-medium">{vehicle.brand?.name} {vehicle.model}</div>
                                  <div className="text-xs text-muted-foreground">{vehicle.year}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{vehicle.color}</div>
                                <div className="text-muted-foreground">{formatMileage(vehicle.mileage)}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatPrice(vehicle.price)}</div>
                              {vehicle.originalPrice && (
                                <div className="text-xs text-muted-foreground line-through">
                                  {formatPrice(vehicle.originalPrice)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-2">
                                {/* Estado: não reservado */}
                                {!vehicle.reserved && !vehicle.sold && (
                                  <>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-2">
                                      Disponível
                                    </Badge>
                                    <div className="flex flex-wrap gap-1">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 px-2 text-xs bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                        title="Reservar por 24h"
                                        onClick={() => handleReserveClick(vehicle as Vehicle)}
                                      >
                                        <Timer className="h-3 w-3 mr-1" /> Reservar
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 px-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        title="Registrar venda deste veículo"
                                        onClick={() => handleMarkAsSoldClick(vehicle as Vehicle)}
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Vender
                                      </Button>
                                    </div>
                                  </>
                                )}
                                
                                {/* Estado: reservado por você */}
                                {vehicle.reserved && vehicle.reservedBy === currentDealer.id && (
                                  <>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mb-1">
                                      Reservado por você
                                    </Badge>
                                    <div className="text-xs flex items-center text-amber-700 mb-2">
                                      <Timer className="h-3 w-3 mr-1" /> 
                                      {formatTimeRemaining(vehicle.reservationExpiresAt)}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 px-2 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                        title="Cancelar sua reserva"
                                        onClick={() => handleCancelReservationClick(vehicle as Vehicle)}
                                      >
                                        <LockOpen className="h-3 w-3 mr-1" /> Cancelar
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 px-2 text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                        title="Registrar venda deste veículo"
                                        onClick={() => handleMarkAsSoldClick(vehicle as Vehicle)}
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Vender
                                      </Button>
                                    </div>
                                  </>
                                )}
                                
                                {/* Estado: reservado por outro vendedor */}
                                {vehicle.reserved && vehicle.reservedBy !== currentDealer.id && (
                                  <>
                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 mb-1">
                                      Reservado
                                    </Badge>
                                    <div className="text-xs flex items-center text-slate-700 mb-2">
                                      <Lock className="h-3 w-3 mr-1" /> 
                                      Outro vendedor
                                    </div>
                                  </>
                                )}
                                
                                {/* Estado: vendido */}
                                {vehicle.sold && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Vendido
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            Nenhum veículo disponível no momento.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}