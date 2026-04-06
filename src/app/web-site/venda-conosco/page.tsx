"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    ArrowRight, CheckCircle2, Store, CreditCard, Truck,
    ChevronDown, ChevronUp, Trophy, Dna, Users
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/10">
            <button
                className="w-full py-6 flex items-center justify-between text-left hover:text-brand-gold transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-base md:text-lg font-medium">{question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 mb-6" : "max-h-0"}`}>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">{answer}</p>
            </div>
        </div>
    );
};

const canais = [
    {
        icon: <Dna className="w-6 h-6" />,
        title: "Marketplace Online",
        desc: "Seu animal no catálogo da Fórmula do Boi, com página própria, ficha técnica, fotos, vídeos e avaliação genética.",
    },
    {
        icon: <Trophy className="w-6 h-6" />,
        title: "Leilões Bula Remates",
        desc: "Seus lotes apartados, filmados e divulgados no leilão Bula Remates × Fórmula do Boi, com transmissão e equipe comercial dedicada.",
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: "Rede Qualificada",
        desc: "Acesso direto à nossa base de compradores ativos — criadores, investidores e parceiros que buscam genética Nelore PO com regularidade.",
    },
];

export default function VendaConosco() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            {/* ── Hero + Form ── */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544274972-e56570650e63?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-[#0a0a0a]/60" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left */}
                        <div className="max-w-xl pt-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/25 mb-7">
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Venda com a Fórmula do Boi</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight uppercase">
                                Seu plantel merece o{" "}
                                <span className="text-brand-gold">melhor canal</span> de venda.
                            </h1>
                            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                                Processo estruturado, rede qualificada e suporte comercial completo para valorizar e dar previsibilidade à comercialização do seu Nelore P.O.
                            </p>
                            <div className="flex flex-col gap-3 text-gray-400">
                                {[
                                    "Curadoria técnica antes de qualquer publicação",
                                    "Marketing especializado em Nelore P.O.",
                                    "Canais próprios: marketplace, leilão e rede de compradores",
                                    "Suporte jurídico e análise de crédito no fechamento",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-brand-gold w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — Form */}
                        <div className="bg-[#111111] rounded-3xl p-8 border border-white/10 shadow-2xl">
                            <h2 className="text-xl font-black mb-1 text-center uppercase tracking-wider">Fale com nosso time</h2>
                            <p className="text-gray-500 text-xs text-center uppercase tracking-widest mb-8">Resposta em até 24h</p>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome Completo</label>
                                    <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-white placeholder-gray-600" placeholder="Ex: João da Silva" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Celular / WhatsApp</label>
                                        <input type="tel" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-white placeholder-gray-600" placeholder="(00) 00000-0000" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Instagram</label>
                                        <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-white placeholder-gray-600" placeholder="@seuinstagram" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome da Fazenda</label>
                                    <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-white placeholder-gray-600" placeholder="Ex: Fazenda Santa Maria" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estado</label>
                                        <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-gray-400">
                                            <option>Selecione</option>
                                            {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(uf => (
                                                <option key={uf}>{uf}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cidade</label>
                                        <input type="text" className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-white placeholder-gray-600" placeholder="Sua cidade" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">O que deseja vender?</label>
                                    <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-gray-400">
                                        <option>Selecione uma opção</option>
                                        <option>Touros Nelore PO (sêmen / animal)</option>
                                        <option>Matrizes e Doadoras Nelore PO</option>
                                        <option>Embriões</option>
                                        <option>Lote para Leilão</option>
                                        <option>Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantidade estimada</label>
                                    <select className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-lg focus:border-brand-gold focus:outline-none transition-colors text-gray-400">
                                        <option>Selecione uma opção</option>
                                        <option>Até 10 animais</option>
                                        <option>10 a 50 animais</option>
                                        <option>50 a 150 animais</option>
                                        <option>Acima de 150 animais</option>
                                    </select>
                                </div>
                                <a
                                    href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20vender%20meu%20gado%20com%20a%20F%C3%B3rmula%20do%20Boi."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 mt-2 bg-brand-gold hover:bg-yellow-500 text-[#0a0a0a] font-black rounded-lg transition-all transform hover:scale-[1.02] uppercase tracking-widest text-sm flex items-center justify-center gap-2 group"
                                >
                                    Quero Vender Meu Gado
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <p className="text-[10px] text-center text-gray-600 mt-2 uppercase tracking-widest">
                                    Acesso restrito · Apenas Nelore P.O. selecionado
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Canais de Venda ── */}
            <section className="py-24 bg-[#050505] border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/20 bg-brand-gold/5 mb-6">
                            <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Canais de Comercialização</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                            Três frentes para vender melhor
                        </h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-sm">
                            Seu plantel exposto onde o comprador qualificado está — com processo, presença e estratégia.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {canais.map((c, i) => (
                            <div key={i} className="bg-[#0f0f0f] p-8 rounded-2xl border border-white/8 hover:border-brand-gold/25 transition-all hover:-translate-y-1 group">
                                <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold/20 rounded-xl flex items-center justify-center mb-6 text-brand-gold group-hover:bg-brand-gold/15 transition-colors">
                                    {c.icon}
                                </div>
                                <h3 className="text-lg font-black mb-3 uppercase tracking-wide">{c.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Como Funciona ── */}
            <section className="py-24 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/20 bg-brand-gold/5 mb-8">
                                <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Processo</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-6 leading-tight">
                                Do primeiro contato à{" "}
                                <span className="text-brand-gold">venda concluída</span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-base mb-6">
                                Nosso processo foi pensado para ser claro, seguro e eficiente — tanto para o vendedor quanto para o comprador. Cada etapa tem um responsável e um objetivo definido.
                            </p>
                            <Link
                                href="/quem-somos"
                                className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors group"
                            >
                                Conheça a equipe
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {[
                                { step: "01", title: "Cadastro e Qualificação", desc: "Você preenche o formulário e nossa equipe entra em contato para entender o seu plantel." },
                                { step: "02", title: "Avaliação Técnica", desc: "Análise de vídeos, pedigree e avaliações PMGZ/ANCP. Apenas Nelore PO com genética consistente." },
                                { step: "03", title: "Definição do Canal", desc: "Marketplace, leilão ou rede privada — escolhemos juntos a estratégia mais adequada." },
                                { step: "04", title: "Publicação e Divulgação", desc: "Ficha técnica, fotos, vídeos e campanha de marketing direcionada ao comprador certo." },
                                { step: "05", title: "Fechamento e Pós-Venda", desc: "Suporte jurídico, análise de crédito, logística homologada e comissão só no resultado." },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-5 items-start group">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-black">
                                        {item.step}
                                    </div>
                                    <div className="pb-4 border-b border-white/5 flex-1">
                                        <p className="text-white font-bold text-sm mb-1">{item.title}</p>
                                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Benefícios ── */}
            <section className="py-24 bg-[#050505] border-t border-white/5">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-14 justify-center">
                        <div className="h-8 w-1 bg-brand-gold rounded-full" />
                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-brand-gold">
                            Por que vender com a Fórmula do Boi
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <Store className="w-7 h-7" />, title: "Visibilidade Qualificada", desc: "Acesso direto a uma base ativa de compradores que buscam genética Nelore PO — sem depender só de leilões ou grupos de WhatsApp." },
                            { icon: <CreditCard className="w-7 h-7" />, title: "Venda Segura", desc: "Análise de crédito, suporte jurídico e contrato estruturado. Você foca na produção, a gente cuida do processo." },
                            { icon: <Truck className="w-7 h-7" />, title: "Logística Integrada", desc: "Parceiros homologados para transporte. Rotas compartilhadas para reduzir custos e facilitar o fechamento." },
                        ].map((c, i) => (
                            <div key={i} className="bg-[#0f0f0f] p-8 md:p-10 rounded-3xl border border-white/8 hover:border-brand-gold/25 transition-all hover:-translate-y-1 group">
                                <div className="w-14 h-14 bg-brand-gold rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#0a0a0a]">
                                    {c.icon}
                                </div>
                                <h3 className="text-lg font-black mb-3 uppercase">{c.title}</h3>
                                <p className="text-gray-400 leading-relaxed text-sm">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section className="py-24 border-t border-white/5">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-black mb-4 text-center uppercase">Perguntas Frequentes</h2>
                    <p className="text-gray-500 mb-14 text-center text-sm">Dúvidas sobre vender com a Fórmula do Boi.</p>
                    <div className="space-y-2">
                        <AccordionItem
                            question="O que preciso para vender no Fórmula do Boi?"
                            answer="Seus animais precisam ser 100% Nelore PO e passar pela nossa avaliação técnica. Analisamos pedigree (RGN ou RGD), vídeos e avaliações genéticas (PMGZ/ANCP). Buscamos genética consistente e animais funcionais."
                        />
                        <AccordionItem
                            question="Como funciona a avaliação dos animais?"
                            answer="Nossa equipe técnica analisa vídeos, pedigree e avaliações genéticas dos lotes. Se aprovados, definimos juntos o melhor canal: marketplace online, leilão Bula Remates ou venda direta pela nossa rede."
                        />
                        <AccordionItem
                            question="Posso incluir lotes em leilão com a Bula Remates?"
                            answer="Sim. Em parceria com a Bula Remates, organizamos leilões de Nelore PO com apartação, filmagem, catálogo, transmissão e equipe comercial. Fale com nosso time para avaliar o seu lote."
                        />
                        <AccordionItem
                            question="Quais são os custos para o vendedor?"
                            answer="Trabalhamos com comissão sobre a venda realizada. Não cobramos taxa de adesão ou mensalidade. Para leilões via Bula Remates, a estrutura comercial e de custos segue o modelo da parceria. Entre em contato para detalhes."
                        />
                        <AccordionItem
                            question="O Fórmula do Boi garante a venda?"
                            answer="Não garantimos a venda, mas garantimos exposição qualificada, estratégia comercial e suporte do início ao fim. Nossa taxa de fechamento fala por si."
                        />
                    </div>
                </div>
            </section>

            {/* ── CTA Final ── */}
            <section className="py-20 border-t border-white/5 bg-[#050505]">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">
                        Pronto para vender com{" "}
                        <span className="text-brand-gold">quem entende</span> do mercado?
                    </h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Fale com nosso time agora pelo WhatsApp ou preencha o formulário acima. Respondemos em até 24 horas.
                    </p>
                    <a
                        href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20vender%20meu%20gado%20com%20a%20F%C3%B3rmula%20do%20Boi."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-10 py-4 bg-brand-gold hover:bg-yellow-500 text-brand-black font-black rounded-lg transition-all hover:shadow-xl hover:shadow-brand-gold/20 uppercase tracking-widest text-sm group"
                    >
                        Falar pelo WhatsApp
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </section>

            <Footer />
        </main>
    );
}
