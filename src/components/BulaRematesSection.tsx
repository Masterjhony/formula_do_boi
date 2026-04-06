import { ArrowRight, Handshake } from "lucide-react";

export default function BulaRematesSection() {
    return (
        <section className="py-20 bg-[#050505] border-t border-white/5">
            <div className="container mx-auto px-4">
                <div className="relative rounded-3xl overflow-hidden border border-brand-gold/20">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/8 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 grid lg:grid-cols-2 gap-0">
                        {/* Left */}
                        <div className="p-10 md:p-14 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/8 mb-8 w-fit">
                                <Handshake className="w-4 h-4 text-brand-gold" />
                                <span className="text-brand-gold text-xs font-bold tracking-[0.15em] uppercase">Parceria Oficial</span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-tight tracking-tight mb-5">
                                Bula Remates{" "}
                                <span className="text-brand-gold">×</span>{" "}
                                Fórmula do Boi
                            </h2>

                            <p className="text-gray-400 leading-relaxed mb-4 text-base md:text-lg">
                                A Bula Assessoria Pecuária é referência em estratégias comerciais para o mercado bovino — mais de{" "}
                                <span className="text-white font-medium">10 anos de dedicação</span> e{" "}
                                <span className="text-white font-medium">R$30 milhões comercializados</span> em 2021.
                            </p>
                            <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                                Em parceria com a Bula Remates, a Fórmula do Boi oferece leilões de Nelore P.O. com curadoria especializada: desde a apartação e filmagem dos lotes até a transmissão, comercialização e pós-venda. Um processo completo, do campo ao comprador.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="https://bulaassessoria.com.br/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-gold hover:bg-yellow-500 text-brand-black font-bold uppercase tracking-widest text-sm rounded-lg transition-all hover:shadow-lg hover:shadow-brand-gold/20 group"
                                >
                                    Conhecer a Bula Remates
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <a
                                    href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20participar%20de%20um%20leil%C3%A3o."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/15 hover:border-brand-gold/40 text-white hover:text-brand-gold font-semibold uppercase tracking-widest text-sm rounded-lg transition-all hover:bg-white/5"
                                >
                                    Interesse em Leilão
                                </a>
                            </div>
                        </div>

                        {/* Right — highlights */}
                        <div className="p-10 md:p-14 border-t lg:border-t-0 lg:border-l border-white/8 flex flex-col justify-center gap-6">
                            {[
                                { label: "Filmagem e catalogação dos lotes", desc: "Cada animal registrado com qualidade e apresentado da forma certa." },
                                { label: "Transmissão e leiloeiro especializado", desc: "Infraestrutura completa para leilões presenciais e online." },
                                { label: "Análise de crédito e contratos", desc: "Processo seguro do interesse até o fechamento do negócio." },
                                { label: "Pós-venda e logística", desc: "Suporte na entrega e transferência dos animais com parceiros homologados." },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-black mt-0.5">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold text-sm mb-0.5">{item.label}</p>
                                        <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
