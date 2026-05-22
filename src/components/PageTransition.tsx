"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
    isVisible: boolean;
}

export default function PageTransition({ isVisible }: PageTransitionProps) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="page-transition-overlay"
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#141414] pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                    {/* Glow radial de fundo */}
                    {!prefersReducedMotion && (
                        <motion.div
                            className="absolute w-[500px] h-[500px] rounded-full"
                            style={{
                                background: "radial-gradient(circle, rgba(197,160,89,0.12) 0%, transparent 70%)",
                            }}
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        />
                    )}

                    {/* Logo */}
                    <motion.div
                        className="relative z-10 flex flex-col items-center gap-6"
                        initial={prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.82, y: 8 }}
                        animate={prefersReducedMotion
                            ? { opacity: 1 }
                            : { opacity: 1, scale: 1, y: 0 }}
                        exit={prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.94, y: -6 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Logo com glow pulsante */}
                        <motion.img
                            src="/logo_complete.svg"
                            alt="Fórmula do Boi"
                            className="w-56 md:w-72 h-auto select-none"
                            draggable={false}
                            animate={prefersReducedMotion ? {} : {
                                filter: [
                                    "drop-shadow(0 0 0px rgba(197,160,89,0))",
                                    "drop-shadow(0 0 18px rgba(197,160,89,0.55))",
                                    "drop-shadow(0 0 6px rgba(197,160,89,0.25))",
                                ],
                            }}
                            transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                        />

                        {/* Barra de progresso dourada */}
                        {!prefersReducedMotion && (
                            <motion.div
                                className="h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent rounded-full overflow-hidden"
                                style={{ width: "120px" }}
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: [0, 1, 0.7] }}
                                transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                            />
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
