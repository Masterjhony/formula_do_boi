import { createClient } from '@/utils/supabase/server';
import { Package, DollarSign, Users, UserCheck, MapPin, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // 1. Fetch Data
    const { data: products } = await supabase.from('products').select('*');
    const { count: breedersCount } = await supabase.from('breeders').select('*', { count: 'exact', head: true });
    // const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }); 
    // Assuming profiles table exists and user has access, otherwise fallback to 0 or mock
    // If profiles table restricted, we might need another way. For now let's try.
    // If it fails, handle gracefully.

    // Fallback for permissions issues or missing table
    let usersCount = 0;
    try {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        usersCount = count || 0;
    } catch (e) {
        console.error("Error fetching profiles:", e);
    }


    // 2. Calculate Metrics
    const totalAnimals = products?.length || 0;

    // Parse price strings "27.000,00" -> 27000.00
    let totalValue = 0;
    const categoryStats: Record<string, number> = {};
    const regionStats: Record<string, number> = {};

    products?.forEach(p => {
        // Price
        if (p.price) {
            const cleanPrice = p.price.toString().replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
            const val = parseFloat(cleanPrice);
            if (!isNaN(val)) totalValue += val;
        }

        // Category
        const cat = p.category || 'Outros';
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;

        // Region
        // Assuming location format like "Uberaba - MG" or just "MG"
        // Let's take the last part "MG" if contains hyphen, otherwise full string
        let region = 'Desconhecido';
        if (p.location) {
            const parts = p.location.split('-');
            if (parts.length > 1) region = parts[parts.length - 1].trim();
            else region = p.location.trim();
        }
        if (!region) region = 'Não Informado';
        regionStats[region] = (regionStats[region] || 0) + 1;
    });

    const avgValue = totalAnimals > 0 ? totalValue / totalAnimals : 0;
    const formattedAvgValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(avgValue);


    // 3. Prepare Chart Data (Sorted)
    const sortedCategories = Object.entries(categoryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5

    const sortedRegions = Object.entries(regionStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5


    return (
        <div className="space-y-8">
            <div className="border-b border-[#222222] pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
                    <p className="text-gray-400">Resumo das atividades e métricas do sistema.</p>
                </div>
                <div className="text-sm text-gray-500 bg-[#1A1A1A] px-3 py-1 rounded-full border border-[#222222]">
                    Atualizado em: {new Date().toLocaleDateString('pt-BR')}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Animais */}
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={80} className="text-[#B8860B]" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#222222] group-hover:border-[#B8860B]/50 transition-colors">
                            <Package className="w-6 h-6 text-[#B8860B]" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total de Animais</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-white">{totalAnimals}</span>
                    </div>
                </div>

                {/* Criadores */}
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserCheck size={80} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#222222] group-hover:border-blue-500/50 transition-colors">
                            <UserCheck className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Criadores</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-white">{breedersCount || 0}</span>
                    </div>
                </div>

                {/* Valor Médio */}
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} className="text-green-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#222222] group-hover:border-green-500/50 transition-colors">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Valor Médio</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-2xl font-bold text-white">{formattedAvgValue}</span>
                    </div>
                </div>

                {/* Usuários - Placeholder/Real */}
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} className="text-purple-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-[#1A1A1A] rounded-xl border border-[#222222] group-hover:border-purple-500/50 transition-colors">
                            <Users className="w-6 h-6 text-purple-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Usuários</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-white">{usersCount}</span>
                        <span className="text-sm text-gray-500 font-normal mb-1">cadastrados</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Category Chart */}
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-[#222222] pb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#B8860B]" />
                        Distribuição por Categoria
                    </h2>
                    <div className="space-y-4">
                        {sortedCategories.map(([cat, count]) => {
                            const percent = ((count / totalAnimals) * 100).toFixed(1);
                            return (
                                <div key={cat} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300 font-medium">{cat}</span>
                                        <span className="text-gray-500">{count} ({percent}%)</span>
                                    </div>
                                    <div className="w-full bg-[#222222] rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-[#B8860B] h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {sortedCategories.length === 0 && <p className="text-gray-600 italic">Sem dados disponíveis.</p>}
                    </div>
                </div>

                {/* Region Chart */}
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-[#222222] pb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-500" />
                        Disponibilidade por Região
                    </h2>
                    <div className="space-y-4">
                        {sortedRegions.map(([region, count]) => {
                            const percent = ((count / totalAnimals) * 100).toFixed(1);
                            return (
                                <div key={region} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-300 font-medium">{region}</span>
                                        <span className="text-gray-500">{count} ({percent}%)</span>
                                    </div>
                                    <div className="w-full bg-[#222222] rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-green-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {sortedRegions.length === 0 && <p className="text-gray-600 italic">Sem dados disponíveis.</p>}
                    </div>
                </div>
            </div>

            {/* Insights & Placeholder Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Google Analytics Placeholder */}
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl opacity-80">
                    <div className="flex justify-between items-start mb-6 border-b border-[#222222] pb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Google Analytics
                        </h2>
                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">Em Breve</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222] flex flex-col gap-1">
                            <span className="text-gray-500 text-xs uppercase">Acessos (Mês)</span>
                            <span className="text-2xl font-bold text-white">--</span>
                        </div>
                        <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222] flex flex-col gap-1">
                            <span className="text-gray-500 text-xs uppercase">Tempo Médio</span>
                            <span className="text-2xl font-bold text-white">--:--</span>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">
                        A integração com Google Analytics trará dados reais sobre o tráfego e comportamento dos usuários nas páginas.
                    </p>
                </div>

                {/* User Insights Information Placeholder */}
                <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-[#222222] pb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Insights de Usuários
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222]">
                            <p className="text-gray-400 text-sm mb-2">
                                <span className="text-white font-bold block mb-1">Qual o perfil predominante?</span>
                                Coletando dados sobre tamanho de fazenda, quantidade de animais e objetivos (iniciante/criador) a partir do cadastro completo.
                            </p>
                            <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden mt-2">
                                <div className="bg-purple-600 h-full w-[0%] animate-pulse"></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-1 block">Aguardando mais cadastros...</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Actions */}
            <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] shadow-xl">
                <h2 className="text-lg font-bold text-white mb-6 border-b border-[#222222] pb-4">Atalhos Rápidos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/products/new" className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222] hover:border-[#B8860B] hover:text-[#B8860B] transition-all flex flex-col items-center justify-center gap-2 text-gray-400 group">
                        <Package className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Novo Card</span>
                    </Link>
                    <Link href="/breeders" className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222] hover:border-blue-500 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 group">
                        <UserCheck className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Criadores</span>
                    </Link>
                    <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222] flex flex-col items-center justify-center gap-2 text-gray-600 cursor-not-allowed opacity-50">
                        <Users className="w-8 h-8" />
                        <span className="font-medium text-sm">Gerenciar Usuários</span>
                    </div>
                    <div className="p-4 bg-[#1A1A1A] rounded-xl border border-[#222222] flex flex-col items-center justify-center gap-2 text-gray-600 cursor-not-allowed opacity-50">
                        <Activity className="w-8 h-8" />
                        <span className="font-medium text-sm">Relatórios</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
