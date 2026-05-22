'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, Eye, MoreHorizontal, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ProductListClient({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBatchUpdating, setIsBatchUpdating] = useState(false);
    const supabase = createClient();

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este card? Esta ação não pode ser desfeita.')) {
            return;
        }

        setDeletingId(id);
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);

            if (error) throw error; // The policy I set allows admins to delete

            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Erro ao excluir produto. Verifique se você tem permissão.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleToggleActive = async (product: any) => {
        const newActiveStatus = !product.active;
        try {
            const { error } = await supabase
                .from('products')
                .update({ active: newActiveStatus })
                .eq('id', product.id);

            if (error) throw error;

            setProducts(products.map(p => 
                p.id === product.id ? { ...p, active: newActiveStatus } : p
            ));
        } catch (error) {
            console.error('Error toggling visibility:', error);
            alert('Erro ao atualizar visibilidade.');
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todos');

    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.details?.registro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'Todos' || product.category?.includes(categoryFilter) || (categoryFilter === 'Outros' && !['Touro', 'Matriz', 'Sêmen', 'Embrião'].some(c => product.category?.includes(c)));

        return matchesSearch && matchesCategory;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredProducts.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]
        );
    };

    const handleBatchStatusUpdate = async (newStatus: string) => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Tem certeza que deseja marcar ${selectedIds.length} cards como "${newStatus}"?`)) return;

        setIsBatchUpdating(true);
        try {
            const updates = selectedIds.map(async (id) => {
                const product = products.find(p => p.id === id);
                if (!product) return;
                
                const currentDetails = product.details || {};
                const newDetails = { ...currentDetails, status: newStatus };

                const { error } = await supabase
                    .from('products')
                    .update({ details: newDetails })
                    .eq('id', id);

                if (error) throw error;
                
                return { id, newDetails };
            });

            const results = await Promise.all(updates);

            setProducts(currentProducts => currentProducts.map(p => {
                const updated = results.find(r => r && r.id === p.id);
                if (updated) {
                    return { ...p, details: updated.newDetails };
                }
                return p;
            }));

            setSelectedIds([]);
        } catch (error) {
            console.error('Error in batch update:', error);
            alert('Erro ao atualizar status em lote.');
        } finally {
            setIsBatchUpdating(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por nome, registro..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 sm:py-3 bg-white dark:bg-[#1d1d1d] border border-gray-200 dark:border-[#2e2e2e] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:outline-none focus:border-[#A0792E]/50 focus:ring-1 focus:ring-[#A0792E]/50 transition-all"
                    />
                    {/* Search Icon could go here if imported */}
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 sm:py-3 bg-white dark:bg-[#1d1d1d] border border-gray-200 dark:border-[#2e2e2e] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#A0792E]/50 cursor-pointer sm:min-w-[200px]"
                >
                    <option value="Todos">Todas as Categorias</option>
                    <option value="Touro">Touros</option>
                    <option value="Matriz">Matrizes</option>
                    <option value="Embrião">Embriões</option>
                    <option value="Sêmen">Sêmen</option>
                    <option value="Novilha">Novilhas</option>
                </select>
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-white dark:bg-[#1d1d1d] border border-[#A0792E]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                        <span className="bg-[#A0792E]/10 text-[#A0792E] font-bold px-3 py-1 rounded-full text-sm">
                            {selectedIds.length} selecionado{selectedIds.length > 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">Ações em lote:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button 
                            onClick={() => handleBatchStatusUpdate('Disponível')}
                            disabled={isBatchUpdating}
                            className="px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-500 hover:bg-green-500/20 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            Marcar Disponível
                        </button>
                        <button 
                            onClick={() => handleBatchStatusUpdate('Reservado')}
                            disabled={isBatchUpdating}
                            className="px-4 py-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            Marcar Reservado
                        </button>
                        <button 
                            onClick={() => handleBatchStatusUpdate('Vendido')}
                            disabled={isBatchUpdating}
                            className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500/20 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            Marcar Vendido
                        </button>
                        <div className="h-6 w-px bg-gray-200 dark:bg-[#3f3f3f] hidden sm:block mx-1"></div>
                        <button 
                            onClick={async () => {
                                if (!selectedIds.length) return;
                                if (!window.confirm(`Tem certeza que deseja OCULTAR ${selectedIds.length} cards?`)) return;
                                setIsBatchUpdating(true);
                                try {
                                    const { error } = await supabase.from('products').update({ active: false }).in('id', selectedIds);
                                    if (error) throw error;
                                    setProducts(products.map(p => selectedIds.includes(p.id) ? { ...p, active: false } : p));
                                    setSelectedIds([]);
                                } catch (error) {
                                    console.error('Error hiding cards:', error);
                                    alert('Erro ao ocultar cards.');
                                } finally {
                                    setIsBatchUpdating(false);
                                }
                            }}
                            disabled={isBatchUpdating}
                            className="px-4 py-2 bg-gray-500/10 text-gray-600 dark:text-gray-400 hover:bg-gray-500/20 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            Ocultar
                        </button>
                        <button 
                            onClick={async () => {
                                if (!selectedIds.length) return;
                                if (!window.confirm(`Tem certeza que deseja MOSTRAR ${selectedIds.length} cards?`)) return;
                                setIsBatchUpdating(true);
                                try {
                                    const { error } = await supabase.from('products').update({ active: true }).in('id', selectedIds);
                                    if (error) throw error;
                                    setProducts(products.map(p => selectedIds.includes(p.id) ? { ...p, active: true } : p));
                                    setSelectedIds([]);
                                } catch (error) {
                                    console.error('Error showing cards:', error);
                                    alert('Erro ao mostrar cards.');
                                } finally {
                                    setIsBatchUpdating(false);
                                }
                            }}
                            disabled={isBatchUpdating}
                            className="px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-500 hover:bg-blue-500/20 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                        >
                            Mostrar
                        </button>
                    </div>
                </div>
            )}

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {filteredProducts?.map((product) => {
                    const status = product.details?.status || 'Disponível';
                    const isVendido = status.includes('Vendido');
                    const isReservado = status.includes('Reservado');
                    const statusBadge = isVendido
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : isReservado
                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                            : 'bg-green-500/10 text-green-500 border-green-500/20';
                    return (
                        <div key={product.id} className={`bg-white dark:bg-[#1d1d1d] rounded-2xl border border-gray-200 dark:border-[#2e2e2e] p-3 ${product.active === false ? 'opacity-60' : ''}`}>
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-[#3f3f3f] text-[#A0792E] focus:ring-[#A0792E]"
                                    checked={selectedIds.includes(product.id)}
                                    onChange={() => handleSelectOne(product.id)}
                                    disabled={isBatchUpdating}
                                />
                                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-[#2e2e2e] overflow-hidden flex-shrink-0 border border-gray-200 dark:border-[#3f3f3f]">
                                    {product.image_url?.endsWith('.mp4') ? (
                                        <video src={product.image_url} className="w-full h-full object-cover" muted />
                                    ) : product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="w-3 h-3 bg-gray-300 dark:bg-[#3f3f3f] rounded-full" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{product.name}</p>
                                    <p className="text-[11px] text-gray-500 font-mono truncate">{product.details?.registro || '-'}</p>
                                    <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#262626] text-gray-600 dark:text-gray-400 font-medium">{product.category}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${statusBadge}`}>{isVendido ? 'Vendido' : isReservado ? 'Reservado' : 'Disponível'}</span>
                                        {product.active === false && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 dark:bg-[#262626] text-gray-500 font-medium">Oculto</span>
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-[#A0792E] mt-1.5">
                                        {typeof product.price === 'number'
                                            ? `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                            : product.price || 'Consulte'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-[#2e2e2e]">
                                <Link href={`/products/${product.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#A0792E]/10 text-[#A0792E] text-xs font-semibold">
                                    <Edit size={13} />
                                    Editar
                                </Link>
                                <button
                                    onClick={() => handleToggleActive(product)}
                                    className="flex items-center justify-center w-10 h-9 rounded-xl bg-blue-500/10 text-blue-500"
                                    title={product.active === false ? 'Mostrar' : 'Ocultar'}
                                >
                                    <Eye size={15} className={product.active === false ? 'opacity-50' : ''} />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    disabled={deletingId === product.id}
                                    className="flex items-center justify-center w-10 h-9 rounded-xl bg-red-500/10 text-red-500 disabled:opacity-50"
                                    title="Excluir"
                                >
                                    {deletingId === product.id ? <div className="w-4 h-4 border-2 border-red-500 rounded-full animate-spin border-t-transparent" /> : <Trash2 size={15} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
                {(!filteredProducts || filteredProducts.length === 0) && (
                    <div className="bg-white dark:bg-[#1d1d1d] rounded-2xl border border-gray-200 dark:border-[#2e2e2e] py-10 px-4 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-[#262626] rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-gray-500 dark:text-gray-600" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Nenhum card encontrado.</p>
                    </div>
                )}
            </div>

            <div className="hidden md:block bg-white dark:bg-[#1d1d1d] rounded-2xl shadow-xl border border-gray-200 dark:border-[#2e2e2e] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-[#262626] border-b border-gray-200 dark:border-[#2e2e2e]">
                            <tr>
                                <th className="px-6 py-5 w-12 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 dark:border-[#3f3f3f] text-[#A0792E] focus:ring-[#A0792E]"
                                        checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                                        onChange={handleSelectAll}
                                        disabled={isBatchUpdating}
                                    />
                                </th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Animal</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Preço</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Disponibilidade</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Visibilidade</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#2e2e2e]">
                            {filteredProducts?.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#262626]/50 transition-colors group">
                                    <td className="px-6 py-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-300 dark:border-[#3f3f3f] text-[#A0792E] focus:ring-[#A0792E]"
                                            checked={selectedIds.includes(product.id)}
                                            onChange={() => handleSelectOne(product.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            disabled={isBatchUpdating}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-[#2e2e2e] overflow-hidden relative flex-shrink-0 border border-gray-200 dark:border-[#3f3f3f] group-hover:border-[#A0792E]/50 transition-colors">
                                                {product.image_url?.endsWith('.mp4') ? (
                                                    <video src={product.image_url} className="w-full h-full object-cover" muted />
                                                ) : product.image_url?.includes('youtube.com') || product.image_url?.includes('youtu.be') ? (
                                                    /* Attempt to get YouTube thumbnail or show video icon */
                                                    <div className="relative w-full h-full">
                                                        {/* Simple logic to try to extract ID, or just fallback to an image if possible. 
                                                            For stability, let's just use a standard img with the thumbnail url if we can naive-extract, 
                                                            or just use the product image if it's NOT the video url. 
                                                            
                                                            Actually, the issue is that product.image_url is the video link itself? 
                                                            If so, we can't show it as an image. 
                                                            Let's check if we can extract the ID.
                                                        */}
                                                        <img
                                                            src={`https://img.youtube.com/vi/${product.image_url.split('v=')[1]?.split('&')[0] || product.image_url.split('/').pop()}/0.jpg`}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="relative w-full h-full">
                                                        {product.image_url ? (
                                                            /* Using standard img to avoid next/image domain config issues for external user-provided urls */
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-[#262626]">
                                                                <div className="w-4 h-4 bg-gray-300 dark:bg-[#3f3f3f] rounded-full" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-[#A0792E] transition-colors">{product.name}</div>
                                                <div className="text-xs text-gray-500 font-mono mt-0.5">{product.details?.registro || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-medium">{product.category}</td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                                        {typeof product.price === 'number'
                                            ? `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                            : product.price || 'Consulte'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${product.details?.status?.includes('Vendido')
                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            }`}>
                                            {product.details?.status || 'Disponível'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${product.details?.status?.includes('Vendido')
                                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                : product.details?.status?.includes('Reservado')
                                                    ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                                                    : 'bg-green-500/10 text-green-500 border border-green-500/20'
                                            }`}>
                                            {product.details?.status?.includes('Vendido') ? 'Vendido' : (product.details?.status?.includes('Reservado') ? 'Reservado' : 'Disponível')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleActive(product);
                                            }}
                                            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                                product.active !== false
                                                    ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                                                    : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                                            }`}
                                            title={product.active !== false ? 'Ocultar Card' : 'Mostrar Card'}
                                        >
                                            {product.active !== false ? (
                                                <Eye size={14} className="mr-1" />
                                            ) : (
                                                <Eye size={14} className="mr-1 opacity-50" />
                                            )}
                                            {product.active !== false ? 'Visível' : 'Oculto'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/products/${product.id}`} className="p-2.5 text-gray-400 hover:text-[#A0792E] hover:bg-[#A0792E]/10 rounded-lg transition-all" title="Editar">
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deletingId === product.id}
                                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                                                title="Excluir"
                                            >
                                                {deletingId === product.id ? <div className="w-4 h-4 border-2 border-red-500 rounded-full animate-spin border-t-transparent" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {(!filteredProducts || filteredProducts.length === 0) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-[#262626] rounded-full flex items-center justify-center">
                                                <AlertCircle className="w-6 h-6 text-gray-500 dark:text-gray-600" />
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum card encontrado.</p>
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
