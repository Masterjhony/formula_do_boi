import { Building2 } from 'lucide-react';

export default function CentralBelaVista() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#A0792E]/20 to-[#D4A85C]/10 flex items-center justify-center border border-[#A0792E]/20">
                <Building2 size={36} className="text-[#A0792E]" />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Central Bela Vista — Operações</h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Estoque de doses por touro, agenda de coletas, envios e rastreabilidade por lote. Em desenvolvimento para fechar o loop com os criadores da Aceleradora.
                </p>
            </div>
            <span className="px-4 py-1.5 rounded-full bg-[#A0792E]/10 text-[#A0792E] text-sm font-medium border border-[#A0792E]/20">
                Em breve
            </span>
        </div>
    );
}
