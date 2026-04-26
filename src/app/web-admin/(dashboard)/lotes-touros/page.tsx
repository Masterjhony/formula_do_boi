import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import LotesTourosClient from './LotesTourosClient';

export default async function LotesTourosPage() {
    const supabase = createClient();
    const { data: products, error } = await (await supabase)
        .from('products')
        .select('*')
        .ilike('category', '%Sêmen%')
        .order('display_order', { ascending: false });

    if (error) {
        return <div className="text-red-500">Erro ao carregar touros: {error.message}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-gray-200 dark:border-[#222222] pb-4 sm:pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Lotes Touros</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Gerencie os touros e lotes de sêmen do catálogo.</p>
                </div>
                <Link
                    href="/products/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#D4AF37] hover:to-[#FFD700] text-black font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg shadow-[#B8860B]/20 hover:shadow-[#B8860B]/30 hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Novo Touro
                </Link>
            </div>

            <LotesTourosClient initialProducts={products ?? []} />
        </div>
    );
}
