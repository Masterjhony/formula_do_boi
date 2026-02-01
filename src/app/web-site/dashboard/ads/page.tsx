import { createClient } from '@/utils/supabase/server'
import ProductCard from '@/components/ProductCard'
import { Store } from 'lucide-react'

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

    // 1. Try fetching by owner_id first (Best practice)
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
            products = data.filter(product => {
                if (!product.details) return false;
                const productBreeder = product.details.breeder || product.details.proprietario;
                return productBreeder && productBreeder.toLowerCase() === breederName.toLowerCase();
            });
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Meus Anúncios</h1>
                <p className="text-gray-400">Gerencie os animais que você anunciou no site</p>
                {breederName && <p className="text-xs text-gray-500 mt-1">Exibindo anúncios para: <span className="text-[#B8860B]">{breederName}</span></p>}
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#111111] border border-[#222222] rounded-2xl p-12 text-center">
                    <div className="bg-[#1A1A1A] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-8 h-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum anúncio encontrado</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Não encontramos animais vinculados ao seu nome de cadastro ({breederName || 'Sem nome'}).
                        Entre em contato com a administração caso seus anúncios não estejam aparecendo.
                    </p>
                </div>
            )}
        </div>
    )
}
