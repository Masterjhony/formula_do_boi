import { createClient } from '@/utils/supabase/server'
import { PRODUCTS } from '@/data/products'

export async function RecentProposals({ userId }: { userId: string }) {
    const supabase = await createClient()

    const { data: proposals } = await supabase
        .from('proposals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

    if (!proposals || proposals.length === 0) {
        return (
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 text-center">
                <p className="text-gray-400">Você ainda não fez nenhuma proposta.</p>
            </div>
        )
    }

    return (
        <div className="bg-[#111111] border border-[#222222] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#1A1A1A] text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Animal</th>
                            <th className="px-6 py-4 font-medium">Valor Ofertado</th>
                            <th className="px-6 py-4 font-medium">Data</th>
                            <th className="px-6 py-4 font-medium text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                        {proposals.map((proposal) => {
                            const product = PRODUCTS.find(p => p.id === proposal.animal_id)
                            return (
                                <tr key={proposal.id} className="text-sm hover:bg-[#1A1A1A]/50 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">
                                        {product?.name || `Lote #${proposal.animal_id}`}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.value)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${proposal.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                                                proposal.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-yellow-500/10 text-yellow-500'}`}>
                                            {proposal.status === 'pending' ? 'Pendente' :
                                                proposal.status === 'accepted' ? 'Aceita' : 'Recusada'}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
