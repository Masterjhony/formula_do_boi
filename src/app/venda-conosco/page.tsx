import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function VendaConosco() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544274972-e56570650e63?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 backdrop-blur-sm mb-6">
                        <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Parceria Exclusiva</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">
                        Venda seu Gado com a <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">Fórmula do Boi</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        Aumente a visibilidade do seu rebanho e alcance compradores qualificados em todo o Brasil.
                    </p>
                    <button className="px-8 py-4 bg-brand-gold hover:bg-yellow-600 text-[#0a0a0a] font-bold rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2">
                        Falar com um Especialista
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-20 bg-white/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Por que vender conosco?</h2>
                        <p className="text-gray-400">Oferecemos uma estrutura completa para garantir o melhor negócio.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Alcance Nacional",
                                desc: "Sua oferta chega a milhares de criadores em todo o território nacional."
                            },
                            {
                                title: "Marketing Especializado",
                                desc: "Produção de fotos, vídeos e material publicitário de alta qualidade."
                            },
                            {
                                title: "Segurança e Transparência",
                                desc: "Processos claros e suporte jurídico em todas as etapas da negociação."
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:border-brand-gold/30 transition-colors">
                                <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-6 h-6 text-brand-gold" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form Placeholder */}
            <section className="py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-[#1a1a1a] rounded-3xl p-8 md:p-12 border border-white/10">
                        <h2 className="text-3xl font-bold mb-8 text-center">Cadastre seu Interesse</h2>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
                                    <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors" placeholder="Ex: João Silva" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Telefone / WhatsApp</label>
                                    <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors" placeholder="(00) 00000-0000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                <input type="email" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors" placeholder="seu@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Mensagem</label>
                                <textarea rows={4} className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors" placeholder="Descreva o que deseja vender..."></textarea>
                            </div>
                            <button className="w-full py-4 bg-brand-gold hover:bg-yellow-600 text-[#0a0a0a] font-bold rounded-lg transition-colors">
                                Enviar Mensagem
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
