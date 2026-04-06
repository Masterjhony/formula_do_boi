import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Handshake, Target, Eye } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Quem Somos | Fórmula do Boi",
    description: "Conheça a história, a visão e os valores da Fórmula do Boi — o ecossistema de genética Nelore P.O. liderado pelo Bulinha.",
};

const valores = [
    { title: "Curadoria antes de tudo", desc: "Nenhum animal, sêmen ou embrião entra no nosso catálogo sem passar por avaliação técnica criteriosa. A qualidade do plantel do comprador depende da seriedade da nossa seleção." },
    { title: "Transparência no negócio", desc: "Cada ficha técnica, cada índice genético e cada condição comercial é apresentada com clareza. Confiança não se promete — se constrói transação a transação." },
    { title: "Relações de longo prazo", desc: "Não vendemos um animal — construímos uma relação. Criador, comprador e parceiro, todos fazem parte do mesmo ecossistema e têm tudo a ganhar com resultados reais." },
];

const numeros = [
    { valor: "P.O.", label: "Puro de Origem — padrão inegociável" },
    { valor: "11", label: "Reprodutores na Aceleradora de Touros" },
    { valor: "ABCZ", label: "Critério de avaliação genética base" },
    { valor: "Bula", label: "Parceria em leilões e comercialização" },
];

