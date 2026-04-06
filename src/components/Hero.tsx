import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import GeneticCommandHUD from "./GeneticCommandHUD";

export default function Hero() {
    return (
        <section className="relative w-full min-h-[92vh] bg-brand-black overflow-hidden flex flex-col items-center justify-center">
            {/* Background layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-gold/8 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-brand-black to-transparent pointer-events-none" />
            {/* Subtle grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(197,160,89,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(197,160,89,0.5) 1px, transparent 1px)",
                    backgroundSize: "80px 80px",
                }}
            />

            <div className="relative container mx-auto px-4 z-10 py-16 lg:py-24">
                {/* ── Desktop: side-by-side  /  Mobile: stacked ── */}
                <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-16">
                    {/* Left – Copy */}
                    <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/8 backdrop-blur-sm mb-8">
                            <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse shadow-[0_0_6px_rgba(197,160,89,0.7)]" />
                            <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                                Genética · Curadoria · Estratégia
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight uppercase text-white">
                            O Ecossistema do{" "}
                            <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold">
                                Nelore P.O.
                            </span>
                        </h1>

                        <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl leading-relaxed font-light pt-4 lg:pt-6">
                            Sêmen de touros selecionados, embriões de elite, leilões com curadoria e{" "}
                            <span className="text-gray-200">inteligência técnica baseada em ABCZ, ANCP e Geneplus</span>.
                            Tudo que o criador sério precisa em um único lugar.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-8">
                            <Link
                                href="/touros"
                                className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-brand-gold hover:bg-yellow-500 text-brand-black font-bold uppercase tracking-widest text-sm rounded transition-all transform hover:translate-y-[-2px] hover:shadow-xl hover:shadow-brand-gold/25"
                            >
                                Explorar Touros
                                <ArrowRight className="w-5 h-5" />
                            </Link>

                            <Link
                                href="https://wa.me/5531984143874?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20falar%20com%20um%20consultor."
                                target="_blank"
                                className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/20 hover:border-brand-gold/50 hover:text-brand-gold text-white font-semibold uppercase tracking-widest text-sm rounded transition-all hover:bg-white/5"
                            >
                                Falar com Consultor
                            </Link>
                        </div>

                        {/* Stats row – desktop only */}
                        <div className="hidden lg:flex items-center gap-12 pt-12 border-t border-white/5 mt-10">
                            <div>
                                <p className="text-3xl font-black text-brand-gold">11</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Reprodutores</p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div>
                                <p className="text-3xl font-black text-brand-gold">PO</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Puro de Origem</p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div>
                                <p className="text-3xl font-black text-brand-gold">100%</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Genética Curada</p>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <div>
                                <p className="text-3xl font-black text-brand-gold">Bula</p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Parceria Remates</p>
                            </div>
                        </div>
                    </div>

                    {/* Right – HUD */}
                    <div className="w-full lg:w-auto lg:flex-shrink-0">
                        <GeneticCommandHUD />
                    </div>
                </div>

                {/* Stats row – mobile only */}
                <div className="flex lg:hidden flex-wrap items-center justify-center gap-8 pt-10 border-t border-white/5 mt-8">
                    <div className="text-center">
                        <p className="text-3xl font-black text-brand-gold">11</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Reprodutores</p>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    <div className="text-center">
                        <p className="text-3xl font-black text-brand-gold">PO</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Puro de Origem</p>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    <div className="text-center">
                        <p className="text-3xl font-black text-brand-gold">100%</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Genética Curada</p>
                    </div>
                    <div className="w-px h-8 bg-white/10 hidden sm:block" />
                    <div className="text-center">
                        <p className="text-3xl font-black text-brand-gold">Bula</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Parceria Remates</p>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 animate-bounce">
                <ChevronDown className="w-5 h-5" />
            </div>
        </section>
    );
}
