import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FaCar, FaUserAlt, FaPhoneAlt, FaEnvelope, FaWhatsapp } from "react-icons/fa";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  carModel: z.string().min(2, { message: "Modelo do carro é obrigatório" }),
  carYear: z.string().regex(/^\d{4}$/, { message: "Ano deve estar no formato YYYY" }),
  carColor: z.string().min(2, { message: "Cor do carro é obrigatória" }),
  mileage: z.string().min(1, { message: "Quilometragem é obrigatória" }),
  message: z.string().optional(),
});

export default function SellYourCar() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      carModel: "",
      carYear: "",
      carColor: "",
      mileage: "",
      message: "",
    },
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Solicitação enviada com sucesso!",
        description: "Em breve entraremos em contato para avaliar seu veículo.",
      });
      form.reset();
    }, 1500);
  }
  
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-poppins font-bold mb-2">Venda seu Carro</h1>
          <p className="text-gray-400 mb-8">
            Preencha o formulário abaixo para solicitar uma avaliação do seu veículo.
            Nossa equipe entrará em contato para agendar uma visita.
          </p>
          
          <div className="glass-card rounded-xl p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium flex items-center">
                      <FaUserAlt className="mr-2 text-primary" /> Seus dados
                    </h2>
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite seu nome" 
                              className="glass-search border-none" 
                              {...field} 
                            />
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
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite seu e-mail" 
                              className="glass-search border-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone/WhatsApp</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(00) 00000-0000" 
                              className="glass-search border-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Car Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium flex items-center">
                      <FaCar className="mr-2 text-primary" /> Informações do veículo
                    </h2>
                    
                    <FormField
                      control={form.control}
                      name="carModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca e Modelo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Fiat Pulse" 
                              className="glass-search border-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="carYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ano</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: 2022" 
                                className="glass-search border-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="carColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Preto" 
                                className="glass-search border-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quilometragem</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: 45000" 
                              className="glass-search border-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informações adicionais (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Informações adicionais sobre o veículo..." 
                          className="glass-search border-none min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" className="bg-primary hover:bg-red-700" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Solicitar avaliação"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="bg-green-600 hover:bg-green-700 border-green-600"
                    asChild
                  >
                    <a 
                      href="https://wa.me/5533991990303?text=Olá, gostaria de vender meu carro para a Douglas Auto Car. Podemos conversar?" 
                      className="flex items-center justify-center"
                    >
                      <FaWhatsapp className="mr-2" /> Contato direto via WhatsApp
                    </a>
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          <div className="mt-8 glass-card rounded-xl p-6">
            <h2 className="text-xl font-medium mb-4">Contato Direto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="tel:(33)3241-1507" 
                className="glass-card p-4 rounded-lg flex items-center hover:bg-white/10 transition-colors"
              >
                <FaPhoneAlt className="text-primary mr-3 text-lg" />
                <span>(33) 3241-1507</span>
              </a>
              
              <a 
                href="https://wa.me/5533991990303" 
                className="glass-card p-4 rounded-lg flex items-center hover:bg-white/10 transition-colors"
              >
                <FaWhatsapp className="text-green-500 mr-3 text-lg" />
                <span>(33) 99199-0303</span>
              </a>
              
              <a 
                href="mailto:contato@douglasautocar.com.br" 
                className="glass-card p-4 rounded-lg flex items-center hover:bg-white/10 transition-colors"
              >
                <FaEnvelope className="text-primary mr-3 text-lg" />
                <span>contato@douglasautocar.com.br</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
