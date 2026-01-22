import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative w-full h-[500px] lg:h-[600px] bg-gray-900 overflow-hidden">
            {/* Background Image Placeholder */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    // Using a high quality cattle image locally
                    backgroundImage: 'url("/cattle/boi_nelore_elite.jpg")'
                }}
            >
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            </div>

            <div className="relative container mx-auto px-4 h-full flex items-center">
                <div className="max-w-2xl text-white space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                        <span className="text-xs font-semibold uppercase tracking-widest text-brand-gold">Leilão ao Vivo</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight uppercase">
                        A Excelência da <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-yellow-200">
                            Genética Nelore
                        </span>
                    </h1>

                    <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
                        Invista no futuro do seu rebanho com animais selecionados rigorosamente.
                        Matrizes, touros e reprodutores de alta performance.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-gold hover:bg-yellow-600 text-brand-black font-bold uppercase tracking-wide rounded-lg transition-all transform hover:scale-105"
                        >
                            Ver Catálogo
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <Link
                            href="/contato"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-semibold uppercase tracking-wide rounded-lg transition-all"
                        >
                            Falar com Consultor
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
