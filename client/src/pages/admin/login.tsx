import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { FaGoogle } from "react-icons/fa";
import { Loader2, Info } from "lucide-react";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const { currentUser, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Se estiver logado, redirecionar para o dashboard
    if (!loading && currentUser) {
      navigate("/admin");
    }
  }, [currentUser, loading, navigate]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle(true); // Use popup for better UX
    } catch (error) {
      console.error("Sign in error:", error);
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
          <Alert className="bg-blue-500/10 border-blue-500/50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Este botão permite fazer login com o email <strong>caiquewm@gmail.com</strong> para acessar o painel administrativo.
            </AlertDescription>
          </Alert>
          
          <div className="text-center py-4">
            <Button
              onClick={handleSignIn}
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
          
          <div className="bg-white/10 p-4 rounded-lg text-sm">
            <h3 className="font-medium mb-2">Como funciona:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              <li>O botão abrirá uma janela do Google para autenticação</li>
              <li>Use a conta <strong>caiquewm@gmail.com</strong> para fazer login</li>
              <li>Apenas administradores podem acessar o painel</li>
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