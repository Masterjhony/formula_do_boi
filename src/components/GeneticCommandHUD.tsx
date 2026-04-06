"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

/* ── helpers ─────────────────────────────────────────── */

function useCountUp(end: number, duration: number, startOnView: boolean, decimals = 0) {
    const [value, setValue] = useState(0);
    const started = useRef(false);

    useEffect(() => {
        if (!startOnView || started.current) return;
        started.current = true;
        const startTime = performance.now();
        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = 1 - Math.pow(2, -10 * progress);
            setValue(parseFloat((eased * end).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [startOnView, end, duration, decimals]);

    return value;
}

/* ── micro-components ────────────────────────────────── */

function StatusDot({ label, active = true }: { label: string; active?: boolean }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-gray-600"} animate-pulse`} />
            <span className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-medium">{label}</span>
        </span>
    );
}

function ScanLine({ reducedMotion }: { reducedMotion: boolean | null }) {
    if (reducedMotion) return null;
    return (
        <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent pointer-events-none"
            initial={{ top: "0%" }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
    );
}

/* ── types ────────────────────────────────────────────── */

interface MetricCardProps {
    label: string;
    value: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    sub?: string;
    inView: boolean;
    reducedMotion: boolean | null;
    delay?: number;
}

function MetricCard({ label, value, suffix = "", prefix = "", decimals = 0, sub, inView, reducedMotion, delay = 0 }: MetricCardProps) {
    const count = useCountUp(value, 1600, inView, decimals);

    return (
        <motion.div
            className="relative group"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={inView ? (reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : {}}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="relative p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden hover:border-brand-gold/20 transition-colors duration-500">
                {/* shimmer */}
                {!reducedMotion && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/[0.04] to-transparent pointer-events-none"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
                    />
                )}

                <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em] font-semibold mb-1.5">{label}</p>
                <p className="text-xl md:text-2xl font-black text-white tabular-nums leading-none">
                    {prefix}{count}{suffix}
                </p>
                {sub && (
                    <p className="text-[10px] text-gray-600 mt-1.5 leading-tight">{sub}</p>
                )}
            </div>
        </motion.div>
    );
}

/* ── main HUD ────────────────────────────────────────── */

export default function GeneticCommandHUD() {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });
    const reducedMotion = useReducedMotion();

    return (
        <motion.div
            ref={ref}
            className="relative w-full max-w-md lg:max-w-lg"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 30 }}
            animate={isInView ? (reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }) : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-brand-gold/[0.03] rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c0c]/90 backdrop-blur-md overflow-hidden">
                {/* Scan line */}
                <ScanLine reducedMotion={reducedMotion} />

                {/* ─ Header ─ */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/40" />
                            <span className="w-1 h-1 rounded-full bg-brand-gold/20" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            Genetic Command
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusDot label="Live" />
                        <StatusDot label="Sync" />
                    </div>
                </div>

                {/* ─ Metrics grid ─ */}
                <div className="grid grid-cols-2 gap-2.5 p-4">
                    <MetricCard
                        label="Elite Index"
                        value={94.8}
                        decimals={1}
                        sub="Índice médio de curadoria"
                        inView={isInView}
                        reducedMotion={reducedMotion}
                        delay={0.1}
                    />
                    <MetricCard
                        label="Aderência"
                        value={96}
                        suffix="%"
                        sub="Objetivo do criador"
                        inView={isInView}
                        reducedMotion={reducedMotion}
                        delay={0.2}
                    />
                    <MetricCard
                        label="Linhagens"
                        value={1240}
                        sub="Em monitoramento ativo"
                        inView={isInView}
                        reducedMotion={reducedMotion}
                        delay={0.3}
                    />
                    <MetricCard
                        label="Precisão"
                        value={98.2}
                        suffix="%"
                        decimals={1}
                        sub="Recomendação genética"
                        inView={isInView}
                        reducedMotion={reducedMotion}
                        delay={0.4}
                    />
                </div>

                {/* ─ Bases integradas ─ */}
                <div className="mx-4 mb-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">
                    <motion.div
                        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={isInView ? (reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : {}}
                        transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em] font-semibold mb-2.5">Bases Integradas</p>
                        <div className="flex flex-wrap gap-2">
                            {["ABCZ", "ANCP", "Geneplus"].map((base, i) => (
                                <motion.span
                                    key={base}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-gold/15 bg-brand-gold/[0.06] text-brand-gold text-[11px] font-bold tracking-wider uppercase"
                                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                                    animate={isInView ? (reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }) : {}}
                                    transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                                >
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                                    {base}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ─ Protocolos ─ */}
                <div className="mx-4 mb-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5">
                    <motion.div
                        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                        animate={isInView ? (reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }) : {}}
                        transition={{ duration: 0.5, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em] font-semibold mb-2.5">Protocolos de Seleção</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            {["Reprodução", "Carcaça", "Precocidade", "Leite", "Temperamento"].map((p) => (
                                <span key={p} className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-brand-gold/50" />
                                    {p}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ─ Footer ─ */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                    <span className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-medium">
                        Fórmula do Boi · Curadoria 24/7
                    </span>
                    <div className="flex items-center gap-1">
                        {!reducedMotion && [0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                className="w-1 h-1 rounded-full bg-brand-gold/40"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
