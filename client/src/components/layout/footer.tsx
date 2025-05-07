import { Link } from "wouter";
import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-[#0d1117] py-16 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <Link href="/admin/login" className="inline-block">
              <img 
                src="https://www.douglasautocar.com.br/sites/douglasautocar.com.br/img/logo.png" 
                alt="Douglas Auto Car" 
                className="h-12 mb-6 hover:opacity-90 transition-opacity"
              />
            </Link>
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
                  Av. Aristídes Campos, 449/451 -<br />
                  Gilberto Machado - Cachoeiro de Itapemirim/ES<br />
                  CEP: 29302-801
                </span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="text-primary mr-3" />
                <div className="text-gray-400">
                  <a href="tel:(28)3027-7065" className="block hover:text-white">(28) 3027-7065</a>
                  <a href="tel:(28)99965-1991" className="block hover:text-white">(28) 99965-1991</a>
                </div>
              </li>
              <li className="flex items-center">
                <FaWhatsapp className="text-primary mr-3" />
                <a href="https://wa.me/5528999339129" className="text-gray-400 hover:text-white">
                  (28) 99933-9129
                </a>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-primary mr-3" />
                <a href="mailto:marketingdouglasautocar@gmail.com" className="text-gray-400 hover:text-white">
                  marketingdouglasautocar@gmail.com
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-poppins font-semibold text-xl mb-6">Horário de Funcionamento</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-400">Segunda à Sexta</span>
                <span className="text-white">07:30 às 18:00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Sábado</span>
                <span className="text-white">07:30 às 12:00</span>
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
          <div className="text-gray-500 text-sm mb-4 md:mb-0">
            <p className="mb-2">
              © {new Date().getFullYear()} Douglas Auto Car - www.douglasautocar.com.br
            </p>
            <p>
              Desenvolvido por <a href="https://www.digitalenterprise.com.br" target="_blank" rel="noreferrer" className="text-primary hover:underline">Caique Contarini</a>
            </p>
          </div>
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
