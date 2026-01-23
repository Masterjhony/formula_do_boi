"use client";

import { useState } from "react";
import { MessageCircle, X, ArrowRight } from "lucide-react";

const whatsappGroups = [
    {
        name: "Shopping de Matrizes Nelore P.O",
        link: "https://chat.whatsapp.com/E0KH0Z5IL4x1fvEzLtaX03"
    },
    {
        name: "Shopping de Touros - Nelore P.O",
        link: "https://chat.whatsapp.com/JYxJPWfkoHHLZfosHlywN9"
    }
];

export default function WhatsappSection() {
    const [showModal, setShowModal] = useState(false);

    return (
        <section className="py-20 bg-brand-gold relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 pattern-grid-lg"></div>
            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-brand-black mb-4 uppercase tracking-tight">
                    Entre nos grupos para receber ofertas exclusivas
                </h2>
                <p className="text-brand-black/80 max-w-2xl mx-auto mb-8 font-medium">
                    Tenha acesso a ofertas exclusivas e oportunidades selecionadas em nossos grupos de WhatsApp.
                </p>
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-8 py-4 bg-brand-black text-white font-bold rounded-lg hover:bg-gray-900 transition-colors uppercase tracking-wide flex items-center gap-2"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Acessar Grupos
                    </button>
                </div>
            </div>

            {/* WhatsApp Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-green-500" />
                                Grupos VIP WhatsApp
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-gray-400 text-sm mb-4">
                                Entre em nossos grupos exclusivos para acompanhar as ofertas e novidades em primeira mão.
                            </p>
                            {whatsappGroups.map((group, index) => (
                                <a
                                    key={index}
                                    href={group.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-green-500/10 border border-white/5 hover:border-green-500/50 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <MessageCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">
                                            {group.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 truncate">{group.link}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
