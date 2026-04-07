import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, Users } from "lucide-react";

const diferenciais = [
    {
        icon: <ShieldCheck className="w-6 h-6" />,
        title: "Curadoria Rigorosa",
        desc: "Nenhum animal entra no ecossistema sem avaliação técnica. Cada lote passa por análise de pedigree, PMGZ/ANCP e critérios genéticos rígidos antes da aprovação.",
    },
    {
        icon: <Star className="w-6 h-6" />,
        title: "Autoridade no Setor",
        desc: "Anos de imersão no mercado de Nelore P.O. construíram uma rede de relações com os melhores criadores, centrais e eventos do Brasil.",
    },
    {
        icon: <Users className="w-6 h-6" />,
        title: "Relacionamento Real",
        desc: "Não somos uma plataforma fria. Somos criadores falando com criadores — com linguagem, critério e compromisso com o resultado do seu plantel.",
    },
];

export default function InstitucionalSection() {
    return (
        <section className="stitch-divider py-24 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left — Text */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/20 bg-brand-gold/5 mb-8">
                            <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Quem está por trás</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase leading-[1.05] tracking-tight mb-6">
                            Método, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-300">
                                Critério
                            </span>{" "}
                            e Reputação.
                        </h2>

                        <p className="text-gray-400 text-lg leading-relaxed mb-4">
                            A Fórmula do Boi nasceu da experiência prática de quem vive o mercado de genética Nelore. Não é teoria — é o resultado de anos avaliando animais, acompanhando índices e construindo relações de confiança com os melhores criadores do Brasil.
                        </p>
                        <p className="text-gray-500 leading-relaxed mb-10">
                            Nosso diferencial não é o volume. É a qualidade de cada seleção, a seriedade de cada negócio e a clareza de que genética de ponta transforma rebanhos — e patrimônios.
                        </p>

                        <Link
                            href="/quem-somos"
                            className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold hover:text-yellow-400 uppercase tracking-widest transition-colors group"
                        >
                            Conheça nossa história
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Right — Diferenciais */}
                    <div className="space-y-5">
                        {diferenciais.map((d, i) => (
                            <div
                                key={i}
                                className="flex gap-5 p-6 rounded-2xl bg-[#0f0f0f] border border-white/8 hover:border-brand-gold/20 transition-colors group"
                            >
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold group-hover:bg-brand-gold/15 transition-colors">
                                    {d.icon}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-base uppercase tracking-wide mb-2">{d.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{d.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
