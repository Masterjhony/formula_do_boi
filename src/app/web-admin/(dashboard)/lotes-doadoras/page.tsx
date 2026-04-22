import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import LotesDoadoresClient from './LotesDoadoresClient';

export default async function LotesDoadoresPage() {
    const supabase = createClient();
    const { data: products, error } = await (await supabase)
        .from('products')
        .select('*')
        .or("category.ilike.%Embrião%,category.ilike.%Embriao%,category.ilike.%DOADORA%,category.ilike.%Doadora%")
        .order('display_order', { ascending: false });

    if (error) {
        return <div className="text-red-500">Erro ao carregar doadoras: {error.message}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-[#222222] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Lotes Doadoras</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Gerencie as doadoras e lotes de embriões do catálogo.</p>
                </div>
                <Link
                    href="/products/new"
                    className="flex items-center gap-2 bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#D4AF37] hover:to-[#FFD700] text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#B8860B]/20 hover:shadow-[#B8860B]/30 hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Nova Doadora
                </Link>
            </div>

            <LotesDoadoresClient initialProducts={products ?? []} />
        </div>
    );
}
