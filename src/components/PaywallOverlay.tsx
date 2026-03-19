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
        <div className={`relative overflow-hidden ${className}`}>
            <div className="blur-md pointer-events-none select-none" aria-hidden="true">
                {children}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center gap-3 text-center px-4 max-w-xs">
                    <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-brand-gold" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                        Crie sua conta gratuita para acessar dados completos
                    </p>
                    <Link
                        href={`/auth/signup?redirect=${encodeURIComponent(redirectPath)}`}
                        className="px-5 py-2 bg-brand-gold text-brand-black text-sm font-bold rounded-lg hover:bg-yellow-500 transition-colors uppercase tracking-wide"
                    >
                        Criar Conta
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
