import { createClient } from '@/utils/supabase/server';
import { Package, Search, Plus, Filter, Tag, MapPin, AlertCircle, Layers, Activity } from 'lucide-react';

export default async function EstoquePage() {
    const supabase = await createClient();

    // Fetch products
    const { data: products } = await supabase
        .from('erp_inventory_products')
        .select(`
            id,
            name,
            sku,
            unit_measure,
            is_active,
            category,
            sub_category,
            stock:erp_inventory_stock(quantity, min_quantity, warehouse:erp_inventory_warehouses(name))
        `)
        .order('name');

    const totalProducts = products?.length || 0;

    const categorizedStats = products?.reduce((acc: any, p: any) => {
        const cat = p.category || 'general';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const totalAnimals = categorizedStats?.['animal'] || 0;
    const totalSemen = categorizedStats?.['semen'] || 0;
    const totalEmbryos = categorizedStats?.['embryo'] || 0;

    return (
        <div className="space-y-5 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-4">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#D4AF37] text-transparent bg-clip-text">
                        Estoque & Inventário
                    </h2>
                    <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                        Gestão de rebanho, genética e insumos
                    </p>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-teal-500/50 text-gray-900 dark:text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-teal-500/20">
                        <MapPin className="w-4 h-4 text-teal-500" /> <span className="hidden sm:inline">Locais/</span>Baías
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-[#B8860B] to-[#9A7209] text-black rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-[#B8860B]/20 hover:scale-105 transition-all">
                        <Plus className="w-4 h-4" /> Novo<span className="hidden sm:inline"> Produto</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Package className="w-14 h-14 sm:w-24 sm:h-24 text-[#D4AF37]" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Total de Itens</p>
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-1 sm:mt-2 tracking-tight">{totalProducts}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Activity className="w-14 h-14 sm:w-24 sm:h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Animais</p>
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-1 sm:mt-2 tracking-tight">{totalAnimals}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Layers className="w-14 h-14 sm:w-24 sm:h-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Sêmen</p>
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-1 sm:mt-2 tracking-tight">{totalSemen}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Tag className="w-14 h-14 sm:w-24 sm:h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Embriões</p>
                        <h3 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-1 sm:mt-2 tracking-tight">{totalEmbryos}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-gray-50 dark:bg-[#141414]">
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">Catálogo de Ativos e Genética</h3>
                    <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80 group/search">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#555] group-focus-within/search:text-[#D4AF37] transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar por nome, SKU..."
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl focus:outline-none focus:border-[#B8860B]/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] transition-all"
                            />
                        </div>
                        <button className="shrink-0 px-3 sm:px-4 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-xl text-gray-500 dark:text-[#888] hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-[#1A1A1A] transition-colors text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                            <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filtros</span>
                        </button>
                    </div>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-100 dark:divide-[#1A1A1A]">
                    {products && products.length > 0 ? (
                        products.map((product: any) => {
                            const totalQty = product.stock?.reduce((acc: number, item: any) => acc + Number(item.quantity), 0) || 0;
                            const hasLowStock = product.stock?.some((item: any) => Number(item.quantity) <= Number(item.min_quantity));
                            const catColors: Record<string, string> = {
                                'animal': 'bg-blue-500/10 text-blue-400',
                                'semen': 'bg-purple-500/10 text-purple-400',
                                'embryo': 'bg-emerald-500/10 text-emerald-400',
                                'general': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                            };
                            const cColor = catColors[product.category] || catColors['general'];
                            const displayCat = product.category === 'animal' ? 'Animal' : product.category === 'semen' ? 'Sêmen' : product.category === 'embryo' ? 'Embrião' : 'Geral';
                            return (
                                <div key={product.id} className="p-4 flex items-start gap-3">
                                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${product.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-300 dark:bg-[#333]'}`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{product.name}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-widest mt-0.5">
                                            {product.sku ? `${product.sku} · ` : ''}{product.unit_measure || 'Unidade'}
                                        </p>
                                        <div className="flex items-center flex-wrap gap-1.5 mt-2">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${cColor}`}>{displayCat}</span>
                                            {product.stock?.slice(0, 2).map((s: any, i: number) => s.warehouse?.name && (
                                                <span key={i} className="text-[10px] bg-gray-100 dark:bg-[#222] px-1.5 py-0.5 rounded text-gray-500 dark:text-[#888]">{s.warehouse.name}</span>
                                            ))}
                                            {product.stock && product.stock.length > 2 && (
                                                <span className="text-[10px] text-gray-400">+{product.stock.length - 2}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-lg font-extrabold ${hasLowStock ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>{totalQty}</p>
                                        {hasLowStock && <AlertCircle className="w-3.5 h-3.5 inline-block text-amber-500" />}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                            <Package className="w-10 h-10 text-gray-300 dark:text-[#333]" />
                            <p className="text-gray-400 dark:text-[#666] font-bold uppercase tracking-widest text-xs">Estoque Vazio</p>
                        </div>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222] uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5 font-bold">Produto / Ativo</th>
                                <th className="px-6 py-5 font-bold">SKU</th>
                                <th className="px-6 py-5 font-bold">Categoria</th>
                                <th className="px-6 py-5 font-bold text-right">Qtd. Total</th>
                                <th className="px-6 py-5 font-bold">Armazenamento</th>
                                <th className="px-6 py-5 font-bold text-center">Ativo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#1A1A1A]">
                            {products && products.length > 0 ? (
                                products.map((product: any) => {
                                    const totalQty = product.stock?.reduce((acc: number, item: any) => acc + Number(item.quantity), 0) || 0;
                                    const hasLowStock = product.stock?.some((item: any) => Number(item.quantity) <= Number(item.min_quantity));

                                    const catColors: Record<string, string> = {
                                        'animal': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                                        'semen': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
                                        'embryo': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                                        'general': 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                    };
                                    const cColor = catColors[product.category] || catColors['general'];
                                    const displayCat = product.category === 'animal' ? 'Animal' : product.category === 'semen' ? 'Sêmen' : product.category === 'embryo' ? 'Embrião' : 'Geral';

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-extrabold text-gray-900 dark:text-white">{product.name}</div>
                                                <div className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-widest mt-1">
                                                    {product.sub_category ? `${product.sub_category} • ` : ''}{product.unit_measure || 'Unidade'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-400 dark:text-[#888] font-mono text-xs">
                                                {product.sku || '-'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${cColor}`}>
                                                    {displayCat}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-5 text-right font-extrabold text-lg ${hasLowStock ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                                                {totalQty}
                                                {hasLowStock && <AlertCircle className="w-4 h-4 inline-block ml-2 text-amber-500 opacity-80" />}
                                            </td>
                                            <td className="px-6 py-5 text-gray-400 dark:text-[#888] text-xs">
                                                {product.stock?.length > 0
                                                    ? <div className="flex flex-wrap gap-1">
                                                        {product.stock.map((s: any, i: number) => (
                                                            <span key={i} className="bg-gray-100 dark:bg-[#222] px-2 py-1 rounded">{s.warehouse?.name}</span>
                                                        ))}
                                                      </div>
                                                    : <span className="text-gray-300 dark:text-[#555] italic">Não alocado</span>}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex justify-center">
                                                    <div className={`w-3 h-3 rounded-full ${product.is_active ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-gray-300 dark:bg-[#333]'}`}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <Package className="w-12 h-12 text-gray-300 dark:text-[#333]" />
                                            <p className="text-gray-400 dark:text-[#666] font-bold uppercase tracking-widest text-xs">Estoque Vazio</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
