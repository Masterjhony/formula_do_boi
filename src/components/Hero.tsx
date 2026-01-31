import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative w-full py-24 lg:py-32 bg-brand-black overflow-hidden flex items-center justify-center">
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gold/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>

            <div className="relative container mx-auto px-4 flex flex-col items-center text-center z-10">
                <div className="max-w-4xl space-y-8">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight uppercase text-white">
                        A Excelência da <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold animate-gradient-x">
                            Genética Nelore
                        </span>
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                        Invista no futuro do seu rebanho com animais selecionados rigorosamente.
                        Matrizes, touros e reprodutores de alta performance para elevar o seu padrão.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 pt-6 justify-center">
                        <Link
                            href="/venda-conosco"
                            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-brand-gold hover:bg-yellow-600 text-brand-black font-bold uppercase tracking-widest text-sm rounded transition-all transform hover:translate-y-[-2px] hover:shadow-lg hover:shadow-brand-gold/20"
                        >
                            Venda Conosco
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <Link
                            href="/contato"
                            className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/20 hover:border-brand-gold/50 hover:text-brand-gold text-white font-semibold uppercase tracking-widest text-sm rounded transition-all hover:bg-white/5"
                        >
                            Falar com Consultor
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

