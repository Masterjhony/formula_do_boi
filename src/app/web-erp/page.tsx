import Link from 'next/link'
import { Wallet, Package, Calculator, ArrowRight, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react'

export default function ERPDashboard() {
    const modules = [
        {
            name: 'Financeiro',
            description: 'Gestão de contas a pagar, receber, categorias e fluxo de caixa.',
            href: '/web-erp/financeiro',
            icon: Wallet,
            color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        },
        {
            name: 'Estoque / Inventário',
            description: 'Controle de produtos, múltiplas localizações de galpões e movimentações.',
            href: '/web-erp/estoque',
            icon: Package,
            color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        },
        {
            name: 'Contábil Base',
            description: 'Plano de contas financeiras, lançamentos em partidas dobradas, ledger.',
            href: '/web-erp/contabil',
            icon: Calculator,
            color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bem-vindo ao ERP da Fórmula do Boi
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Activity className="w-4 h-4 text-[--brand-gold]" />
                    Visão geral simplificada das operações da sua fazenda.
                </p>
            </div>

            {/* Quick Stats Outline  */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo Atual</p>
                        <Wallet className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">R$ 0,00</p>
                    <div className="mt-2 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 mr-1 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">0%</span>
                        <span className="ml-2 text-gray-500">desde ontem</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">A Pagar (Hoje)</p>
                        <TrendingDown className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">R$ 0,00</p>
                    <div className="mt-2 flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-1 text-amber-500" />
                        <span className="text-amber-500 font-medium">0 contas</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Itens no Estoque</p>
                        <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">0</p>
                    <div className="mt-2 flex items-center text-sm">
                        <span className="text-gray-500">Produtos cadastrados</span>
                    </div>
                </div>
            </div>

            {/* Modules Navigation Map */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Módulos Disponíveis
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {modules.map((module) => {
                        const Icon = module.icon
                        return (
                            <Link
                                key={module.name}
                                href={module.href}
                                className="group relative bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:border-[--brand-gold] flex flex-col justify-between"
                            >
                                <div>
                                    <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        {module.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        {module.description}
                                    </p>
                                </div>
                                <div className="flex items-center text-[--brand-gold] font-medium text-sm group-hover:translate-x-1 transition-transform">
                                    Acessar Módulo
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
