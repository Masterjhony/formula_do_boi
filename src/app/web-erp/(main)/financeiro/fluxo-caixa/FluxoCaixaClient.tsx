'use client';

import { useMemo, useState } from 'react';
import {
    Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
    BarChart3, Sparkles, Calendar, Target, Activity,
    Download, Printer, FileSpreadsheet, Building2, AlertTriangle,
    ChevronDown, ChevronUp, Scale, LineChart,
} from 'lucide-react';
import type { Account, Category, Transaction, FechamentoLite } from '../_lib/types';

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════
const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtShort = (v: number) => {
    const abs = Math.abs(v);
    const sig = v < 0 ? '-' : '';
    if (abs >= 1_000_000) return `${sig}R$ ${(abs / 1_000_000).toFixed(2)} mi`;
    if (abs >= 1_000) return `${sig}R$ ${(abs / 1_000).toFixed(1)} mil`;
    return `${sig}R$ ${abs.toFixed(0)}`;
};

const fmtMonth = (key: string) => {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
};

const fmtMonthLong = (key: string) => {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

const CAT_COLORS = [
    '#D4AF37', '#10B981', '#F43F5E', '#3B82F6', '#8B5CF6',
    '#F97316', '#06B6D4', '#EC4899', '#84CC16', '#6366F1',
    '#F59E0B', '#14B8A6', '#EF4444', '#60A5FA', '#A78BFA',
];

// Delta pill
function Delta({ v, inverse = false }: { v: number; inverse?: boolean }) {
    if (!isFinite(v) || v === 0) {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-500/10 text-gray-400 uppercase tracking-wider">
                —
            </span>
        );
    }
    const positive = inverse ? v < 0 : v > 0;
    const cls = positive
        ? 'bg-emerald-500/10 text-emerald-500'
        : 'bg-rose-500/10 text-rose-500';
    const Icon = v > 0 ? TrendingUp : TrendingDown;
    return (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${cls}`}>
            <Icon className="w-3 h-3" />
            {v > 0 ? '+' : ''}{v.toFixed(1)}%
        </span>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════
interface Props {
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
    fechamentos: FechamentoLite[];
}

type Granularity = 'month' | 'quarter' | 'year';

export default function FluxoCaixaClient({ accounts, transactions, fechamentos }: Props) {
    const [granularity, setGranularity] = useState<Granularity>('month');
    const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
    const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
    const [showDRE, setShowDRE] = useState(true);
    const [showProjection, setShowProjection] = useState(true);

    // ── Derived: available years ─────────────────────────────────────────
    const years = useMemo(() => {
        const set = new Set<string>();
        for (const tx of transactions) {
            const y = tx.transaction_date?.substring(0, 4);
            if (y) set.add(y);
        }
        const arr = Array.from(set).sort();
        if (!arr.includes(String(new Date().getFullYear()))) arr.push(String(new Date().getFullYear()));
        return arr.sort();
    }, [transactions]);

    // ── Saldo inicial (baseline saldo inicial contas) ─────────────────────
    const initialBalance = useMemo(
        () => accounts.reduce((s, a) => s + Number(a.initial_balance || 0), 0),
        [accounts],
    );

    // ── Filter transactions for selected period ──────────────────────────
    const filtered = useMemo(() => {
        return transactions.filter(tx => {
            if (tx.status === 'cancelled') return false;
            if (showOnlyCompleted && tx.status !== 'completed') return false;
            if (!tx.transaction_date) return false;
            return tx.transaction_date.startsWith(selectedYear);
        });
    }, [transactions, selectedYear, showOnlyCompleted]);

    // Previous year (for YoY)
    const filteredPrev = useMemo(() => {
        const prev = String(Number(selectedYear) - 1);
        return transactions.filter(tx => {
            if (tx.status === 'cancelled') return false;
            if (showOnlyCompleted && tx.status !== 'completed') return false;
            return tx.transaction_date?.startsWith(prev);
        });
    }, [transactions, selectedYear, showOnlyCompleted]);

    // ── Monthly rollup ────────────────────────────────────────────────────
    const monthly = useMemo(() => {
        const map = new Map<string, {
            income: number; expense: number;
            incomeDone: number; expenseDone: number;
            pendingIn: number; pendingOut: number;
            catExp: Map<string, number>;
            catInc: Map<string, number>;
            supplierExp: Map<string, number>;
            clientInc: Map<string, number>;
        }>();
        for (const tx of filtered) {
            const m = tx.transaction_date.substring(0, 7);
            const cur = map.get(m) || {
                income: 0, expense: 0,
                incomeDone: 0, expenseDone: 0,
                pendingIn: 0, pendingOut: 0,
                catExp: new Map(), catInc: new Map(),
                supplierExp: new Map(), clientInc: new Map(),
            };
            const amt = Number(tx.amount) || 0;
            const catName = tx.category?.name || '— Sem categoria';
            if (tx.type === 'income') {
                cur.income += amt;
                if (tx.status === 'completed') cur.incomeDone += amt;
                else cur.pendingIn += amt;
                cur.catInc.set(catName, (cur.catInc.get(catName) || 0) + amt);
                const k = tx.description?.trim() || catName;
                cur.clientInc.set(k, (cur.clientInc.get(k) || 0) + amt);
            } else if (tx.type === 'expense') {
                cur.expense += amt;
                if (tx.status === 'completed') cur.expenseDone += amt;
                else cur.pendingOut += amt;
                cur.catExp.set(catName, (cur.catExp.get(catName) || 0) + amt);
                const k = tx.description?.trim() || catName;
                cur.supplierExp.set(k, (cur.supplierExp.get(k) || 0) + amt);
            }
            map.set(m, cur);
        }
        // Ensure all 12 months are represented
        for (let i = 1; i <= 12; i++) {
            const mk = `${selectedYear}-${String(i).padStart(2, '0')}`;
            if (!map.has(mk)) {
                map.set(mk, {
                    income: 0, expense: 0,
                    incomeDone: 0, expenseDone: 0,
                    pendingIn: 0, pendingOut: 0,
                    catExp: new Map(), catInc: new Map(),
                    supplierExp: new Map(), clientInc: new Map(),
                });
            }
        }
        const entries = Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, d]) => ({
                month,
                label: fmtMonth(month),
                labelLong: fmtMonthLong(month),
                income: d.income,
                expense: d.expense,
                net: d.income - d.expense,
                incomeDone: d.incomeDone,
                expenseDone: d.expenseDone,
                pendingIn: d.pendingIn,
                pendingOut: d.pendingOut,
                catExp: d.catExp,
                catInc: d.catInc,
                supplierExp: d.supplierExp,
                clientInc: d.clientInc,
            }));
        // Running balance
        let bal = initialBalance;
        return entries.map(e => {
            const openBal = bal;
            bal += e.net;
            return { ...e, openBalance: openBal, closeBalance: bal };
        });
    }, [filtered, initialBalance, selectedYear]);

    // ── Quarterly rollup ─────────────────────────────────────────────────
    const quarterly = useMemo(() => {
        const qs = [
            { key: 'Q1', months: [0, 1, 2] },
            { key: 'Q2', months: [3, 4, 5] },
            { key: 'Q3', months: [6, 7, 8] },
            { key: 'Q4', months: [9, 10, 11] },
        ];
        return qs.map(q => {
            const slice = q.months.map(i => monthly[i]).filter(Boolean);
            const income = slice.reduce((s, m) => s + m.income, 0);
            const expense = slice.reduce((s, m) => s + m.expense, 0);
            return {
                key: q.key,
                label: `${q.key}/${selectedYear.substring(2)}`,
                income, expense,
                net: income - expense,
                openBalance: slice[0]?.openBalance ?? 0,
                closeBalance: slice[slice.length - 1]?.closeBalance ?? 0,
            };
        });
    }, [monthly, selectedYear]);

    // ── Period totals ────────────────────────────────────────────────────
    const totals = useMemo(() => {
        const income = monthly.reduce((s, m) => s + m.income, 0);
        const expense = monthly.reduce((s, m) => s + m.expense, 0);
        const incomeDone = monthly.reduce((s, m) => s + m.incomeDone, 0);
        const expenseDone = monthly.reduce((s, m) => s + m.expenseDone, 0);
        const pendingIn = monthly.reduce((s, m) => s + m.pendingIn, 0);
        const pendingOut = monthly.reduce((s, m) => s + m.pendingOut, 0);
        const net = income - expense;
        const finalBalance = monthly[monthly.length - 1]?.closeBalance ?? initialBalance;
        const margin = income > 0 ? (net / income) * 100 : 0;
        return { income, expense, incomeDone, expenseDone, pendingIn, pendingOut, net, finalBalance, margin };
    }, [monthly, initialBalance]);

    // ── Previous year totals (for YoY) ────────────────────────────────────
    const totalsPrev = useMemo(() => {
        let income = 0, expense = 0;
        for (const tx of filteredPrev) {
            const a = Number(tx.amount) || 0;
            if (tx.type === 'income') income += a;
            else if (tx.type === 'expense') expense += a;
        }
        return { income, expense, net: income - expense };
    }, [filteredPrev]);

    const delta = (cur: number, prev: number) => {
        if (!prev) return 0;
        return ((cur - prev) / Math.abs(prev)) * 100;
    };

    // ── Category aggregate over period ───────────────────────────────────
    const categoryBreakdown = useMemo(() => {
        const exp = new Map<string, number>();
        const inc = new Map<string, number>();
        for (const m of monthly) {
            for (const [k, v] of m.catExp) exp.set(k, (exp.get(k) || 0) + v);
            for (const [k, v] of m.catInc) inc.set(k, (inc.get(k) || 0) + v);
        }
        const eTotal = Array.from(exp.values()).reduce((s, v) => s + v, 0);
        const iTotal = Array.from(inc.values()).reduce((s, v) => s + v, 0);
        return {
            expenses: Array.from(exp.entries()).map(([name, total]) => ({
                name, total, pct: eTotal > 0 ? (total / eTotal) * 100 : 0,
            })).sort((a, b) => b.total - a.total),
            incomes: Array.from(inc.entries()).map(([name, total]) => ({
                name, total, pct: iTotal > 0 ? (total / iTotal) * 100 : 0,
            })).sort((a, b) => b.total - a.total),
        };
    }, [monthly]);

    // Top suppliers/clients across period
    const tops = useMemo(() => {
        const sup = new Map<string, number>();
        const cli = new Map<string, number>();
        for (const m of monthly) {
            for (const [k, v] of m.supplierExp) sup.set(k, (sup.get(k) || 0) + v);
            for (const [k, v] of m.clientInc) cli.set(k, (cli.get(k) || 0) + v);
        }
        return {
            suppliers: Array.from(sup.entries()).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 10),
            clients: Array.from(cli.entries()).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 10),
        };
    }, [monthly]);

    // Max for bar scaling
    const maxFlow = useMemo(
        () => Math.max(...monthly.map(m => Math.max(m.income, m.expense)), 1),
        [monthly],
    );

    // ── Projeção 90 dias (baseado em pendentes futuros) ─────────────────
    const projection = useMemo(() => {
        const todayISO = new Date().toISOString().split('T')[0];
        const ninety = new Date(); ninety.setDate(ninety.getDate() + 90);
        const ninetyISO = ninety.toISOString().split('T')[0];
        let proIn = 0, proOut = 0;
        const items: Array<{ date: string; amount: number; type: 'income' | 'expense'; description: string }> = [];
        for (const tx of transactions) {
            if (tx.status !== 'pending') continue;
            if (!tx.transaction_date) continue;
            if (tx.transaction_date < todayISO) continue;
            if (tx.transaction_date > ninetyISO) continue;
            const a = Number(tx.amount) || 0;
            if (tx.type === 'income') proIn += a;
            else if (tx.type === 'expense') proOut += a;
            items.push({
                date: tx.transaction_date, amount: a, type: tx.type as 'income' | 'expense',
                description: tx.description || '—',
            });
        }
        items.sort((a, b) => a.date.localeCompare(b.date));
        // Add leilão fechamentos receita
        const f90Receita = fechamentos
            .filter(f => f.data && f.data >= todayISO && f.data <= ninetyISO)
            .reduce((s, f) => s + (Number(f.receita_bula) || 0), 0);
        const f90Comissao = fechamentos
            .filter(f => f.data && f.data >= todayISO && f.data <= ninetyISO)
            .reduce((s, f) => s + (Number(f.comissao_assessoria) || 0), 0);
        return {
            entradas: proIn + f90Receita,
            saidas: proOut + f90Comissao,
            liquido: (proIn + f90Receita) - (proOut + f90Comissao),
            items: items.slice(0, 15),
        };
    }, [transactions, fechamentos]);

    // ── DRE Estimada Mensal ──────────────────────────────────────────────
    // Simples aproximação: Receita - Impostos (simulado 15%) - Despesas (vari + fix split)
    const dre = useMemo(() => {
        const rows = monthly.map(m => {
            const receita = m.income;
            const impostos = receita * 0.08;      // simulação: 8% de tributos médios
            const receitaLiq = receita - impostos;
            // categoriza despesas: juros bancários / contabilidade / taxas = fixas
            let variaveis = 0, fixas = 0;
            for (const [k, v] of m.catExp) {
                const low = k.toLowerCase();
                if (low.includes('fix') || low.includes('aluguel') || low.includes('salário') || low.includes('contabilidade') || low.includes('internet') || low.includes('imposto')) {
                    fixas += v;
                } else {
                    variaveis += v;
                }
            }
            const ebitda = receitaLiq - variaveis - fixas;
            const margemEbitda = receita > 0 ? (ebitda / receita) * 100 : 0;
            return { month: m.month, label: m.label, receita, impostos, receitaLiq, variaveis, fixas, ebitda, margemEbitda };
        });
        const sum = rows.reduce((a, r) => ({
            receita: a.receita + r.receita,
            impostos: a.impostos + r.impostos,
            receitaLiq: a.receitaLiq + r.receitaLiq,
            variaveis: a.variaveis + r.variaveis,
            fixas: a.fixas + r.fixas,
            ebitda: a.ebitda + r.ebitda,
        }), { receita: 0, impostos: 0, receitaLiq: 0, variaveis: 0, fixas: 0, ebitda: 0 });
        return { rows, sum, margem: sum.receita > 0 ? (sum.ebitda / sum.receita) * 100 : 0 };
    }, [monthly]);

    // ── Insights / Leitura Executiva ──────────────────────────────────────
    const insights = useMemo(() => {
        const list: Array<{ kind: 'positive' | 'warning' | 'info'; title: string; body: string }> = [];
        // Delta net vs prev year
        if (totalsPrev.income > 0) {
            const dn = delta(totals.income, totalsPrev.income);
            list.push({
                kind: dn >= 0 ? 'positive' : 'warning',
                title: dn >= 0 ? 'Receita cresceu vs. ano anterior' : 'Receita recuou vs. ano anterior',
                body: `Receita ${dn >= 0 ? '+' : ''}${dn.toFixed(1)}% vs ${Number(selectedYear) - 1} (${fmt(totals.income)} vs ${fmt(totalsPrev.income)}).`,
            });
        }
        // Melhor e pior mês
        const validMonths = monthly.filter(m => m.income > 0 || m.expense > 0);
        if (validMonths.length > 0) {
            const best = validMonths.reduce((a, b) => b.net > a.net ? b : a);
            const worst = validMonths.reduce((a, b) => b.net < a.net ? b : a);
            list.push({
                kind: 'info',
                title: `Melhor mês: ${best.labelLong}`,
                body: `Resultado líquido de ${fmt(best.net)} — ${fmt(best.income)} entradas x ${fmt(best.expense)} saídas.`,
            });
            if (worst.net < 0) {
                list.push({
                    kind: 'warning',
                    title: `Mês mais apertado: ${worst.labelLong}`,
                    body: `Resultado líquido de ${fmt(worst.net)}. Revisar grandes despesas do mês.`,
                });
            }
        }
        // Maior categoria de despesa
        if (categoryBreakdown.expenses.length > 0) {
            const top = categoryBreakdown.expenses[0];
            list.push({
                kind: 'info',
                title: `Maior despesa: ${top.name}`,
                body: `${fmt(top.total)} no período (${top.pct.toFixed(1)}% do total de saídas). Avalie ROI e renegociações.`,
            });
        }
        // Projeção 90 dias
        if (projection.liquido < 0) {
            list.push({
                kind: 'warning',
                title: 'Projeção 90 dias negativa',
                body: `Entradas previstas ${fmt(projection.entradas)} x saídas ${fmt(projection.saidas)} — déficit de ${fmt(Math.abs(projection.liquido))}. Antecipar recebimentos ou renegociar vencimentos.`,
            });
        } else if (projection.liquido > 0) {
            list.push({
                kind: 'positive',
                title: 'Projeção 90 dias positiva',
                body: `Previsão de ${fmt(projection.liquido)} líquidos — espaço para investir ou distribuir.`,
            });
        }
        // Alerta saldo final
        if (totals.finalBalance < 0) {
            list.push({
                kind: 'warning',
                title: 'Saldo final projetado negativo',
                body: `Saldo consolidado ao fim de ${selectedYear}: ${fmt(totals.finalBalance)}.`,
            });
        }
        return list;
    }, [totals, totalsPrev, selectedYear, monthly, categoryBreakdown, projection]);

    // ── CSV Export ───────────────────────────────────────────────────────
    const handleExportCSV = () => {
        const rows: string[][] = [
            ['Mês', 'Saldo Inicial', 'Entradas', 'Saídas', 'Resultado', 'Saldo Final'],
            ...monthly.map(m => [
                m.labelLong,
                m.openBalance.toFixed(2).replace('.', ','),
                m.income.toFixed(2).replace('.', ','),
                m.expense.toFixed(2).replace('.', ','),
                m.net.toFixed(2).replace('.', ','),
                m.closeBalance.toFixed(2).replace('.', ','),
            ]),
            [],
            ['DRE Estimada'],
            ['Mês', 'Receita', 'Impostos', 'Receita Líquida', 'Desp. Variáveis', 'Desp. Fixas', 'EBITDA', 'Margem %'],
            ...dre.rows.map(r => [
                r.label,
                r.receita.toFixed(2).replace('.', ','),
                r.impostos.toFixed(2).replace('.', ','),
                r.receitaLiq.toFixed(2).replace('.', ','),
                r.variaveis.toFixed(2).replace('.', ','),
                r.fixas.toFixed(2).replace('.', ','),
                r.ebitda.toFixed(2).replace('.', ','),
                r.margemEbitda.toFixed(2).replace('.', ','),
            ]),
        ];
        const csv = '\ufeff' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fluxo-caixa-${selectedYear}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const topMonths = useMemo(() => {
        return [...monthly]
            .filter(m => m.income > 0 || m.expense > 0)
            .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
            .slice(0, 3);
    }, [monthly]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 print:pb-0">
            {/* ─── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 md:gap-4">
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-1.5 sm:mb-2">
                            Financeiro · Fluxo de Caixa
                        </p>
                        <h2 className="text-xl sm:text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#D4AF37] text-transparent bg-clip-text">
                            Fluxo de Caixa
                        </h2>
                        <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                            DRE mensal · Projeção 90d · Consolidado
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-[#B8860B]/50 text-gray-900 dark:text-white text-xs font-bold rounded-xl transition-all uppercase tracking-widest"
                        >
                            <Printer className="w-4 h-4" /> Imprimir
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-emerald-500/50 text-gray-900 dark:text-white text-xs font-bold rounded-xl transition-all uppercase tracking-widest"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> CSV
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center print:hidden">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#111] p-1 rounded-xl overflow-x-auto max-w-full">
                        {years.map(y => (
                            <button
                                key={y}
                                onClick={() => setSelectedYear(y)}
                                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedYear === y
                                        ? 'bg-[#D4AF37] text-black shadow'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#111] p-1 rounded-xl">
                        {(['month', 'quarter', 'year'] as Granularity[]).map(g => (
                            <button
                                key={g}
                                onClick={() => setGranularity(g)}
                                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    granularity === g
                                        ? 'bg-white dark:bg-[#222] text-[#D4AF37] shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {g === 'month' ? 'Mensal' : g === 'quarter' ? 'Trim.' : 'Anual'}
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-[#111] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showOnlyCompleted}
                            onChange={e => setShowOnlyCompleted(e.target.checked)}
                            className="w-4 h-4 accent-[#D4AF37]"
                        />
                        <span className="text-[11px] sm:text-xs font-bold text-gray-600 dark:text-[#AAA] uppercase tracking-wider">
                            Só efetivados
                        </span>
                    </label>
                </div>
            </div>

            {/* ─── Executive KPIs ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Saldo Inicial */}
                <KpiCard
                    label="Saldo Inicial"
                    value={fmt(initialBalance)}
                    icon={<Wallet className="w-5 h-5" />}
                    color="gold"
                    sub={`Base ${selectedYear}`}
                />
                {/* Entradas */}
                <KpiCard
                    label="Entradas"
                    value={fmt(totals.income)}
                    icon={<ArrowUpRight className="w-5 h-5" />}
                    color="emerald"
                    delta={<Delta v={delta(totals.income, totalsPrev.income)} />}
                    sub={`${fmt(totals.incomeDone)} efetivados`}
                />
                {/* Saídas */}
                <KpiCard
                    label="Saídas"
                    value={fmt(totals.expense)}
                    icon={<ArrowDownRight className="w-5 h-5" />}
                    color="rose"
                    delta={<Delta v={delta(totals.expense, totalsPrev.expense)} inverse />}
                    sub={`${fmt(totals.expenseDone)} efetivados`}
                />
                {/* Resultado */}
                <KpiCard
                    label="Resultado"
                    value={fmt(totals.net)}
                    icon={<Scale className="w-5 h-5" />}
                    color={totals.net >= 0 ? 'emerald' : 'rose'}
                    delta={<Delta v={delta(totals.net, totalsPrev.net)} />}
                    sub={`margem ${totals.margin.toFixed(1)}%`}
                />
                {/* Saldo Final */}
                <KpiCard
                    label="Saldo Final"
                    value={fmt(totals.finalBalance)}
                    icon={<Target className="w-5 h-5" />}
                    color={totals.finalBalance >= 0 ? 'gold' : 'rose'}
                    sub={`Dez/${selectedYear.substring(2)} projetado`}
                />
                {/* Projeção 90d */}
                <KpiCard
                    label="Previsto 90d"
                    value={fmt(projection.liquido)}
                    icon={<Activity className="w-5 h-5" />}
                    color={projection.liquido >= 0 ? 'emerald' : 'rose'}
                    sub={`+${fmtShort(projection.entradas)} / -${fmtShort(projection.saidas)}`}
                />
            </div>

            {/* ─── Leitura Executiva ──────────────────────────────────── */}
            {insights.length > 0 && (
                <div className="bg-gradient-to-br from-[#B8860B]/10 via-white to-transparent dark:from-[#B8860B]/10 dark:via-[#0F0F0F] dark:to-[#0A0A0A] rounded-2xl border border-[#B8860B]/30 shadow-xl overflow-hidden">
                    <div className="p-5 border-b border-[#B8860B]/20 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Leitura Executiva</h3>
                            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">
                                Insights automáticos · {insights.length} destaque(s)
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-[#1A1A1A]">
                        {insights.map((ins, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-[#0F0F0F]">
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                                        ins.kind === 'positive' ? 'bg-emerald-500/10 text-emerald-500' :
                                        ins.kind === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                        {ins.kind === 'positive' ? <TrendingUp className="w-4 h-4" /> :
                                         ins.kind === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                         <Activity className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{ins.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-[#AAA] leading-relaxed">{ins.body}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── Waterfall / Evolução mensal ────────────────────────── */}
            <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#222] bg-gradient-to-r from-[#B8860B]/5 to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20 shrink-0">
                            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm truncate">
                                Evolução Mensal · {selectedYear}
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest hidden sm:block">
                                Entradas x Saídas · Saldo acumulado
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                            <span className="w-3 h-3 rounded-full bg-emerald-500" /> Entradas
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                            <span className="w-3 h-3 rounded-full bg-rose-500" /> Saídas
                        </span>
                        <span className="flex items-center gap-1.5 text-[#D4AF37] font-bold">
                            <span className="w-3 h-3 rounded-full bg-[#D4AF37]" /> Saldo
                        </span>
                    </div>
                </div>

                {granularity === 'month' && (
                    <div className="overflow-x-auto">
                        <div className="min-w-[640px] sm:min-w-[960px] p-4 sm:p-6">
                            {/* Chart area */}
                            <div className="relative h-56 flex items-end justify-between gap-2 border-b-2 border-gray-200 dark:border-[#222]">
                                {monthly.map(m => {
                                    const inH = (m.income / maxFlow) * 100;
                                    const outH = (m.expense / maxFlow) * 100;
                                    return (
                                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                                            <div className="flex items-end gap-0.5 h-full">
                                                <div
                                                    className="w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all hover:opacity-80"
                                                    style={{ height: `${inH}%` }}
                                                    title={`Entradas: ${fmt(m.income)}`}
                                                />
                                                <div
                                                    className="w-4 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t transition-all hover:opacity-80"
                                                    style={{ height: `${outH}%` }}
                                                    title={`Saídas: ${fmt(m.expense)}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between gap-2 mt-2">
                                {monthly.map(m => (
                                    <div key={m.month} className="flex-1 text-center text-[9px] font-bold text-gray-400 dark:text-[#666] uppercase tracking-widest">
                                        {m.label}
                                    </div>
                                ))}
                            </div>

                            {/* Balance line */}
                            <div className="mt-8">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-3">
                                    Saldo Acumulado (closing)
                                </p>
                                <div className="flex items-end justify-between gap-2">
                                    {monthly.map((m, i) => {
                                        const maxBal = Math.max(...monthly.map(x => Math.abs(x.closeBalance)), 1);
                                        const h = (Math.abs(m.closeBalance) / maxBal) * 80;
                                        return (
                                            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                                <div className={`text-[9px] font-bold whitespace-nowrap ${m.closeBalance >= 0 ? 'text-[#D4AF37]' : 'text-rose-500'}`}>
                                                    {fmtShort(m.closeBalance)}
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-[#1A1A1A] rounded-lg overflow-hidden" style={{ height: '80px' }}>
                                                    <div
                                                        className={`w-full rounded-lg transition-all ${m.closeBalance >= 0 ? 'bg-[#D4AF37]/70' : 'bg-rose-500/70'}`}
                                                        style={{ height: `${h}%`, marginTop: `${80 - h}px` }}
                                                        title={`${m.labelLong}: ${fmt(m.closeBalance)}`}
                                                    />
                                                </div>
                                                <div className="text-[9px] text-gray-400 dark:text-[#666]">{i + 1}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {granularity === 'quarter' && (
                    <div className="p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {quarterly.map(q => (
                            <div key={q.key} className="p-3 sm:p-5 bg-gray-50 dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#222]">
                                <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-3">{q.label}</p>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-gray-500">Entradas</span><span className="font-bold text-emerald-500">{fmt(q.income)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Saídas</span><span className="font-bold text-rose-500">{fmt(q.expense)}</span></div>
                                    <div className="border-t border-gray-200 dark:border-[#222] pt-2 flex justify-between"><span className="font-bold text-gray-700 dark:text-gray-300">Resultado</span><span className={`font-extrabold ${q.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{fmt(q.net)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Saldo Final</span><span className="font-bold text-[#D4AF37]">{fmt(q.closeBalance)}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {granularity === 'year' && (
                    <div className="p-4 sm:p-10 flex flex-col md:flex-row items-center justify-around gap-6 sm:gap-8">
                        <Waterfall
                            steps={[
                                { label: 'Saldo Inicial', value: initialBalance, kind: 'base' },
                                { label: 'Entradas', value: totals.income, kind: 'positive' },
                                { label: 'Saídas', value: -totals.expense, kind: 'negative' },
                                { label: 'Saldo Final', value: totals.finalBalance, kind: 'base' },
                            ]}
                        />
                    </div>
                )}

                {/* Monthly detail table */}
                <div className="border-t border-gray-100 dark:border-[#222] overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-[10px] uppercase tracking-widest text-gray-500">
                            <tr>
                                <th className="px-5 py-3 text-left font-bold">Mês</th>
                                <th className="px-5 py-3 text-right font-bold">Saldo Inicial</th>
                                <th className="px-5 py-3 text-right font-bold text-emerald-500">Entradas</th>
                                <th className="px-5 py-3 text-right font-bold text-rose-500">Saídas</th>
                                <th className="px-5 py-3 text-right font-bold">Resultado</th>
                                <th className="px-5 py-3 text-right font-bold">Saldo Final</th>
                                <th className="px-5 py-3 text-right font-bold">Margem %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthly.map(m => {
                                const margin = m.income > 0 ? (m.net / m.income) * 100 : 0;
                                return (
                                    <tr key={m.month} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50/50 dark:hover:bg-[#141414]">
                                        <td className="px-5 py-3 font-bold text-gray-900 dark:text-white capitalize">{m.labelLong}</td>
                                        <td className="px-5 py-3 text-right font-mono text-xs text-gray-500">{fmt(m.openBalance)}</td>
                                        <td className="px-5 py-3 text-right font-bold text-emerald-500">{m.income > 0 ? fmt(m.income) : '—'}</td>
                                        <td className="px-5 py-3 text-right font-bold text-rose-500">{m.expense > 0 ? fmt(m.expense) : '—'}</td>
                                        <td className={`px-5 py-3 text-right font-extrabold ${m.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {m.net !== 0 ? (m.net > 0 ? '+' : '') + fmt(m.net) : '—'}
                                        </td>
                                        <td className={`px-5 py-3 text-right font-extrabold ${m.closeBalance >= 0 ? 'text-[#D4AF37]' : 'text-rose-500'}`}>{fmt(m.closeBalance)}</td>
                                        <td className="px-5 py-3 text-right text-xs font-bold text-gray-500">{m.income > 0 ? `${margin.toFixed(1)}%` : '—'}</td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-gray-50 dark:bg-[#0A0A0A] border-t-2 border-gray-200 dark:border-[#222]">
                                <td className="px-5 py-3 font-black uppercase tracking-widest text-xs text-gray-900 dark:text-white">Total {selectedYear}</td>
                                <td className="px-5 py-3 text-right font-mono text-xs text-gray-500">{fmt(initialBalance)}</td>
                                <td className="px-5 py-3 text-right font-black text-emerald-500">{fmt(totals.income)}</td>
                                <td className="px-5 py-3 text-right font-black text-rose-500">{fmt(totals.expense)}</td>
                                <td className={`px-5 py-3 text-right font-black ${totals.net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {totals.net > 0 ? '+' : ''}{fmt(totals.net)}
                                </td>
                                <td className={`px-5 py-3 text-right font-black ${totals.finalBalance >= 0 ? 'text-[#D4AF37]' : 'text-rose-500'}`}>{fmt(totals.finalBalance)}</td>
                                <td className="px-5 py-3 text-right text-xs font-black text-gray-700 dark:text-gray-300">{totals.margin.toFixed(1)}%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── DRE Estimada ───────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                <button
                    onClick={() => setShowDRE(!showDRE)}
                    className="w-full p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414] flex justify-between items-center print:border-none"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <LineChart className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                DRE Estimada · {selectedYear}
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">
                                Receita · Despesas Variáveis · Fixas · EBITDA por mês
                            </p>
                        </div>
                    </div>
                    {showDRE ? <ChevronUp className="w-5 h-5 text-gray-400 print:hidden" /> : <ChevronDown className="w-5 h-5 text-gray-400 print:hidden" />}
                </button>
                {showDRE && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[900px]">
                            <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-[10px] uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold sticky left-0 bg-gray-50 dark:bg-[#0A0A0A]">Linha</th>
                                    {dre.rows.map(r => (
                                        <th key={r.month} className="px-3 py-3 text-right font-bold">{r.label}</th>
                                    ))}
                                    <th className="px-4 py-3 text-right font-black bg-[#D4AF37]/10 text-[#B8860B]">Ano</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                <DRERow label="Receita Bruta" values={dre.rows.map(r => r.receita)} total={dre.sum.receita} strong color="text-emerald-500" />
                                <DRERow label="(−) Impostos (est. 8%)" values={dre.rows.map(r => -r.impostos)} total={-dre.sum.impostos} muted />
                                <DRERow label="Receita Líquida" values={dre.rows.map(r => r.receitaLiq)} total={dre.sum.receitaLiq} strong color="text-blue-500" />
                                <DRERow label="(−) Desp. Variáveis" values={dre.rows.map(r => -r.variaveis)} total={-dre.sum.variaveis} muted />
                                <DRERow label="(−) Desp. Fixas" values={dre.rows.map(r => -r.fixas)} total={-dre.sum.fixas} muted />
                                <DRERow label="EBITDA" values={dre.rows.map(r => r.ebitda)} total={dre.sum.ebitda} strong color={dre.sum.ebitda >= 0 ? 'text-emerald-500' : 'text-rose-500'} highlight />
                                <tr className="border-t border-gray-200 dark:border-[#222]">
                                    <td className="px-4 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-bold sticky left-0 bg-white dark:bg-[#0F0F0F]">Margem EBITDA</td>
                                    {dre.rows.map(r => (
                                        <td key={r.month} className="px-3 py-3 text-right text-[10px] text-gray-500 font-bold">
                                            {r.receita > 0 ? `${r.margemEbitda.toFixed(1)}%` : '—'}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right text-[10px] font-black bg-[#D4AF37]/10 text-[#B8860B]">
                                        {dre.margem.toFixed(1)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="px-5 py-3 text-[10px] text-gray-400 dark:text-[#555] bg-gray-50 dark:bg-[#0A0A0A] border-t border-gray-100 dark:border-[#222]">
                            * DRE estimada: impostos aproximados em 8% da receita bruta; despesas classificadas por palavra-chave da categoria (fixas: aluguel, salário, contabilidade, internet, imposto). Refine classificando as categorias.
                        </p>
                    </div>
                )}
            </div>

            {/* ─── Projeção 90 dias ───────────────────────────────────── */}
            <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                <button
                    onClick={() => setShowProjection(!showProjection)}
                    className="w-full p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414] flex justify-between items-center"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Calendar className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                                Projeção de Caixa · Próximos 90 dias
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">
                                Baseada em contas pendentes e fechamentos de leilão
                            </p>
                        </div>
                    </div>
                    {showProjection ? <ChevronUp className="w-5 h-5 text-gray-400 print:hidden" /> : <ChevronDown className="w-5 h-5 text-gray-400 print:hidden" />}
                </button>
                {showProjection && (
                    <div className="p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">Entradas</p>
                            <p className="text-2xl font-black text-emerald-500">{fmt(projection.entradas)}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                            <p className="text-[10px] uppercase tracking-widest text-rose-500 font-bold mb-1">Saídas</p>
                            <p className="text-2xl font-black text-rose-500">{fmt(projection.saidas)}</p>
                        </div>
                        <div className={`p-4 rounded-xl ${projection.liquido >= 0 ? 'bg-[#D4AF37]/5 border-[#D4AF37]/30' : 'bg-rose-500/5 border-rose-500/20'} border`}>
                            <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${projection.liquido >= 0 ? 'text-[#B8860B]' : 'text-rose-500'}`}>Resultado</p>
                            <p className={`text-2xl font-black ${projection.liquido >= 0 ? 'text-[#B8860B]' : 'text-rose-500'}`}>
                                {projection.liquido >= 0 ? '+' : ''}{fmt(projection.liquido)}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                            <p className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-1">Saldo estimado 90d</p>
                            <p className="text-2xl font-black text-blue-500">{fmt(totals.finalBalance + projection.liquido)}</p>
                        </div>

                        {projection.items.length > 0 && (
                            <div className="md:col-span-4 mt-2">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3">Vencimentos próximos</p>
                                <div className="divide-y divide-gray-100 dark:divide-[#1A1A1A] border border-gray-200 dark:border-[#222] rounded-xl overflow-hidden">
                                    {projection.items.map((it, i) => (
                                        <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#141414]">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-xs font-mono text-gray-500 dark:text-[#888] shrink-0">
                                                    {new Date(it.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                                </span>
                                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{it.description}</span>
                                            </div>
                                            <span className={`text-xs font-extrabold shrink-0 ml-4 ${it.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {it.type === 'income' ? '+' : '-'}{fmt(it.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Distribuição por Categoria ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryPanel
                    title="Despesas por Categoria"
                    icon={<ArrowDownRight className="w-4 h-4" />}
                    color="rose"
                    items={categoryBreakdown.expenses}
                    total={totals.expense}
                />
                <CategoryPanel
                    title="Receitas por Categoria"
                    icon={<ArrowUpRight className="w-4 h-4" />}
                    color="emerald"
                    items={categoryBreakdown.incomes}
                    total={totals.income}
                />
            </div>

            {/* ─── Top Fornecedores e Clientes ────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopListPanel title="Top Fornecedores (Saídas)" items={tops.suppliers} color="rose" />
                <TopListPanel title="Top Clientes (Entradas)" items={tops.clients} color="emerald" />
            </div>

            {/* ─── Saldos por conta bancária ──────────────────────────── */}
            {accounts.length > 0 && (
                <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                            <Building2 className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Saldos por Conta</h3>
                            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest">{accounts.length} conta(s) · totais atualizados</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100 dark:bg-[#1A1A1A]">
                        {accounts.map(acc => (
                            <div key={acc.id} className="p-5 bg-white dark:bg-[#0F0F0F]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{acc.name}</p>
                                <p className="text-2xl font-black text-[#D4AF37] mt-1">{fmt(Number(acc.current_balance))}</p>
                                <p className="text-[10px] text-gray-400 mt-1">inicial: {fmt(Number(acc.initial_balance))}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="text-center text-[10px] text-gray-400 dark:text-[#555] uppercase tracking-widest py-4 border-t border-gray-200 dark:border-[#222] print:pt-2">
                Fórmula do Boi · Painel Executivo de Fluxo de Caixa · {new Date().toLocaleDateString('pt-BR')}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Subcomponents
// ═══════════════════════════════════════════════════════════════════════════
function KpiCard({
    label, value, sub, icon, color, delta,
}: {
    label: string; value: string; sub?: string; icon: React.ReactNode;
    color: 'emerald' | 'rose' | 'gold' | 'blue'; delta?: React.ReactNode;
}) {
    const border = {
        emerald: 'border-emerald-500/20 hover:border-emerald-500/40',
        rose: 'border-rose-500/20 hover:border-rose-500/40',
        gold: 'border-[#B8860B]/20 hover:border-[#B8860B]/40',
        blue: 'border-blue-500/20 hover:border-blue-500/40',
    }[color];
    const iconBg = {
        emerald: 'bg-emerald-500/10 text-emerald-500',
        rose: 'bg-rose-500/10 text-rose-500',
        gold: 'bg-[#B8860B]/10 text-[#B8860B]',
        blue: 'bg-blue-500/10 text-blue-500',
    }[color];
    const valueColor = {
        emerald: 'text-emerald-500',
        rose: 'text-rose-500',
        gold: 'text-[#D4AF37]',
        blue: 'text-blue-500',
    }[color];

    return (
        <div className={`bg-white dark:bg-[#111111] border ${border} rounded-2xl p-4 shadow-xl transition-all relative overflow-hidden`}>
            <div className="flex items-start justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
                {delta}
            </div>
            <p className="text-[9px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">{label}</p>
            <h3 className={`text-xl font-extrabold ${valueColor} mt-1 tracking-tight`}>{value}</h3>
            {sub && <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1 truncate">{sub}</p>}
        </div>
    );
}

function DRERow({
    label, values, total, strong, muted, color, highlight,
}: {
    label: string; values: number[]; total: number;
    strong?: boolean; muted?: boolean; color?: string; highlight?: boolean;
}) {
    const cls = strong ? 'font-bold' : muted ? 'text-gray-500 dark:text-[#AAA]' : '';
    return (
        <tr className={`border-b border-gray-100 dark:border-[#1A1A1A] ${highlight ? 'bg-[#B8860B]/5' : ''}`}>
            <td className={`px-4 py-2.5 sticky left-0 bg-white dark:bg-[#0F0F0F] ${highlight ? 'bg-[#B8860B]/5' : ''} ${cls} ${color || ''}`}>{label}</td>
            {values.map((v, i) => (
                <td key={i} className={`px-3 py-2.5 text-right font-mono ${cls} ${color || ''}`}>
                    {v !== 0 ? fmtShort(v) : '—'}
                </td>
            ))}
            <td className={`px-4 py-2.5 text-right font-black bg-[#D4AF37]/10 ${color || 'text-[#B8860B]'}`}>{fmtShort(total)}</td>
        </tr>
    );
}

function Waterfall({ steps }: { steps: Array<{ label: string; value: number; kind: 'base' | 'positive' | 'negative' }> }) {
    const max = Math.max(...steps.map(s => Math.abs(s.value)), 1);
    return (
        <div className="w-full max-w-2xl">
            <div className="grid grid-cols-4 gap-4 items-end h-56">
                {steps.map((s, i) => {
                    const h = (Math.abs(s.value) / max) * 100;
                    const cls = s.kind === 'positive' ? 'bg-emerald-500' : s.kind === 'negative' ? 'bg-rose-500' : 'bg-[#D4AF37]';
                    return (
                        <div key={i} className="flex flex-col items-center gap-2 h-full justify-end">
                            <span className={`text-xs font-black ${s.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {fmtShort(s.value)}
                            </span>
                            <div className={`w-full ${cls} rounded-t transition-all`} style={{ height: `${h}%` }} />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">{s.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function CategoryPanel({
    title, icon, color, items, total,
}: {
    title: string; icon: React.ReactNode; color: 'rose' | 'emerald';
    items: Array<{ name: string; total: number; pct: number }>; total: number;
}) {
    const ring = color === 'rose' ? 'border-rose-500/20' : 'border-emerald-500/20';
    const txt = color === 'rose' ? 'text-rose-500' : 'text-emerald-500';
    const bg = color === 'rose' ? 'bg-rose-500/10' : 'bg-emerald-500/10';

    return (
        <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} ${ring} border flex items-center justify-center ${txt}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">{title}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{fmt(total)} total · {items.length} categoria(s)</p>
                </div>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-auto">
                {items.length > 0 ? items.map((cat, i) => (
                    <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                                <span className="text-xs text-gray-700 dark:text-[#CCC] truncate font-medium">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className={`text-[10px] font-bold whitespace-nowrap ${txt}`}>{fmt(cat.total)}</span>
                                <span className="text-[9px] text-gray-400 dark:text-[#666] w-10 text-right">{cat.pct.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${cat.pct}%`, backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }}
                            />
                        </div>
                    </div>
                )) : (
                    <p className="text-xs text-gray-400 dark:text-[#555] text-center py-6 font-bold uppercase tracking-widest">Nenhum lançamento</p>
                )}
            </div>
        </div>
    );
}

function TopListPanel({
    title, items, color,
}: {
    title: string; items: Array<{ name: string; total: number }>; color: 'rose' | 'emerald';
}) {
    const txt = color === 'rose' ? 'text-rose-500' : 'text-emerald-500';
    const max = Math.max(...items.map(i => i.total), 1);
    return (
        <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414]">
                <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">{title}</h3>
            </div>
            <div className="p-4 space-y-2">
                {items.length > 0 ? items.map((it, i) => {
                    const pct = (it.total / max) * 100;
                    return (
                        <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[65%]" title={it.name}>
                                    <span className="text-[9px] font-bold text-gray-400 dark:text-[#666] mr-1.5">#{i + 1}</span>
                                    {it.name}
                                </span>
                                <span className={`text-[11px] font-black ${txt} whitespace-nowrap ml-2`}>{fmt(it.total)}</span>
                            </div>
                            <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${color === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                }) : (
                    <p className="text-xs text-gray-400 dark:text-[#555] text-center py-6 font-bold uppercase tracking-widest">Nenhum registro</p>
                )}
            </div>
        </div>
    );
}
