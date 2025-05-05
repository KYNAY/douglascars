import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";

export function ServicesSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#0d1117] to-[#1f2937] relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sell Your Car */}
          <div className="glass-card rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-poppins font-bold mb-4">Venda seu Carro</h3>
              <p className="text-gray-300 mb-6">
                Solicite a avaliação do seu carro online, no conforto da sua casa.
              </p>
              <Button 
                asChild
                className="bg-primary hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                <Link href="/venda-seu-carro">
                  Avalie agora
                </Link>
              </Button>
            </div>
            <div className="absolute bottom-0 right-0 w-40 h-40 opacity-20">
              <img 
                src="https://static.autoconf.com.br/common/template-2/venda-seu-carro-2.png" 
                alt="Venda seu Carro" 
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
          
          {/* Finance */}
          <div className="glass-card rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-poppins font-bold mb-4">Financie seu sonho</h3>
              <p className="text-gray-300 mb-6">
                Trabalhamos com as principais financeiras, isso garante melhores taxas para você!
              </p>
              <Button 
                asChild
                variant="outline"
                className="bg-white/10 hover:bg-white/15 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                <Link href="/financie">
                  Faça uma simulação
                </Link>
              </Button>
            </div>
            <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10">
              <LineChart className="text-white" size={144} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
