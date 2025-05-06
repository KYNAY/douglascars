import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaFacebook, FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  // Dados do Veículo
  marca: z.string().min(1, "Campo obrigatório"),
  modelo: z.string().min(1, "Campo obrigatório"),
  anoModelo: z.string().min(1, "Campo obrigatório"),
  cor: z.string().min(1, "Campo obrigatório"),
  combustivel: z.string().min(1, "Campo obrigatório"),
  
  // Dados Pessoais
  nome: z.string().min(1, "Campo obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Número inválido"),
  celular: z.string().min(10, "Número inválido"),
  
  // Informações Adicionais
  informacoesAdicionais: z.string().optional(),
  
  // Termos
  aceitaTermos: z.boolean().refine(val => val === true, {
    message: "Você precisa aceitar os termos de privacidade"
  }),
});

export default function Avaliacao() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marca: "",
      modelo: "",
      anoModelo: "",
      cor: "",
      combustivel: "",
      nome: "",
      email: "",
      telefone: "",
      celular: "",
      informacoesAdicionais: "",
      aceitaTermos: false,
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Prepare data for API
    const evaluationRequest = {
      name: values.nome,
      email: values.email,
      phone: values.telefone,
      vehicleInfo: `${values.marca} ${values.modelo} ${values.anoModelo}, ${values.cor}, ${values.combustivel}`,
      requestDate: new Date().toISOString(),
      status: 'pending',
      notes: values.informacoesAdicionais || null,
    };
    
    console.log("Enviando dados de avaliação:", evaluationRequest);
    
    // Send to API
    try {
      const response = await fetch('/api/evaluation-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evaluationRequest),
      });
      
      console.log("Status da resposta:", response.status);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error("Texto de erro:", responseText);
        throw new Error('Falha ao enviar solicitação');
      }
      
      const data = await response.json();
      console.log("Resposta do servidor:", data);
      
      // Mostrar toast de sucesso
      toast({
        title: "Solicitação enviada!",
        description: "Entraremos em contato o mais breve possível.",
      });
      
      // Limpar formulário
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      toast({
        title: "Erro ao enviar solicitação",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-poppins font-bold mb-4 text-white">AVALIE O SEU VEÍCULO COM A GENTE.</h1>
        <p className="text-lg mb-8 text-gray-300">
          Preencha o formulário abaixo e tenha a melhor avaliação do mercado para seu veículo.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Dados do Veículo */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Dados do Veículo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex. Volkswagen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex. Golf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="anoModelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano/Modelo</FormLabel>
                      <div className="flex">
                        <Input placeholder="Fab" className="w-16 mr-2" {...field} />
                        <span className="flex items-center">/</span>
                        <Input placeholder="Mod" className="w-16 ml-2" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex. Preto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="combustivel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Combustível</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="flex">Flex</SelectItem>
                          <SelectItem value="gasolina">Gasolina</SelectItem>
                          <SelectItem value="etanol">Etanol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="eletrico">Elétrico</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Dados Pessoais */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <div className="flex">
                        <Input placeholder="DDD" className="w-16 mr-2" />
                        <Input placeholder="Telefone" className="flex-1" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <div className="flex">
                        <Input placeholder="DDD" className="w-16 mr-2" />
                        <Input placeholder="Seu celular" className="flex-1" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Informações Adicionais */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Informações Adicionais</h2>
              <FormField
                control={form.control}
                name="informacoesAdicionais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informações Adicionais</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva outras informações relevantes sobre o veículo" 
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Termos */}
            <div className="flex items-start space-x-2">
              <FormField
                control={form.control}
                name="aceitaTermos"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Li e concordo com a <a href="#" className="text-primary underline">política de privacidade</a>.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" className="bg-primary hover:bg-blue-800">
              Enviar avaliação
            </Button>
          </form>
        </Form>
        
        {/* Social Media */}
        <div className="fixed right-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2 p-2">
          <a 
            href="https://www.facebook.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-[#3b5998] p-3 rounded-l-md hover:scale-110 transition-transform"
          >
            <FaFacebook size={20} />
          </a>
          <a 
            href="https://wa.me/5528999339129" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-[#25D366] p-3 rounded-l-md hover:scale-110 transition-transform"
          >
            <FaWhatsapp size={20} />
          </a>
          <a 
            href="https://www.instagram.com/douglas.autocar/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] p-3 rounded-l-md hover:scale-110 transition-transform"
          >
            <FaInstagram size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}