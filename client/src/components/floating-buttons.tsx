import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowUp, FaWhatsapp } from "react-icons/fa";

export function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Show/hide button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <>
      {/* Back to Top Button */}
      <Button
        variant="default"
        size="icon"
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-all z-50 ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={scrollToTop}
      >
        <FaArrowUp />
      </Button>
    </>
  );
}
