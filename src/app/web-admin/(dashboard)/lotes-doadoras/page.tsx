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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-gray-200 dark:border-[#2e2e2e] pb-4 sm:pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Lotes Doadoras</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Gerencie as doadoras e lotes de embriões do catálogo.</p>
                </div>
                <Link
                    href="/products/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#A0792E] to-[#A0792E] hover:from-[#D4A85C] hover:to-[#E8CB85] text-black font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg shadow-[#A0792E]/20 hover:shadow-[#A0792E]/30 hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    Nova Doadora
                </Link>
            </div>

            <LotesDoadoresClient initialProducts={products ?? []} />
        </div>
    );
}
