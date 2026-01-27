"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2, Store, CreditCard, Truck, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Simple Accordion Component
const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10">
            <button
                className="w-full py-6 flex items-center justify-between text-left hover:text-brand-gold transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-lg font-medium">{question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 mb-6" : "max-h-0"}`}>
                <p className="text-gray-400 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

export default function VendaConosco() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            {/* Hero Section with Form */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544274972-e56570650e63?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 backdrop-blur-sm mb-6">
                                <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Genética PO</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                ELEVE O PADRÃO DA SUA VENDA COM <span className="text-brand-gold">GENÉTICA</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Processo, rede e suporte para dar previsibilidade e valorização à comercialização do seu plantel.
                            </p>
                            <div className="flex flex-col gap-4 text-gray-400">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-brand-gold w-5 h-5" />
                                    <span>Ecossistema exclusivo de compradores</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-brand-gold w-5 h-5" />
                                    <span>Marketing especializado em Nelore PO</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-brand-gold w-5 h-5" />
                                    <span>Suporte comercial completo</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Form Card */}
                        <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/10 shadow-2xl">
                            <h2 className="text-2xl font-bold mb-8 text-center uppercase tracking-wider">Cadastre seu Gado</h2>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome Completo</label>
                                    <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors" placeholder="Ex: João da Silva" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Celular</label>
                                        <input type="tel" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors" placeholder="(00) 00000-0000" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instagram (Opcional)</label>
                                        <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors" placeholder="@seuinstagram" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome da Fazenda</label>
                                    <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors" placeholder="Ex: Fazenda Santa Maria" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estado</label>
                                        <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-gray-400">
                                            <option>Selecione</option>
                                            {/* Add states here */}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cidade</label>
                                        <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-gray-400">
                                            <option>Selecione</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">O que deseja vender?</label>
                                    <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-gray-400">
                                        <option>Selecione uma opção</option>
                                        <option>Touros Nelore PO</option>
                                        <option>Matrizes Nelore PO</option>
                                        <option>Gado Comercial</option>
                                        <option>Sêmen / Embriões</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantidade de Animais</label>
                                    <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-gray-400">
                                        <option>Selecione uma opção</option>
                                        <option>Até 50 cabeças</option>
                                        <option>50 a 100 cabeças</option>
                                        <option>100 a 300 cabeças</option>
                                        <option>Acima de 300 cabeças</option>
                                    </select>
                                </div>

                                <button className="w-full py-4 mt-4 bg-brand-gold hover:bg-yellow-600 text-[#0a0a0a] font-bold rounded-lg transition-transform transform hover:scale-[1.02] uppercase tracking-wide">
                                    Quero Vender Meu Gado
                                </button>
                                <p className="text-[10px] text-center text-gray-500 mt-4 uppercase tracking-widest">
                                    Acesso restrito para criadores selecionados
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* O Que É Section */}
            <section className="py-24 bg-white/5">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase">O Que É</h2>
                    <p className="text-gray-400 mb-12">Entenda exatamente o propósito do nosso ecossistema de vendas.</p>

                    <div className="bg-[#1a1a1a] rounded-3xl p-8 md:p-12 border border-white/5 inline-flex flex-col md:flex-row gap-8 md:gap-16 text-left mx-auto">
                        <div className="flex gap-4 items-start">
                            <div className="mt-1">
                                <CheckCircle2 className="w-6 h-6 text-brand-gold" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">Conectamos criadores com compradores qualificados em busca de genética de ponta.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="mt-1">
                                <CheckCircle2 className="w-6 h-6 text-brand-gold" />
                            </div>
                            <div>
                                <p className="font-medium text-lg">Estratégias de venda personalizadas e suporte comercial dedicado para o seu plantel.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Cards Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex items-center gap-4 mb-16 justify-center">
                        <div className="h-8 w-1 bg-brand-gold rounded-full"></div>
                        <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-brand-gold">Como o Fórmula do Boi ajuda o Vendedor</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-[#1a1a1a] p-8 md:p-10 rounded-3xl border border-white/10 hover:border-brand-gold/30 transition-all hover:-translate-y-1 group">
                            <div className="w-14 h-14 bg-brand-gold rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#0a0a0a]">
                                <Store className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 uppercase">Visibilidade Direta</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Acesso direto a uma base qualificada de compradores, sem depender exclusivamente de leilões, com comunicação objetiva e foco no negócio.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#1a1a1a] p-8 md:p-10 rounded-3xl border border-white/10 hover:border-brand-gold/30 transition-all hover:-translate-y-1 group">
                            <div className="w-14 h-14 bg-brand-gold rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#0a0a0a]">
                                <CreditCard className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 uppercase">Venda Segura e Ágil</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Processo de comercialização estruturado, com análise de crédito e suporte jurídico para garantir segurança e fluidez na negociação.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#1a1a1a] p-8 md:p-10 rounded-3xl border border-white/10 hover:border-brand-gold/30 transition-all hover:-translate-y-1 group">
                            <div className="w-14 h-14 bg-brand-gold rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#0a0a0a]">
                                <Truck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-4 uppercase">Logística Integrada</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Apoio na organização logística e rotas compartilhadas para otimizar custos de entrega e facilitar o fechamento do negócio.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white/5">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center uppercase">Perguntas Frequentes</h2>
                    <p className="text-gray-400 mb-16 text-center">Tire suas dúvidas sobre como vender com o Fórmula do Boi.</p>

                    <div className="space-y-2">
                        <AccordionItem
                            question="O que preciso para vender no Fórmula do Boi?"
                            answer="Para vender conosco, é necessário que seus animais sejam 100% Nelore PO e passem por nossa avaliação técnica. Buscamos genética consistente e animais funcionais."
                        />
                        <AccordionItem
                            question="Como funciona a avaliação dos animais?"
                            answer="Nossa equipe técnica analisa vídeos, pedigree e avaliações genéticas (PMGZ/ANCP) dos lotes ofertados. Se aprovados, os animais entram em nosso catálogo exclusivo."
                        />
                        <AccordionItem
                            question="Quais são os custos para o vendedor?"
                            answer="Trabalhamos com uma taxa de sucesso sobre a venda realizada. Não cobramos taxas de adesão ou mensalidades. Entre em contato para conhecer as condições comerciais."
                        />
                        <AccordionItem
                            question="O Fórmula do Boi garante a venda?"
                            answer="Embora não possamos garantir a venda, garantimos a exposição para uma audiência altamente qualificada e investimos em marketing direcionado para maximizar suas chances."
                        />
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
