'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Calculator, FileText, BookOpen, Download, Receipt, Scale,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet,
    Building2, CircleDollarSign, FileSpreadsheet, ChevronRight, CheckCircle2, AlertTriangle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Account { id: string; name: string; type: string; current_balance: number; initial_balance: number; }
interface Category { id: string; name: string; type: string; }
interface Transaction {
    id: string; account_id: string; category_id?: string | null;
    type: string; amount: number; description: string;
    transaction_date: string; status: string;
    account?: { id: string; name: string; type?: string } | null;
    category?: { id: string; name: string; type?: string } | null;
}

const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtCompact = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
    if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(1)}k`;
    return fmt(v);
};
const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

type TabKey = 'overview' | 'dre' | 'balanco' | 'plano' | 'nfe' | 'razao';

export default function ContabilClient({
    accounts, transactions, categories,
}: {
    accounts: Account[];
    transactions: Transaction[];
    categories: Category[];
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabFromUrl = (searchParams.get('tab') as TabKey) || 'overview';
    const [activeTab, setActiveTab] = useState<TabKey>(tabFromUrl);
    const [year, setYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        const t = (searchParams.get('tab') as TabKey) || 'overview';
        setActiveTab(t);
    }, [searchParams]);

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        const url = tab === 'overview' ? '/contabil' : `/contabil?tab=${tab}`;
        router.push(url, { scroll: false });
    };

    // ── Computed ─────────────────────────────────────────────────────────────
    const yearsAvailable = useMemo(() => {
        const set = new Set<number>();
        transactions.forEach(t => {
            if (t.transaction_date) set.add(Number(t.transaction_date.substring(0, 4)));
        });
        set.add(new Date().getFullYear());
        return Array.from(set).sort((a, b) => b - a);
    }, [transactions]);

    const yearTxs = useMemo(
        () => transactions.filter(t => t.transaction_date?.startsWith(String(year)) && t.status === 'completed'),
        [transactions, year],
    );

    const dre = useMemo(() => {
        let receitaBruta = 0, despesaTotal = 0;
        const byMonth: Array<{ receita: number; despesa: number; resultado: number }> = Array.from({ length: 12 }, () => ({ receita: 0, despesa: 0, resultado: 0 }));
        const porCategoriaReceita = new Map<string, number>();
        const porCategoriaDespesa = new Map<string, number>();
        for (const tx of yearTxs) {
            const m = Number(tx.transaction_date.substring(5, 7)) - 1;
            const amt = Number(tx.amount);
            if (tx.type === 'income') {
                receitaBruta += amt;
                byMonth[m].receita += amt;
                const k = tx.category?.name || 'Sem categoria';
                porCategoriaReceita.set(k, (porCategoriaReceita.get(k) || 0) + amt);
            } else if (tx.type === 'expense') {
                despesaTotal += amt;
                byMonth[m].despesa += amt;
                const k = tx.category?.name || 'Sem categoria';
                porCategoriaDespesa.set(k, (porCategoriaDespesa.get(k) || 0) + amt);
            }
        }
        byMonth.forEach(m => { m.resultado = m.receita - m.despesa; });
        const resultado = receitaBruta - despesaTotal;
        const margem = receitaBruta > 0 ? (resultado / receitaBruta) * 100 : 0;
        return {
            receitaBruta, despesaTotal, resultado, margem,
            byMonth,
            porCategoriaReceita: Array.from(porCategoriaReceita.entries()).sort((a, b) => b[1] - a[1]),
            porCategoriaDespesa: Array.from(porCategoriaDespesa.entries()).sort((a, b) => b[1] - a[1]),
        };
    }, [yearTxs]);

    // Balanço patrimonial simplificado
    const balanco = useMemo(() => {
        const caixaBancos = accounts.reduce((s, a) => {
            const init = Number(a.initial_balance || 0);
            const txNet = transactions
                .filter(t => t.account_id === a.id && t.status === 'completed')
                .reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
            return s + init + txNet;
        }, 0);
        const aReceber = transactions
            .filter(t => t.type === 'income' && t.status === 'pending')
            .reduce((s, t) => s + Number(t.amount), 0);
        const aPagar = transactions
            .filter(t => t.type === 'expense' && t.status === 'pending')
            .reduce((s, t) => s + Number(t.amount), 0);
        const ativoCirculante = caixaBancos + aReceber;
        const passivoCirculante = aPagar;
        const patrimonioLiquido = ativoCirculante - passivoCirculante;
        return { caixaBancos, aReceber, aPagar, ativoCirculante, passivoCirculante, patrimonioLiquido };
    }, [accounts, transactions]);

    const TAB_LABELS: Record<TabKey, string> = {
        overview: 'Visão Geral',
        dre: 'DRE',
        balanco: 'Balanço Patrimonial',
        plano: 'Plano de Contas',
        nfe: 'Notas Fiscais',
        razao: 'Livro Razão',
    };

    const maxMonth = Math.max(1, ...dre.byMonth.map(m => Math.max(m.receita, m.despesa)));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4A85C] via-[#FFF8DC] to-[#D4A85C] text-transparent bg-clip-text">
                        Contábil
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                        {TAB_LABELS[activeTab]}
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <select
                        value={year}
                        onChange={e => setYear(Number(e.target.value))}
                        className="px-4 py-2.5 bg-white dark:bg-[#111] border border-gray-300 dark:border-[#333] text-gray-900 dark:text-white text-sm font-bold rounded-xl focus:outline-none focus:border-[#D4A85C]/50"
                    >
                        {yearsAvailable.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-indigo-500/50 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20">
                        <Download className="w-4 h-4 text-indigo-500" /> Exportar
                    </button>
                </div>
            </div>

            {/* ═══ VISÃO GERAL ═══ */}
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <KPI title="Receita Bruta" value={dre.receitaBruta} icon={ArrowUpRight} color="emerald" />
                        <KPI title="Despesa Total" value={dre.despesaTotal} icon={ArrowDownRight} color="rose" />
                        <KPI title={`Resultado ${year}`} value={dre.resultado} icon={dre.resultado >= 0 ? TrendingUp : TrendingDown} color={dre.resultado >= 0 ? 'emerald' : 'rose'} />
                        <KPI title="Margem Líquida" value={dre.margem} icon={CircleDollarSign} color={dre.margem >= 0 ? 'indigo' : 'rose'} suffix="%" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white">Receita × Despesa</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-[#888] font-mono tracking-widest mt-1">MENSAL — {year}</p>
                                </div>
                            </div>
                            <div className="flex items-end justify-between gap-2 h-60">
                                {dre.byMonth.map((m, i) => {
                                    const rh = (m.receita / maxMonth) * 100;
                                    const dh = (m.despesa / maxMonth) * 100;
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="flex items-end gap-1 w-full h-52 justify-center">
                                                <div className="w-3 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all group-hover:opacity-100 opacity-80" style={{ height: `${rh}%` }} title={`Receita: ${fmt(m.receita)}`} />
                                                <div className="w-3 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t transition-all group-hover:opacity-100 opacity-80" style={{ height: `${dh}%` }} title={`Despesa: ${fmt(m.despesa)}`} />
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-[#666] uppercase">{MONTH_NAMES[i]}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-[#222]">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-xs text-gray-500 dark:text-[#888] font-semibold">Receita</span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-500" /><span className="text-xs text-gray-500 dark:text-[#888] font-semibold">Despesa</span></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">Top 5 Despesas</h3>
                            <div className="space-y-3">
                                {dre.porCategoriaDespesa.slice(0, 5).map(([name, v]) => {
                                    const pct = (v / (dre.despesaTotal || 1)) * 100;
                                    return (
                                        <div key={name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{name}</span>
                                                <span className="text-xs font-mono text-rose-500">{fmtCompact(v)}</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                {dre.porCategoriaDespesa.length === 0 && (
                                    <p className="text-xs text-gray-400 dark:text-[#555] italic text-center py-8">Sem despesas registradas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ DRE ═══ */}
            {activeTab === 'dre' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414] flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#D4A85C]/10 flex items-center justify-center border border-[#D4A85C]/20">
                                <TrendingUp className="w-5 h-5 text-[#D4A85C]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white tracking-widest text-sm uppercase">Demonstrativo de Resultado do Exercício</h3>
                                <p className="text-[10px] text-gray-500 dark:text-[#888] font-mono tracking-widest mt-0.5">EXERCÍCIO {year} • APURADO PELO REGIME DE CAIXA</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <DreLine label="Receita Bruta Operacional" value={dre.receitaBruta} bold tone="positive" />
                            <DreIndent>
                                {dre.porCategoriaReceita.slice(0, 8).map(([name, v]) => (
                                    <DreLine key={name} label={name} value={v} small />
                                ))}
                            </DreIndent>
                            <DreLine label="(–) Despesas Operacionais" value={-dre.despesaTotal} tone="negative" bold />
                            <DreIndent>
                                {dre.porCategoriaDespesa.slice(0, 10).map(([name, v]) => (
                                    <DreLine key={name} label={name} value={-v} small />
                                ))}
                            </DreIndent>
                            <div className="my-4 border-t border-gray-200 dark:border-[#222]" />
                            <DreLine label="= Resultado do Exercício" value={dre.resultado} big tone={dre.resultado >= 0 ? 'positive' : 'negative'} />
                            <DreLine label="Margem Líquida" value={dre.margem} suffix="%" tone={dre.margem >= 0 ? 'positive' : 'negative'} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414]">
                            <h3 className="font-bold text-gray-900 dark:text-white tracking-widest text-sm uppercase">DRE Mensal Comparativo</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-bold">Mês</th>
                                        <th className="px-4 py-3 text-right font-bold">Receita</th>
                                        <th className="px-4 py-3 text-right font-bold">Despesa</th>
                                        <th className="px-4 py-3 text-right font-bold">Resultado</th>
                                        <th className="px-4 py-3 text-right font-bold">Margem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dre.byMonth.map((m, i) => {
                                        const marg = m.receita > 0 ? (m.resultado / m.receita) * 100 : 0;
                                        return (
                                            <tr key={i} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414]">
                                                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{MONTH_NAMES[i]}/{year}</td>
                                                <td className="px-4 py-3 text-right font-mono text-emerald-500">{fmt(m.receita)}</td>
                                                <td className="px-4 py-3 text-right font-mono text-rose-500">{fmt(m.despesa)}</td>
                                                <td className={`px-4 py-3 text-right font-mono font-bold ${m.resultado >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{fmt(m.resultado)}</td>
                                                <td className={`px-4 py-3 text-right font-mono text-xs ${marg >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{marg.toFixed(1)}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-[#141414] border-t-2 border-gray-300 dark:border-[#333]">
                                    <tr>
                                        <td className="px-4 py-3 font-extrabold uppercase tracking-widest text-xs">Total {year}</td>
                                        <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-500">{fmt(dre.receitaBruta)}</td>
                                        <td className="px-4 py-3 text-right font-mono font-extrabold text-rose-500">{fmt(dre.despesaTotal)}</td>
                                        <td className={`px-4 py-3 text-right font-mono font-extrabold ${dre.resultado >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{fmt(dre.resultado)}</td>
                                        <td className={`px-4 py-3 text-right font-mono font-extrabold text-xs ${dre.margem >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{dre.margem.toFixed(1)}%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ BALANÇO ═══ */}
            {activeTab === 'balanco' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <KPI title="Ativo Total" value={balanco.ativoCirculante} icon={Wallet} color="emerald" />
                        <KPI title="Passivo Total" value={balanco.passivoCirculante} icon={AlertTriangle} color="rose" />
                        <KPI title="Patrimônio Líquido" value={balanco.patrimonioLiquido} icon={Scale} color={balanco.patrimonioLiquido >= 0 ? 'indigo' : 'rose'} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BalancoSection
                            title="Ativo Circulante"
                            total={balanco.ativoCirculante}
                            icon={ArrowUpRight}
                            tone="emerald"
                            rows={[
                                { label: 'Caixa e Equivalentes', value: balanco.caixaBancos, detail: `${accounts.length} conta${accounts.length !== 1 ? 's' : ''}` },
                                { label: 'Contas a Receber', value: balanco.aReceber, detail: 'Lançamentos pendentes (receitas)' },
                            ]}
                        />
                        <BalancoSection
                            title="Passivo Circulante"
                            total={balanco.passivoCirculante}
                            icon={ArrowDownRight}
                            tone="rose"
                            rows={[
                                { label: 'Contas a Pagar', value: balanco.aPagar, detail: 'Lançamentos pendentes (despesas)' },
                            ]}
                        />
                    </div>

                    <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414]">
                            <h3 className="font-bold text-gray-900 dark:text-white tracking-widest text-sm uppercase">Posição por Conta</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222]">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-bold">Conta</th>
                                        <th className="px-4 py-3 text-left font-bold">Tipo</th>
                                        <th className="px-4 py-3 text-right font-bold">Saldo Inicial</th>
                                        <th className="px-4 py-3 text-right font-bold">Saldo Atual</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accounts.map(a => {
                                        const txNet = transactions
                                            .filter(t => t.account_id === a.id && t.status === 'completed')
                                            .reduce((acc, t) => acc + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
                                        const saldo = Number(a.initial_balance || 0) + txNet;
                                        return (
                                            <tr key={a.id} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414]">
                                                <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{a.name}</td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-[#888] uppercase text-xs tracking-widest">{a.type}</td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-500 dark:text-[#888]">{fmt(Number(a.initial_balance || 0))}</td>
                                                <td className={`px-4 py-3 text-right font-mono font-bold ${saldo >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{fmt(saldo)}</td>
                                            </tr>
                                        );
                                    })}
                                    {accounts.length === 0 && (
                                        <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400 dark:text-[#555] text-xs uppercase tracking-widest">Nenhuma conta cadastrada.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ PLANO DE CONTAS ═══ */}
            {activeTab === 'plano' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <PlanoCard
                            title="Receitas"
                            icon={ArrowUpRight}
                            tone="emerald"
                            items={categories.filter(c => c.type === 'income').map(c => c.name)}
                        />
                        <PlanoCard
                            title="Despesas"
                            icon={ArrowDownRight}
                            tone="rose"
                            items={categories.filter(c => c.type === 'expense').map(c => c.name)}
                        />
                    </div>

                    <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-4">Estrutura Contábil Recomendada</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <PlanoGrupo codigo="1" nome="Ativo" subs={['1.1 Ativo Circulante (Caixa, Bancos, Contas a Receber)', '1.2 Ativo Não-Circulante (Imobilizado, Investimentos)']} />
                            <PlanoGrupo codigo="2" nome="Passivo" subs={['2.1 Passivo Circulante (Contas a Pagar, Salários, Impostos)', '2.2 Passivo Não-Circulante (Financiamentos LP)']} />
                            <PlanoGrupo codigo="3" nome="Patrimônio Líquido" subs={['3.1 Capital Social', '3.2 Lucros/Prejuízos Acumulados']} />
                            <PlanoGrupo codigo="4" nome="Receitas" subs={['4.1 Receita de Leilões (comissões)', '4.2 Outras Receitas Operacionais']} />
                            <PlanoGrupo codigo="5" nome="Despesas" subs={['5.1 Despesas Operacionais', '5.2 Despesas com Pessoal', '5.3 Tributárias']} />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ NOTAS FISCAIS ═══ */}
            {activeTab === 'nfe' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <KPI title="NF-e Emitidas" value={0} icon={Receipt} color="indigo" raw />
                        <KPI title="NF-e Recebidas" value={0} icon={FileSpreadsheet} color="indigo" raw />
                        <KPI title="Canceladas" value={0} icon={AlertTriangle} color="rose" raw />
                        <KPI title="Pendentes SEFAZ" value={0} icon={CheckCircle2} color="amber" raw />
                    </div>

                    <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-10 text-center shadow-xl relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <Receipt className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3">Integração SEFAZ em desenvolvimento</h3>
                            <p className="text-gray-500 dark:text-[#888] max-w-2xl mx-auto leading-relaxed text-sm font-medium">
                                Em breve: emissão de NF-e (modelo 55), NFS-e municipal, importação automática de XML, conciliação com Financeiro e arquivamento por 5 anos conforme exigência fiscal.
                            </p>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
                                {[
                                    { title: 'Emissão NF-e', desc: 'Geração de XML, assinatura digital A1/A3, transmissão SEFAZ' },
                                    { title: 'Importação XML', desc: 'Leitura automática de notas recebidas e vínculo com pagamentos' },
                                    { title: 'DANFE / PDF', desc: 'Impressão do documento auxiliar e envio por e-mail' },
                                ].map(it => (
                                    <div key={it.title} className="p-4 bg-gray-50 dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-[#222] text-left">
                                        <p className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider mb-1">{it.title}</p>
                                        <p className="text-[11px] text-gray-500 dark:text-[#888] leading-relaxed">{it.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ LIVRO RAZÃO ═══ */}
            {activeTab === 'razao' && (
                <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden animate-in fade-in duration-500">
                    <div className="p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4A85C]/10 flex items-center justify-center border border-[#D4A85C]/20">
                            <BookOpen className="w-5 h-5 text-[#D4A85C]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white tracking-widest text-sm uppercase">Livro Razão</h3>
                            <p className="text-[10px] text-gray-500 dark:text-[#888] font-mono tracking-widest mt-0.5">LANÇAMENTOS EFETIVADOS • {yearTxs.length} REGISTROS • {year}</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222] sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold">Data</th>
                                    <th className="px-4 py-3 text-left font-bold">Histórico</th>
                                    <th className="px-4 py-3 text-left font-bold">Conta</th>
                                    <th className="px-4 py-3 text-left font-bold">Categoria</th>
                                    <th className="px-4 py-3 text-right font-bold">Débito</th>
                                    <th className="px-4 py-3 text-right font-bold">Crédito</th>
                                </tr>
                            </thead>
                            <tbody>
                                {yearTxs.slice(0, 500).map(tx => (
                                    <tr key={tx.id} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414]">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-[#888]">{new Date(tx.transaction_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate" title={tx.description}>{tx.description}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#888]">{tx.account?.name || '—'}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-[#888]">{tx.category?.name || '—'}</td>
                                        <td className="px-4 py-3 text-right font-mono text-rose-500">{tx.type === 'expense' ? fmt(Number(tx.amount)) : '—'}</td>
                                        <td className="px-4 py-3 text-right font-mono text-emerald-500">{tx.type === 'income' ? fmt(Number(tx.amount)) : '—'}</td>
                                    </tr>
                                ))}
                                {yearTxs.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400 dark:text-[#555] text-xs uppercase tracking-widest">Nenhum lançamento efetivado em {year}.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {yearTxs.length > 500 && (
                        <div className="p-4 text-center text-xs text-gray-400 dark:text-[#666] border-t border-gray-100 dark:border-[#222]">
                            Mostrando primeiros 500 de {yearTxs.length} lançamentos.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Sub components ──────────────────────────────────────────────────────────
function KPI({ title, value, icon: Icon, color, suffix, raw }: { title: string; value: number; icon: any; color: 'emerald' | 'rose' | 'indigo' | 'amber'; suffix?: string; raw?: boolean }) {
    const colorMap = {
        emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/40' },
        rose: { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'hover:border-rose-500/40' },
        indigo: { text: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/40' },
        amber: { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/40' },
    };
    const c = colorMap[color];
    return (
        <div className={`bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] ${c.border} rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <Icon className={`w-20 h-20 ${c.text}`} />
            </div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">{title}</p>
                <h3 className={`text-3xl font-extrabold ${c.text} mt-2 tracking-tight`}>
                    {suffix === '%' ? `${value.toFixed(1)}%` : raw ? value : fmt(value)}
                </h3>
            </div>
        </div>
    );
}

function DreLine({ label, value, bold, big, small, tone, suffix }: { label: string; value: number; bold?: boolean; big?: boolean; small?: boolean; tone?: 'positive' | 'negative' | 'neutral'; suffix?: string }) {
    const color = tone === 'positive' ? 'text-emerald-500' : tone === 'negative' ? 'text-rose-500' : 'text-gray-900 dark:text-white';
    const size = big ? 'text-xl' : small ? 'text-xs' : 'text-sm';
    const weight = bold || big ? 'font-extrabold' : small ? 'font-medium' : 'font-semibold';
    return (
        <div className={`flex items-center justify-between py-2 ${big ? 'py-4' : ''} ${small ? 'text-gray-500 dark:text-[#888]' : ''}`}>
            <span className={`${size} ${weight} ${small ? 'text-gray-500 dark:text-[#888]' : 'text-gray-700 dark:text-gray-300'}`}>{label}</span>
            <span className={`${size} ${weight} font-mono ${color}`}>
                {suffix === '%' ? `${value.toFixed(1)}%` : fmt(value)}
            </span>
        </div>
    );
}

function DreIndent({ children }: { children: React.ReactNode }) {
    return <div className="pl-6 border-l-2 border-gray-200 dark:border-[#222] ml-2 my-1 space-y-0.5">{children}</div>;
}

function BalancoSection({ title, total, icon: Icon, tone, rows }: { title: string; total: number; icon: any; tone: 'emerald' | 'rose'; rows: Array<{ label: string; value: number; detail?: string }> }) {
    const color = tone === 'emerald' ? 'text-emerald-500' : 'text-rose-500';
    const bg = tone === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';
    return (
        <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white tracking-widest text-sm uppercase">{title}</h3>
            </div>
            <div className="p-6 space-y-4">
                {rows.map(r => (
                    <div key={r.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#1A1A1A] last:border-0">
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.label}</p>
                            {r.detail && <p className="text-[10px] text-gray-500 dark:text-[#888] uppercase tracking-widest mt-0.5">{r.detail}</p>}
                        </div>
                        <span className={`font-mono font-bold ${color}`}>{fmt(r.value)}</span>
                    </div>
                ))}
                <div className="pt-4 border-t-2 border-gray-200 dark:border-[#333] flex items-center justify-between">
                    <p className="text-xs font-extrabold uppercase tracking-widest text-gray-900 dark:text-white">Total</p>
                    <span className={`text-xl font-mono font-extrabold ${color}`}>{fmt(total)}</span>
                </div>
            </div>
        </div>
    );
}

function PlanoCard({ title, icon: Icon, tone, items }: { title: string; icon: any; tone: 'emerald' | 'rose'; items: string[] }) {
    const color = tone === 'emerald' ? 'text-emerald-500' : 'text-rose-500';
    const bg = tone === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20';
    return (
        <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-[#222] bg-gray-50 dark:bg-[#141414] flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} border flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white tracking-widest text-sm uppercase">{title}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-[#888] font-mono tracking-widest mt-0.5">{items.length} CATEGORIA{items.length !== 1 ? 'S' : ''}</p>
                </div>
            </div>
            <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {items.length > 0 ? items.map(name => (
                    <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#141414] rounded-lg border border-gray-100 dark:border-[#1A1A1A]">
                        <ChevronRight className={`w-4 h-4 ${color}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{name}</span>
                    </div>
                )) : (
                    <p className="text-center text-xs text-gray-400 dark:text-[#555] italic py-6">Nenhuma categoria cadastrada.</p>
                )}
            </div>
        </div>
    );
}

function PlanoGrupo({ codigo, nome, subs }: { codigo: string; nome: string; subs: string[] }) {
    return (
        <div className="p-4 bg-gray-50 dark:bg-[#141414] rounded-xl border border-gray-200 dark:border-[#222]">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-extrabold text-[#D4A85C] bg-[#D4A85C]/10 px-2 py-1 rounded-md border border-[#D4A85C]/20">{codigo}</span>
                <span className="text-sm font-extrabold uppercase tracking-widest text-gray-900 dark:text-white">{nome}</span>
            </div>
            <ul className="space-y-1.5 pl-6 border-l-2 border-gray-300 dark:border-[#333]">
                {subs.map(s => (
                    <li key={s} className="text-xs text-gray-600 dark:text-[#aaa]">{s}</li>
                ))}
            </ul>
        </div>
    );
}

// silence unused warnings for conditionally referenced icons
void Calculator; void Building2;
