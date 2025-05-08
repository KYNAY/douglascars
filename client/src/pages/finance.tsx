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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Relaxamos algumas validações para facilitar os testes
const formSchema = z.object({
  // Dados do Veículo
  marca: z.string().min(1, { message: "Marca é obrigatória" }),
  modelo: z.string().min(1, { message: "Modelo é obrigatório" }),
  ano: z.string().min(1, { message: "Ano é obrigatório" }),
  valor: z.number().min(10000, { message: "Valor mínimo do veículo é R$ 10.000" }),
  entrada: z.number().min(0, { message: "Valor da entrada não pode ser negativo" }),
  parcelas: z.string().min(1, { message: "Número de parcelas é obrigatório" }),
  
  // Dados Pessoais
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  data_nascimento: z.string().optional(),
  nome_mae: z.string().optional(),
  nome_pai: z.string().optional(),
  estado_civil: z.string().optional(),
  email: z.string().email({ message: "E-mail inválido" }),
  telefone: z.string().optional(),
  celular: z.string().min(8, { message: "Celular inválido" }),
  
  // Renda
  renda: z.string().min(1, { message: "Renda mensal é obrigatória" }),
  
  // Informações Adicionais
  info_adicional: z.string().optional(),
});

export default function Finance() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marca: "",
      modelo: "",
      ano: "",
      valor: 50000,
      entrada: 10000,
      parcelas: "48",
      nome: "",
      cpf: "",
      rg: "",
      data_nascimento: "",
      nome_mae: "",
      nome_pai: "",
      estado_civil: "",
      email: "",
      telefone: "",
      celular: "",
      renda: "",
      info_adicional: "",
    },
  });
  
  // Dados do veículo
  const valor = form.watch("valor");
  const entrada = form.watch("entrada");
  const parcelas = form.watch("parcelas");
  
  // Calculadora de parcelas
  const calculateMonthlyPayment = () => {
    const valorFinanciado = valor - entrada;
    const taxaJuros = 0.0129; // 1.29% mensal
    const numeroParcelas = parseInt(parcelas || "48");
    
    if (valorFinanciado <= 0 || numeroParcelas <= 0) {
      return 0;
    }
    
    const calculatedPayment = 
      (valorFinanciado * taxaJuros * Math.pow(1 + taxaJuros, numeroParcelas)) / 
      (Math.pow(1 + taxaJuros, numeroParcelas) - 1);
    
    return isNaN(calculatedPayment) ? 0 : calculatedPayment;
  };
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Exibir erros do formulário se houver
    if (Object.keys(form.formState.errors).length > 0) {
      console.error("Erros no formulário:", form.formState.errors);
      toast({
        title: "Erro ao preencher formulário",
        description: "Verifique se todos os campos obrigatórios estão preenchidos corretamente.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Calcular o pagamento final
    const payment = calculateMonthlyPayment();
    
    // Preparar informações do veículo em formato estruturado
    const vehicleDetails = {
      marca: values.marca,
      modelo: values.modelo,
      ano: values.ano,
      valor: values.valor,
      entrada: values.entrada,
      parcelas: values.parcelas,
      valorParcela: payment,
    };
    
    // Preparar dados finais para API (seguindo o formato esperado pelo backend)
    const financingRequest = {
      name: values.nome,
      email: values.email,
      phone: values.celular || values.telefone,
      vehicleInfo: JSON.stringify(vehicleDetails),
      income: values.renda,
      notes: JSON.stringify({
        cpf: values.cpf,
        rg: values.rg,
        observacoes: values.info_adicional
      })
    };
    
    console.log("Enviando dados:", financingRequest);
    
    // Enviar para API
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
      
      // Resetar o formulário mantendo os valores do veículo
      form.reset({
        ...form.getValues(),
        nome: "",
        cpf: "",
        rg: "",
        data_nascimento: "",
        nome_mae: "",
        nome_pai: "",
        estado_civil: "",
        email: "",
        telefone: "",
        celular: "",
        renda: "",
        info_adicional: "",
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-poppins font-bold mb-2">Financiamento Douglas Auto Car</h1>
          <p className="text-gray-400 mb-8">
            Facilidade e taxas especiais para financiamento do seu veículo.
          </p>
          
          <div className="glass-card rounded-xl p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Seção 1: Dados do Veículo */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b border-white/10 pb-2">Dados do Veículo</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="marca"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <FormControl>
                            <Input placeholder="Marca do veículo" className="glass-search border-none" {...field} />
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
                            <Input placeholder="Modelo do veículo" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ano"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ano</FormLabel>
                          <FormControl>
                            <Input placeholder="Ano do veículo" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="valor"
                      render={({ field }) => (
                        <FormItem>
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
                      name="entrada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor da entrada</FormLabel>
                          <div className="flex items-center mb-2">
                            <DollarSign className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-xl font-medium">{formatPrice(field.value)}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={valor * 0.9}
                              step={1000}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>R$ 0</span>
                            <span>{formatPrice(valor * 0.9)}</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="parcelas"
                      render={({ field }) => (
                        <FormItem>
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
                </div>
                
                {/* Seção 2: Dados Pessoais */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b border-white/10 pb-2">Dados Pessoais</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="nome"
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="exemplo@email.com" className="glass-search border-none" {...field} />
                          </FormControl>
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
                          <FormControl>
                            <Input placeholder="(00) 00000-0000" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="renda"
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
                
                {/* Informações adicionais */}
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="info_adicional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Informações adicionais (opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Caso tenha informações adicionais que possam auxiliar na análise de crédito"
                            className="glass-search border-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Botão de envio */}
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-blue-700 h-12 text-lg" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Solicitar Financiamento"}
                </Button>
                
                {/* Logos dos bancos */}
                <div className="mt-8">
                  <h3 className="text-center text-xl font-medium mb-6">Trabalhamos com as seguintes financeiras:</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
                    <div className="flex justify-center">
                      <img src="/banks/santander.png" alt="Santander" className="h-10 object-contain" />
                    </div>
                    <div className="flex justify-center">
                      <img src="/banks/itau.png" alt="Itaú" className="h-10 object-contain" />
                    </div>
                    <div className="flex justify-center">
                      <img src="/banks/bv-financeira.png" alt="BV Financeira" className="h-10 object-contain" />
                    </div>
                    <div className="flex justify-center">
                      <img src="/banks/banco-pan.png" alt="Banco Pan" className="h-10 object-contain" />
                    </div>
                    <div className="flex justify-center">
                      <img src="/banks/bradesco.png" alt="Bradesco" className="h-10 object-contain" />
                    </div>
                    <div className="flex justify-center">
                      <img src="/banks/safra.png" alt="Safra Financeira" className="h-10 object-contain" />
                    </div>
                    <div className="flex justify-center">
                      <img src="/banks/porto-seguro.png" alt="Porto Seguro" className="h-10 object-contain" />
                    </div>
                    <div className="flex justify-center">
                      <img src="/banks/omni.png" alt="Omni" className="h-10 object-contain" />
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
