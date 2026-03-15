import { createClient } from '@/utils/supabase/server';
import { Package, DollarSign, Users, UserCheck, MapPin, TrendingUp, Activity, ExternalLink, Database } from 'lucide-react';
import Link from 'next/link';
import AnalyticsDashboardCard from '@/components/admin/AnalyticsDashboardCard';

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
            <div className="border-b border-gray-200 dark:border-[#222222] pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Visão Geral</h1>
                    <p className="text-gray-500 dark:text-gray-400">Resumo das atividades e métricas do sistema.</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-[#1A1A1A] px-3 py-1 rounded-full border border-gray-200 dark:border-[#222222]">
                    Atualizado em: {new Date().toLocaleDateString('pt-BR')}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Animais */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Package size={80} className="text-[#B8860B]" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] group-hover:border-[#B8860B]/50 transition-colors">
                            <Package className="w-6 h-6 text-[#B8860B]" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total de Animais</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{totalAnimals}</span>
                    </div>
                </div>

                {/* Criadores */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserCheck size={80} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] group-hover:border-blue-500/50 transition-colors">
                            <UserCheck className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Criadores</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{breedersCount || 0}</span>
                    </div>
                </div>

                {/* Valor Médio */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={80} className="text-green-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] group-hover:border-green-500/50 transition-colors">
                            <DollarSign className="w-6 h-6 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Médio</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{formattedAvgValue}</span>
                    </div>
                </div>

                {/* Usuários - Placeholder/Real */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl relative overflow-hidden group hover:border-[#B8860B]/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users size={80} className="text-purple-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] group-hover:border-purple-500/50 transition-colors">
                            <Users className="w-6 h-6 text-purple-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuários</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">{usersCount}</span>
                        <span className="text-sm text-gray-500 font-normal mb-1">cadastrados</span>
                    </div>
                </div>
            </div>

            {/* ERP System Access Banner */}
            <Link href="https://erp.formuladoboi.com" target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-black dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#1a1a1a] border border-[#B8860B]/30 shadow-2xl group transition-all duration-500 hover:shadow-[#B8860B]/20 hover:border-[#B8860B]/60">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#B8860B] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 dark:opacity-20 group-hover:opacity-60 dark:group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-[#B8860B] rounded-full mix-blend-multiply filter blur-[80px] opacity-30 dark:opacity-10 group-hover:opacity-50 dark:group-hover:opacity-30 transition-opacity duration-500"></div>
                
                <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B8860B]/20 to-transparent border border-[#B8860B]/30 text-[#B8860B] shadow-[0_0_15px_rgba(184,134,11,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(184,134,11,0.4)] transition-all duration-500">
                            <Database size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                                    FÓRMULA DO BOI | <span className="text-[#B8860B]">ERP</span>
                                </h2>
                                <span className="px-2.5 py-1 rounded-md bg-[#B8860B]/20 border border-[#B8860B]/50 text-[#B8860B] text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                                    Acesso Exclusivo
                                </span>
                            </div>
                            <p className="text-gray-300 dark:text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
                                Acesse o Sistema de Gestão Empresarial integrado. Controle financeiro, estoque, contábil e muito mais em um ambiente premium e centralizado.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <div className="flex items-center justify-center gap-2 bg-[#B8860B] hover:bg-[#9a7009] text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 shadow-[0_4px_14px_0_rgba(184,134,11,0.39)] hover:shadow-[0_6px_20px_rgba(184,134,11,0.23)] group-hover:-translate-y-1 w-full md:w-auto cursor-pointer">
                            <span>Acessar o ERP</span>
                            <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Category Chart */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-[#222222] pb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#B8860B]" />
                        Distribuição por Categoria
                    </h2>
                    <div className="space-y-4">
                        {sortedCategories.map(([cat, count]) => {
                            const percent = ((count / totalAnimals) * 100).toFixed(1);
                            return (
                                <div key={cat} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{cat}</span>
                                        <span className="text-gray-500">{count} ({percent}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-[#222222] rounded-full h-2 overflow-hidden">
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
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-[#222222] pb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-500" />
                        Disponibilidade por Região
                    </h2>
                    <div className="space-y-4">
                        {sortedRegions.map(([region, count]) => {
                            const percent = ((count / totalAnimals) * 100).toFixed(1);
                            return (
                                <div key={region} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{region}</span>
                                        <span className="text-gray-500">{count} ({percent}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-[#222222] rounded-full h-2 overflow-hidden">
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

                {/* Google Analytics */}
                <AnalyticsDashboardCard />

                {/* User Insights Information Placeholder */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-[#222222] pb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        Insights de Usuários
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222]">
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                                <span className="text-gray-900 dark:text-white font-bold block mb-1">Qual o perfil predominante?</span>
                                Coletando dados sobre tamanho de fazenda, quantidade de animais e objetivos (iniciante/criador) a partir do cadastro completo.
                            </p>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-[#222222] rounded-full overflow-hidden mt-2">
                                <div className="bg-purple-600 h-full w-[0%] animate-pulse"></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-1 block">Aguardando mais cadastros...</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-[#222222] pb-4">Atalhos Rápidos</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/products/new" className="p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] hover:border-[#B8860B] hover:text-[#B8860B] transition-all flex flex-col items-center justify-center gap-2 text-gray-400 group">
                        <Package className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Novo Card</span>
                    </Link>
                    <Link href="/breeders" className="p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] hover:border-blue-500 hover:text-blue-500 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 group">
                        <UserCheck className="w-8 h-8 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Criadores</span>
                    </Link>
                    <div className="p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] flex flex-col items-center justify-center gap-2 text-gray-600 cursor-not-allowed opacity-50">
                        <Users className="w-8 h-8" />
                        <span className="font-medium text-sm">Gerenciar Usuários</span>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] flex flex-col items-center justify-center gap-2 text-gray-600 cursor-not-allowed opacity-50">
                        <Activity className="w-8 h-8" />
                        <span className="font-medium text-sm">Relatórios</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
