import { createClient } from '@/utils/supabase/server';
import { Package, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
    const supabase = createClient();

    // Create a client instance first
    const client = await supabase;
    const { data: products } = await client.from('products').select('*');

    return (
        <div className="space-y-8">
            <div className="border-b border-[#222222] pb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
                <p className="text-gray-400">Resumo das atividades e métricas do sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={80} className="text-[#B8860B]" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#222222] group-hover:border-[#B8860B]/50 transition-colors">
                            <Package className="w-6 h-6 text-[#B8860B]" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total de Cards</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-white">{products?.length || 0}</span>
                        <span className="text-sm text-green-400 font-medium mb-1.5 flex items-center gap-1">
                            +1 <span className="text-gray-600 font-normal text-xs">recentemente</span>
                        </span>
                    </div>
                </div>

                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} className="text-green-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#222222] group-hover:border-green-500/50 transition-colors">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Vendas (Mês)</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-white">R$ 0</span>
                        <span className="text-sm text-gray-500 font-medium mb-1.5 flex items-center gap-1">
                            0% <span className="text-gray-600 font-normal text-xs">sem dados</span>
                        </span>
                    </div>
                </div>

                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#222222] group-hover:border-blue-500/50 transition-colors">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Novos Clientes</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-white">0</span>
                        <span className="text-sm text-gray-500 font-medium mb-1.5 flex items-center gap-1">
                            <span className="text-gray-600 font-normal text-xs">aguardando dados</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-[#222222] pb-4">Atividade Recente</h2>
                    <div className="text-center py-12 text-gray-600 italic">
                        Nenhuma atividade registrada.
                    </div>
                </div>

                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-[#222222] pb-4">Atalhos Rápidos</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/products/new" className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222] hover:border-[#B8860B] hover:text-[#B8860B] transition-all flex flex-col items-center justify-center gap-2 text-gray-400 group">
                            <Package className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">Novo Card</span>
                        </Link>
                        <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222] flex flex-col items-center justify-center gap-2 text-gray-600 cursor-not-allowed">
                            <Users className="w-8 h-8 opacity-50" />
                            <span className="font-medium text-sm">Gerenciar Usuários</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
