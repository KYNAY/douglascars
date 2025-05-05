import { Link } from "wouter";
import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-[#0d1117] py-16 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h2 className="text-white font-poppins font-bold text-2xl mb-6">
              Douglas <span className="text-primary">Auto Car</span>
            </h2>
            <p className="text-gray-400 mb-6">
              Seu parceiro de confiança na compra e venda de veículos. Estamos no mercado há mais de 15 anos oferecendo os melhores negócios.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/douglas.autocar/" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition-all"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram />
              </a>
              <a 
                href="https://www.facebook.com/" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition-all"
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebookF />
              </a>
              <a 
                href="https://www.youtube.com/" 
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-primary transition-all"
                target="_blank"
                rel="noreferrer"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-poppins font-semibold text-xl mb-6">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-primary mt-1 mr-3" />
                <span className="text-gray-400">
                  Av. Brasil, 1234 - Centro<br />
                  Governador Valadares - MG
                </span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="text-primary mr-3" />
                <a href="tel:(33)3241-1507" className="text-gray-400 hover:text-white">
                  (33) 3241-1507
                </a>
              </li>
              <li className="flex items-center">
                <FaWhatsapp className="text-primary mr-3" />
                <a href="https://wa.me/5533991990303" className="text-gray-400 hover:text-white">
                  (33) 99199-0303
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-primary mr-3" />
                <a href="mailto:contato@douglasautocar.com.br" className="text-gray-400 hover:text-white">
                  contato@douglasautocar.com.br
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-poppins font-semibold text-xl mb-6">Horário de Funcionamento</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-400">Segunda à Sexta</span>
                <span className="text-white">7:30 às 18:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Sábado</span>
                <span className="text-white">7:30 às 13:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Domingo</span>
                <span className="text-white">Fechado</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <a 
                href="https://g.co/kgs/qgzEhNu" 
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-gray-400 hover:text-white"
              >
                <FaMapMarkerAlt className="text-primary mr-2" /> Ver no Google Maps
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Douglas Auto Car. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4">
            <Link href="/termos" className="text-gray-500 hover:text-white text-sm">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="text-gray-500 hover:text-white text-sm">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
