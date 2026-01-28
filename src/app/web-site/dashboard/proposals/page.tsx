import { createClient } from '@/utils/supabase/server'
import { PRODUCTS } from '@/data/products'
import { FileText, Calendar, DollarSign, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default async function ProposalsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: proposals } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Minhas Propostas</h1>
                <p className="text-gray-400">Gerencie todas as suas negociações em andamento</p>
            </div>

            <div className="grid gap-4">
                {proposals?.map((proposal) => {
                    const product = PRODUCTS.find(p => p.id === proposal.animal_id)
                    return (
                        <div key={proposal.id} className="bg-[#111111] border border-[#222222] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-[#B8860B]/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#1A1A1A] rounded-xl group-hover:bg-[#B8860B]/10 transition-colors">
                                    <FileText className="w-6 h-6 text-[#B8860B]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {product?.name || `Lote #${proposal.animal_id}`}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-300">
                                            <DollarSign className="w-4 h-4" />
                                            Oferta: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.value)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#222222]">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                                    ${proposal.status === 'accepted' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        proposal.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                    {proposal.status === 'pending' ? 'Em Análise' :
                                        proposal.status === 'accepted' ? 'Aprovada' : 'Recusada'}
                                </span>
                                <Link
                                    href={`/lote/${proposal.animal_id}`}
                                    className="p-2 bg-[#1A1A1A] hover:bg-[#B8860B] hover:text-black rounded-lg transition-colors group-hover:translate-x-1 duration-300"
                                >
                                    <ArrowUpRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    )
                })}

                {(!proposals || proposals.length === 0) && (
                    <div className="text-center py-20 bg-[#111111] border border-[#222222] rounded-2xl">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Nenhuma proposta encontrada</h3>
                        <p className="text-gray-500 mb-6">Você ainda não realizou nenhuma proposta nos nossos leilões.</p>
                        <Link href="/touros" className="inline-flex items-center justify-center px-6 py-3 bg-[#B8860B] hover:bg-[#D4AF37] text-black font-bold rounded-xl transition-all">
                            Ver Lotes Disponíveis
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
