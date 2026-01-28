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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222222] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Gerenciar Cards</h1>
                    <p className="text-gray-400 text-sm">Visualize, cadastre e gerencie o estoque de animais.</p>
                </div>
                <Link
                    href="/products/new"
                    className="flex items-center gap-2 bg-gradient-to-r from-[#B8860B] to-[#DAA520] hover:from-[#D4AF37] hover:to-[#FFD700] text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#B8860B]/20 hover:shadow-[#B8860B]/30 hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    <span>Novo Card</span>
                </Link>
            </div>



            <ProductListClient initialProducts={products || []} />
        </div>
    );
}
