import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithGoogle, loginWithEmailPassword } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";
import { Loader2, Info, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("caiquewm@gmail.com");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Se estiver logado, redirecionar para o dashboard
    if (!loading && currentUser) {
      navigate("/admin");
    }
  }, [currentUser, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setLoginError("");
      await signInWithGoogle(true); // Use popup for better UX
    } catch (error) {
      console.error("Sign in error:", error);
      setLoginError("Erro ao fazer login com Google. Tente outro método.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setLoginError("");
      await loginWithEmailPassword(email, password);
      // Se logar com sucesso, o useEffect redirecionará para o dashboard
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === "auth/invalid-credential") {
        setLoginError("Email ou senha incorretos");
      } else if (error.code === "auth/invalid-email") {
        setLoginError("Formato de email inválido");
      } else if (error.code === "auth/too-many-requests") {
        setLoginError("Muitas tentativas de login. Tente novamente mais tarde.");
      } else {
        setLoginError("Erro ao fazer login. Por favor, tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

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

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email e Senha</TabsTrigger>
              <TabsTrigger value="google">Google</TabsTrigger>
            </TabsList>

            {/* Email/Password Login Tab */}
            <TabsContent value="email">
              <div className="space-y-4 pt-4">
                <Alert className="bg-blue-500/10 border-blue-500/50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Email padrão: <strong>caiquewm@gmail.com</strong><br />
                    Senha padrão: <strong>102030</strong>
                  </AlertDescription>
                </Alert>

                <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
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
            </TabsContent>

            {/* Google Login Tab */}
            <TabsContent value="google">
              <div className="space-y-4 pt-4">
                <Alert className="bg-blue-500/10 border-blue-500/50">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Este botão permite fazer login com o email <strong>caiquewm@gmail.com</strong> para acessar o painel administrativo.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-white text-primary hover:bg-white/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <FaGoogle className="mr-2 h-4 w-4" />
                      Entrar com Google
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-white/10 p-4 rounded-lg text-sm mt-4">
            <h3 className="font-medium mb-2">Como acessar:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>Use o email: <strong>caiquewm@gmail.com</strong></li>
              <li>Apenas administradores podem acessar o painel</li>
              <li>Se tiver problemas, tente o método alternativo de login</li>
            </ul>
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