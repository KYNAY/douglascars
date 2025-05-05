import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";
import { Loader2, AlertCircle } from "lucide-react";

// Credenciais de acesso fixas
const ADMIN_EMAIL = "caiquewm@gmail.com";
const ADMIN_PASSWORD = "102030";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Verificar se já está logado
    const isLoggedIn = localStorage.getItem("admin_authenticated") === "true";
    if (isLoggedIn) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setLoginError("");
      
      // Verificar as credenciais
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Login bem-sucedido - salvar no localStorage
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem("admin_email", email);
        localStorage.setItem("admin_login_time", new Date().toISOString());
        
        // Redirecionar para o dashboard
        navigate("/admin");
      } else {
        setLoginError("Email ou senha incorretos");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Erro ao fazer login. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-20 max-w-md">
      <Card className="glass-card border-white/10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Área Administrativa</CardTitle>
          <CardDescription>
            Faça login para acessar o painel administrativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Mensagem de erro */}
          {loginError && (
            <Alert className="bg-red-500/10 border-red-500/50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-sm text-red-500">{loginError}</AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            <div className="glass-card rounded-lg p-4 mb-6 bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="text-blue-400 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-400 mb-1">Acesso Seguro</h3>
                  <p className="text-sm text-gray-300">
                    Esta área é restrita aos administradores da Douglas Auto Car.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-red-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </div>
          
          <div className="text-center text-sm mt-4">
            <Button 
              variant="link" 
              onClick={() => navigate("/")}
              className="text-primary p-0 h-auto"
            >
              Voltar para o site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}