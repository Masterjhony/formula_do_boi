'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Trash2, Eye, MoreHorizontal, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ProductListClient({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [deletingId, setDeletingId] = useState<number | null>(null);
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
        // Toggle active status logic could go here
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por nome, registro..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:outline-none focus:border-[#B8860B]/50 focus:ring-1 focus:ring-[#B8860B]/50 transition-all"
                    />
                    {/* Search Icon could go here if imported */}
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-[#B8860B]/50 cursor-pointer min-w-[200px]"
                >
                    <option value="Todos">Todas as Categorias</option>
                    <option value="Touro">Touros</option>
                    <option value="Matriz">Matrizes</option>
                    <option value="Embrião">Embriões</option>
                    <option value="Sêmen">Sêmen</option>
                    <option value="Novilha">Novilhas</option>
                </select>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-2xl shadow-xl border border-gray-200 dark:border-[#222222] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#222222]">
                            <tr>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Animal</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Preço</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Disponibilidade</th>
                                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#222222]">
                            {filteredProducts?.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A]/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-[#222222] overflow-hidden relative flex-shrink-0 border border-gray-200 dark:border-[#333333] group-hover:border-[#B8860B]/50 transition-colors">
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
                                                            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-[#1A1A1A]">
                                                                <div className="w-4 h-4 bg-gray-300 dark:bg-[#333333] rounded-full" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 dark:text-white group-hover:text-[#B8860B] transition-colors">{product.name}</div>
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
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/products/${product.id}`} className="p-2.5 text-gray-400 hover:text-[#B8860B] hover:bg-[#B8860B]/10 rounded-lg transition-all" title="Editar">
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
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-[#1A1A1A] rounded-full flex items-center justify-center">
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
