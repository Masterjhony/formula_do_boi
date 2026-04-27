'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Eye, EyeOff, Search, Award, AlertCircle, CheckCircle, Clock, XCircle, Download, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function LotesTourosClient({ initialProducts }: { initialProducts: any[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [downloadingId, setDownloadingId] = useState<any>(null);
    const supabase = createClient();

    const collectMediaUrls = (p: any): string[] => {
        const urls: string[] = [];
        if (p.image_url) urls.push(p.image_url);
        if (p.image) urls.push(p.image);
        if (Array.isArray(p.gallery)) for (const g of p.gallery) if (g) urls.push(g);
        return Array.from(new Set(urls));
    };

    const handleDownloadMedia = async (p: any) => {
        const urls = collectMediaUrls(p);
        if (urls.length === 0) {
            alert('Nenhuma mídia disponível para este touro.');
            return;
        }
        setDownloadingId(p.id);
        try {
            const safeName = (p.name || 'touro').replace(/[^a-zA-Z0-9._\- ]/g, '_').trim();
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('fetch failed');
                    const blob = await res.blob();
                    const ext = (url.split('?')[0].split('.').pop() || 'mp4').toLowerCase();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = urls.length === 1 ? `${safeName}.${ext}` : `${safeName}_${i + 1}.${ext}`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                } catch {
                    window.open(url, '_blank', 'noopener');
                }
            }
        } finally {
            setDownloadingId(null);
        }
    };

    const handleToggleActive = async (product: any) => {
        const next = !product.active;
        try {
            const { error } = await supabase.from('products').update({ active: next }).eq('id', product.id);
            if (error) throw error;
            setProducts(p => p.map(x => x.id === product.id ? { ...x, active: next } : x));
        } catch {
            alert('Erro ao atualizar visibilidade.');
        }
    };

    const filtered = products.filter(p => {
        const s = search.toLowerCase();
        const matchSearch =
            p.name?.toLowerCase().includes(s) ||
            (p.details?.registro ?? p.registro ?? '').toLowerCase().includes(s) ||
            (p.details?.pai ?? p.pai ?? '').toLowerCase().includes(s);
        const st = p.details?.status ?? p.status ?? 'Disponível';
        const matchStatus = statusFilter === 'Todos' || st.includes(statusFilter);
        return matchSearch && matchStatus;
    });

    const counts = {
        total: products.length,
        disponivel: products.filter(p => !(p.details?.status ?? p.status ?? '').includes('Vendido') && !(p.details?.status ?? p.status ?? '').includes('Reservado')).length,
        reservado: products.filter(p => (p.details?.status ?? p.status ?? '').includes('Reservado')).length,
        vendido: products.filter(p => (p.details?.status ?? p.status ?? '').includes('Vendido')).length,
    };

    const getStatus = (p: any) => p.details?.status ?? p.status ?? 'Disponível';

    const statusStyle = (st: string) => {
        if (st.includes('Vendido')) return { dot: 'bg-red-400', badge: 'bg-red-500/10 text-red-400 border-red-500/20' };
        if (st.includes('Reservado')) return { dot: 'bg-yellow-400', badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
        return { dot: 'bg-green-400', badge: 'bg-green-500/10 text-green-400 border-green-500/20' };
    };

    const getImage = (p: any) => p.image_url || p.gallery?.[0] || p.image || null;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Total', value: counts.total, icon: Award, color: 'text-[#A0792E]', bg: 'bg-[#A0792E]/10' },
                    { label: 'Disponíveis', value: counts.disponivel, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
                    { label: 'Reservados', value: counts.reservado, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Vendidos', value: counts.vendido, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] p-3 sm:p-5 flex items-center gap-3 sm:gap-4">
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                            <Icon size={18} className={color} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
                            <p className="text-[11px] sm:text-xs text-gray-500 truncate">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, RGD, pai..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:border-[#A0792E]/50 focus:ring-1 focus:ring-[#A0792E]/30 transition-all"
                    />
                </div>
                <div className="grid grid-cols-4 sm:flex gap-2 sm:flex-wrap">
                    {['Todos', 'Disponível', 'Reservado', 'Vendido'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-2 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${statusFilter === s
                                ? 'bg-gradient-to-r from-[#A0792E] to-[#D4A85C] text-black shadow-md shadow-[#A0792E]/20'
                                : 'bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] text-gray-600 dark:text-gray-400 hover:border-[#A0792E]/40'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center">
                        <AlertCircle size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500">Nenhum touro encontrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filtered.map(p => {
                        const st = getStatus(p);
                        const style = statusStyle(st);
                        const img = getImage(p);
                        const registro = p.details?.registro ?? p.registro ?? null;
                        const pai = p.details?.pai ?? p.pai ?? null;
                        const mae = p.details?.mae ?? p.mae ?? null;
                        const price = typeof p.price === 'number'
                            ? `R$ ${p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : p.price || 'Sob Consulta';

                        return (
                            <div
                                key={p.id}
                                className={`group bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] overflow-hidden hover:border-[#A0792E]/40 hover:shadow-lg hover:shadow-[#A0792E]/5 transition-all duration-200 flex flex-col ${p.active === false ? 'opacity-60' : ''}`}
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                                    {img ? (
                                        img.endsWith('.mp4') ? (
                                            <video src={img} className="w-full h-full object-cover" muted playsInline />
                                        ) : img.includes('youtube.com') || img.includes('youtu.be') ? (
                                            <img
                                                src={`https://img.youtube.com/vi/${img.split('v=')[1]?.split('&')[0] || img.split('/').pop()}/0.jpg`}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : (
                                            <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        )
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Award size={40} className="text-gray-300 dark:text-[#333333]" />
                                        </div>
                                    )}
                                    {/* Status badge overlay */}
                                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold backdrop-blur-sm ${style.badge}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                        {st}
                                    </div>
                                    {/* Visibility badge */}
                                    {p.active === false && (
                                        <div className="absolute top-3 right-3 bg-gray-900/70 text-gray-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                            Oculto
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight group-hover:text-[#A0792E] transition-colors line-clamp-2">
                                            {p.name}
                                        </h3>
                                        {registro && (
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{registro}</p>
                                        )}
                                    </div>

                                    {/* Genealogy */}
                                    {(pai || mae) && (
                                        <div className="space-y-1 text-xs text-gray-500">
                                            {pai && <p><span className="text-gray-400">Pai:</span> {pai}</p>}
                                            {mae && <p><span className="text-gray-400">Mãe:</span> {mae}</p>}
                                        </div>
                                    )}

                                    {/* Price */}
                                    <p className="text-sm font-bold text-[#A0792E] mt-auto">{price}</p>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-[#222222]">
                                        <Link
                                            href={`/products/${p.id}`}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#A0792E]/10 text-[#A0792E] hover:bg-[#A0792E]/20 text-xs font-semibold transition-all"
                                        >
                                            <Edit size={13} />
                                            Editar
                                        </Link>
                                        {collectMediaUrls(p).length > 0 && (
                                            <button
                                                onClick={() => handleDownloadMedia(p)}
                                                disabled={downloadingId === p.id}
                                                title={`Baixar mídia${collectMediaUrls(p).length > 1 ? ` (${collectMediaUrls(p).length})` : ''}`}
                                                className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-60"
                                            >
                                                {downloadingId === p.id
                                                    ? <Loader2 size={15} className="animate-spin" />
                                                    : <Download size={15} />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggleActive(p)}
                                            title={p.active === false ? 'Tornar visível' : 'Ocultar'}
                                            className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#252525] transition-all"
                                        >
                                            {p.active === false ? <Eye size={15} /> : <EyeOff size={15} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
