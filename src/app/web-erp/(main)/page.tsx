import Link from 'next/link'
import { Wallet, Package, Calculator, ArrowRight, TrendingUp, TrendingDown, Clock, Activity, BarChart3, Users, Factory } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export default async function ERPDashboard() {
    const supabase = await createClient()

    // Saldo Atual — soma de current_balance de todas as contas bancárias
    const { data: accounts } = await supabase
        .from('erp_finance_accounts')
        .select('current_balance')

    const saldoAtual = accounts?.reduce((sum, a) => sum + (Number(a.current_balance) || 0), 0) ?? 0

    // Variação mensal: transações concluídas do mês atual para estimar saldo no início do mês
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const { data: thisMonthTx } = await supabase
        .from('erp_finance_transactions')
        .select('amount, type')
        .eq('status', 'completed')
        .gte('transaction_date', startOfMonth)

    const thisMonthNet = thisMonthTx?.reduce((sum, t) => {
        return sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount))
    }, 0) ?? 0

    const lastMonthBalance = saldoAtual - thisMonthNet
    const balancePercent = lastMonthBalance !== 0
        ? Math.round(((saldoAtual - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100)
        : 0

    // A Pagar — despesas pendentes
    const { data: pendingExpenses } = await supabase
        .from('erp_finance_transactions')
        .select('amount')
        .eq('type', 'expense')
        .eq('status', 'pending')

    const aPagar = pendingExpenses?.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) ?? 0
    const pendingCount = pendingExpenses?.length ?? 0

    // Estoque ativo
    const { count: productCount } = await supabase
        .from('erp_inventory_products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)

    const { count: warehouseCount } = await supabase
        .from('erp_inventory_warehouses')
        .select('id', { count: 'exact', head: true })

    // Colaboradores — perfis cadastrados
    const { count: profileCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })

    const modules = [
        {
            name: 'Financeiro',
            description: 'Gestão de contas a pagar, receber, categorias, transações e fluxo de caixa consolidado.',
            href: '/financeiro',
            icon: Wallet,
            color: 'from-[#B8860B] to-[#9A7209]',
            textColor: 'text-[#D4AF37]',
            bgColor: 'bg-[#B8860B]/10',
            borderColor: 'border-[#B8860B]/20',
        },
        {
            name: 'Estoque / Inventário',
            description: 'Controle de Animais, Sêmen, Embriões e insumos agrícolas gerais em múltiplos galpões.',
            href: '/estoque',
            icon: Package,
            color: 'from-[#008080] to-[#006666]',
            textColor: 'text-teal-500',
            bgColor: 'bg-teal-500/10',
            borderColor: 'border-teal-500/20',
        },
        {
            name: 'Contábil Base',
            description: 'Plano de contas integradas, lançamentos em diários, controle de balanço patrimonial.',
            href: '/contabil',
            icon: Calculator,
            color: 'from-[#4B0082] to-[#3A0066]',
            textColor: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20',
        },
    ]

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#D4AF37] text-transparent bg-clip-text">
                        Dashboard ERP
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                        <Activity className="w-4 h-4 text-[#B8860B]" />
                        Visão Geral Estratégica
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-[#B8860B]/50 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-[#B8860B]/20 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                        Gerar Referência
                    </button>
                </div>
            </div>

            {/* Premium Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Saldo Atual */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Saldo Atual</p>
                        <div className="p-2 bg-[#B8860B]/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Wallet className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {formatCurrency(saldoAtual)}
                    </p>
                    <div className={`mt-4 flex items-center text-xs font-semibold w-fit px-2.5 py-1 rounded-md ${balancePercent >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {balancePercent >= 0
                            ? <TrendingUp className="w-3.5 h-3.5 mr-1" />
                            : <TrendingDown className="w-3.5 h-3.5 mr-1" />
                        }
                        <span>{balancePercent > 0 ? '+' : ''}{balancePercent}% desde o último mês</span>
                    </div>
                </div>

                {/* A Pagar */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">A Pagar (Pendente)</p>
                        <div className="p-2 bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingDown className="w-5 h-5 text-rose-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {formatCurrency(aPagar)}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-semibold bg-rose-500/10 w-fit px-2.5 py-1 rounded-md text-rose-400">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{pendingCount} {pendingCount === 1 ? 'título pendente' : 'títulos pendentes'}</span>
                    </div>
                </div>

                {/* Estoque Ativo */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Estoque Ativo</p>
                        <div className="p-2 bg-teal-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Package className="w-5 h-5 text-teal-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {productCount ?? 0} <span className="text-lg text-gray-400 dark:text-[#666] font-medium">itens</span>
                    </p>
                    <div className="mt-4 flex items-center text-xs font-semibold bg-teal-500/10 w-fit px-2.5 py-1 rounded-md text-teal-400">
                        <Factory className="w-3.5 h-3.5 mr-1" />
                        <span>{warehouseCount ?? 0} {(warehouseCount ?? 0) === 1 ? 'armazém ativo' : 'armazéns ativos'}</span>
                    </div>
                </div>

                {/* Colaboradores */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Colaboradores</p>
                        <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Users className="w-5 h-5 text-indigo-400" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        {profileCount ?? 0}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-semibold bg-indigo-500/10 w-fit px-2.5 py-1 rounded-md text-indigo-400">
                        <Activity className="w-3.5 h-3.5 mr-1" />
                        <span>Acessos registrados</span>
                    </div>
                </div>
            </div>

            {/* Modules Navigation Map */}
            <div className="pt-4">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-[#B8860B] to-[#D4AF37] rounded-full" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Módulos do Sistema
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module) => {
                        const Icon = module.icon
                        return (
                            <Link
                                key={module.name}
                                href={module.href}
                                className={`group relative bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] hover:${module.borderColor} rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden`}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${module.color} opacity-5 blur-3xl group-hover:opacity-20 transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-xl ${module.bgColor} border border-gray-200 dark:border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                        <Icon className={`w-7 h-7 ${module.textColor}`} />
                                    </div>
                                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                        {module.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-[#777] font-medium leading-relaxed mb-8">
                                        {module.description}
                                    </p>
                                </div>

                                <div className="relative z-10 flex items-center justify-between border-t border-gray-200 dark:border-[#222] pt-6 mt-auto">
                                    <span className={`text-sm font-bold uppercase tracking-widest ${module.textColor}`}>
                                        Acessar Módulo
                                    </span>
                                    <div className={`w-8 h-8 rounded-full ${module.bgColor} flex items-center justify-center group-hover:translate-x-2 transition-transform duration-300`}>
                                        <ArrowRight className={`w-4 h-4 ${module.textColor}`} />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
