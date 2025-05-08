import { useState, useEffect } from "react";
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
import { DollarSign, Calculator, CheckCircle, CircleDollarSign } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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
  cpf: z.string().min(11, { message: "CPF inválido" }),
  rg: z.string().min(1, { message: "RG é obrigatório" }),
  data_nascimento: z.string().min(1, { message: "Data de nascimento é obrigatória" }),
  nome_mae: z.string().min(2, { message: "Nome da mãe é obrigatório" }),
  nome_pai: z.string().optional(),
  estado_civil: z.string().min(1, { message: "Estado civil é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  telefone: z.string().min(10, { message: "Telefone inválido" }),
  celular: z.string().min(10, { message: "Celular inválido" }),
  
  // Endereço
  endereco: z.string().min(2, { message: "Endereço é obrigatório" }),
  numero: z.string().min(1, { message: "Número é obrigatório" }),
  complemento: z.string().optional(),
  cep: z.string().min(8, { message: "CEP inválido" }),
  bairro: z.string().min(2, { message: "Bairro é obrigatório" }),
  cidade: z.string().min(2, { message: "Cidade é obrigatória" }),
  estado: z.string().min(2, { message: "Estado é obrigatório" }),
  tempo_residencia: z.string().min(1, { message: "Tempo de residência é obrigatório" }),
  
  // Dados Profissionais
  empresa: z.string().min(2, { message: "Nome da empresa é obrigatório" }),
  cargo: z.string().min(1, { message: "Cargo é obrigatório" }),
  renda: z.string().min(1, { message: "Renda mensal é obrigatória" }),
  endereco_empresa: z.string().min(2, { message: "Endereço da empresa é obrigatório" }),
  complemento_empresa: z.string().optional(),
  cep_empresa: z.string().min(8, { message: "CEP é obrigatório" }),
  bairro_empresa: z.string().min(2, { message: "Bairro é obrigatório" }),
  cidade_empresa: z.string().min(2, { message: "Cidade é obrigatória" }),
  estado_empresa: z.string().min(2, { message: "Estado é obrigatório" }),
  telefone_empresa: z.string().min(10, { message: "Telefone é obrigatório" }),
  tempo_empresa: z.string().min(1, { message: "Tempo na empresa é obrigatório" }),
  
  // Referência Bancária
  banco: z.string().min(1, { message: "Banco é obrigatório" }),
  agencia: z.string().min(1, { message: "Agência é obrigatória" }),
  conta: z.string().min(1, { message: "Conta é obrigatória" }),
  tempo_conta: z.string().min(1, { message: "Tempo de conta é obrigatório" }),
  
  // Referência Pessoal
  referencia_nome1: z.string().min(2, { message: "Nome da referência é obrigatório" }),
  referencia_telefone1: z.string().min(10, { message: "Telefone da referência é obrigatório" }),
  referencia_nome2: z.string().min(2, { message: "Nome da referência é obrigatório" }),
  referencia_telefone2: z.string().min(10, { message: "Telefone da referência é obrigatório" }),
  
  // Informações Adicionais
  info_adicional: z.string().optional(),
});

