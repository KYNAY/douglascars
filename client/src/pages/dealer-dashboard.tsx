import { useEffect, useState } from "react";
import { useNavigate } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getInitial, formatPrice, formatMileage } from "@/lib/utils";
import { LogOut, Cars, DollarSign, Award, Clock, Image, ShoppingCart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

export default function DealerDashboard() {
  const [currentDealer, setCurrentDealer] = useState<DealerData | null>(null);
  const navigate = useNavigate();

  // Carregar dados do vendedor do localStorage quando a página carrega
  useEffect(() => {
    // Verificar se o vendedor está autenticado
    const isAuth = localStorage.getItem("dealer_authenticated");
    const dealerData = localStorage.getItem("dealer_data");
    
    if (!isAuth || !dealerData) {
      // Redirecionar para a página de login se não estiver autenticado
      navigate("/dealer-login");
      return;
    }
    
    try {
      const dealer = JSON.parse(dealerData);
      setCurrentDealer(dealer);
    } catch (error) {
      console.error("Error parsing dealer data:", error);
      // Se houver erro, redirecionar para login
      navigate("/dealer-login");
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
  }, [navigate]);

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

  // Dados para o gráfico de vendas por mês
  const getChartData = () => {
    if (!mySales || !mySales.length) {
      return [
        { name: 'Jan', amount: 0 },
        { name: 'Fev', amount: 0 },
        { name: 'Mar', amount: 0 },
        { name: 'Abr', amount: 0 },
        { name: 'Mai', amount: 0 },
        { name: 'Jun', amount: 0 },
      ];
    }

    // Em uma implementação real, você agruparia as vendas por mês
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    // Pegar os últimos 6 meses
    const sixMonths = [];
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

  const handleLogout = () => {
    localStorage.removeItem("dealer_authenticated");
    localStorage.removeItem("dealer_token");
    localStorage.removeItem("dealer_data");
    localStorage.removeItem("dealer_login_time");
    navigate("/dealer-login");
  };

  // Se não tiver dados do vendedor, mostrar carregando
  if (!currentDealer) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Painel do Vendedor</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitial(currentDealer.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{currentDealer.name}</p>
                <p className="text-xs text-muted-foreground">Vendedor</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
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
                <CardTitle className="text-sm font-medium">Data de Início</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">{currentDealer.startDate}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Veículos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Cars className="mr-2 h-4 w-4 text-muted-foreground" />
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
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Disponível
                              </Badge>
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