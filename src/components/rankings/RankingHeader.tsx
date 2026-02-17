"use client";

import { motion } from "framer-motion";

export default function RankingHeader() {
    return (
        <section className="relative w-full bg-brand-black py-20 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="inline-block py-1 px-3 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-wider mb-6">
                        Elite Genética
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Ranking <span className="text-brand-gold">Fórmula do Boi</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                        A vitrine definitiva da nossa genética. Explore os melhores animais classificados por índices técnicos e desempenho comprovado.
                    </p>
                </motion.div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-gold/20 blur-[120px] rounded-full pointer-events-none" />
        </section>
    );
}
