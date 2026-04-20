import Link from "next/link";
import { ArrowRight, Dna, Gavel, Users } from "lucide-react";

const CANAIS = [
    {
        Icon: Dna,
        titulo: "Marketplace",
        desc: "Ficha técnica, fotos, vídeo e avaliação genética — seu animal visível para quem decide comprar.",
    },
    {
        Icon: Gavel,
        titulo: "Leilão Bula Remates",
        desc: "Lotes apartados, filmados e divulgados com transmissão ao vivo e equipe comercial.",
    },
    {
        Icon: Users,
        titulo: "Rede Qualificada",
        desc: "Base ativa de criadores, investidores e parceiros que buscam Nelore P.O. com regularidade.",
    },
];

export default function VendaConoscoSection() {
    return (
        <section className="py-24 bg-[#050505] border-t border-white/5">
            <div className="container mx-auto px-4">

                {/* ── Header ── */}
                <div className="max-w-2xl mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-gold/25 bg-brand-gold/6 mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                        <span className="text-brand-gold text-[10px] font-black tracking-[0.22em] uppercase">
                            Para Criadores e Fazendas
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4">
                        Venda conosco.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                            Seu plantel merece
                        </span>{" "}
                        <span className="text-white">o melhor canal.</span>
                    </h2>
                    <p className="text-gray-400 text-base leading-relaxed">
                        Processo estruturado, rede qualificada e suporte comercial completo.
                        A Fórmula do Boi cuida de tudo — da avaliação técnica ao fechamento.
                    </p>
                </div>

                {/* ── Canais ── */}
                <div className="grid md:grid-cols-3 gap-5 mb-12">
                    {CANAIS.map(({ Icon, titulo, desc }) => (
                        <div
                            key={titulo}
                            className="group p-8 rounded-2xl border border-white/8 bg-[#0f0f0f] hover:border-brand-gold/25 hover:bg-[#141006] transition-all duration-300"
                        >
                            <div className="w-11 h-11 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-5 text-brand-gold group-hover:bg-brand-gold/20 transition-colors">
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-black text-base uppercase tracking-wide mb-2">{titulo}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>

                {/* ── CTAs ── */}
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <a
                        href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20quero%20vender%20meu%20gado%20com%20a%20F%C3%B3rmula%20do%20Boi."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-gold hover:bg-yellow-500 text-brand-black font-black uppercase tracking-widest text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-brand-gold/20 group"
                    >
                        Quero vender meu gado
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <Link
                        href="/venda-conosco"
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/15 hover:border-brand-gold/40 text-white hover:text-brand-gold font-semibold uppercase tracking-widest text-sm rounded-lg transition-all hover:bg-white/5 group"
                    >
                        Como funciona
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* ── Detalhe acesso restrito ── */}
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-5">
                    Acesso restrito · Apenas Nelore P.O. selecionado
                </p>
            </div>
        </section>
    );
}
