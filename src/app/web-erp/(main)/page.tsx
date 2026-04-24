import Link from 'next/link'
import {
    Wallet, Calculator, ArrowRight, TrendingUp, TrendingDown, Activity,
    BarChart3, Gavel, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Calendar,
    Trophy,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatShort(value: number) {
    const abs = Math.abs(value)
    const sig = value < 0 ? '-' : ''
    if (abs >= 1_000_000) return `${sig}R$ ${(abs / 1_000_000).toFixed(2)}mi`
    if (abs >= 1_000) return `${sig}R$ ${(abs / 1_000).toFixed(0)}k`
    return `${sig}R$ ${abs.toFixed(0)}`
}

function fmtDateBR(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export default async function ERPDashboard() {
    const supabase = await createClient()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]
    const in30d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString().split('T')[0]

    // ─── Core Finance ────────────────────────────────────────────────────────
    const [
        { data: accounts },
        { data: allTx },
        { data: fechamentos },
    ] = await Promise.all([
        supabase.from('erp_finance_accounts').select('initial_balance'),
        supabase.from('erp_finance_transactions')
            .select('amount, type, status, transaction_date, description')
            .order('transaction_date', { ascending: false })
            .limit(5000),
        supabase.from('bula_leilao_fechamento')
            .select('id, nome, data, vgv_total, comissao_assessoria, receita_bula, sobra_bruta')
            .order('data', { ascending: false })
            .limit(6),
    ])

    const totalInitial = (accounts ?? []).reduce((s, a) => s + (Number(a.initial_balance) || 0), 0)
    const txs = allTx ?? []

    // Saldo atual (completed)
    const saldoAtual = txs
        .filter(t => t.status === 'completed')
        .reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), totalInitial)

    // Mês atual × mês anterior
    const curMonthTx = txs.filter(t => t.transaction_date >= startOfMonth)
    const prevMonthTx = txs.filter(t => t.transaction_date >= startOfPrevMonth && t.transaction_date < startOfMonth)

    const sumBy = (list: typeof txs, type: 'income' | 'expense') =>
        list.filter(t => t.type === type).reduce((s, t) => s + Number(t.amount), 0)

    const entradasMes = sumBy(curMonthTx, 'income')
    const saidasMes = sumBy(curMonthTx, 'expense')
    const resultadoMes = entradasMes - saidasMes

    const entradasPrev = sumBy(prevMonthTx, 'income')
    const saidasPrev = sumBy(prevMonthTx, 'expense')
    const resultadoPrev = entradasPrev - saidasPrev

    const pct = (cur: number, prev: number) => {
        if (prev === 0) return cur === 0 ? 0 : 100
        return Math.round(((cur - prev) / Math.abs(prev)) * 100)
    }

    const entradasDelta = pct(entradasMes, entradasPrev)
    const saidasDelta = pct(saidasMes, saidasPrev)
    const resultadoDelta = pct(resultadoMes, resultadoPrev)

    // Variação de saldo vs mês anterior (saldo sem tx do mês atual)
    const thisMonthNet = curMonthTx
        .filter(t => t.status === 'completed')
        .reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)
    const lastMonthBalance = saldoAtual - thisMonthNet
    const saldoDelta = pct(saldoAtual, lastMonthBalance)

    // A Receber × A Pagar (pending)
    const pendentes = txs.filter(t => t.status === 'pending')
    const aReceber = sumBy(pendentes, 'income')
    const aPagar = sumBy(pendentes, 'expense')

    // Vencendo em 30d
    const vencendo30d = pendentes.filter(t => t.transaction_date >= today && t.transaction_date <= in30d)
    const venc30dReceber = sumBy(vencendo30d, 'income')
    const venc30dPagar = sumBy(vencendo30d, 'expense')

    // Vencidos (pending antes de hoje)
    const vencidos = pendentes.filter(t => t.transaction_date < today)
    const vencidosReceber = sumBy(vencidos, 'income')
    const vencidosPagar = sumBy(vencidos, 'expense')

    // Próximos vencimentos (top 6 pending ordenados por data crescente)
    const proximosVenc = [...pendentes]
        .sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))
        .slice(0, 6)

    // Últimos 6 meses (entradas × saídas) — somando todas transações independente de status
    const last6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const key = d.toISOString().substring(0, 7)
        return { key, label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') }
    })
    const series = last6.map(({ key, label }) => {
        const monthTx = txs.filter(t => t.transaction_date?.substring(0, 7) === key)
        return {
            key, label,
            income: sumBy(monthTx, 'income'),
            expense: sumBy(monthTx, 'expense'),
        }
    })
    const maxBar = Math.max(...series.map(s => Math.max(s.income, s.expense)), 1)

    // Leilões (top fechamentos)
    const fechs = fechamentos ?? []
    const receitaLeiloes12m = fechs
        .filter(f => {
            if (!f.data) return false
            const diff = (now.getTime() - new Date(f.data).getTime()) / (1000 * 60 * 60 * 24)
            return diff <= 365
        })
        .reduce((s, f) => s + (Number(f.receita_bula) || 0), 0)

    const modules = [
        {
            name: 'Financeiro',
            description: 'Contas a pagar, receber, fluxo de caixa, conciliação e categorias.',
            href: '/financeiro',
            icon: Wallet,
            color: 'from-[#B8860B] to-[#9A7209]',
            textColor: 'text-[#D4AF37]',
            bgColor: 'bg-[#B8860B]/10',
            borderColor: 'border-[#B8860B]/20',
        },
        {
            name: 'Leilões',
            description: 'Receita, comissão e fechamentos de leilões da Bula Genética.',
            href: '/leiloes',
            icon: Gavel,
            color: 'from-[#B8860B] to-[#9A7209]',
            textColor: 'text-[#D4AF37]',
            bgColor: 'bg-[#B8860B]/10',
            borderColor: 'border-[#B8860B]/20',
        },
        {
            name: 'Contábil Base',
            description: 'Plano de contas integradas, lançamentos em diários e balanço patrimonial.',
            href: '/contabil',
            icon: Calculator,
            color: 'from-[#4B0082] to-[#3A0066]',
            textColor: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
            borderColor: 'border-indigo-500/20',
        },
    ]

    const DeltaPill = ({ value, inverted = false }: { value: number; inverted?: boolean }) => {
        const good = inverted ? value <= 0 : value >= 0
        return (
            <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md ${good ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {value >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {value > 0 ? '+' : ''}{value}% vs mês ant.
            </span>
        )
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* ─── Header ───────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#D4AF37] text-transparent bg-clip-text">
                        Dashboard ERP
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                        <Activity className="w-4 h-4 text-[#B8860B]" />
                        Visão Geral Estratégica · {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/financeiro/fluxo-caixa"
                        className="px-5 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-[#B8860B]/50 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-[#B8860B]/20 flex items-center gap-2"
                    >
                        <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                        Fluxo de Caixa
                    </Link>
                </div>
            </div>

            {/* ─── KPI Row: Financial Pulse (4) ─────────────────────── */}
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
                    <div className="mt-4"><DeltaPill value={saldoDelta} /></div>
                </div>

                {/* Entradas Mês */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Entradas (Mês)</p>
                        <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <ArrowDownToLine className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-emerald-500 tracking-tight">
                        {formatCurrency(entradasMes)}
                    </p>
                    <div className="mt-4"><DeltaPill value={entradasDelta} /></div>
                </div>

                {/* Saídas Mês */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-rose-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Saídas (Mês)</p>
                        <div className="p-2 bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform">
                            <ArrowUpFromLine className="w-5 h-5 text-rose-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-rose-500 tracking-tight">
                        {formatCurrency(saidasMes)}
                    </p>
                    <div className="mt-4"><DeltaPill value={saidasDelta} inverted /></div>
                </div>

                {/* Resultado Mês */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Resultado (Mês)</p>
                        <div className="p-2 bg-[#B8860B]/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Trophy className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                    </div>
                    <p className={`text-3xl font-extrabold tracking-tight ${resultadoMes >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {formatCurrency(resultadoMes)}
                    </p>
                    <div className="mt-4"><DeltaPill value={resultadoDelta} /></div>
                </div>
            </div>

            {/* ─── Pendências e Projeção ────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* A Receber */}
                <Link
                    href="/financeiro/a-receber"
                    className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">A Receber</p>
                        <ArrowDownToLine className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-extrabold text-emerald-500 tracking-tight">
                        {formatCurrency(aReceber)}
                    </p>
                    <div className="mt-4 space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-gray-500 dark:text-[#777]">
                            <span>Próximos 30d</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(venc30dReceber)}</span>
                        </div>
                        {vencidosReceber > 0 && (
                            <div className="flex justify-between text-rose-500 font-semibold">
                                <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Vencidos</span>
                                <span>{formatCurrency(vencidosReceber)}</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* A Pagar */}
                <Link
                    href="/financeiro/a-pagar"
                    className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-rose-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">A Pagar</p>
                        <ArrowUpFromLine className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-2xl font-extrabold text-rose-500 tracking-tight">
                        {formatCurrency(aPagar)}
                    </p>
                    <div className="mt-4 space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-gray-500 dark:text-[#777]">
                            <span>Próximos 30d</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(venc30dPagar)}</span>
                        </div>
                        {vencidosPagar > 0 && (
                            <div className="flex justify-between text-rose-500 font-semibold">
                                <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Vencidos</span>
                                <span>{formatCurrency(vencidosPagar)}</span>
                            </div>
                        )}
                    </div>
                </Link>

                {/* Receita Leilões 12m */}
                <Link
                    href="/leiloes"
                    className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Receita Leilões (12m)</p>
                        <Gavel className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <p className="text-2xl font-extrabold text-[#D4AF37] tracking-tight">
                        {formatCurrency(receitaLeiloes12m)}
                    </p>
                    <div className="mt-4 space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-gray-500 dark:text-[#777]">
                            <span>Fechamentos recentes</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{fechs.length}</span>
                        </div>
                    </div>
                </Link>
            </div>

            {/* ─── Chart + Próximos Vencimentos ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bar chart — 6 meses */}
                <div className="lg:col-span-3 bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#B8860B] to-[#D4AF37] rounded-full" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Entradas × Saídas — últimos 6 meses
                            </h3>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 text-emerald-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Entradas
                            </span>
                            <span className="flex items-center gap-1.5 text-rose-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Saídas
                            </span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between gap-3 h-48 px-1">
                        {series.map(s => {
                            const hIn = (s.income / maxBar) * 100
                            const hOut = (s.expense / maxBar) * 100
                            return (
                                <div key={s.key} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full flex items-end justify-center gap-1 h-full">
                                        <div
                                            className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all group-hover:opacity-80 relative"
                                            style={{ height: `${hIn}%` }}
                                            title={`Entradas: ${formatCurrency(s.income)}`}
                                        />
                                        <div
                                            className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all group-hover:opacity-80"
                                            style={{ height: `${hOut}%` }}
                                            title={`Saídas: ${formatCurrency(s.expense)}`}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666]">
                                        {s.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-4 grid grid-cols-6 gap-3 text-[10px]">
                        {series.map(s => (
                            <div key={s.key} className="text-center">
                                <div className="text-emerald-500 font-bold">{formatShort(s.income)}</div>
                                <div className="text-rose-500 font-bold">{formatShort(s.expense)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Próximos Vencimentos */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#B8860B] to-[#D4AF37] rounded-full" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Próximos Vencimentos
                            </h3>
                        </div>
                        <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                        {proximosVenc.length > 0 ? proximosVenc.map((tx, i) => {
                            const vencido = tx.transaction_date < today
                            return (
                                <div
                                    key={i}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${vencido ? 'border-rose-500/30 bg-rose-500/5' : 'border-gray-200 dark:border-[#222] hover:border-[#B8860B]/30'}`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {tx.description || '—'}
                                        </p>
                                        <p className={`text-[10px] font-semibold mt-0.5 ${vencido ? 'text-rose-500' : 'text-gray-500 dark:text-[#777]'}`}>
                                            {vencido && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                            {fmtDateBR(tx.transaction_date)}
                                            {vencido ? ' · vencido' : ''}
                                        </p>
                                    </div>
                                    <span className={`text-sm font-extrabold whitespace-nowrap ml-3 ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                                    </span>
                                </div>
                            )
                        }) : (
                            <p className="text-center text-xs text-gray-400 dark:text-[#555] py-8 uppercase tracking-widest">
                                Nenhum vencimento pendente
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Últimos Leilões ──────────────────────────────────── */}
            {fechs.length > 0 && (
                <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-gray-100 dark:border-[#222] flex items-center justify-between bg-gradient-to-r from-[#B8860B]/5 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#B8860B] to-[#D4AF37] rounded-full" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Últimos Fechamentos de Leilão
                            </h3>
                        </div>
                        <Link
                            href="/leiloes"
                            className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#B8860B] flex items-center gap-1"
                        >
                            Ver todos <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-[10px] text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222] uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-3 text-left font-bold">Data</th>
                                    <th className="px-6 py-3 text-left font-bold">Leilão</th>
                                    <th className="px-6 py-3 text-right font-bold">VGV</th>
                                    <th className="px-6 py-3 text-right font-bold">Receita</th>
                                    <th className="px-6 py-3 text-right font-bold">Sobra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fechs.slice(0, 5).map(f => (
                                    <tr key={f.id} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors">
                                        <td className="px-6 py-4 text-gray-500 dark:text-[#888] font-mono text-xs">
                                            {f.data ? fmtDateBR(f.data) : '—'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{f.nome || '—'}</td>
                                        <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300 font-mono">
                                            {formatCurrency(Number(f.vgv_total) || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-emerald-500 font-extrabold">
                                            {formatCurrency(Number(f.receita_bula) || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-[#D4AF37] font-extrabold">
                                            +{formatCurrency(Number(f.sobra_bruta) || 0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ─── Módulos do Sistema ───────────────────────────────── */}
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
                                className="group relative bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
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
