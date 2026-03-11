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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#D4AF37] text-transparent bg-clip-text">
                        Estoque & Inventário
                    </h2>
                    <p className="mt-2 text-sm text-[#888] font-medium tracking-wider uppercase">
                        Gestão de rebanho, genética e insumos operacionais
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-[#111] border border-[#333] hover:border-teal-500/50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-teal-500/20">
                        <MapPin className="w-4 h-4 text-teal-500" /> Locais/Baías
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#9A7209] text-black rounded-xl text-sm font-bold shadow-lg shadow-[#B8860B]/20 hover:scale-105 transition-all">
                        <Plus className="w-4 h-4" /> Novo Produto
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Package className="w-24 h-24 text-[#D4AF37]" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Total de Itens</p>
                        <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{totalProducts}</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Activity className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Animais Registrados</p>
                        <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{totalAnimals}</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Layers className="w-24 h-24 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Doses de Sêmen</p>
                        <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{totalSemen}</h3>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Tag className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-[#888] uppercase tracking-widest">Embriões</p>
                        <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{totalEmbryos}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-[#0F0F0F] rounded-2xl border border-[#222] shadow-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141414]">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Catálogo de Ativos e Genética</h3>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-80 group/search">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#555] group-focus-within/search:text-[#D4AF37] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nome, SKU, categoria..." 
                                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#0A0A0A] border border-[#222] rounded-xl focus:outline-none focus:border-[#B8860B]/50 text-white placeholder:text-[#444] transition-all"
                            />
                        </div>
                        <button className="px-4 py-2.5 bg-[#111] border border-[#222] rounded-xl text-[#888] hover:text-white hover:bg-[#1A1A1A] transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filtros
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[10px] text-[#888] bg-[#0A0A0A] border-b border-[#222] uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-5 font-bold">Produto / Ativo</th>
                                <th className="px-6 py-5 font-bold">SKU</th>
                                <th className="px-6 py-5 font-bold">Categoria</th>
                                <th className="px-6 py-5 font-bold text-right">Qtd. Total</th>
                                <th className="px-6 py-5 font-bold">Armazenamento</th>
                                <th className="px-6 py-5 font-bold text-center">Ativo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A1A1A]">
                            {products && products.length > 0 ? (
                                products.map((product: any) => {
                                    const totalQty = product.stock?.reduce((acc: number, item: any) => acc + Number(item.quantity), 0) || 0;
                                    const hasLowStock = product.stock?.some((item: any) => Number(item.quantity) <= Number(item.min_quantity));
                                    
                                    const catColors: Record<string, string> = {
                                        'animal': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                                        'semen': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
                                        'embryo': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                                        'general': 'bg-gray-800 text-gray-400 border border-gray-700'
                                    };
                                    const cColor = catColors[product.category] || catColors['general'];
                                    const displayCat = product.category === 'animal' ? 'Animal' : product.category === 'semen' ? 'Sêmen' : product.category === 'embryo' ? 'Embrião' : 'Geral';

                                    return (
                                        <tr key={product.id} className="hover:bg-[#141414] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-extrabold text-white">{product.name}</div>
                                                <div className="text-[10px] text-[#666] uppercase tracking-widest mt-1">
                                                    {product.sub_category ? `${product.sub_category} • ` : ''}{product.unit_measure || 'Unidade'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-[#888] font-mono text-xs">
                                                {product.sku || '-'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${cColor}`}>
                                                    {displayCat}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-5 text-right font-extrabold text-lg ${hasLowStock ? 'text-amber-500' : 'text-white'}`}>
                                                {totalQty}
                                                {hasLowStock && <AlertCircle className="w-4 h-4 inline-block ml-2 text-amber-500 opacity-80" />}
                                            </td>
                                            <td className="px-6 py-5 text-[#888] text-xs">
                                                {product.stock?.length > 0 
                                                    ? <div className="flex flex-wrap gap-1">
                                                        {product.stock.map((s: any, i:number) => (
                                                            <span key={i} className="bg-[#222] px-2 py-1 rounded">{s.warehouse?.name}</span>
                                                        ))}
                                                      </div>
                                                    : <span className="text-[#555] italic">Não alocado</span>}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex justify-center">
                                                    <div className={`w-3 h-3 rounded-full ${product.is_active ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-[#333]'}`}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <Package className="w-12 h-12 text-[#333]" />
                                            <p className="text-[#666] font-bold uppercase tracking-widest text-xs">Estoque Vazio</p>
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
