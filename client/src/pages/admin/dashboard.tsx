import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, ArrowDown, ArrowUp, Home, LogOut } from "lucide-react";
import { getInitial } from "@/lib/utils";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ranking");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "points",
    direction: "desc"
  });

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
  const { data: dealers, isLoading } = useQuery<Dealer[]>({
    queryKey: ['/api/dealers/ranking'],
    enabled: isAuthenticated // Só buscar se estiver autenticado
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
        <TabsList>
          <TabsTrigger value="ranking">Ranking de Vendedores</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
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