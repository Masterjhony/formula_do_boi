import { ArrowRight, Shield, Gavel, TrendingUp } from "lucide-react";

const DESTAQUES = [
    {
        Icon: Shield,
        titulo: "Curadoria de Campo",
        desc: "Filmagem, apartação e análise técnica de todos os lotes antes de qualquer oferta.",
    },
    {
        Icon: Gavel,
        titulo: "Leilão com Estrutura",
        desc: "Transmissão ao vivo, equipe comercial dedicada e crédito para o comprador.",
    },
    {
        Icon: TrendingUp,
        titulo: "Resultado Mensurável",
        desc: "Mais de 10 anos de mercado. Médias acima do mercado e reincidência de compradores.",
    },
];

export default function SociedadeBulinha() {
    return (
        <section className="py-24 bg-[#080808] border-t border-white/5">
            <div className="container mx-auto px-4">

                {/* ── Layout principal ── */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* ── Foto Bulinha ── */}
                    <div className="order-2 lg:order-1 flex justify-center">
                        <div className="relative w-full max-w-sm">
                            {/* Moldura dourada */}
                            <div
                                className="w-full aspect-[4/5] rounded-3xl overflow-hidden"
                                style={{
                                    background: "linear-gradient(135deg, #D4A017 0%, #7A5010 50%, #C9A84C 100%)",
                                    padding: "1.5px",
                                }}
                            >
                                <div className="w-full h-full rounded-3xl bg-[#111] relative overflow-hidden">
                                    <img
                                        src="/bulinha.png"
                                        alt="Bulinha — Bula Remates"
                                        className="w-full h-full object-cover object-top"
                                    />
                                    {/* Gradiente base para legibilidade do badge */}
                                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

                                    {/* Badge no canto */}
                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-gold/15 border border-brand-gold/35 backdrop-blur-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                                            <span className="text-brand-gold text-[10px] font-bold uppercase tracking-widest">Bula Remates</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Glow exterior */}
                            <div className="absolute inset-0 rounded-3xl blur-2xl bg-brand-gold/[0.06] -z-10 scale-110" />
                        </div>
                    </div>

                    {/* ── Texto ── */}
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/25 bg-brand-gold/6 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                            <span className="text-brand-gold text-[10px] font-black tracking-[0.22em] uppercase">
                                Sociedade Exclusiva
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-5">
                            Sociedade com<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                                a Bulinha
                            </span>
                        </h2>

                        <p className="text-gray-400 text-base leading-relaxed mb-4">
                            Não é parceria — é sociedade. A Fórmula do Boi e a Bula Remates operam juntas
                            de ponta a ponta: da seleção dos criadores à transmissão do leilão,
                            com a mesma régua técnica e o mesmo compromisso com o criador sério.
                        </p>

                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            Cada lote que passa pela nossa curadoria passa pelo olho do Bulinha —
                            quem tem{" "}
                            <span className="text-white font-medium">mais de 10 anos</span>{" "}
                            de campo e sabe o que o mercado Nelore P.O. exige.
                        </p>

                        {/* Destaques */}
                        <div className="space-y-4 mb-8">
                            {DESTAQUES.map(({ Icon, titulo, desc }) => (
                                <div key={titulo} className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-4 h-4 text-brand-gold" />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-bold uppercase tracking-wide mb-0.5">{titulo}</p>
                                        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <a
                            href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20os%20leil%C3%B5es%20Bula%20Remates%20%C3%97%20F%C3%B3rmula%20do%20Boi."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-gold hover:bg-yellow-500 text-brand-black font-black uppercase tracking-widest text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-brand-gold/20 group"
                        >
                            Falar com a equipe
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
