import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AlertCircle } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Nome de usuário é obrigatório"),
  password: z.string().min(3, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function DealerLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [_, setLocation] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await apiRequest('/api/auth/dealer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Salvar os dados do vendedor e token no localStorage
        localStorage.setItem('dealer_authenticated', 'true');
        localStorage.setItem('dealer_token', result.token);
        localStorage.setItem('dealer_data', JSON.stringify(result.dealer));
        localStorage.setItem('dealer_login_time', new Date().toString());
        
        // Redirecionar para o dashboard do vendedor
        setLocation("/vendedor/dashboard");
      } else {
        setLoginError(result.error || "Falha ao fazer login. Verifique suas credenciais.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Erro ao tentar conectar com o servidor. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <Card className="w-full max-w-md border border-gray-800 bg-gray-900/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-2 pb-6 pt-8">
            <CardTitle className="text-2xl md:text-3xl font-bold text-center text-white">Área do Vendedor</CardTitle>
            <CardDescription className="text-center text-gray-300">
              Entre com suas credenciais para acessar o painel de vendedor
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 md:px-8">
            {loginError && (
              <Alert variant="destructive" className="mb-6 bg-red-900/60 border border-red-500 text-white">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{loginError}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-gray-200 text-sm font-medium">Nome de Usuário ou Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu nome de usuário ou email" 
                          className="bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-gray-200 text-sm font-medium">Senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Sua senha" 
                          className="bg-gray-800/70 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base transition-colors mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center pb-8 pt-3">
            <p className="text-sm text-gray-400">
              Em caso de problemas no acesso, contate o administrador.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}