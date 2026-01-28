import { createClient } from '@/utils/supabase/server'
import { PRODUCTS } from '@/data/products'
import { Heart, ArrowUpRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function FavoritesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: favorites } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Meus Favoritos</h1>
                <p className="text-gray-400">Acompanhe os lotes que você mais gostou</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites?.map((favorite) => {
                    const product = PRODUCTS.find(p => p.id === favorite.animal_id)
                    // Fallback logic if product is not found in static data
                    if (!product) return null

                    return (
                        <div key={favorite.id} className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden group hover:border-[#B8860B]/30 transition-colors">
                            <div className="relative aspect-video">
                                {product.image.endsWith('.mp4') ? (
                                    <video
                                        src={product.image}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        playsInline
                                    />
                                ) : (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                                    <p className="text-sm text-gray-300">{product.category}</p>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-sm">
                                        <p className="text-gray-500">Valor Estimado</p>
                                        <p className="text-[#B8860B] font-bold">R$ {product.price}</p>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p className="text-gray-500">Registro</p>
                                        <p className="text-white">{product.details?.registro}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/lote/${product.id}`}
                                        className="flex-1 bg-[#1A1A1A] hover:bg-[#B8860B] hover:text-black text-white font-medium py-2.5 rounded-xl transition-all text-center text-sm flex items-center justify-center gap-2"
                                    >
                                        Ver Detalhes
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                    {/* Ideally create a client component for removing favorite */}
                                    <button className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {(!favorites || favorites.length === 0) && (
                <div className="text-center py-20 bg-[#111111] border border-[#222222] rounded-2xl">
                    <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Sua lista de favoritos está vazia</h3>
                    <p className="text-gray-500 mb-6">Explore nossos lotes e marque como favorito os que mais te interessar.</p>
                    <Link href="/touros" className="inline-flex items-center justify-center px-6 py-3 bg-[#B8860B] hover:bg-[#D4AF37] text-black font-bold rounded-xl transition-all">
                        Explorar Leilões
                    </Link>
                </div>
            )}
        </div>
    )
}