export default function Finance() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Dados do Veículo
      marca: "",
      modelo: "",
      ano: "",
      valor: 50000,
      entrada: 10000,
      parcelas: "48",
      
      // Dados Pessoais
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
      
      // Endereço
      endereco: "",
      numero: "",
      complemento: "",
      cep: "",
      bairro: "",
      cidade: "",
      estado: "",
      tempo_residencia: "",
      
      // Dados Profissionais
      empresa: "",
      cargo: "",
      renda: "",
      endereco_empresa: "",
      complemento_empresa: "",
      cep_empresa: "",
      bairro_empresa: "",
      cidade_empresa: "",
      estado_empresa: "",
      telefone_empresa: "",
      tempo_empresa: "",
      
      // Referência Bancária
      banco: "",
      agencia: "",
      conta: "",
      tempo_conta: "",
      
      // Referência Pessoal
      referencia_nome1: "",
      referencia_telefone1: "",
      referencia_nome2: "",
      referencia_telefone2: "",
      
      // Informações Adicionais
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
    setIsSubmitting(true);
    
    // Calcular o pagamento final
    const payment = calculateMonthlyPayment();
    
    // Preparar informações do veículo em formato estruturado para armazenar no campo vehicleInfo
    const vehicleDetails = {
      marca: values.marca,
      modelo: values.modelo,
      ano: values.ano,
      valor: values.valor,
      entrada: values.entrada,
      parcelas: values.parcelas,
      valorParcela: payment,
    };
    
    // Preparar informações pessoais e de contato
    const personalDetails = {
      cpf: values.cpf,
      rg: values.rg,
      dataNascimento: values.data_nascimento,
      estadoCivil: values.estado_civil,
      nomeMae: values.nome_mae,
      nomePai: values.nome_pai,
      endereco: {
        logradouro: values.endereco,
        numero: values.numero,
        complemento: values.complemento,
        bairro: values.bairro,
        cidade: values.cidade,
        estado: values.estado,
        cep: values.cep,
        tempoResidencia: values.tempo_residencia
      },
      emprego: {
        empresa: values.empresa,
        cargo: values.cargo,
        endereco: values.endereco_empresa,
        telefone: values.telefone_empresa,
        tempo: values.tempo_empresa
      },
      banco: {
        nome: values.banco,
        agencia: values.agencia,
        conta: values.conta,
        tempoConta: values.tempo_conta
      },
      referencias: {
        referencia1: {
          nome: values.referencia_nome1,
          telefone: values.referencia_telefone1
        },
        referencia2: {
          nome: values.referencia_nome2,
          telefone: values.referencia_telefone2
        }
      },
      observacoes: values.info_adicional
    };
    
    // Preparar dados finais para API (seguindo o formato esperado pelo backend)
    const financingRequest = {
      name: values.nome,
      email: values.email,
      phone: values.celular || values.telefone, // Usar celular se disponível, senão o telefone fixo
      vehicleInfo: JSON.stringify(vehicleDetails), // Campo vehicleInfo armazena informações do veículo
      income: values.renda, // Campo income armazena a renda do solicitante
      notes: JSON.stringify(personalDetails) // Campo notes armazena detalhes adicionais
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
        // Limpar apenas os dados pessoais
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
        
        // Limpar endereço
        endereco: "",
        numero: "",
        complemento: "",
        cep: "",
        bairro: "",
        cidade: "",
        estado: "",
        tempo_residencia: "",
        
        // Limpar dados profissionais
        empresa: "",
        cargo: "",
        renda: "",
        endereco_empresa: "",
        complemento_empresa: "",
        cep_empresa: "",
        bairro_empresa: "",
        cidade_empresa: "",
        estado_empresa: "",
        telefone_empresa: "",
        tempo_empresa: "",
        
        // Limpar dados bancários
        banco: "",
        agencia: "",
        conta: "",
        tempo_conta: "",
        
        // Limpar referências
        referencia_nome1: "",
        referencia_telefone1: "",
        referencia_nome2: "",
        referencia_telefone2: "",
        
        // Limpar informações adicionais
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
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder="00.000.000-0" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nome_mae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da mãe</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo da mãe" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nome_pai"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do pai</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do pai (opcional)" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="estado_civil"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Civil</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-search border-none">
                                <SelectValue placeholder="Selecione seu estado civil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                              <SelectItem value="casado">Casado(a)</SelectItem>
                              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                              <SelectItem value="separado">Separado(a)</SelectItem>
                            </SelectContent>
                          </Select>
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
                  </div>
                </div>
                
                {/* Seção 3: Endereço */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b border-white/10 pb-2">Endereço</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    <div className="md:col-span-4">
                      <FormField
                        control={form.control}
                        name="endereco"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da rua, avenida, etc" className="glass-search border-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <FormField
                        control={form.control}
                        name="numero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="Nº" className="glass-search border-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <FormField
                        control={form.control}
                        name="complemento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input placeholder="Apto, bloco, etc" className="glass-search border-none" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input placeholder="00000-000" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tempo_residencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempo de residência</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 5 anos" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Estado" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Seção 4: Dados Profissionais */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b border-white/10 pb-2">Dados Profissionais</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Empresa onde trabalha" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cargo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu cargo ou função" className="glass-search border-none" {...field} />
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="endereco_empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço da empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Endereço da empresa" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="telefone_empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone da empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="(00) 0000-0000" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tempo_empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tempo na empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 3 anos" className="glass-search border-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Seção 5: Referências */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b border-white/10 pb-2">Referências</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-base font-medium mb-4">Referência Bancária</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="banco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Banco</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do banco" className="glass-search border-none" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="agencia"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Agência</FormLabel>
                                <FormControl>
                                  <Input placeholder="Agência" className="glass-search border-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="conta"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Conta</FormLabel>
                                <FormControl>
                                  <Input placeholder="Conta" className="glass-search border-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="tempo_conta"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tempo de conta</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: 2 anos" className="glass-search border-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-4">Referências Pessoais</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="referencia_nome1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome da 1ª referência</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome completo" className="glass-search border-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="referencia_telefone1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone da 1ª referência</FormLabel>
                                <FormControl>
                                  <Input placeholder="(00) 00000-0000" className="glass-search border-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="referencia_nome2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome da 2ª referência</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome completo" className="glass-search border-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="referencia_telefone2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone da 2ª referência</FormLabel>
                                <FormControl>
                                  <Input placeholder="(00) 00000-0000" className="glass-search border-none" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
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