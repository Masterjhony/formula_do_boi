import Link from 'next/link'
import {
    Wallet, Calculator, ArrowRight, TrendingUp, TrendingDown, Activity,
    BarChart3, Gavel, ArrowDownToLine, ArrowUpFromLine, AlertTriangle, Calendar,
    Trophy, PieChart, Building2, Flame,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { buildReceivables, buildPayables } from './financeiro/_lib/helpers'
import type { Account, Transaction, BulaLeilao, FechamentoLite, UnifiedItem } from './financeiro/_lib/types'

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

function DeltaPill({ value, inverted = false }: { value: number; inverted?: boolean }) {
    const good = inverted ? value <= 0 : value >= 0
    return (
        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md ${good ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {value >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {value > 0 ? '+' : ''}{value}% vs mês ant.
        </span>
    )
}

export default async function ERPDashboard() {
    const supabase = await createClient()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
    const today = now.toISOString().split('T')[0]
    const in30d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString().split('T')[0]

    // ─── Core Finance ────────────────────────────────────────────────────────
    // Fetch in the same shape used by /financeiro/a-pagar e /financeiro/a-receber,
    // para que o dashboard mostre exatamente o que essas páginas mostram.
    const [
        { data: accounts },
        { data: allTxFull },
        { data: leiloes },
        { data: fechamentosFull },
    ] = await Promise.all([
        supabase.from('erp_finance_accounts').select('id, name, type, initial_balance, current_balance').order('name'),
        supabase.from('erp_finance_transactions')
            .select(`
                id, amount, type, description, observacao, transaction_date, status, account_id, category_id,
                account:erp_finance_accounts(id, name, type),
                category:erp_finance_categories(id, name, type)
            `)
            .order('transaction_date', { ascending: false })
            .limit(5000),
        supabase.from('bula_leiloes')
            .select('id, nome, data, criador, status, comissao, comissao_receber, recebido, faturamento_realizado, venda_bula, realizado_bula')
            .order('data', { ascending: false }),
        supabase.from('bula_leilao_fechamento')
            .select('id, nome, data, vgv_total, comissao_assessoria, receita_bula, sobra_bruta, por_assessor, lances')
            .order('data', { ascending: false }),
    ])

    const txsAll = (allTxFull as unknown as Transaction[]) ?? []
    const accountsList = (accounts as unknown as Account[]) ?? []
    const leiloesList = (leiloes as unknown as BulaLeilao[]) ?? []
    const fechamentosList = (fechamentosFull as unknown as FechamentoLite[]) ?? []
    // KPIs simples ainda usam shape compacto
    const allTx = txsAll.map(t => ({
        amount: t.amount,
        type: t.type,
        status: t.status,
        transaction_date: t.transaction_date,
        description: t.description,
    }))
    const fechamentos = fechamentosList.slice(0, 6)

    const totalInitial = accountsList.reduce((s, a) => s + (Number(a.initial_balance) || 0), 0)
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

    // A Receber × A Pagar — usa os MESMOS builders das páginas reais
    // (transações ERP + virtuais de fechamento/leilão) para ficar sincronizado.
    const receivables = buildReceivables(txsAll, leiloesList, fechamentosList)
    const payables = buildPayables(txsAll, fechamentosList)

    // Apenas o saldo em aberto (pendente / virtual). 'completed' já entrou no Saldo Atual.
    const isOpen = (i: UnifiedItem) => i.status !== 'completed' && i.status !== 'cancelled'
    const openReceivables = receivables.filter(isOpen)
    const openPayables = payables.filter(isOpen)

    const sumBalance = (list: UnifiedItem[]) => list.reduce((s, i) => s + (Number(i.balance) || 0), 0)

    const aReceber = sumBalance(openReceivables)
    const aPagar = sumBalance(openPayables)

    // Vencendo em 30d (≥ hoje e ≤ hoje+30d)
    const inWindow = (d: string) => d && d >= today && d <= in30d
    const venc30dReceber = sumBalance(openReceivables.filter(i => inWindow(i.dueDate)))
    const venc30dPagar = sumBalance(openPayables.filter(i => inWindow(i.dueDate)))

    // Vencidos (dueDate < hoje)
    const vencidosReceber = sumBalance(openReceivables.filter(i => i.dueDate && i.dueDate < today))
    const vencidosPagar = sumBalance(openPayables.filter(i => i.dueDate && i.dueDate < today))

    // Próximos vencimentos (top 6, mesclado a pagar + a receber)
    const proximosVenc: Array<{
        description: string
        transaction_date: string
        amount: number
        type: 'income' | 'expense'
        source: 'erp' | 'leilao' | 'fechamento'
    }> = [...openReceivables, ...openPayables]
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
        .slice(0, 6)
        .map(i => ({
            description: i.title,
            transaction_date: i.dueDate,
            amount: i.balance,
            type: i.type,
            source: i.source,
        }))

    // Últimos 6 meses (entradas × saídas) — somando todas transações independente de status
    const last6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const key = d.toISOString().substring(0, 7)
        return { key, label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '') }
    })
    const series = last6.map(({ key, label }) => {
        const monthTx = txs.filter(t => t.transaction_date?.substring(0, 7) === key)
        const income = sumBy(monthTx, 'income')
        const expense = sumBy(monthTx, 'expense')
        return { key, label, income, expense, net: income - expense }
    })

    // ─── Geometria do gráfico SVG (barras + linha de resultado) ──────────────
    const VB_W = 600
    const VB_H = 260
    const PAD_L = 52
    const PAD_R = 16
    const PAD_T = 22
    const PAD_B = 36
    const innerW = VB_W - PAD_L - PAD_R
    const innerH = VB_H - PAD_T - PAD_B

    const niceCeil = (v: number) => {
        if (v <= 0) return 1
        const exp = Math.pow(10, Math.floor(Math.log10(v)))
        const n = v / exp
        const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10
        return m * exp
    }

    const minNet = Math.min(...series.map(s => s.net), 0)
    const maxAll = Math.max(...series.map(s => Math.max(s.income, s.expense, s.net)), 1)
    const yMax = niceCeil(maxAll)
    const yMin = minNet < 0 ? -niceCeil(Math.abs(minNet)) : 0
    const yRange = yMax - yMin

    const N = series.length
    const colW = innerW / N
    const colCenter = (i: number) => PAD_L + colW * (i + 0.5)
    const ptY = (v: number) => PAD_T + (1 - (v - yMin) / yRange) * innerH
    const baseY = ptY(0)

    const buildPath = (pts: { x: number; y: number }[]) => {
        if (pts.length === 0) return ''
        let d = `M ${pts[0].x},${pts[0].y}`
        for (let i = 1; i < pts.length; i++) {
            const cx = (pts[i - 1].x + pts[i].x) / 2
            d += ` C ${cx},${pts[i - 1].y} ${cx},${pts[i].y} ${pts[i].x},${pts[i].y}`
        }
        return d
    }
    const netPts = series.map((s, i) => ({ x: colCenter(i), y: ptY(s.net) }))
    const netPath = buildPath(netPts)

    const gridSteps = [0, 0.25, 0.5, 0.75, 1]
    const totalEntradas6m = series.reduce((s, m) => s + m.income, 0)
    const totalSaidas6m = series.reduce((s, m) => s + m.expense, 0)
    const resultado6m = totalEntradas6m - totalSaidas6m

    // ─── Saldo por conta ─────────────────────────────────────────────────────
    // Só conta transações com status='completed' (cash realizado).
    const accountBalances = accountsList.map(a => {
        const balance = txsAll
            .filter(t => t.account_id === a.id && t.status === 'completed')
            .reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), Number(a.initial_balance) || 0)
        return { ...a, balance }
    })

    // ─── Composição de saídas (mês corrente, por categoria) ──────────────────
    const PALETTE = ['#D4A85C', '#A0792E', '#7C3AED', '#0EA5E9', '#10B981', '#F97316', '#EC4899', '#64748B']
    const expenseCatMap = new Map<string, number>()
    for (const t of txsAll) {
        if (t.type !== 'expense') continue
        if (!t.transaction_date || t.transaction_date < startOfMonth) continue
        if (t.transaction_date > today && t.status === 'pending') {
            // pendentes futuros entram na composição (visão "comprometido no mês")
        }
        const name = t.category?.name || 'Sem categoria'
        expenseCatMap.set(name, (expenseCatMap.get(name) || 0) + Number(t.amount))
    }
    const expenseCatTotal = Array.from(expenseCatMap.values()).reduce((s, v) => s + v, 0)
    const expenseCats = Array.from(expenseCatMap.entries())
        .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
        .sort((a, b) => b.value - a.value)
    const expenseCatsTop = expenseCats.slice(0, 5)
    const expenseCatsRest = expenseCats.slice(5)
    const expenseCatsRestSum = expenseCatsRest.reduce((s, c) => s + c.value, 0)
    const expenseCatsForChart = expenseCatsRestSum > 0
        ? [...expenseCatsTop, { name: 'Outras', value: expenseCatsRestSum, color: PALETTE[5 % PALETTE.length] }]
        : expenseCatsTop

    // ─── Heatmap diário (mês corrente) ───────────────────────────────────────
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const firstDow = new Date(now.getFullYear(), now.getMonth(), 1).getDay() // 0=dom..6=sáb
    const dowIdx = (jsDow: number) => (jsDow + 6) % 7 // SEG=0..DOM=6
    const dayVolume = new Map<number, number>()
    for (const t of txsAll) {
        if (!t.transaction_date) continue
        if (t.transaction_date < startOfMonth) continue
        const d = new Date(t.transaction_date + 'T00:00:00')
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) continue
        const dom = d.getDate()
        dayVolume.set(dom, (dayVolume.get(dom) || 0) + Number(t.amount))
    }
    const heatRows = Math.ceil((dowIdx(firstDow) + daysInMonth) / 7)
    type HeatCell = { dom: number | null; value: number; date: string | null }
    const heatGrid: HeatCell[][] = Array.from({ length: heatRows }, () => Array(7).fill(null).map(() => ({ dom: null, value: 0, date: null })))
    for (let dom = 1; dom <= daysInMonth; dom++) {
        const offset = dowIdx(firstDow) + dom - 1
        const r = Math.floor(offset / 7)
        const c = offset % 7
        const date = new Date(now.getFullYear(), now.getMonth(), dom).toISOString().split('T')[0]
        heatGrid[r][c] = { dom, value: dayVolume.get(dom) || 0, date }
    }
    const heatMax = Math.max(...Array.from(dayVolume.values()), 1)
    const heatTotalMes = Array.from(dayVolume.values()).reduce((s, v) => s + v, 0)
    const heatPicoEntry = Array.from(dayVolume.entries()).sort((a, b) => b[1] - a[1])[0]
    const heatPicoDom = heatPicoEntry?.[0] || 0
    const heatPicoValor = heatPicoEntry?.[1] || 0
    const heatDiasComMov = Array.from(dayVolume.values()).filter(v => v > 0).length
    const heatMediaDia = heatDiasComMov > 0 ? heatTotalMes / heatDiasComMov : 0
    const HEAT_DOWS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

    // ─── Donut chart (composição saídas) ─────────────────────────────────────
    const DONUT_R = 78
    const DONUT_RI = 50
    const donutSlice = (cx: number, cy: number, r: number, ri: number, a0: number, a1: number) => {
        const x1 = cx + r * Math.cos(a0)
        const y1 = cy + r * Math.sin(a0)
        const x2 = cx + r * Math.cos(a1)
        const y2 = cy + r * Math.sin(a1)
        const xi1 = cx + ri * Math.cos(a0)
        const yi1 = cy + ri * Math.sin(a0)
        const xi2 = cx + ri * Math.cos(a1)
        const yi2 = cy + ri * Math.sin(a1)
        const large = a1 - a0 > Math.PI ? 1 : 0
        return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1} Z`
    }
    const donutSlices = expenseCatsForChart.reduce<Array<{ name: string; value: number; color: string; path: string; pct: number; endAngle: number }>>((acc, c) => {
        const a0 = acc.length === 0 ? -Math.PI / 2 : acc[acc.length - 1].endAngle
        const a1 = a0 + (expenseCatTotal > 0 ? (c.value / expenseCatTotal) * Math.PI * 2 : 0)
        acc.push({
            ...c,
            path: donutSlice(100, 100, DONUT_R, DONUT_RI, a0, a1),
            pct: expenseCatTotal > 0 ? (c.value / expenseCatTotal) * 100 : 0,
            endAngle: a1,
        })
        return acc
    }, [])

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
            color: 'from-[#A0792E] to-[#9A7209]',
            textColor: 'text-[#D4A85C]',
            bgColor: 'bg-[#A0792E]/10',
            borderColor: 'border-[#A0792E]/20',
        },
        {
            name: 'Leilões',
            description: 'Receita, comissão e fechamentos de leilões da Bula Genética.',
            href: '/leiloes',
            icon: Gavel,
            color: 'from-[#A0792E] to-[#9A7209]',
            textColor: 'text-[#D4A85C]',
            bgColor: 'bg-[#A0792E]/10',
            borderColor: 'border-[#A0792E]/20',
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

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* ─── Header ───────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4A85C] via-[#FFF8DC] to-[#D4A85C] text-transparent bg-clip-text">
                        Dashboard ERP
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                        <Activity className="w-4 h-4 text-[#A0792E]" />
                        Visão Geral Estratégica · {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/financeiro/fluxo-caixa"
                        className="px-5 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-[#A0792E]/50 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-[#A0792E]/20 flex items-center gap-2"
                    >
                        <BarChart3 className="w-4 h-4 text-[#D4A85C]" />
                        Fluxo de Caixa
                    </Link>
                </div>
            </div>

            {/* ─── KPI Row: Financial Pulse (4) ─────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Saldo Atual */}
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#A0792E]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Saldo Atual</p>
                        <div className="p-2 bg-[#A0792E]/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Wallet className="w-5 h-5 text-[#D4A85C]" />
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
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#A0792E]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Resultado (Mês)</p>
                        <div className="p-2 bg-[#A0792E]/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Trophy className="w-5 h-5 text-[#D4A85C]" />
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
                    className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#A0792E]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Receita Leilões (12m)</p>
                        <Gavel className="w-5 h-5 text-[#D4A85C]" />
                    </div>
                    <p className="text-2xl font-extrabold text-[#D4A85C] tracking-tight">
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
                {/* Area chart — 6 meses */}
                <div className="lg:col-span-3 bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#A0792E] to-[#D4A85C] rounded-full" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Fluxo de Caixa — últimos 6 meses
                            </h3>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1.5 text-emerald-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Entradas
                            </span>
                            <span className="flex items-center gap-1.5 text-rose-500">
                                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Saídas
                            </span>
                            <span className="flex items-center gap-1.5 text-[#D4A85C]">
                                <span className="w-3 h-[2px] bg-[#D4A85C] rounded-full" /> Resultado
                            </span>
                        </div>
                    </div>

                    {/* SVG Bars + Resultado line */}
                    <div className="w-full">
                        <svg
                            viewBox={`0 0 ${VB_W} ${VB_H}`}
                            className="w-full h-auto"
                            preserveAspectRatio="xMidYMid meet"
                            role="img"
                            aria-label="Gráfico de fluxo de caixa últimos 6 meses"
                        >
                            <defs>
                                <linearGradient id="incomeBarGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <linearGradient id="expenseBarGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#fb7185" />
                                    <stop offset="100%" stopColor="#e11d48" />
                                </linearGradient>
                            </defs>

                            {/* Grid horizontal + labels Y */}
                            {gridSteps.map((t, i) => {
                                const y = PAD_T + t * innerH
                                const v = yMax - t * yRange
                                return (
                                    <g key={i}>
                                        <line
                                            x1={PAD_L} x2={VB_W - PAD_R}
                                            y1={y} y2={y}
                                            className="stroke-gray-200 dark:stroke-[#1f1f1f]"
                                            strokeWidth="1"
                                            strokeDasharray={Math.abs(v) < 0.01 ? '0' : '3 5'}
                                        />
                                        <text
                                            x={PAD_L - 10} y={y + 3}
                                            textAnchor="end"
                                            className="fill-gray-400 dark:fill-[#666]"
                                            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}
                                        >
                                            {formatShort(v)}
                                        </text>
                                    </g>
                                )
                            })}

                            {/* Barras */}
                            {series.map((s, i) => {
                                const cx = colCenter(i)
                                const barW = Math.min(22, colW * 0.32)
                                const gap = 4
                                const inX = cx - barW - gap / 2
                                const outX = cx + gap / 2
                                const inTop = ptY(s.income)
                                const outTop = ptY(s.expense)
                                const inH = Math.max(0, baseY - inTop)
                                const outH = Math.max(0, baseY - outTop)
                                return (
                                    <g key={s.key}>
                                        <rect x={inX} y={inTop} width={barW} height={inH} rx={4} fill="url(#incomeBarGrad)">
                                            <title>{`${s.label.toUpperCase()} · Entradas: ${formatCurrency(s.income)}`}</title>
                                        </rect>
                                        <rect x={outX} y={outTop} width={barW} height={outH} rx={4} fill="url(#expenseBarGrad)">
                                            <title>{`${s.label.toUpperCase()} · Saídas: ${formatCurrency(s.expense)}`}</title>
                                        </rect>
                                    </g>
                                )
                            })}

                            {/* Linha de resultado */}
                            <path d={netPath} fill="none" stroke="#D4A85C" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                            {netPts.map((p, i) => (
                                <g key={`net-${i}`}>
                                    <circle cx={p.x} cy={p.y} r="6" fill="#D4A85C" fillOpacity="0.18" />
                                    <circle cx={p.x} cy={p.y} r="3.5" className="fill-white dark:fill-[#0F0F0F]" stroke="#D4A85C" strokeWidth="2">
                                        <title>{`${series[i].label.toUpperCase()} · Resultado: ${formatCurrency(series[i].net)}`}</title>
                                    </circle>
                                </g>
                            ))}

                            {/* Labels eixo X */}
                            {series.map((s, i) => (
                                <text
                                    key={s.key}
                                    x={colCenter(i)} y={VB_H - 12}
                                    textAnchor="middle"
                                    className="fill-gray-400 dark:fill-[#666]"
                                    style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase' }}
                                >
                                    {s.label.toUpperCase()}
                                </text>
                            ))}
                        </svg>
                    </div>

                    {/* Sumário 6m */}
                    <div className="mt-5 pt-5 border-t border-gray-100 dark:border-[#1A1A1A] grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-1">Entradas 6m</p>
                            <p className="text-base font-extrabold text-emerald-500 tracking-tight">{formatCurrency(totalEntradas6m)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-1">Saídas 6m</p>
                            <p className="text-base font-extrabold text-rose-500 tracking-tight">{formatCurrency(totalSaidas6m)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-1">Resultado 6m</p>
                            <p className={`text-base font-extrabold tracking-tight ${resultado6m >= 0 ? 'text-[#D4A85C]' : 'text-rose-500'}`}>
                                {formatCurrency(resultado6m)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Próximos Vencimentos */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#A0792E] to-[#D4A85C] rounded-full" />
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
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${vencido ? 'border-rose-500/30 bg-rose-500/5' : 'border-gray-200 dark:border-[#222] hover:border-[#A0792E]/30'}`}
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

            {/* ─── Composição Saídas + Heatmap + Contas ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                {/* Composição de Saídas (donut) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#A0792E] to-[#D4A85C] rounded-full" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Composição de Saídas
                            </h3>
                        </div>
                        <PieChart className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-3">
                        {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · {formatCurrency(expenseCatTotal)}
                    </p>

                    {expenseCatTotal > 0 ? (
                        <div className="flex items-center justify-center mb-4">
                            <svg viewBox="0 0 200 200" className="w-44 h-44" preserveAspectRatio="xMidYMid meet">
                                {donutSlices.map((s, i) => (
                                    <path key={i} d={s.path} fill={s.color}>
                                        <title>{`${s.name}: ${formatCurrency(s.value)} (${s.pct.toFixed(1)}%)`}</title>
                                    </path>
                                ))}
                                <text x="100" y="96" textAnchor="middle" className="fill-gray-900 dark:fill-white" style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
                                    {formatShort(expenseCatTotal)}
                                </text>
                                <text x="100" y="116" textAnchor="middle" className="fill-gray-400 dark:fill-[#666]" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                                    Total · {expenseCats.length} cat
                                </text>
                            </svg>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-44 mb-4">
                            <p className="text-xs text-gray-400 dark:text-[#555] uppercase tracking-widest">Sem saídas no mês</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        {expenseCatsForChart.map((c, i) => (
                            <div key={i} className="flex items-center justify-between gap-2 text-[11px]">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: c.color }} />
                                    <span className="truncate text-gray-700 dark:text-gray-300 font-semibold">{c.name}</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                    {formatShort(c.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Heatmap diário */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#A0792E] to-[#D4A85C] rounded-full" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Heatmap Diário
                            </h3>
                        </div>
                        <Flame className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-4">
                        Volume movimentado · {now.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '')}
                    </p>

                    <div className="space-y-1">
                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {HEAT_DOWS.map(d => (
                                <div key={d} className="text-center text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666]">
                                    {d}
                                </div>
                            ))}
                        </div>
                        {heatGrid.map((row, ri) => (
                            <div key={ri} className="grid grid-cols-7 gap-1">
                                {row.map((cell, ci) => {
                                    if (cell.dom === null) {
                                        return <div key={ci} className="aspect-square rounded-md bg-gray-50 dark:bg-[#0A0A0A]" />
                                    }
                                    const intensity = cell.value / heatMax
                                    const isToday = cell.date === today
                                    const opacity = cell.value > 0 ? 0.18 + intensity * 0.82 : 0
                                    return (
                                        <div
                                            key={ci}
                                            className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-bold transition-all ${isToday ? 'ring-1 ring-[#D4A85C]/60' : ''}`}
                                            style={{
                                                backgroundColor: cell.value > 0
                                                    ? `rgba(212,168,92, ${opacity})`
                                                    : 'rgba(36, 36, 36, 0.25)',
                                                color: cell.value > 0 && intensity > 0.6 ? '#0a0a0a' : '#888',
                                            }}
                                            title={cell.value > 0 ? `Dia ${cell.dom}: ${formatCurrency(cell.value)}` : `Dia ${cell.dom}`}
                                        >
                                            {cell.value > 0 ? formatShort(cell.value).replace('R$ ', '') : cell.dom}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#1A1A1A] grid grid-cols-3 gap-3 text-[10px]">
                        <div>
                            <p className="font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-1">Total mês</p>
                            <p className="text-sm font-extrabold text-[#D4A85C]">{formatShort(heatTotalMes)}</p>
                        </div>
                        <div>
                            <p className="font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-1">Pico</p>
                            <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                                {heatPicoDom > 0 ? `Dia ${heatPicoDom} · ${formatShort(heatPicoValor)}` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-1">Média/dia</p>
                            <p className="text-sm font-extrabold text-gray-900 dark:text-white">{formatShort(heatMediaDia)}</p>
                        </div>
                    </div>
                </div>

                {/* Contas & saldos */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#A0792E] to-[#D4A85C] rounded-full" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Contas & Saldos
                            </h3>
                        </div>
                        <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666] mb-4">
                        {accountBalances.length} {accountBalances.length === 1 ? 'conta conectada' : 'contas conectadas'}
                    </p>

                    {accountBalances.length > 0 ? (
                        <div className="space-y-2">
                            {accountBalances.map(a => (
                                <div
                                    key={a.id}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-[#1A1A1A] hover:border-[#A0792E]/30 transition-all"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-9 h-9 rounded-lg bg-[#A0792E]/10 border border-[#A0792E]/20 flex items-center justify-center flex-shrink-0">
                                            <Building2 className="w-4 h-4 text-[#D4A85C]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.name}</p>
                                            {a.type && (
                                                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#666]">
                                                    {a.type}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-sm font-extrabold whitespace-nowrap ${a.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-rose-500'}`}>
                                        {formatCurrency(a.balance)}
                                    </span>
                                </div>
                            ))}
                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#1A1A1A] flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#666]">Saldo consolidado</span>
                                <span className="text-base font-extrabold text-[#D4A85C]">
                                    {formatCurrency(accountBalances.reduce((s, a) => s + a.balance, 0))}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-xs text-gray-400 dark:text-[#555] py-8 uppercase tracking-widest">
                            Nenhuma conta cadastrada
                        </p>
                    )}
                </div>
            </div>

            {/* ─── Últimos Leilões ──────────────────────────────────── */}
            {fechs.length > 0 && (
                <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-gray-100 dark:border-[#222] flex items-center justify-between bg-gradient-to-r from-[#A0792E]/5 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-5 bg-gradient-to-b from-[#A0792E] to-[#D4A85C] rounded-full" />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Últimos Fechamentos de Leilão
                            </h3>
                        </div>
                        <Link
                            href="/leiloes"
                            className="text-[10px] font-bold uppercase tracking-widest text-[#D4A85C] hover:text-[#A0792E] flex items-center gap-1"
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
                                        <td className="px-6 py-4 text-right text-[#D4A85C] font-extrabold">
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
                    <div className="w-1.5 h-6 bg-gradient-to-b from-[#A0792E] to-[#D4A85C] rounded-full" />
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
