import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import ProductListClient from './ProductListClient';

export default async function AdminProductsPage() {
    const supabase = createClient();
    // Fetch products from DB
    const { data: products, error } = await (await supabase)
        .from('products')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        return <div className="text-red-500">Erro ao carregar produtos: {error.message}</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-[#2e2e2e] pb-4 sm:pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Gerenciar Cards</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Visualize, cadastre e gerencie o estoque de animais.</p>
                </div>
                <Link
                    href="/products/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#A0792E] to-[#A0792E] hover:from-[#D4A85C] hover:to-[#E8CB85] text-black font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-lg shadow-[#A0792E]/20 hover:shadow-[#A0792E]/30 hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    <span>Novo Card</span>
                </Link>
            </div>



            <ProductListClient initialProducts={products || []} />
        </div>
    );
}
