import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { LoginButton } from "@/components/auth/login-button";

export function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/estoque", label: "ESTOQUE" },
    { href: "/venda-seu-carro", label: "VENDA SEU CARRO" },
    { href: "/financie", label: "FINANCIE" },
    { href: "/atacado", label: "ATACADO" },
    { href: "/sobre", label: "SOBRE" },
  ];

  return (
    <header className="glass-nav fixed w-full z-50">
      <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <h1 className="text-white font-poppins font-bold text-2xl ml-2">
              Douglas <span className="text-primary">Auto Car</span>
            </h1>
          </Link>
        </div>
        
        <div className="hidden lg:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`font-medium transition-colors ${
                location === link.href ? "text-primary" : "hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a href="tel:(28)3027-7065" className="flex items-center text-primary font-medium">
            <Phone className="mr-2 h-4 w-4" /> (28) 3027-7065
          </a>
          <a href="https://wa.me/5528999339129" className="ml-4">
            <FaWhatsapp className="text-2xl text-green-500" />
          </a>
          <div className="ml-4">
            <LoginButton />
          </div>
        </div>
        
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass-card border-l border-white/10">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`py-2 px-4 rounded-md font-medium transition-colors ${
                      location === link.href 
                        ? "bg-white/10 text-primary" 
                        : "hover:bg-white/5 hover:text-primary"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                <a 
                  href="tel:(28)3027-7065" 
                  className="flex items-center text-primary font-medium"
                >
                  <Phone className="mr-2 h-4 w-4" /> (28) 3027-7065
                </a>
                <a 
                  href="https://wa.me/5528999339129" 
                  className="flex items-center text-green-500 font-medium"
                >
                  <FaWhatsapp className="mr-2 h-5 w-5" /> Whatsapp
                </a>
                <div className="mt-4">
                  <LoginButton />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="lg:hidden bg-[#1f2937] py-2 px-4 text-center">
        <div className="flex justify-between items-center">
          <a href="tel:(28)3027-7065" className="text-primary flex items-center">
            <Phone className="mr-1 h-4 w-4" /> (28) 3027-7065
          </a>
          <a href="https://wa.me/5528999339129" className="flex items-center text-green-500">
            <FaWhatsapp className="mr-1 h-4 w-4" /> Whatsapp
          </a>
        </div>
      </div>
    </header>
  );
}
