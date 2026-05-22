import Link from "next/link";
import { ArrowRight, Dna, FlaskConical, Trophy, Brain, Calendar } from "lucide-react";

const pilares = [
    {
        icon: <Dna className="w-7 h-7" />,
        label: "Touros & Sêmen",
        headline: "Aceleradora de Touros",
        description:
            "11 reprodutores selecionados a dedo, sob coleta contínua na Central Bela Vista. Sêmen com logística nacional e genética provada para acelerar o teto do seu rebanho.",
        cta: "Ver Touros",
        href: "/touros",
        accent: true,
    },
    {
        icon: <FlaskConical className="w-7 h-7" />,
        label: "Doadoras & Embriões",
        headline: "Multiplicação de Elite",
        description:
            "Acesso a doadoras de linhagens consagradas e embriões de alto valor agregado. Multiplicação genética com segurança real no resultado da sua fazenda.",
        cta: "Ver Embriões",
        href: "/embrioes",
        accent: false,
    },
    {
        icon: <Trophy className="w-7 h-7" />,
        label: "Leilões",
        headline: "Bula Remates × Fórmula do Boi",
        description:
            "Leilões de Nelore P.O. com curadoria especializada em parceria com a Bula Remates. Lotes selecionados, avaliados e divulgados com estratégia comercial.",
        cta: "Conhecer",
        href: "https://bulaassessoria.com.br/",
        external: true,
        accent: false,
    },
    {
        icon: <Calendar className="w-7 h-7" />,
        label: "Agenda de Leilões",
        headline: "Próximas Oportunidades",
        description:
            "Acompanhe os próximos eventos, datas e lotes disponíveis. Não perca nenhuma oportunidade de adquirir ou comercializar genética de ponta no mercado.",
        cta: "Ver Agenda",
        href: "https://bulaassessoria.com.br/agenda",
        external: true,
        accent: false,
    },
    {
        icon: <Brain className="w-7 h-7" />,
        label: "IA Especialista Técnica",
        headline: "Análise com Fundamento",
        description:
            "Ferramenta de análise técnica baseada em documentação oficial: ABCZ, ANCP e Geneplus. Parecer embasado para sustentar as melhores decisões do seu plantel.",
        cta: "Em Breve",
        href: "#",
        disabled: true,
        accent: false,
    },
];

export default function PilaresSection() {
    return (
        <section className="stitch-divider py-24 bg-[#111111] border-t border-white/5">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/20 bg-brand-gold/5 mb-6">
                        <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Frentes de Negócio</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                        O que a Fórmula do Boi oferece
                    </h2>
                    <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-base">
                        Cinco frentes estratégicas unidas em um único ecossistema para o criador de Nelore P.O.
                    </p>
                </div>

                {/* Pilares Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pilares.map((p, i) => (
                        <div
                            key={i}
                            className={`group relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 flex flex-col
                                ${p.accent
                                    ? "bg-gradient-to-br from-brand-gold/10 to-brand-gold/5 border-brand-gold/30 hover:border-brand-gold/60"
                                    : "bg-[#1b1b1b] border-white/8 hover:border-brand-gold/25"
                                }
                                ${p.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110
                                ${p.accent ? "bg-brand-gold text-brand-black" : "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"}`}>
                                {p.icon}
                            </div>

                            {/* Label */}
                            <span className="text-xs font-bold text-brand-gold/70 uppercase tracking-widest mb-2">{p.label}</span>

                            {/* Headline */}
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{p.headline}</h3>

                            {/* Description */}
                            <p className="text-gray-400 text-sm leading-relaxed flex-1">{p.description}</p>

                            {/* CTA */}
                            <div className="mt-6">
                                {p.disabled ? (
                                    <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-widest">
                                        {p.cta}
                                    </span>
                                ) : p.external ? (
                                    <a
                                        href={p.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors"
                                    >
                                        {p.cta}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                ) : (
                                    <Link
                                        href={p.href}
                                        className="inline-flex items-center gap-2 text-xs font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors"
                                    >
                                        {p.cta}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
