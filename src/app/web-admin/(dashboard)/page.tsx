import { createClient } from '@/utils/supabase/server';
import {
    Package, DollarSign, TrendingUp, TrendingDown,
    ExternalLink, PhoneCall, CheckCircle2, Clock, AlertTriangle,
    ArrowRight, BarChart3, Target, Flame, CircleDot, ListTodo, Activity,
    Gavel, Wallet, Calendar, FileText, MessageSquare, UserCheck,
    Award, Zap,
} from 'lucide-react';
import Link from 'next/link';
import AnalyticsDashboardCard from '@/components/admin/AnalyticsDashboardCard';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function parsePrice(raw: unknown): number {
    if (!raw) return 0;
    const clean = raw.toString().replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
    const v = parseFloat(clean);
    return isNaN(v) ? 0 : v;
}

function daysFromNow(dateStr: string | null | undefined): number | null {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const MONTH_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const STATUS_LEILAO = {
    confirmado: { label: 'Confirmado', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
    negociacao: { label: 'Em negociação', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/25' },
    prospecto: { label: 'Prospecto', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/25' },
    concluido: { label: 'Concluído', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/25' },
} as const;

// ─── component ──────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
    const supabase = await createClient();

    const [
        { data: products },
        { count: breedersCount },
        { data: leads },
        { data: tasks },
        { data: leiloes },
        { data: completedTx },
        { data: pendingExpenses },
        { data: finAccounts },
        { data: whatsappStats },
    ] = await Promise.all([
        supabase.from('products').select('id, price, category, location, active, sold, details'),
        supabase.from('breeders').select('*', { count: 'exact', head: true }),
        supabase.from('crm_leads')
            .select('id, nome, status, prioridade, data_estimada_fechamento, created_at')
            .order('created_at', { ascending: false }),
        supabase.from('tactical_tasks')
            .select('id, status, priority, due_date')
            .order('position', { ascending: true }),
        supabase.from('bula_leiloes')
            .select('id, nome, data, tipo, animais, expectativa, meta_bula, realizado_bula, status, horario, modelo, leiloeira')
            .order('data', { ascending: true }),
        supabase.from('erp_finance_transactions')
            .select('amount, type, transaction_date')
            .eq('status', 'completed'),
        supabase.from('erp_finance_transactions')
            .select('amount')
            .eq('type', 'expense')
            .eq('status', 'pending'),
        supabase.from('erp_finance_accounts')
            .select('initial_balance'),
        supabase.from('whatsapp_messages')
            .select('id, status, created_at')
            .order('created_at', { ascending: false })
            .limit(200),
    ]);

    // ── Financeiro ──────────────────────────────────────────────────────────
    const totalInitial = (finAccounts ?? []).reduce((s, a) => s + (Number(a.initial_balance) || 0), 0);
    const txAll = completedTx ?? [];
    const saldoAtual = txAll.reduce((s, t) =>
        s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), totalInitial);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const txThisMonth = txAll.filter(t => t.transaction_date >= startOfMonth);
    const receitasMes = txThisMonth.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const despesasMes = txThisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const resultadoMes = receitasMes - despesasMes;

    const aPagar = (pendingExpenses ?? []).reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const pendingCount = (pendingExpenses ?? []).length;

    // Last 6 months cashflow
    const months6 = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_ABBR[d.getMonth()] };
    });
    const monthly6 = months6.map(m => {
        const txs = txAll.filter(t => {
            const d = new Date(t.transaction_date);
            return d.getFullYear() === m.year && d.getMonth() === m.month;
        });
        const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
        return { ...m, income, expense, net: income - expense };
    });
    const maxChartVal = Math.max(...monthly6.map(m => Math.max(m.income, m.expense)), 1);

    // ── Leilões ──────────────────────────────────────────────────────────────
    const allLeiloes = leiloes ?? [];
    const todayStr = now.toISOString().split('T')[0];
    const upcomingLeiloes = allLeiloes.filter(l => (l.data ?? '') >= todayStr);
    const pastLeiloes = allLeiloes.filter(l => (l.data ?? '') < todayStr);

    const leilaoByStatus = { confirmado: 0, negociacao: 0, prospecto: 0, concluido: 0 };
    for (const l of allLeiloes) {
        if (l.status && l.status in leilaoByStatus)
            leilaoByStatus[l.status as keyof typeof leilaoByStatus]++;
    }

    const totalAnimaisUpcoming = upcomingLeiloes.reduce((s, l) => s + (l.animais ?? 0), 0);
    const totalMetaBula = upcomingLeiloes
        .filter(l => l.status === 'confirmado')
        .reduce((s, l) => s + (Number(l.meta_bula) || 0), 0);
    const totalRealizadoBula = pastLeiloes.reduce((s, l) => s + (Number(l.realizado_bula) || 0), 0);
    const nextLeiloes = upcomingLeiloes.slice(0, 5);

    // ── Animais / Catálogo ───────────────────────────────────────────────────
    const allProducts = products ?? [];
    const totalAnimals = allProducts.length;
    let available = 0, sold = 0;
    const categoryStats: Record<string, number> = {};

    for (const p of allProducts) {
        categoryStats[p.category || 'Outros'] = (categoryStats[p.category || 'Outros'] || 0) + 1;
        const detStatus = (p.details as Record<string, string> | null)?.status;
        const VALID = new Set(['Disponível', 'Vendido', 'Reservado', 'Inativo']);
        const status = (detStatus && VALID.has(detStatus)) ? detStatus : p.sold ? 'Vendido' : !p.active ? 'Inativo' : 'Disponível';
        if (status === 'Disponível') available++;
        else if (status === 'Vendido') sold++;
    }
    const sortedCategories = Object.entries(categoryStats).sort(([, a], [, b]) => b - a).slice(0, 5);
    const totalValue = allProducts.reduce((s, p) => s + parsePrice(p.price), 0);
    const avgValue = totalAnimals > 0 ? totalValue / totalAnimals : 0;

    // ── CRM ──────────────────────────────────────────────────────────────────
    const allLeads = leads ?? [];
    const totalLeads = allLeads.length;
    const leadsByStatus: Record<string, number> = {};
    for (const l of allLeads) {
        leadsByStatus[l.status || 'Sem status'] = (leadsByStatus[l.status || 'Sem status'] || 0) + 1;
    }
    const hotLeads = allLeads.filter(l => l.prioridade === 'Alta').length;
    const recentLeads = allLeads.slice(0, 5);
    const closingLeads = allLeads.filter(l => {
        const d = daysFromNow(l.data_estimada_fechamento);
        return d !== null && d >= 0 && d <= 7;
    }).length;
    const activeLeads = totalLeads - (leadsByStatus['Fechado'] || 0);

    // ── Projetos ─────────────────────────────────────────────────────────────
    const allTasks = tasks ?? [];
    const totalTasks = allTasks.length;
    const tasksByStatus: Record<string, number> = {};
    for (const t of allTasks) {
        tasksByStatus[t.status || 'Sem status'] = (tasksByStatus[t.status || 'Sem status'] || 0) + 1;
    }
    const highPrioTasks = allTasks.filter(t => t.priority === 'Alta').length;
    const overdueTasks = allTasks.filter(t => {
        const d = daysFromNow(t.due_date);
        return d !== null && d < 0 && t.status !== 'Completa';
    }).length;
    const completedTasks = tasksByStatus['Completa'] || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // ── WhatsApp ─────────────────────────────────────────────────────────────
    const allWpp = whatsappStats ?? [];
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const wppToday = allWpp.filter(m => m.created_at >= todayStart).length;
    const wppSent = allWpp.filter(m => m.status === 'sent').length;

    const todayLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-gray-200 dark:border-[#1E1E1E]">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visão Geral</h1>
                    <p className="text-sm text-gray-400 mt-0.5 capitalize">{todayLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Sistema ativo
                    </span>
                </div>
            </div>

            {/* ── KPI Strip ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    {
                        label: 'Saldo Caixa',
                        value: fmtBRL(saldoAtual),
                        sub: `${resultadoMes >= 0 ? '+' : ''}${fmtBRL(resultadoMes)} no mês`,
                        icon: Wallet,
                        color: 'text-[#B8860B]',
                        bg: 'bg-[#B8860B]/10',
                        ok: resultadoMes >= 0,
                        small: true,
                    },
                    {
                        label: 'Leads Ativos',
                        value: String(activeLeads),
                        sub: `${hotLeads} quentes`,
                        icon: PhoneCall,
                        color: 'text-violet-500',
                        bg: 'bg-violet-500/10',
                        ok: true,
                    },
                    {
                        label: 'Próx. Leilões',
                        value: String(upcomingLeiloes.length),
                        sub: `${leilaoByStatus.confirmado} confirmados`,
                        icon: Gavel,
                        color: 'text-amber-500',
                        bg: 'bg-amber-500/10',
                        ok: true,
                    },
                    {
                        label: 'Animais',
                        value: String(totalAnimals),
                        sub: `${available} disponíveis`,
                        icon: Package,
                        color: 'text-teal-500',
                        bg: 'bg-teal-500/10',
                        ok: true,
                    },
                    {
                        label: 'Tarefas',
                        value: String(totalTasks - completedTasks),
                        sub: overdueTasks > 0 ? `${overdueTasks} em atraso` : `${completionRate}% concluído`,
                        icon: ListTodo,
                        color: overdueTasks > 0 ? 'text-rose-500' : 'text-sky-500',
                        bg: overdueTasks > 0 ? 'bg-rose-500/10' : 'bg-sky-500/10',
                        ok: overdueTasks === 0,
                    },
                    {
                        label: 'A Pagar',
                        value: fmtBRL(aPagar),
                        sub: `${pendingCount} título${pendingCount !== 1 ? 's' : ''}`,
                        icon: Clock,
                        color: pendingCount > 0 ? 'text-rose-500' : 'text-gray-400',
                        bg: pendingCount > 0 ? 'bg-rose-500/10' : 'bg-gray-500/10',
                        ok: pendingCount === 0,
                        small: true,
                    },
                ].map(({ label, value, sub, icon: Icon, color, bg, ok, small }) => (
                    <div key={label} className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className={`inline-flex p-1.5 ${bg} rounded-lg mb-2`}>
                            <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <p className={`font-bold text-gray-900 dark:text-white ${small ? 'text-sm' : 'text-xl'} leading-tight`}>{value}</p>
                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">{label}</p>
                        <p className={`text-[10px] mt-1 ${ok ? 'text-emerald-500' : 'text-rose-400'}`}>{sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Leilões + Financeiro ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* Leilões — 3/5 */}
                <div className="lg:col-span-3 bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-500/10 rounded-xl">
                                <Gavel className="w-4 h-4 text-amber-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Pipeline de Leilões</h3>
                        </div>
                        <Link href="/leiloes" className="text-xs text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                            Gerenciar <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="p-5 flex-1 space-y-4">
                        {/* Status badges */}
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.entries(leilaoByStatus) as [keyof typeof STATUS_LEILAO, number][]).map(([s, count]) => {
                                const st = STATUS_LEILAO[s];
                                return (
                                    <div key={s} className={`rounded-xl p-3 border ${st.bg} ${st.border} text-center`}>
                                        <p className={`text-2xl font-black ${st.color}`}>{count}</p>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-wide font-medium mt-0.5 leading-tight">{st.label}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Stats strip */}
                        <div className="flex items-center gap-1 p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl">
                            <div className="flex-1 text-center py-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{totalAnimaisUpcoming.toLocaleString('pt-BR')}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wide">Animais (próx.)</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-[#2A2A2A]" />
                            <div className="flex-1 text-center py-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{allLeiloes.length}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wide">Total histórico</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-[#2A2A2A]" />
                            <div className="flex-1 text-center py-1">
                                <p className="text-sm font-bold text-amber-500">{fmtBRL(totalMetaBula)}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wide">Meta confirmados</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-[#2A2A2A]" />
                            <div className="flex-1 text-center py-1">
                                <p className="text-sm font-bold text-emerald-500">{fmtBRL(totalRealizadoBula)}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wide">Realizado total</p>
                            </div>
                        </div>

                        {/* Upcoming leilões list */}
                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Próximos eventos</p>
                            {nextLeiloes.length === 0 ? (
                                <div className="text-center py-6 text-gray-400">
                                    <Gavel className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs">Nenhum leilão agendado.</p>
                                </div>
                            ) : (
                                nextLeiloes.map(l => {
                                    const [y, m, d] = (l.data ?? '').split('-').map(Number);
                                    const dateObj = y && m && d ? new Date(y, m - 1, d) : null;
                                    const st = STATUS_LEILAO[(l.status as keyof typeof STATUS_LEILAO)] ?? STATUS_LEILAO.prospecto;
                                    return (
                                        <div key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-default">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center">
                                                <span className="text-amber-500 font-black text-sm leading-none">{dateObj?.getDate() ?? '?'}</span>
                                                <span className="text-amber-500/60 text-[8px] font-bold uppercase">{dateObj ? MONTH_ABBR[dateObj.getMonth()] : '—'}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{l.nome}</p>
                                                <p className="text-[10px] text-gray-500 truncate">
                                                    {[l.tipo, l.animais ? `${l.animais} animais` : null, l.leiloeira].filter(Boolean).join(' · ')}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${st.bg} ${st.border} ${st.color}`}>
                                                {st.label}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Financeiro — 2/5 */}
                <div className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-[#B8860B]/10 rounded-xl">
                                <Wallet className="w-4 h-4 text-[#B8860B]" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Financeiro</h3>
                        </div>
                        <a href="https://erp.formuladoboi.com" target="_blank" rel="noreferrer"
                            className="text-xs text-gray-400 hover:text-[#B8860B] transition-colors flex items-center gap-1">
                            ERP <ExternalLink size={11} />
                        </a>
                    </div>

                    <div className="p-5 flex-1 flex flex-col gap-4">
                        {/* Saldo atual */}
                        <div className="p-4 rounded-xl bg-[#B8860B]/5 border border-[#B8860B]/20">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Saldo atual (ERP)</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{fmtBRL(saldoAtual)}</p>
                            {pendingCount > 0 && (
                                <p className="text-[10px] text-rose-400 mt-1 flex items-center gap-1">
                                    <Clock size={10} /> {fmtBRL(aPagar)} a pagar ({pendingCount} título{pendingCount !== 1 ? 's' : ''})
                                </p>
                            )}
                        </div>

                        {/* Mês atual */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl p-3 bg-emerald-500/5 border border-emerald-500/20">
                                <div className="flex items-center gap-1 mb-1.5">
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">Receitas</span>
                                </div>
                                <p className="text-base font-bold text-emerald-500">{fmtBRL(receitasMes)}</p>
                                <p className="text-[9px] text-gray-500 mt-0.5">este mês</p>
                            </div>
                            <div className="rounded-xl p-3 bg-rose-500/5 border border-rose-500/20">
                                <div className="flex items-center gap-1 mb-1.5">
                                    <TrendingDown className="w-3 h-3 text-rose-400" />
                                    <span className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">Despesas</span>
                                </div>
                                <p className="text-base font-bold text-rose-400">{fmtBRL(despesasMes)}</p>
                                <p className="text-[9px] text-gray-500 mt-0.5">este mês</p>
                            </div>
                        </div>

                        {/* Resultado */}
                        <div className={`rounded-xl px-4 py-3 ${resultadoMes >= 0 ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-rose-500/5 border border-rose-500/20'}`}>
                            <p className="text-[9px] text-gray-500 uppercase tracking-wide font-medium">Resultado do mês</p>
                            <p className={`text-xl font-black mt-1 ${resultadoMes >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                                {resultadoMes >= 0 ? '+' : ''}{fmtBRL(resultadoMes)}
                            </p>
                        </div>

                        {/* 6-month grouped bar chart */}
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-3">Fluxo — últimos 6 meses</p>
                            <div className="flex items-end justify-between gap-1" style={{ height: '80px' }}>
                                {monthly6.map((m, i) => {
                                    const isNow = i === 5;
                                    const incH = Math.max(2, Math.round((m.income / maxChartVal) * 72));
                                    const expH = Math.max(2, Math.round((m.expense / maxChartVal) * 72));
                                    return (
                                        <div key={m.label} className="flex-1 flex flex-col items-center gap-0.5">
                                            <div className="w-full flex items-end justify-center gap-[1px]" style={{ height: '72px' }}>
                                                <div
                                                    title={`Receitas: ${fmtBRL(m.income)}`}
                                                    className={`flex-1 rounded-t-sm transition-all ${isNow ? 'bg-emerald-500' : 'bg-emerald-500/35'}`}
                                                    style={{ height: `${incH}px` }}
                                                />
                                                <div
                                                    title={`Despesas: ${fmtBRL(m.expense)}`}
                                                    className={`flex-1 rounded-t-sm transition-all ${isNow ? 'bg-rose-400' : 'bg-rose-400/35'}`}
                                                    style={{ height: `${expH}px` }}
                                                />
                                            </div>
                                            <span className={`text-[8px] ${isNow ? 'text-[#B8860B] font-bold' : 'text-gray-500'}`}>{m.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60" />
                                    <span className="text-[9px] text-gray-500">Receitas</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-sm bg-rose-400/60" />
                                    <span className="text-[9px] text-gray-500">Despesas</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CRM + Projetos ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* CRM */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-violet-500/10 rounded-xl">
                                <PhoneCall className="w-4 h-4 text-violet-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">CRM — Pipeline</h3>
                        </div>
                        <Link href="/crm" className="text-xs text-gray-400 hover:text-violet-500 transition-colors flex items-center gap-1">
                            Ver tudo <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-violet-500 font-bold text-xl">{totalLeads}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Total</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-orange-500 font-bold text-xl">{hotLeads}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5 flex items-center justify-center gap-0.5">
                                    <Flame size={9} /> Quentes
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-green-500 font-bold text-xl">{closingLeads}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Fechando 7d</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {Object.entries(leadsByStatus).slice(0, 5).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{status}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-100 dark:bg-[#222] rounded-full h-1.5 overflow-hidden">
                                            <div className="h-full bg-violet-400 rounded-full"
                                                style={{ width: `${totalLeads > 0 ? (count / totalLeads) * 100 : 0}%` }} />
                                        </div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300 w-5 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                            {totalLeads === 0 && <p className="text-gray-400 text-xs italic">Nenhum lead cadastrado.</p>}
                        </div>

                        {recentLeads.length > 0 && (
                            <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-[#1E1E1E]">
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-2">Recentes</p>
                                {recentLeads.map(l => (
                                    <div key={l.id} className="flex items-center justify-between text-xs py-0.5">
                                        <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]">{l.nome}</span>
                                        <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded-full shrink-0">{l.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Projetos */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-sky-500/10 rounded-xl">
                                <Target className="w-4 h-4 text-sky-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Projetos & Tarefas</h3>
                        </div>
                        <Link href="/tactical-plan" className="text-xs text-gray-400 hover:text-sky-500 transition-colors flex items-center gap-1">
                            Ver tudo <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-sky-500 font-bold text-xl">{tasksByStatus['A fazer'] || 0}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">A fazer</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-amber-500 font-bold text-xl">{tasksByStatus['Em andamento'] || 0}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Em andamento</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-green-500 font-bold text-xl">{completedTasks}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Concluídas</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-500 font-medium">Taxa de conclusão</span>
                                <span className="text-sky-500 font-bold">{completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all"
                                    style={{ width: `${completionRate}%` }} />
                            </div>
                        </div>

                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-[#1E1E1E]">
                            {overdueTasks > 0 && (
                                <div className="flex items-center gap-2 text-xs bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl border border-red-200 dark:border-red-500/20">
                                    <AlertTriangle size={13} className="shrink-0" />
                                    <span><strong>{overdueTasks}</strong> tarefa{overdueTasks > 1 ? 's' : ''} em atraso</span>
                                </div>
                            )}
                            {highPrioTasks > 0 && (
                                <div className="flex items-center gap-2 text-xs bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-2 rounded-xl border border-orange-200 dark:border-orange-500/20">
                                    <Flame size={13} className="shrink-0" />
                                    <span><strong>{highPrioTasks}</strong> tarefa{highPrioTasks > 1 ? 's' : ''} de alta prioridade</span>
                                </div>
                            )}
                            {overdueTasks === 0 && highPrioTasks === 0 && totalTasks > 0 && (
                                <div className="flex items-center gap-2 text-xs bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-xl border border-green-200 dark:border-green-500/20">
                                    <CheckCircle2 size={13} className="shrink-0" />
                                    <span>Tudo em dia — sem atrasos!</span>
                                </div>
                            )}
                            {totalTasks === 0 && <p className="text-gray-400 text-xs italic">Nenhuma tarefa cadastrada.</p>}
                        </div>

                        {/* OKR / Contratos quick links */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-[#1E1E1E]">
                            <Link href="/okr" className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors text-xs text-gray-600 dark:text-gray-400 hover:text-sky-500">
                                <BarChart3 size={13} />
                                <span className="font-medium">OKR Estratégico</span>
                            </Link>
                            <Link href="/contratos" className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#1E1E1E] transition-colors text-xs text-gray-600 dark:text-gray-400 hover:text-[#B8860B]">
                                <FileText size={13} />
                                <span className="font-medium">Contratos</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Catálogo + Analytics + Atalhos ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Catálogo de Animais */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-teal-500/10 rounded-xl">
                                <Package className="w-4 h-4 text-teal-500" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Catálogo</h3>
                        </div>
                        <Link href="/products" className="text-xs text-gray-400 hover:text-teal-500 transition-colors flex items-center gap-1">
                            Ver tudo <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-teal-500 font-bold text-xl">{totalAnimals}</p>
                                <p className="text-gray-500 text-[10px]">Total</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-green-500 font-bold text-xl">{available}</p>
                                <p className="text-gray-500 text-[10px]">Disponíveis</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-2.5">
                                <p className="text-gray-400 font-bold text-xl">{sold}</p>
                                <p className="text-gray-500 text-[10px]">Vendidos</p>
                            </div>
                        </div>

                        {avgValue > 0 && (
                            <div className="text-center p-2.5 bg-[#B8860B]/5 border border-[#B8860B]/20 rounded-xl">
                                <p className="text-[#B8860B] font-bold text-base">{fmtBRL(avgValue)}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wider">Valor médio por animal</p>
                            </div>
                        )}

                        <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-[#1E1E1E]">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Por categoria</p>
                            {sortedCategories.map(([cat, count]) => {
                                const pct = totalAnimals > 0 ? ((count / totalAnimals) * 100).toFixed(0) : '0';
                                return (
                                    <div key={cat}>
                                        <div className="flex justify-between text-xs mb-0.5">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[140px]">{cat}</span>
                                            <span className="text-gray-500 shrink-0 ml-2">{count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-[#222] rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {sortedCategories.length === 0 && <p className="text-gray-400 text-xs italic">Sem dados.</p>}
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-[#1E1E1E]">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span className="text-xs text-gray-500">{breedersCount ?? 0} criadores cadastrados</span>
                        </div>
                    </div>
                </div>

                {/* Analytics */}
                <div>
                    <AnalyticsDashboardCard />
                </div>

                {/* Atalhos + Links externos */}
                <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm flex flex-col gap-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Acesso Rápido</h3>

                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { href: '/leiloes', icon: Gavel, label: 'Leilões', color: 'hover:border-amber-500/40 hover:text-amber-500' },
                            { href: '/crm', icon: PhoneCall, label: 'CRM', color: 'hover:border-violet-500/40 hover:text-violet-500' },
                            { href: '/products/new', icon: Package, label: 'Novo Card', color: 'hover:border-teal-500/40 hover:text-teal-500' },
                            { href: '/tactical-plan', icon: ListTodo, label: 'Projetos', color: 'hover:border-sky-500/40 hover:text-sky-500' },
                            { href: '/contratos', icon: FileText, label: 'Contratos', color: 'hover:border-[#B8860B]/40 hover:text-[#B8860B]' },
                            { href: '/whatsapp', icon: MessageSquare, label: 'WhatsApp', color: 'hover:border-green-500/40 hover:text-green-500' },
                        ].map(({ href, icon: Icon, label, color }) => (
                            <Link key={href} href={href}
                                className={`p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] ${color} transition-all flex items-center gap-2 text-gray-400 group`}>
                                <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform shrink-0" />
                                <span className="font-medium text-xs text-gray-600 dark:text-gray-400 group-hover:text-inherit truncate">{label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* WhatsApp stats */}
                    <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400">WhatsApp</span>
                            </div>
                            <Link href="/whatsapp" className="text-[10px] text-gray-400 hover:text-green-500 transition-colors">Ver detalhes →</Link>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <p className="text-lg font-bold text-green-500">{wppToday}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wide">Hoje</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{wppSent}</p>
                                <p className="text-[9px] text-gray-500 uppercase tracking-wide">Enviados (200)</p>
                            </div>
                        </div>
                    </div>

                    {/* External systems */}
                    <div className="space-y-2 mt-auto">
                        <a href="https://erp.formuladoboi.com" target="_blank" rel="noreferrer"
                            className="flex items-center justify-between p-3 bg-[#B8860B]/5 border border-[#B8860B]/20 rounded-xl hover:bg-[#B8860B]/10 hover:border-[#B8860B]/40 transition-all group">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-[#B8860B]" />
                                <span className="text-sm font-semibold text-[#B8860B]">Acessar ERP</span>
                            </div>
                            <ExternalLink size={13} className="text-[#B8860B]/60 group-hover:text-[#B8860B] transition-colors" />
                        </a>
                        <a href="https://app.formuladoboi.com" target="_blank" rel="noreferrer"
                            className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/20 rounded-xl hover:bg-green-500/10 hover:border-green-500/40 transition-all group">
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold text-green-500">Site Público</span>
                            </div>
                            <ExternalLink size={13} className="text-green-500/60 group-hover:text-green-500 transition-colors" />
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
}
