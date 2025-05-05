import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, ArrowDown, ArrowUp, Home, User, LogOut } from "lucide-react";
import { getInitial } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { logOut } from "@/lib/firebase";

interface Dealer {
  id: number;
  name: string;
  username: string;
  startDate: string;
  points: number;
  sales: number;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("ranking");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "points",
    direction: "desc"
  });

  // Verificar autenticação
  useEffect(() => {
    // Se não estiver carregando e não estiver logado, redirecionar
    if (!loading && !currentUser) {
      navigate("/");
    }
    
    // Verificar se é um administrador (exemplo simplificado)
    // Na prática, você pode querer verificar claims ou roles no banco de dados
    if (currentUser && currentUser.email !== "caiquewm@gmail.com") {
      navigate("/");
    }
  }, [currentUser, loading, navigate]);

  // Buscar dados dos vendedores
  const { data: dealers, isLoading } = useQuery<Dealer[]>({
    queryKey: ['/api/dealers/ranking'],
    enabled: !!currentUser // Só buscar se estiver autenticado
  });

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

  const handleLogout = async () => {
    await logOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar logado para acessar esta área.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Voltar para Home</Button>
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
                  {currentUser.email ? getInitial(currentUser.email) : "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Bem-vindo, Administrador</CardTitle>
                <CardDescription>{currentUser.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="ranking">Ranking de Vendedores</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Vendedores</CardTitle>
              <CardDescription>
                Vendedores ordenados por pontuação e número de vendas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
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
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Vendas</CardTitle>
              <CardDescription>
                Registro de vendas realizadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white/10 p-8 rounded text-center">
                <p className="text-gray-500">Funcionalidade em desenvolvimento.</p>
                <Button variant="default" className="mt-4">
                  Ver vendas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}