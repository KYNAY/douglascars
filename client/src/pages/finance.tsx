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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Calculator, CheckCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  cpf: z.string().min(11, { message: "CPF inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  email: z.string().email({ message: "E-mail inválido" }),
  income: z.string().min(1, { message: "Renda mensal é obrigatória" }),
  vehicleValue: z.number().min(10000, { message: "Valor mínimo do veículo é R$ 10.000" }),
  downPayment: z.number().min(0, { message: "Valor da entrada não pode ser negativo" }),
  term: z.string(),
});

export default function Finance() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      email: "",
      income: "",
      vehicleValue: 50000,
      downPayment: 10000,
      term: "48",
    },
  });
  
  const vehicleValue = form.watch("vehicleValue");
  const downPayment = form.watch("downPayment");
  const term = form.watch("term");
  
  // Quando o valor do veículo mudar, não ajustamos automaticamente o valor da entrada
  // Isso mantém o valor da entrada constante quando o usuário manipula o valor do veículo
  
  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const principal = vehicleValue - downPayment;
    const interestRate = 0.0129; // 1.29% monthly
    const numberOfPayments = parseInt(term);
    
    const calculatedPayment = 
      (principal * interestRate * Math.pow(1 + interestRate, numberOfPayments)) / 
      (Math.pow(1 + interestRate, numberOfPayments) - 1);
    
    return calculatedPayment;
  };
  
  // Update monthly payment when form values change
  useState(() => {
    const payment = calculateMonthlyPayment();
    setMonthlyPayment(payment);
  });
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Calculate final payment
    const payment = calculateMonthlyPayment();
    setMonthlyPayment(payment);
    
    // Prepare data for API
    const financingRequest = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      income: values.income,
      vehicleInfo: `Veículo de R$ ${formatPrice(values.vehicleValue)} com entrada de R$ ${formatPrice(values.downPayment)}`,
      requestDate: new Date().toISOString(),
      status: 'pending',
      notes: `Simulação: ${values.term} meses, parcela de ${formatPrice(payment)}, CPF: ${values.cpf}`
    };
    
    console.log("Enviando dados:", financingRequest);
    
    // Send to API
    fetch('/api/financing-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(financingRequest),
    })
    .then(response => {
      console.log("Status da resposta:", response.status);
      if (!response.ok) {
        throw new Error('Falha ao enviar solicitação');
      }
      return response.json();
    })
    .then(data => {
      console.log("Resposta:", data);
      setIsSubmitting(false);
      toast({
        title: "Simulação enviada com sucesso!",
        description: "Em breve um de nossos consultores entrará em contato.",
      });
      
      // Reset the form fields but keep vehicle/financing values
      form.reset({
        ...form.getValues(),
        name: "",
        cpf: "",
        phone: "",
        email: "",
        income: "",
      });
    })
    .catch(error => {
      console.error('Erro ao enviar solicitação:', error);
      setIsSubmitting(false);
      toast({
        title: "Erro ao enviar simulação",
        description: "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    });
  }
  
  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-poppins font-bold mb-2">Financiamento Douglas Auto Car</h1>
          <p className="text-gray-400 mb-8">
            Facilidade e taxas especiais para financiamento do seu veículo.
          </p>
          
          {/* Simulador */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="glass-card rounded-xl p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-medium border-b border-white/10 pb-2 mb-4">Seus dados</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome completo</FormLabel>
                              <FormControl>
                                <Input placeholder="Digite seu nome" className="glass-search border-none" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input placeholder="000.000.000-00" className="glass-search border-none" {...field} />
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
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input placeholder="(00) 00000-0000" className="glass-search border-none" {...field} />
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
                                <Input placeholder="exemplo@email.com" className="glass-search border-none" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="income"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Renda mensal</FormLabel>
                              <FormControl>
                                <Input placeholder="R$ 0,00" className="glass-search border-none" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-medium border-b border-white/10 pb-2 mb-4">Dados do financiamento</h2>
                      
                      <FormField
                        control={form.control}
                        name="vehicleValue"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel>Valor do veículo</FormLabel>
                            <div className="flex items-center mb-2">
                              <DollarSign className="mr-2 h-4 w-4 text-primary" />
                              <span className="text-xl font-medium">{formatPrice(field.value)}</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={10000}
                                max={300000}
                                step={1000}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="py-4"
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>R$ 10.000</span>
                              <span>R$ 300.000</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="downPayment"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel>Valor da entrada</FormLabel>
                            <div className="flex items-center mb-2">
                              <DollarSign className="mr-2 h-4 w-4 text-primary" />
                              <span className="text-xl font-medium">{formatPrice(field.value)}</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={0}
                                max={vehicleValue * 0.9}
                                step={1000}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                className="py-4"
                              />
                            </FormControl>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>R$ 0</span>
                              <span>{formatPrice(vehicleValue * 0.9)}</span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="term"
                        render={({ field }) => (
                          <FormItem className="mb-6">
                            <FormLabel>Prazo (meses)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="glass-search border-none">
                                  <SelectValue placeholder="Selecione o prazo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="12">12 meses</SelectItem>
                                <SelectItem value="24">24 meses</SelectItem>
                                <SelectItem value="36">36 meses</SelectItem>
                                <SelectItem value="48">48 meses</SelectItem>
                                <SelectItem value="60">60 meses</SelectItem>
                                <SelectItem value="72">72 meses</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-blue-700 h-12 text-lg" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Simular Financiamento"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
            
            <div>
              <div className="glass-card rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-medium mb-4">Resumo da simulação</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Valor do veículo:</span>
                    <span className="font-medium">{formatPrice(vehicleValue)}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Valor da entrada:</span>
                    <span className="font-medium">{formatPrice(downPayment)}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Valor financiado:</span>
                    <span className="font-medium">{formatPrice(vehicleValue - downPayment)}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Prazo:</span>
                    <span className="font-medium">{term} meses</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Taxa de juros:</span>
                    <span className="font-medium">1,29% a.m.</span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400">Parcela mensal:</span>
                    <span className="text-2xl font-bold text-white">
                      {monthlyPayment ? formatPrice(monthlyPayment) : "R$ --,--"}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 bg-white/5 rounded-lg p-4">
                  <div className="flex">
                    <Calculator className="text-primary mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-300">
                        Esta é uma simulação. O valor final pode variar conforme análise de crédito e condições da financeira.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-2 mt-1 h-5 w-5" />
                    <p className="text-sm">Taxas especiais para clientes Douglas Auto Car</p>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-2 mt-1 h-5 w-5" />
                    <p className="text-sm">Aprovação facilitada e rápida</p>
                  </div>
                  
                  <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-2 mt-1 h-5 w-5" />
                    <p className="text-sm">Trabalhamos com diversas financeiras</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Financeiras parceiras */}
          <div className="mt-12 glass-card rounded-xl p-8">
            <h2 className="text-2xl font-poppins font-medium mb-6 text-center">Financeiras Parceiras</h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
              <div className="glass-card p-4 rounded-lg flex items-center justify-center">
                <img 
                  src="/assets/banks/banco-do-brasil.svg" 
                  alt="Banco do Brasil" 
                  className="h-10 filter opacity-70 hover:opacity-100 transition-opacity" 
                />
              </div>
              
              <div className="glass-card p-4 rounded-lg flex items-center justify-center">
                <img 
                  src="/assets/banks/bradesco.svg" 
                  alt="Bradesco" 
                  className="h-10 filter opacity-70 hover:opacity-100 transition-opacity" 
                />
              </div>
              
              <div className="glass-card p-4 rounded-lg flex items-center justify-center">
                <img 
                  src="/assets/banks/caixa.svg" 
                  alt="Caixa" 
                  className="h-10 filter opacity-70 hover:opacity-100 transition-opacity" 
                />
              </div>
              
              <div className="glass-card p-4 rounded-lg flex items-center justify-center">
                <img 
                  src="/assets/banks/itau.svg" 
                  alt="Itaú" 
                  className="h-10 filter opacity-70 hover:opacity-100 transition-opacity" 
                />
              </div>
              
              <div className="glass-card p-4 rounded-lg flex items-center justify-center">
                <img 
                  src="/assets/banks/santander.svg" 
                  alt="Santander" 
                  className="h-10 filter opacity-70 hover:opacity-100 transition-opacity" 
                />
              </div>
              
              <div className="glass-card p-4 rounded-lg flex items-center justify-center">
                <img 
                  src="/assets/banks/bv.svg" 
                  alt="BV Financeira" 
                  className="h-10 filter opacity-70 hover:opacity-100 transition-opacity" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}