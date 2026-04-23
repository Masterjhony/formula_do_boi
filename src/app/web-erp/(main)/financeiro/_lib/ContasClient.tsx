'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    AlertTriangle, Calendar, CheckCircle2,
    Search, Filter, Plus, Wallet, X, Loader2, Clock, TrendingUp,
    Printer, CheckCheck, Undo2, Trash2, Ban, SplitSquareHorizontal,
    Gavel, Sparkles, ChevronRight, FileDown, CircleDollarSign,
} from 'lucide-react';
import {
    fmt, fmtDate, today, daysOverdue, bucketOf, BUCKET_LABELS,
    BUCKET_COLORS, buildReceivables, buildPayables, toCSV, downloadCSV,
    type AgingBucket,
} from './helpers';
import type { Account, Category, Transaction, BulaLeilao, FechamentoLite, UnifiedItem } from './types';
import {
    saveTransaction, deleteTransaction, baixarTransacao, baixarEmLote,
    reabrirTransacao, cancelarTransacao, baixaParcial, registrarLeiloesLote,
} from '../actions';

type Mode = 'receber' | 'pagar';

interface Props {
    mode: Mode;
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
    leiloes: BulaLeilao[];
    fechamentos: FechamentoLite[];
}

const MODE = {
    receber: {
        title: 'Contas a Receber',
        short: 'Receber',
        type: 'income' as const,
        actionPast: 'Recebido',
        actionVerb: 'Receber',
        actionSubject: 'cliente',
        partyLabel: 'Cliente / Origem',
        hero: 'from-emerald-500 to-green-700',
        routeOther: '/web-erp/financeiro/a-pagar',
        routeOtherLabel: 'A Pagar',
    },
    pagar: {
        title: 'Contas a Pagar',
        short: 'Pagar',
        type: 'expense' as const,
        actionPast: 'Pago',
        actionVerb: 'Pagar',
        actionSubject: 'fornecedor',
        partyLabel: 'Fornecedor / Destino',
        hero: 'from-rose-500 to-red-700',
        routeOther: '/web-erp/financeiro/a-receber',
        routeOtherLabel: 'A Receber',
    },
} as const;