export default function QuemSomos() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />

            {/* ── Hero Institucional ── */}
            <section className="relative pt-28 pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand-gold/8 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                    style={{ backgroundImage: "linear-gradient(rgba(197,160,89,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,89,0.5) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/25 bg-brand-gold/8 mb-10">
                            <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Nossa História</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[1.0] tracking-tight mb-8">
                            Genética que{" "}
                            <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold">
                                transforma rebanhos.
                            </span>
                        </h1>

                        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl font-light">
                            A Fórmula do Boi nasceu de um propósito claro: tornar acessível o que há de melhor na genética Nelore P.O. — com critério, transparência e o relacionamento de quem conhece o campo de perto.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Números ── */}
            <section className="py-12 bg-[#050505] border-y border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y md:divide-y-0 divide-white/8">
                        {numeros.map((n, i) => (
                            <div key={i} className="text-center py-8 px-6">
                                <p className="text-3xl md:text-4xl font-black text-brand-gold mb-1">{n.valor}</p>
                                <p className="text-gray-500 text-xs uppercase tracking-widest leading-snug">{n.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Bulinha — Figura Central ── */}
            <section className="py-24 border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text side */}
                        <div className="order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/20 bg-brand-gold/5 mb-8">
                                <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Sócio</span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight tracking-tight mb-6">
                                O Bulinha
                            </h2>

                            <p className="text-gray-300 text-lg leading-relaxed mb-5">
                                Por trás da Fórmula do Boi está o Bulinha — um criador com raízes no campo, formação técnica sólida e uma visão de mercado que poucas pessoas no setor têm a coragem de articular com tanta clareza.
                            </p>
                            <p className="text-gray-400 leading-relaxed mb-5">
                                Mais do que um empresário do agronegócio, o Bulinha é um curador. Cada touro que entra na Aceleradora, cada doadora no plantel e cada lote apresentado nos leilões passa pelo seu olhar — exigente, fundamentado e orientado a resultado.
                            </p>
                            <p className="text-gray-400 leading-relaxed mb-8">
                                Sua reputação no mercado de Nelore P.O. foi construída visita a visita, negócio a negócio, com a disciplina de quem entende que genética não se vende: se entrega com responsabilidade.
                            </p>

                            <div className="flex flex-col gap-3 mb-10">
                                {[
                                    "Especialista em avaliação de genética Nelore PO",
                                    "Experiência em seleção por ABCZ, ANCP e Geneplus",
                                    "Rede de relações com os principais criadores do Brasil",
                                    "Parceiro estratégico da Bula Assessoria Pecuária",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="text-brand-gold w-5 h-5 flex-shrink-0" />
                                        <span className="text-gray-400 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* Visual side */}
                        <div className="order-1 lg:order-2 flex justify-center">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold/20 to-yellow-600/20 rounded-3xl blur-2xl opacity-40" />
                                <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl border border-brand-gold/20 overflow-hidden">
                                    <img
                                        src="/bulinha.png"
                                        alt="Bulinha — Sócio da Fórmula do Boi"
                                        className="w-full h-full object-cover object-top"
                                    />
                                    {/* Subtle gradient overlay at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a]/80 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="text-brand-gold font-black text-sm uppercase tracking-wider">Bulinha</p>
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mt-0.5">Sócio · Fórmula do Boi</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Visão, Missão e Propósito ── */}
            <section className="py-24 bg-[#050505] border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                            Visão & Propósito
                        </h2>
                        <p className="text-gray-500 mt-4 text-sm max-w-xl mx-auto">
                            O que guia cada decisão, cada seleção e cada relação que construímos.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-2xl bg-[#0f0f0f] border border-brand-gold/20 hover:border-brand-gold/40 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-6 text-brand-gold">
                                <Eye className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-wide text-brand-gold mb-3">Visão</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Ser a referência nacional em curadoria de genética Nelore P.O. — o lugar onde criadores sérios encontram o melhor do mercado com transparência e critério.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-[#0f0f0f] border border-white/8 hover:border-brand-gold/20 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-6 text-brand-gold">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-wide text-white mb-3">Missão</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Conectar genética de elite a criadores que sabem o valor do que estão comprando — com processo estruturado, suporte técnico e relações de confiança duradouras.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-[#0f0f0f] border border-white/8 hover:border-brand-gold/20 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-6 text-brand-gold">
                                <Handshake className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-wide text-white mb-3">Propósito</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Fazer o mercado de Nelore P.O. mais inteligente, mais acessível e mais justo para quem produz com seriedade e investe com visão.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Valores ── */}
            <section className="py-24 border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/20 bg-brand-gold/5 mb-8">
                                <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">O que nos move</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight mb-6">
                                Princípios que guiam{" "}
                                <span className="text-brand-gold">cada negócio</span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed text-base">
                                No mercado de genética, a reputação é o ativo mais valioso. Cada decisão da Fórmula do Boi é orientada por princípios claros — porque no longo prazo, só sobrevive quem age com integridade.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {valores.map((v, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-[#0f0f0f] border border-white/8 hover:border-brand-gold/20 transition-colors group">
                                    <div className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-black mt-0.5">
                                            {String(i + 1).padStart(2, "0")}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-2">{v.title}</h3>
                                            <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Parceria Bula Remates ── */}
            <section className="py-24 bg-[#050505] border-b border-white/5">
                <div className="container mx-auto px-4">
                    <div className="relative rounded-3xl overflow-hidden border border-brand-gold/15 p-10 md:p-16">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/6 via-transparent to-transparent pointer-events-none" />
                        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/25 bg-brand-gold/8 mb-8 w-fit">
                                    <Handshake className="w-4 h-4 text-brand-gold" />
                                    <span className="text-brand-gold text-xs font-bold tracking-[0.15em] uppercase">Parceria Estratégica</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight mb-5">
                                    Bula Remates × <br />
                                    <span className="text-brand-gold">Fórmula do Boi</span>
                                </h2>
                                <p className="text-gray-400 leading-relaxed mb-4">
                                    A Bula Assessoria Pecuária é uma das referências mais sólidas em estratégias comerciais para o mercado bovino — mais de 10 anos de dedicação e R$30 milhões comercializados.
                                </p>
                                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                                    Nossa parceria com a Bula Remates une o melhor dos dois mundos: a profundidade genética e de curadoria da Fórmula do Boi com a infraestrutura, o relacionamento e a excelência operacional da Bula em leilões de Nelore PO.
                                </p>
                                <a
                                    href="https://bulaassessoria.com.br/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors group"
                                >
                                    Conhecer a Bula Assessoria
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { n: "+10", label: "Anos de mercado — Bula Assessoria" },
                                    { n: "R$30M", label: "Comercializados em 2021" },
                                    { n: "100%", label: "Nelore PO nos leilões conjuntos" },
                                    { n: "BR", label: "Cobertura nacional de entrega" },
                                ].map((item, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/8 text-center">
                                        <p className="text-2xl font-black text-brand-gold mb-1">{item.n}</p>
                                        <p className="text-gray-500 text-xs leading-snug">{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA Final ── */}
            <section className="py-20 border-t border-white/5">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">
                        Pronto para fazer parte{" "}
                        <span className="text-brand-gold">do ecossistema</span>?
                    </h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Seja para comprar genética de elite, vender seu plantel ou participar de um leilão — a Fórmula do Boi tem o canal certo para você.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/touros"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold hover:bg-yellow-500 text-brand-black font-bold uppercase tracking-widest text-sm rounded-lg transition-all hover:shadow-xl hover:shadow-brand-gold/20 group"
                        >
                            Ver Touros & Sêmen
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/venda-conosco"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 hover:border-brand-gold/40 text-white hover:text-brand-gold font-semibold uppercase tracking-widest text-sm rounded-lg transition-all hover:bg-white/5"
                        >
                            Vender com a Fórmula
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
