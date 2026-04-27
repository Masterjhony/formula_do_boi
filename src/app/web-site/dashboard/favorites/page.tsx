import { createClient } from '@/utils/supabase/server'
import ProductCard from '@/components/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default async function FavoritesPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data: favorites } = await supabase
        .from('favorites')
        .select(`
            product_id,
            products:product_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Clean up the data structure
    const favoriteProducts = favorites
        ?.map((fav: any) => fav.products)
        .filter((product: any) => product !== null) || []

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Meus Favoritos</h1>
                <p className="text-gray-500 dark:text-gray-400">Acompanhe os lotes que você mais gostou</p>
            </div>

            {favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteProducts.map((product: any) => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#333333] p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-[#A0792E]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Sua lista de favoritos está vazia
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
                        Explore nossos lotes e marque como favorito os que mais te interessar.
                    </p>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-[#A0792E] hover:bg-[#A0792E] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#A0792E]/20"
                    >
                        Explorar Leilões
                    </Link>
                </div>
            )}
        </div>
    )
}
