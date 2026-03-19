"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

interface PaywallOverlayProps {
    isAuthenticated: boolean;
    redirectPath: string;
    children: React.ReactNode;
    className?: string;
}

export default function PaywallOverlay({ isAuthenticated, redirectPath, children, className = "" }: PaywallOverlayProps) {
    if (isAuthenticated) return <>{children}</>;

    return (
        <div className={`relative overflow-hidden min-h-[200px] ${className}`}>
            <div className="blur-sm pointer-events-none select-none" aria-hidden="true">
                {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] z-10 p-4">
                <div className="flex flex-col items-center gap-2.5 text-center w-full max-w-[260px]">
                    <div className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                        <Lock className="w-4 h-4 text-brand-gold" />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700 leading-snug">
                        Crie sua conta para ver dados completos
                    </p>
                    <Link
                        href={`/auth/signup?redirect=${encodeURIComponent(redirectPath)}`}
                        className="w-full py-2 bg-brand-gold text-brand-black text-xs sm:text-sm font-bold rounded-lg hover:bg-yellow-500 transition-colors uppercase tracking-wide text-center"
                    >
                        Criar Conta Grátis
                    </Link>
                    <Link
                        href={`/login?next=${encodeURIComponent(redirectPath)}`}
                        className="text-xs text-gray-500 hover:text-brand-gold transition-colors"
                    >
                        Já tenho conta
                    </Link>
                </div>
            </div>
        </div>
    );
}
