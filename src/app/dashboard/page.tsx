import { createClient } from '@/utils/supabase/server'
import { StatsCard } from './components/stats-card'
import { RecentProposals } from './components/recent-proposals'
import { FileText, Heart, Beef, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Fetch Stats
    const { count: proposalsCount } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

    const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

    const { count: herdsCount } = await supabase
        .from('herds')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Visão Geral</h1>
                <p className="text-gray-400">Acompanhe suas atividades e status do rebanho</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Propostas Ativas"
                    value={proposalsCount || 0}
                    icon={FileText}
                    description="Em negociação"
                />
                <StatsCard
                    title="Favoritos"
                    value={favoritesCount || 0}
                    icon={Heart}
                    description="Itens salvos"
                />
                <StatsCard
                    title="Meu Rebanho"
                    value={herdsCount || 0}
                    icon={Beef}
                    description="Animais cadastrados"
                />
                <StatsCard
                    title="Total Investido"
                    value={'R$ 0,00'}
                    icon={TrendingUp}
                    description="Últimos 12 meses"
                    isCurrency
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-white mb-6">Propostas Recentes</h2>
                    <RecentProposals userId={user?.id!} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-6">Atividades</h2>
                    <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6">
                        <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
