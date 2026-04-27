import { createClient } from '@/utils/supabase/server'
import ProductCard from '@/components/ProductCard'
import { Store, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function MyAdsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    // Get user profile to find their name
    const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

    const breederName = profile?.name

    // Fetch products
    let products: any[] = []

    // 1. Fetch by owner_id (Best practice)
    const { data: productsByOwner } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    if (productsByOwner && productsByOwner.length > 0) {
        products = productsByOwner;
    } else if (breederName) {
        // 2. Fallback: Fetch by breeder name match (Legacy/Name-based)
        const { data } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) {
            const filtered = data.filter(product => {
                if (!product.details) return false;
                const productBreeder = product.details.breeder || product.details.proprietario;
                return productBreeder && productBreeder.toLowerCase() === breederName.toLowerCase();
            });
            // Only add if not already present (avoid duplicates if owner_id and name match)
            const existingIds = new Set(products.map(p => p.id));
            filtered.forEach(p => {
                if (!existingIds.has(p.id)) {
                    products.push(p);
                }
            });
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meus Anúncios</h1>
                    <p className="text-gray-500">Gerencie os animais que você anunciou no site</p>
                    {breederName && <p className="text-xs text-gray-500 mt-1">Exibindo anúncios para: <span className="text-[#A0792E]">{breederName}</span></p>}
                </div>
                <Link
                    href="/dashboard/ads/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#A0792E] text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Cadastrar Novo Anúncio
                </Link>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="h-full relative group">
                            <ProductCard product={product} />
                            {/* Optional: Add edit/delete buttons overlay */}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-2xl p-12 text-center shadow-sm dark:shadow-none">
                    <div className="bg-gray-50 dark:bg-[#1A1A1A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#A0792E]">
                        <Store className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum anúncio encontrado</h3>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Você ainda não possui anúncios cadastrados. Comece agora mesmo a divulgar seus animais.
                    </p>
                    <Link
                        href="/dashboard/ads/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#A0792E] text-white rounded-lg hover:bg-yellow-600 transition-colors font-bold shadow-lg shadow-yellow-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Criar Primeiro Anúncio
                    </Link>
                </div>
            )}
        </div>
    )
}
