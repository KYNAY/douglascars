import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FaSearch, FaWhatsapp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { HeroSlide } from "@shared/schema";

type CarouselSlide = {
  imageUrl: string;
  title: string;
  subtitle: string;
};

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Buscar os slides do carousel do banco de dados
  const { data: heroSlidesData, isLoading, isError } = useQuery({
    queryKey: ['/api/hero-slides'],
    queryFn: async () => {
      const res = await fetch('/api/hero-slides');
      if (!res.ok) throw new Error('Failed to fetch hero slides');
      return res.json() as Promise<HeroSlide[]>;
    }
  });
  
  // Slides padrão com a Ferrari em destaque como primeiro slide (caso não existam slides no banco)
  const defaultSlides: CarouselSlide[] = [
    {
      // Slide fixo com Ferrari vermelha
      imageUrl: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?q=80&w=1470&auto=format&fit=crop",
      title: "Encontre seu próximo carro dos sonhos",
      subtitle: "Fale com nossa equipe especializada. Estamos prontos para te atender!"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      title: "Financiamento facilitado",
      subtitle: "Taxas exclusivas e aprovação rápida para você conquistar seu veículo"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1617814076668-11183bc12271?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      title: "Qualidade garantida",
      subtitle: "Todos os nossos veículos passam por rigorosa inspeção técnica"
    }
  ];
  
  // Usar os slides do banco de dados se estiverem disponíveis, ou os padrão se não
  const slides = (heroSlidesData && heroSlidesData.length > 0) 
    ? heroSlidesData.filter(slide => slide.active) 
    : defaultSlides;
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  
  // Desativar a rotação automática que estava causando o efeito de piscar
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     nextSlide();
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);
  
  return (
    <section className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="relative rounded-2xl overflow-hidden h-[500px] mb-8">
          {/* Hero background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: `url(${slides[currentSlide].imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117]/90 to-transparent"></div>
          </div>
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-8">
              <div className="w-full lg:w-1/2 relative z-10 text-white">
                <div className="glass-card p-8 rounded-2xl">
                  <p className="text-primary font-semibold mb-2 inline-block px-3 py-1 rounded-full bg-white/10">
                    ATENDIMENTO ONLINE
                  </p>
                  <h2 className="font-poppins font-bold text-4xl md:text-5xl mb-4">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-gray-300 mb-8">
                    {slides[currentSlide].subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button 
                      asChild
                      className="bg-primary hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                    >
                      <Link href="/estoque" className="flex items-center">
                        <FaSearch className="mr-2" /> Buscar Veículos
                      </Link>
                    </Button>
                    <Button 
                      asChild
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                    >
                      <a href="https://wa.me/5533991990303" className="flex items-center">
                        <FaWhatsapp className="mr-2" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Slide controls */}
          <div className="absolute bottom-8 right-8 flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={prevSlide}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-all"
            >
              <FaChevronLeft />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextSlide}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-red-700 transition-all"
            >
              <FaChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
