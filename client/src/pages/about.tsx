import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaHandshake, FaCarAlt, FaCheckCircle } from "react-icons/fa";

export default function About() {
  const milestones = [
    {
      year: "2009",
      title: "Fundação",
      description: "A Douglas Auto Car foi fundada em Governador Valadares, inicialmente como uma pequena loja de veículos usados."
    },
    {
      year: "2012",
      title: "Expansão",
      description: "Inauguração da sede atual com um showroom maior e estrutura moderna para melhor atender os clientes."
    },
    {
      year: "2015",
      title: "Reconhecimento",
      description: "Premiada como uma das melhores revendas de veículos da região, pelo compromisso com a qualidade e atendimento."
    },
    {
      year: "2018",
      title: "Inovação",
      description: "Implementação de sistema digital de gestão de vendas e atendimento personalizado ao cliente."
    },
    {
      year: "2023",
      title: "Modernização",
      description: "Renovação completa da identidade visual e processos, consolidando a empresa como referência no mercado automotivo regional."
    }
  ];
  
  const values = [
    {
      icon: <FaHandshake className="h-8 w-8 text-primary" />,
      title: "Transparência",
      description: "Compromisso com a clareza em todas as negociações, prezando pela confiança e respeito aos clientes."
    },
    {
      icon: <FaCheckCircle className="h-8 w-8 text-primary" />,
      title: "Qualidade",
      description: "Todos os veículos passam por rigorosa inspeção técnica antes de serem disponibilizados para venda."
    },
    {
      icon: <FaUsers className="h-8 w-8 text-primary" />,
      title: "Atendimento",
      description: "Equipe treinada para oferecer o melhor atendimento, compreendendo as necessidades de cada cliente."
    },
    {
      icon: <FaCarAlt className="h-8 w-8 text-primary" />,
      title: "Variedade",
      description: "Amplo estoque com diversas marcas e modelos para atender diferentes perfis e orçamentos."
    }
  ];
  
  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-poppins font-bold mb-2">Sobre a Douglas Auto Car</h1>
          <p className="text-gray-400 mb-8">
            Conheça nossa história, valores e o que nos torna referência na venda de veículos na região.
          </p>
          
          {/* Hero section */}
          <div className="glass-card rounded-xl overflow-hidden mb-12">
            <div className="relative h-64 md:h-80">
              <img 
                src="https://images.unsplash.com/photo-1562141657-49917864adac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="Douglas Auto Car" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/90 to-transparent flex items-center">
                <div className="p-8">
                  <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-4">
                    Tradição e Qualidade desde 2009
                  </h2>
                  <p className="text-gray-200 max-w-md">
                    Há mais de 14 anos oferecendo as melhores opções em veículos seminovos e usados com procedência garantida.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Introduction */}
          <div className="glass-card rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-poppins font-semibold mb-6">Nossa História</h2>
            <p className="text-gray-300 mb-6">
              A Douglas Auto Car nasceu do sonho e determinação de seu fundador, Douglas Mendes, que sempre foi apaixonado por automóveis. Em 2009, com um pequeno lote de carros e muita dedicação, iniciou suas atividades em Governador Valadares.
            </p>
            <p className="text-gray-300 mb-6">
              O que começou como um pequeno negócio familiar, cresceu e se consolidou como uma das principais revendas de veículos da região. A confiança dos clientes foi conquistada através de negociações transparentes, veículos de qualidade e um atendimento diferenciado.
            </p>
            <p className="text-gray-300">
              Hoje, contamos com uma equipe qualificada, estrutura moderna e processos eficientes para proporcionar a melhor experiência de compra e venda de veículos. Nossa missão é transformar o sonho do carro próprio em realidade, oferecendo opções que se encaixam perfeitamente nas necessidades e no orçamento de cada cliente.
            </p>
          </div>
          
          {/* Values */}
          <h2 className="text-2xl font-poppins font-semibold mb-6">Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {values.map((value, index) => (
              <div key={index} className="glass-card rounded-xl p-6 flex">
                <div className="mr-4 mt-1">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-xl font-poppins font-medium mb-2">{value.title}</h3>
                  <p className="text-gray-300">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Timeline */}
          <h2 className="text-2xl font-poppins font-semibold mb-6">Nossa Trajetória</h2>
          <div className="glass-card rounded-xl p-8 mb-12">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-white/10 hidden md:block"></div>
              
              {/* Milestones */}
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex flex-col md:flex-row">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="flex-shrink-0 glass-card p-3 rounded-full mr-4 relative z-10">
                        <FaCalendarAlt className="text-primary h-5 w-5" />
                      </div>
                      <div className="font-bold text-xl text-primary md:w-16">{milestone.year}</div>
                    </div>
                    <div className="md:ml-8">
                      <h3 className="text-xl font-medium mb-2">{milestone.title}</h3>
                      <p className="text-gray-300">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Call to action */}
          <div className="glass-card rounded-xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-poppins font-semibold mb-4">Venha nos Conhecer</h2>
              <p className="text-gray-300 mb-6">
                Estamos localizados na Av. Aristídes Campos, 449/451, Gilberto Machado, Cachoeiro de Itapemirim/ES, CEP: 29302-801. Nossa equipe está pronta para te receber e ajudar a encontrar o veículo ideal para você.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-primary hover:bg-red-700">
                  <Link href="/estoque" className="flex items-center">
                    Ver Estoque
                  </Link>
                </Button>
                <Button asChild variant="outline" className="bg-white/10 hover:bg-white/15">
                  <a 
                    href="https://g.co/kgs/qgzEhNu" 
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center"
                  >
                    <FaMapMarkerAlt className="mr-2" /> Ver no Google Maps
                  </a>
                </Button>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10">
              <FaMapMarkerAlt className="w-full h-full text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
