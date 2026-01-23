import Link from "next/link";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-brand-black text-white pt-16 pb-8 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex flex-col items-start">
                            {/* Brand Logo */}
                            <div className="relative h-16 w-60 lg:h-[72px] lg:w-72 mb-6">
                                <img
                                    src="/logo_complete.svg"
                                    alt="Fórmula do Boi"
                                    className="h-full w-full object-contain object-left"
                                />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Referência em genética bovina e comercialização de gado de elite.
                            Conectando criadores a o que há de melhor no agronegócio brasileiro.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-gold hover:text-brand-black transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-gold hover:text-brand-black transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-gold hover:text-brand-black transition-colors">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-brand-gold uppercase tracking-wider">Navegação</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-white transition-colors">Início</Link></li>
                            <li><Link href="/catalogo" className="hover:text-white transition-colors">Catálogo</Link></li>
                            <li><Link href="/embrioes-semen" className="hover:text-white transition-colors">Embriões & Sêmen</Link></li>
                            <li><Link href="/venda-conosco" className="hover:text-white transition-colors">Venda Conosco</Link></li>
                        </ul>
                    </div>

                    {/* Links Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-brand-gold uppercase tracking-wider">Suporte</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Como Comprar</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Regulamento</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Fale Conosco</a></li>
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div>
                        <h3 className="text-lg font-bold mb-6 text-brand-gold uppercase tracking-wider">Contato</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 mt-0.5 text-brand-gold" />
                                <span>(62) 99999-9999<br />(62) 3333-3333</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 mt-0.5 text-brand-gold" />
                                <span>contato@formuladoboi.com.br</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-0.5 text-brand-gold" />
                                <span>Av. do Boi, 1000 - Setor Bueno<br />Goiânia - GO</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; 2024 Fórmula do Boi. Todos os direitos reservados.</p>
                    <p>Desenvolvido com tecnologia de ponta.</p>
                </div>
            </div>
        </footer>
    );
}