export default function ContasClient({ mode, accounts, categories, transactions, leiloes, fechamentos }: Props) {
    const router = useRouter();
    const cfg = MODE[mode];

    // ── Dados unificados ───────────────────────────────────────────────
    const items = useMemo<UnifiedItem[]>(() => {
        return mode === 'receber'
            ? buildReceivables(transactions, leiloes, fechamentos)
            : buildPayables(transactions, fechamentos);
    }, [mode, transactions, leiloes, fechamentos]);

    // ── Filtros ────────────────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todos' | 'abertos' | 'baixados' | 'vencidos'>('abertos');
    const [bucketFilter, setBucketFilter] = useState<AgingBucket | 'all'>('all');
    const [catFilter, setCatFilter] = useState<string>('all');
    const [accFilter, setAccFilter] = useState<string>('all');
    const [sourceFilter, setSourceFilter] = useState<'all' | 'erp' | 'virtual'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // ── Seleção ────────────────────────────────────────────────────────
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const toggleSel = (key: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    // ── Modais ─────────────────────────────────────────────────────────
    const [showForm, setShowForm] = useState(false);
    const [formItem, setFormItem] = useState<UnifiedItem | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        description: '', amount: '', transaction_date: today(), account_id: '',
        category_id: '', status: 'pending', party: '', observacao: '',
    });

    const [showBaixa, setShowBaixa] = useState(false);
    const [baixaItem, setBaixaItem] = useState<UnifiedItem | null>(null);
    const [baixaData, setBaixaData] = useState({ actualDate: today(), accountId: '', note: '' });
    const [busy, setBusy] = useState(false);

    const [showParcial, setShowParcial] = useState(false);
    const [parcialItem, setParcialItem] = useState<UnifiedItem | null>(null);
    const [parcialData, setParcialData] = useState({ amountPaid: '', actualDate: today(), accountId: '', note: '' });

    const [showLancar, setShowLancar] = useState(false);
    const [lancarItem, setLancarItem] = useState<UnifiedItem | null>(null);
    const [lancarData, setLancarData] = useState({ accountId: '', categoryId: '', transaction_date: today() });

    const [showBulkBaixa, setShowBulkBaixa] = useState(false);
    const [bulkDate, setBulkDate] = useState(today());

    // ── Lista filtrada + ordenada ──────────────────────────────────────
    const filtered = useMemo(() => {
        let list = items;

        if (statusFilter === 'abertos') {
            list = list.filter(i => i.status === 'pending' || i.status === 'virtual');
        } else if (statusFilter === 'baixados') {
            list = list.filter(i => i.status === 'completed');
        } else if (statusFilter === 'vencidos') {
            list = list.filter(i => (i.status === 'pending' || i.status === 'virtual') && daysOverdue(i.dueDate) > 0);
        }

        if (bucketFilter !== 'all') {
            list = list.filter(i => (i.status === 'pending' || i.status === 'virtual') && bucketOf(i.dueDate) === bucketFilter);
        }

        if (catFilter !== 'all') {
            if (catFilter === '__none__') list = list.filter(i => !i.categoryId);
            else list = list.filter(i => i.categoryId === catFilter);
        }

        if (accFilter !== 'all') {
            list = list.filter(i => i.accountId === accFilter);
        }

        if (sourceFilter === 'erp') list = list.filter(i => i.source === 'erp');
        else if (sourceFilter === 'virtual') list = list.filter(i => i.source !== 'erp');

        if (dateFrom) list = list.filter(i => i.dueDate >= dateFrom);
        if (dateTo) list = list.filter(i => i.dueDate <= dateTo);

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(i =>
                i.title.toLowerCase().includes(q) ||
                i.party.toLowerCase().includes(q) ||
                (i.categoryName || '').toLowerCase().includes(q) ||
                (i.accountName || '').toLowerCase().includes(q),
            );
        }

        return list;
    }, [items, statusFilter, bucketFilter, catFilter, accFilter, sourceFilter, dateFrom, dateTo, search]);

    // ── KPIs ───────────────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const abertos = items.filter(i => i.status === 'pending' || i.status === 'virtual');
        const baixados = items.filter(i => i.status === 'completed');
        const vencidos = abertos.filter(i => daysOverdue(i.dueDate) > 0);
        const hoje = abertos.filter(i => daysOverdue(i.dueDate) === 0);
        const proxSete = abertos.filter(i => {
            const d = daysOverdue(i.dueDate);
            return d < 0 && d >= -7;
        });

        return {
            totalAberto: abertos.reduce((s, i) => s + i.balance, 0),
            totalBaixado: baixados.reduce((s, i) => s + i.amount, 0),
            totalVencido: vencidos.reduce((s, i) => s + i.balance, 0),
            totalHoje: hoje.reduce((s, i) => s + i.balance, 0),
            total7: proxSete.reduce((s, i) => s + i.balance, 0),
            countAberto: abertos.length,
            countBaixado: baixados.length,
            countVencido: vencidos.length,
            countHoje: hoje.length,
        };
    }, [items]);

    // ── Aging buckets para o gráfico ───────────────────────────────────
    const buckets = useMemo(() => {
        const map: Record<AgingBucket, { count: number; total: number }> = {
            overdue: { count: 0, total: 0 }, today: { count: 0, total: 0 },
            d7: { count: 0, total: 0 }, d30: { count: 0, total: 0 },
            d90: { count: 0, total: 0 }, future: { count: 0, total: 0 },
        };
        for (const i of items) {
            if (i.status !== 'pending' && i.status !== 'virtual') continue;
            const b = bucketOf(i.dueDate);
            map[b].count++;
            map[b].total += i.balance;
        }
        return map;
    }, [items]);

    const maxBucket = Math.max(...(Object.values(buckets).map(b => b.total)), 1);

    // ── Seleção agregada (somente linhas com txId) ─────────────────────
    const selectedItems = useMemo(
        () => filtered.filter(i => selected.has(i.key) && i.txId && i.status === 'pending'),
        [filtered, selected],
    );
    const selectedTotal = selectedItems.reduce((s, i) => s + i.balance, 0);

    // ── Handlers ───────────────────────────────────────────────────────
    const openNew = () => {
        setFormItem(null);
        setFormData({
            description: '', amount: '', transaction_date: today(),
            account_id: accounts[0]?.id || '', category_id: '',
            status: 'pending', party: '', observacao: '',
        });
        setShowForm(true);
    };
    const openEdit = (i: UnifiedItem) => {
        if (!i.txId) return;
        setFormItem(i);
        setFormData({
            description: i.title,
            amount: String(i.amount),
            transaction_date: i.dueDate,
            account_id: i.accountId || accounts[0]?.id || '',
            category_id: i.categoryId || '',
            status: i.status === 'virtual' ? 'pending' : i.status,
            party: i.party,
            observacao: i.observacao || '',
        });
        setShowForm(true);
    };
    const closeForm = () => { setShowForm(false); setSaving(false); };

    const saveForm = async () => {
        if (!formData.description.trim() || !formData.amount || !formData.account_id) return;
        setSaving(true);
        const res = await saveTransaction({
            id: formItem?.txId || undefined,
            account_id: formData.account_id,
            type: cfg.type,
            amount: parseFloat(formData.amount),
            description: formData.description.trim(),
            transaction_date: formData.transaction_date,
            status: formData.status,
            category_id: formData.category_id || null,
            observacao: formData.observacao.trim() || null,
        });
        if (res.success) { closeForm(); router.refresh(); }
        else { alert('Erro: ' + res.error); setSaving(false); }
    };

    const openBaixa = (i: UnifiedItem) => {
        setBaixaItem(i);
        setBaixaData({ actualDate: today(), accountId: i.accountId || accounts[0]?.id || '', note: '' });
        setShowBaixa(true);
    };
    const confirmBaixa = async () => {
        if (!baixaItem?.txId) return;
        setBusy(true);
        const res = await baixarTransacao({
            id: baixaItem.txId,
            actualDate: baixaData.actualDate,
            accountId: baixaData.accountId || null,
            note: baixaData.note || null,
        });
        setBusy(false);
        if (res.success) { setShowBaixa(false); router.refresh(); }
        else alert('Erro: ' + res.error);
    };

    const openParcial = (i: UnifiedItem) => {
        setParcialItem(i);
        setParcialData({
            amountPaid: '', actualDate: today(),
            accountId: i.accountId || accounts[0]?.id || '', note: '',
        });
        setShowParcial(true);
    };
    const confirmParcial = async () => {
        if (!parcialItem?.txId) return;
        const amt = parseFloat(parcialData.amountPaid);
        if (!amt || amt <= 0) { alert('Informe o valor pago.'); return; }
        setBusy(true);
        const res = await baixaParcial({
            originalId: parcialItem.txId,
            amountPaid: amt,
            actualDate: parcialData.actualDate,
            accountId: parcialData.accountId,
            note: parcialData.note || null,
        });
        setBusy(false);
        if (res.success) { setShowParcial(false); router.refresh(); }
        else alert('Erro: ' + res.error);
    };

    const openLancar = (i: UnifiedItem) => {
        setLancarItem(i);
        setLancarData({
            accountId: accounts[0]?.id || '',
            categoryId: '',
            transaction_date: i.dueDate || today(),
        });
        setShowLancar(true);
    };
    const confirmLancar = async () => {
        if (!lancarItem || !lancarData.accountId) return;
        setBusy(true);
        const res = await registrarLeiloesLote([{
            type: cfg.type,
            amount: lancarItem.balance,
            description: lancarItem.title,
            transaction_date: lancarData.transaction_date,
            account_id: lancarData.accountId,
            category_id: lancarData.categoryId || null,
            sourceTag: lancarItem.sourceTag || lancarItem.key,
        }]);
        setBusy(false);
        if (res.success) { setShowLancar(false); router.refresh(); }
        else alert('Erro');
    };

    const lancarTodosVirtuais = async () => {
        const virtuais = items.filter(i => i.status === 'virtual');
        if (virtuais.length === 0) return;
        if (!accounts[0]) { alert('Cadastre uma conta bancária primeiro.'); return; }
        if (!confirm(`Lançar ${virtuais.length} ${cfg.short.toLowerCase()} pendentes vindas de leilões no ERP?`)) return;
        setBusy(true);
        const res = await registrarLeiloesLote(
            virtuais.map(i => ({
                type: cfg.type,
                amount: i.balance,
                description: i.title,
                transaction_date: i.dueDate || today(),
                account_id: accounts[0].id,
                category_id: null,
                sourceTag: i.sourceTag || i.key,
            })),
        );
        setBusy(false);
        if (res.success) {
            alert(`✓ ${res.created} criadas, ${res.skipped} já existentes, ${res.failed} falharam.`);
            router.refresh();
        }
    };

    const bulkBaixa = async () => {
        if (selectedItems.length === 0) return;
        setBusy(true);
        const res = await baixarEmLote(selectedItems.map(i => i.txId!), bulkDate);
        setBusy(false);
        if (res.success) {
            setShowBulkBaixa(false);
            setSelected(new Set());
            router.refresh();
        } else alert('Erro');
    };

    const reabrir = async (id: string) => {
        const res = await reabrirTransacao(id);
        if (res.success) router.refresh();
    };
    const cancelar = async (id: string) => {
        if (!confirm('Cancelar esta conta?')) return;
        const res = await cancelarTransacao(id);
        if (res.success) router.refresh();
    };
    const excluir = async (id: string) => {
        if (!confirm('Excluir esta conta definitivamente?')) return;
        const res = await deleteTransaction(id);
        if (res.success) router.refresh();
    };

    const handleExport = () => {
        downloadCSV(
            `${cfg.title.toLowerCase().replace(/\s+/g, '_')}_${today()}.csv`,
            toCSV(filtered, cfg.title),
        );
    };
    const handlePrint = () => window.print();

    // ── Classes de cor baseadas no modo ──────────────────────────────
    const accent = mode === 'receber'
        ? { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30', soft: 'bg-emerald-500/10', softText: 'text-emerald-400' }
        : { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500/30', soft: 'bg-rose-500/10', softText: 'text-rose-400' };

    const relCategories = categories.filter(c => c.type === cfg.type);
    const virtuaisCount = items.filter(i => i.status === 'virtual').length;

    // ─────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 print:pb-0">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6 print:hidden">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <Link href="/web-erp/financeiro" className="hover:text-[#D4AF37] transition-colors">Financeiro</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className={accent.text}>{cfg.title}</span>
                        </div>
                        <h2 className={`mt-2 text-3xl font-bold tracking-wide uppercase bg-gradient-to-r ${cfg.hero} text-transparent bg-clip-text`}>
                            {cfg.title}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                            Gestão profissional de {cfg.actionSubject}s · aging · baixas · integração com leilões
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={cfg.routeOther}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-[#D4AF37]/40 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-all"
                        >
                            <CircleDollarSign className="w-4 h-4" /> {cfg.routeOtherLabel}
                        </Link>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-[#D4AF37]/40 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-all"
                            title="Exportar lista filtrada para CSV"
                        >
                            <FileDown className="w-4 h-4" /> CSV
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-[#D4AF37]/40 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-all"
                        >
                            <Printer className="w-4 h-4" /> Imprimir
                        </button>
                        <button
                            onClick={openNew}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105 text-white bg-gradient-to-r ${cfg.hero}`}
                        >
                            <Plus className="w-4 h-4" /> Nova Conta {cfg.short === 'Receber' ? 'a Receber' : 'a Pagar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── KPIs ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPI
                    label={`Total em Aberto`}
                    value={fmt(kpis.totalAberto)}
                    hint={`${kpis.countAberto} conta(s)`}
                    icon={<Clock className="w-5 h-5" />}
                    color={mode === 'receber' ? 'emerald' : 'rose'}
                />
                <KPI
                    label="Vencidas"
                    value={fmt(kpis.totalVencido)}
                    hint={`${kpis.countVencido} em atraso`}
                    icon={<AlertTriangle className="w-5 h-5" />}
                    color="red"
                    danger={kpis.countVencido > 0}
                />
                <KPI
                    label="Vence Hoje"
                    value={fmt(kpis.totalHoje)}
                    hint={`${kpis.countHoje} conta(s)`}
                    icon={<Calendar className="w-5 h-5" />}
                    color="amber"
                />
                <KPI
                    label={`${cfg.actionPast} (acum.)`}
                    value={fmt(kpis.totalBaixado)}
                    hint={`${kpis.countBaixado} baixa(s)`}
                    icon={<CheckCircle2 className="w-5 h-5" />}
                    color={mode === 'receber' ? 'emerald' : 'blue'}
                />
            </div>

            {/* ── Aging chart ─────────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-6 shadow-xl print:border-gray-300">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${accent.soft} ${accent.text}`}>
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Distribuição por Vencimento</h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Apenas contas em aberto · clique no bucket para filtrar</p>
                        </div>
                    </div>
                    {bucketFilter !== 'all' && (
                        <button
                            onClick={() => setBucketFilter('all')}
                            className="text-xs text-[#D4AF37] font-bold hover:underline"
                        >Limpar filtro</button>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {(Object.keys(buckets) as AgingBucket[]).map(b => {
                        const data = buckets[b];
                        const pct = (data.total / maxBucket) * 100;
                        const active = bucketFilter === b;
                        return (
                            <button
                                key={b}
                                onClick={() => setBucketFilter(active ? 'all' : b)}
                                className={`text-left p-3 rounded-xl border transition-all ${
                                    active ? `${BUCKET_COLORS[b]} ring-2` : 'border-gray-200 dark:border-[#222] hover:border-[#D4AF37]/40'
                                }`}
                            >
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{BUCKET_LABELS[b]}</p>
                                <p className="text-lg font-extrabold text-gray-900 dark:text-white mt-1">{fmt(data.total)}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{data.count} conta(s)</p>
                                <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-[#222]">
                                    <div
                                        className={`h-full rounded-full ${b === 'overdue' ? 'bg-rose-500' : b === 'today' ? 'bg-amber-500' : b === 'd7' ? 'bg-amber-400' : accent.bg}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Banner leilões/fechamentos ──────────────────────────── */}
            {virtuaisCount > 0 && (
                <div className="bg-gradient-to-r from-[#B8860B]/10 via-[#B8860B]/5 to-transparent border border-[#B8860B]/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center shadow-lg shrink-0">
                            <Gavel className="w-5 h-5 text-black" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                {virtuaisCount} {cfg.short === 'Receber' ? 'receita(s)' : 'comissão(ões)'} pendente(s) de leilões
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Essas contas estão previstas mas ainda não lançadas no ERP. Lance em lote para incluir na conciliação.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={lancarTodosVirtuais}
                        disabled={busy}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#9A7209] text-black rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                    >
                        <Sparkles className="w-4 h-4" /> Lançar tudo no ERP
                    </button>
                </div>
            )}

            {/* ── Filtros ─────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-4 print:hidden">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {(['abertos', 'vencidos', 'baixados', 'todos'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                    statusFilter === s
                                        ? `${accent.soft} ${accent.text} ring-1 ${accent.border}`
                                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >{s === 'abertos' ? 'Em aberto' : s === 'vencidos' ? 'Vencidas' : s === 'baixados' ? cfg.actionPast + 's' : 'Todas'}</button>
                        ))}
                        <div className="hidden md:block h-5 w-px bg-gray-200 dark:bg-[#333] mx-2" />
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder={`Buscar por descrição, ${cfg.actionSubject}, categoria...`}
                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222] rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#D4AF37]/50"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-500 font-bold uppercase tracking-widest"><Filter className="w-3 h-3 inline mr-1" />Filtros:</span>
                        <select
                            value={catFilter}
                            onChange={e => setCatFilter(e.target.value)}
                            className="px-3 py-1.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222] rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#D4AF37]/50"
                        >
                            <option value="all">Todas categorias</option>
                            <option value="__none__">Sem categoria</option>
                            {relCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            value={accFilter}
                            onChange={e => setAccFilter(e.target.value)}
                            className="px-3 py-1.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222] rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#D4AF37]/50"
                        >
                            <option value="all">Todas contas</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <select
                            value={sourceFilter}
                            onChange={e => setSourceFilter(e.target.value as any)}
                            className="px-3 py-1.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222] rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#D4AF37]/50"
                        >
                            <option value="all">Todas origens</option>
                            <option value="erp">ERP</option>
                            <option value="virtual">Leilões (virtual)</option>
                        </select>
                        <div className="flex items-center gap-1">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222] rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#D4AF37]/50"
                            />
                            <span className="text-gray-400">→</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="px-2 py-1.5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222] rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#D4AF37]/50"
                            />
                        </div>
                        {(search || catFilter !== 'all' || accFilter !== 'all' || sourceFilter !== 'all' || dateFrom || dateTo || bucketFilter !== 'all') && (
                            <button
                                onClick={() => { setSearch(''); setCatFilter('all'); setAccFilter('all'); setSourceFilter('all'); setDateFrom(''); setDateTo(''); setBucketFilter('all'); }}
                                className="px-2 py-1 rounded-md text-[10px] text-gray-500 hover:text-rose-500 underline"
                            >Limpar</button>
                        )}
                        <span className="ml-auto text-gray-500 font-semibold">
                            {filtered.length} de {items.length} conta(s)
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Barra de seleção ────────────────────────────────────── */}
            {selected.size > 0 && (
                <div className={`sticky top-4 z-20 ${accent.soft} border ${accent.border} rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg print:hidden`}>
                    <div className="flex items-center gap-3">
                        <CheckCheck className={`w-5 h-5 ${accent.text}`} />
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {selectedItems.length} conta(s) · {fmt(selectedTotal)}
                            </p>
                            <p className="text-[10px] text-gray-500">Apenas contas em aberto com lançamento no ERP podem ser baixadas em lote</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowBulkBaixa(true)}
                            disabled={selectedItems.length === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${cfg.hero} disabled:opacity-50`}
                        >
                            <CheckCircle2 className="w-4 h-4" /> Dar baixa em lote
                        </button>
                        <button
                            onClick={() => setSelected(new Set())}
                            className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        >Cancelar</button>
                    </div>
                </div>
            )}

            {/* ── Tabela / Lista ──────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden print:border-gray-300 print:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#222]">
                            <tr>
                                <th className="w-10 px-3 py-3 print:hidden">
                                    <input
                                        type="checkbox"
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setSelected(new Set(filtered.filter(i => i.txId && i.status === 'pending').map(i => i.key)));
                                            } else setSelected(new Set());
                                        }}
                                        checked={selectedItems.length > 0 && selectedItems.length === filtered.filter(i => i.txId && i.status === 'pending').length}
                                        className="accent-[#D4AF37]"
                                    />
                                </th>
                                <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Vencimento</th>
                                <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">{cfg.partyLabel}</th>
                                <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Descrição</th>
                                <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden lg:table-cell">Categoria</th>
                                <th className="text-left px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden lg:table-cell">Conta</th>
                                <th className="text-right px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Valor</th>
                                <th className="text-center px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">Status</th>
                                <th className="w-40 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 print:hidden">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center text-gray-400">
                                        <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                        <p className="text-sm">Nenhuma conta encontrada com os filtros atuais.</p>
                                    </td>
                                </tr>
                            ) : filtered.map(i => <Row
                                key={i.key}
                                item={i}
                                accent={accent}
                                mode={mode}
                                selected={selected.has(i.key)}
                                onToggle={() => toggleSel(i.key)}
                                onEdit={() => openEdit(i)}
                                onBaixa={() => openBaixa(i)}
                                onParcial={() => openParcial(i)}
                                onLancar={() => openLancar(i)}
                                onReabrir={() => i.txId && reabrir(i.txId)}
                                onCancelar={() => i.txId && cancelar(i.txId)}
                                onExcluir={() => i.txId && excluir(i.txId)}
                            />)}
                        </tbody>
                        {filtered.length > 0 && (
                            <tfoot className="bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-[#222]">
                                <tr>
                                    <td colSpan={6} className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-gray-500">Totais filtrados</td>
                                    <td className={`px-3 py-3 text-right text-sm font-extrabold ${accent.text}`}>
                                        {fmt(filtered.reduce((s, i) => s + i.balance, 0))}
                                    </td>
                                    <td colSpan={2} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* ═══ MODAL: Novo / Editar ═══ */}
            {showForm && (
                <Modal onClose={closeForm} title={formItem ? 'Editar Conta' : `Nova Conta a ${cfg.short}`}>
                    <div className="space-y-4">
                        <Field label="Descrição *">
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                                placeholder={mode === 'receber' ? 'Ex: Venda de matriz #123' : 'Ex: Ração bovinos - Maio'}
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Valor *">
                                <input
                                    type="number" step="0.01"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                                />
                            </Field>
                            <Field label="Vencimento *">
                                <input
                                    type="date"
                                    value={formData.transaction_date}
                                    onChange={e => setFormData({ ...formData, transaction_date: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                                />
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Conta *">
                                <select
                                    value={formData.account_id}
                                    onChange={e => setFormData({ ...formData, account_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                                >
                                    <option value="">Selecione…</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Categoria">
                                <select
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                                >
                                    <option value="">Sem categoria</option>
                                    {relCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="Status">
                            <div className="flex gap-2">
                                {(['pending', 'completed', 'cancelled'] as const).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFormData({ ...formData, status: s })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                            formData.status === s
                                                ? s === 'completed' ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/30'
                                                : s === 'cancelled' ? 'bg-gray-500/10 text-gray-500 ring-1 ring-gray-500/30'
                                                : 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30'
                                                : 'text-gray-500 bg-gray-50 dark:bg-[#1A1A1A]'
                                        }`}
                                    >{s === 'pending' ? 'Pendente' : s === 'completed' ? cfg.actionPast : 'Cancelada'}</button>
                                ))}
                            </div>
                        </Field>
                        <Field label="Observação">
                            <textarea
                                value={formData.observacao}
                                onChange={e => setFormData({ ...formData, observacao: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                                placeholder="Notas internas, número da NF, contato…"
                            />
                        </Field>
                        <div className="flex gap-3 pt-2">
                            <button onClick={closeForm} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white">Cancelar</button>
                            <button
                                onClick={saveForm}
                                disabled={saving}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${cfg.hero} disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {saving ? 'Salvando…' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ═══ MODAL: Baixa ═══ */}
            {showBaixa && baixaItem && (
                <Modal onClose={() => setShowBaixa(false)} title={`Dar Baixa · ${cfg.actionPast}`}>
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${accent.soft} border ${accent.border}`}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">{cfg.partyLabel}</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{baixaItem.title}</p>
                            <p className={`text-2xl font-extrabold mt-2 ${accent.text}`}>{fmt(baixaItem.balance)}</p>
                        </div>
                        <Field label={`Data efetiva do ${mode === 'receber' ? 'recebimento' : 'pagamento'} *`}>
                            <input
                                type="date"
                                value={baixaData.actualDate}
                                onChange={e => setBaixaData({ ...baixaData, actualDate: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            />
                        </Field>
                        <Field label="Conta de destino">
                            <select
                                value={baixaData.accountId}
                                onChange={e => setBaixaData({ ...baixaData, accountId: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            >
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Observação da baixa">
                            <input
                                type="text"
                                value={baixaData.note}
                                onChange={e => setBaixaData({ ...baixaData, note: e.target.value })}
                                placeholder={mode === 'receber' ? 'Ex: PIX recebido, CCB 123…' : 'Ex: Nota fiscal 123, boleto pago…'}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            />
                        </Field>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { setShowBaixa(false); openParcial(baixaItem); }}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-[#D4AF37]"
                            >
                                <SplitSquareHorizontal className="w-4 h-4" /> Parcial
                            </button>
                            <button onClick={() => setShowBaixa(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-500">Cancelar</button>
                            <button
                                onClick={confirmBaixa}
                                disabled={busy}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${cfg.hero} disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirmar baixa
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ═══ MODAL: Baixa Parcial ═══ */}
            {showParcial && parcialItem && (
                <Modal onClose={() => setShowParcial(false)} title="Baixa Parcial">
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${accent.soft} border ${accent.border}`}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Saldo</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{parcialItem.title}</p>
                            <p className={`text-2xl font-extrabold mt-2 ${accent.text}`}>{fmt(parcialItem.balance)}</p>
                        </div>
                        <Field label="Valor pago agora *">
                            <input
                                type="number" step="0.01"
                                value={parcialData.amountPaid}
                                onChange={e => setParcialData({ ...parcialData, amountPaid: e.target.value })}
                                placeholder={`Máximo: ${fmt(parcialItem.balance)}`}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            />
                            {parcialData.amountPaid && (
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Saldo restante: <strong className={accent.text}>{fmt(Math.max(0, parcialItem.balance - parseFloat(parcialData.amountPaid || '0')))}</strong>
                                </p>
                            )}
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Data *">
                                <input
                                    type="date"
                                    value={parcialData.actualDate}
                                    onChange={e => setParcialData({ ...parcialData, actualDate: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                                />
                            </Field>
                            <Field label="Conta">
                                <select
                                    value={parcialData.accountId}
                                    onChange={e => setParcialData({ ...parcialData, accountId: e.target.value })}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                                >
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="Observação">
                            <input
                                type="text"
                                value={parcialData.note}
                                onChange={e => setParcialData({ ...parcialData, note: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            />
                        </Field>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowParcial(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-500">Cancelar</button>
                            <button
                                onClick={confirmParcial}
                                disabled={busy}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${cfg.hero} disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                                Registrar baixa parcial
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ═══ MODAL: Lançar virtual no ERP ═══ */}
            {showLancar && lancarItem && (
                <Modal onClose={() => setShowLancar(false)} title={`Lançar ${cfg.short === 'Receber' ? 'Receita' : 'Despesa'} no ERP`}>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/30">
                            <div className="flex items-start gap-2">
                                <Gavel className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Origem: Leilão</p>
                                    <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{lancarItem.title}</p>
                                    <p className="text-xl font-extrabold mt-1 text-[#D4AF37]">{fmt(lancarItem.balance)}</p>
                                </div>
                            </div>
                        </div>
                        <Field label="Conta *">
                            <select
                                value={lancarData.accountId}
                                onChange={e => setLancarData({ ...lancarData, accountId: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            >
                                <option value="">Selecione…</option>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Categoria">
                            <select
                                value={lancarData.categoryId}
                                onChange={e => setLancarData({ ...lancarData, categoryId: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            >
                                <option value="">Sem categoria</option>
                                {relCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Vencimento">
                            <input
                                type="date"
                                value={lancarData.transaction_date}
                                onChange={e => setLancarData({ ...lancarData, transaction_date: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            />
                        </Field>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowLancar(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-500">Cancelar</button>
                            <button
                                onClick={confirmLancar}
                                disabled={busy}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${cfg.hero} disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                                Lançar como Pendente
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ═══ MODAL: Baixa em Lote ═══ */}
            {showBulkBaixa && (
                <Modal onClose={() => setShowBulkBaixa(false)} title={`Baixa em Lote (${selectedItems.length} conta(s))`}>
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${accent.soft} border ${accent.border}`}>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Total a {cfg.actionVerb.toLowerCase()}</p>
                            <p className={`text-2xl font-extrabold ${accent.text} mt-1`}>{fmt(selectedTotal)}</p>
                            <p className="text-[11px] text-gray-500 mt-1">{selectedItems.length} conta(s) serão marcadas como {cfg.actionPast.toLowerCase()}</p>
                        </div>
                        <Field label={`Data efetiva do ${mode === 'receber' ? 'recebimento' : 'pagamento'}`}>
                            <input
                                type="date"
                                value={bulkDate}
                                onChange={e => setBulkDate(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-900 dark:text-white"
                            />
                        </Field>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setShowBulkBaixa(false)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-500">Cancelar</button>
                            <button
                                onClick={bulkBaixa}
                                disabled={busy}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r ${cfg.hero} disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirmar baixas
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ─── Sub-componentes ─────────────────────────────────────────────

function KPI({ label, value, hint, icon, color, danger }: {
    label: string; value: string; hint: string; icon: React.ReactNode; color: string; danger?: boolean;
}) {
    const txt: Record<string, string> = {
        emerald: 'text-emerald-500',
        rose: 'text-rose-500',
        red: 'text-rose-500',
        amber: 'text-amber-500',
        blue: 'text-blue-500',
    };
    const bg: Record<string, string> = {
        emerald: 'bg-emerald-500/10',
        rose: 'bg-rose-500/10',
        red: 'bg-rose-500/10',
        amber: 'bg-amber-500/10',
        blue: 'bg-blue-500/10',
    };
    return (
        <div className={`bg-white dark:bg-[#111] border ${danger ? 'border-rose-500/40' : 'border-gray-200 dark:border-[#222]'} rounded-2xl p-5 shadow-xl relative overflow-hidden`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
                    <h3 className={`text-2xl md:text-3xl font-extrabold mt-1 ${txt[color] || 'text-gray-900 dark:text-white'}`}>{value}</h3>
                    <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txt[color] || 'text-gray-500'} ${bg[color] || 'bg-gray-500/10'}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:hidden">
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-5 border-b border-gray-100 dark:border-[#222] flex items-center justify-between sticky top-0 bg-white dark:bg-[#111] z-10">
                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-rose-500"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1 block">{label}</label>
            {children}
        </div>
    );
}

function Row({
    item, accent, mode, selected, onToggle, onEdit, onBaixa, onParcial, onLancar, onReabrir, onCancelar, onExcluir,
}: {
    item: UnifiedItem;
    accent: { text: string; bg: string; border: string; soft: string; softText: string };
    mode: Mode;
    selected: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onBaixa: () => void;
    onParcial: () => void;
    onLancar: () => void;
    onReabrir: () => void;
    onCancelar: () => void;
    onExcluir: () => void;
}) {
    const isOpen = item.status === 'pending' || item.status === 'virtual';
    const d = isOpen ? daysOverdue(item.dueDate) : 0;
    const overdueBadge = isOpen && d > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" /> {d}d atraso
        </span>
    ) : isOpen && d === 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Hoje
        </span>
    ) : isOpen && d >= -3 && d < 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {Math.abs(d)}d
        </span>
    ) : null;

    const statusBadge = item.status === 'completed' ? (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">Baixado</span>
    ) : item.status === 'cancelled' ? (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-gray-500/10 text-gray-500 border border-gray-500/30">Cancelado</span>
    ) : item.status === 'virtual' ? (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-[#B8860B]/10 text-[#D4AF37] border border-[#B8860B]/30">
            <Gavel className="w-3 h-3" /> Leilão
        </span>
    ) : (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/30">Pendente</span>
    );

    return (
        <tr className={`border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#0F0F0F] transition-colors ${selected ? 'bg-[#D4AF37]/5' : ''}`}>
            <td className="px-3 py-3 print:hidden">
                <input
                    type="checkbox"
                    disabled={!item.txId || item.status !== 'pending'}
                    checked={selected}
                    onChange={onToggle}
                    className="accent-[#D4AF37] disabled:opacity-30"
                />
            </td>
            <td className="px-3 py-3 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmtDate(item.dueDate)}</span>
                    {overdueBadge}
                </div>
            </td>
            <td className="px-3 py-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.party || '—'}</p>
                <p className="text-[10px] text-gray-500">{item.subtitle}</p>
            </td>
            <td className="px-3 py-3">
                <p className="text-sm text-gray-900 dark:text-white">{item.title}</p>
                {item.observacao && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{item.observacao}</p>}
            </td>
            <td className="px-3 py-3 hidden lg:table-cell">
                <span className="text-xs text-gray-500">{item.categoryName || '—'}</span>
            </td>
            <td className="px-3 py-3 hidden lg:table-cell">
                <span className="text-xs text-gray-500">{item.accountName || '—'}</span>
            </td>
            <td className="px-3 py-3 text-right whitespace-nowrap">
                <p className={`text-sm font-bold ${isOpen ? accent.text : 'text-gray-400'}`}>{fmt(item.balance)}</p>
                {item.paid > 0 && item.paid < item.amount && (
                    <p className="text-[10px] text-gray-500">de {fmt(item.amount)}</p>
                )}
            </td>
            <td className="px-3 py-3 text-center">{statusBadge}</td>
            <td className="px-3 py-3 print:hidden">
                <div className="flex items-center justify-end gap-1">
                    {item.status === 'virtual' ? (
                        <button
                            onClick={onLancar}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold text-black bg-gradient-to-r from-[#B8860B] to-[#9A7209] hover:scale-105 transition-transform"
                            title="Lançar no ERP"
                        >
                            <Sparkles className="w-3 h-3" /> Lançar
                        </button>
                    ) : item.status === 'pending' ? (
                        <>
                            <button
                                onClick={onBaixa}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold ${accent.soft} ${accent.text} hover:opacity-80`}
                                title="Dar baixa"
                            >
                                <CheckCircle2 className="w-3 h-3" /> {mode === 'receber' ? 'Receber' : 'Pagar'}
                            </button>
                            <button onClick={onParcial} className="text-gray-400 hover:text-[#D4AF37] p-1" title="Baixa parcial">
                                <SplitSquareHorizontal className="w-4 h-4" />
                            </button>
                            <button onClick={onEdit} className="text-gray-400 hover:text-blue-500 p-1" title="Editar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button onClick={onCancelar} className="text-gray-400 hover:text-gray-600 p-1" title="Cancelar">
                                <Ban className="w-4 h-4" />
                            </button>
                            <button onClick={onExcluir} className="text-gray-400 hover:text-rose-500 p-1" title="Excluir">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : item.status === 'completed' ? (
                        <>
                            <button
                                onClick={onReabrir}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                                title="Reabrir"
                            >
                                <Undo2 className="w-3 h-3" /> Reabrir
                            </button>
                            <button onClick={onExcluir} className="text-gray-400 hover:text-rose-500 p-1" title="Excluir">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onReabrir}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold text-gray-500 bg-gray-500/10 hover:bg-gray-500/20"
                        >
                            <Undo2 className="w-3 h-3" /> Reativar
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
