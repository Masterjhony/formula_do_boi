import { Award } from 'lucide-react';

export default function LotesTouros() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#B8860B]/20 to-[#D4AF37]/10 flex items-center justify-center border border-[#B8860B]/20">
                <Award size={36} className="text-[#B8860B]" />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lotes Touros</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Gestão de lotes de touros em desenvolvimento. Em breve será possível cadastrar e gerenciar lotes de sêmen por touro.
                </p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-[#B8860B]/10 text-[#B8860B] text-sm font-medium border border-[#B8860B]/20">
                Em breve
            </span>
        </div>
    );
}
