'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Search, Plus,
    Building2, CheckCircle2, Tag, X, Trash2,
    Loader2, Pencil, AlertTriangle, PiggyBank, Banknote,
    CreditCard, Gavel, Trophy, CheckCheck, ChevronRight, Users, Sparkles,
    Filter, Clock, Percent, Download, RotateCcw,
} from 'lucide-react';
import {
    saveTransaction, updateTransactionStatus, deleteTransaction,
    conciliarMultiplos, updateTransactionCategory,
    saveCategory, deleteCategory, saveObservacao,
    registrarLeiloesLote, saveAccount, deleteAccount,
} from './actions';
import { normalizeAssessorNome } from '@/lib/assessor-normalize';
import { resolverAcordo, formatarAcordoCurto, type AcordoLeilao } from '@/lib/leilao-acordos';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Account {
    id: string;
    name: string;
    type: string;
    current_balance: number;
    initial_balance: number;
}

interface Category {
    id: string;
    name: string;
    type: string;
}

interface Transaction {
    id: string;
    account_id: string;
    category_id?: string | null;
    type: string;
    amount: number;
    description: string;
    observacao?: string | null;
    transaction_date: string;
    status: string;
    account?: { id: string; name: string; type?: string } | null;
    category?: { id: string; name: string; type?: string } | null;
}

interface BulaLeilao {
    id: string;
    nome: string;
    data: string | null;
    criador: string | null;
    status: string | null;
    comissao: string | null;
    comissao_receber: string | null;
    recebido: string | null;
    faturamento_realizado: number | null;
    venda_bula: number | null;
    realizado_bula: number | null;
}

interface FechamentoLite {
    id: string;
    nome: string;
    data: string;
    vgv_total: number | null;
    faturamento_total_leilao?: number | null;
    comissao_assessoria: number | null;
    receita_bula: number | null;
    sobra_bruta: number | null;
    acordo_pct_faturamento?: number | null;
    acordo_pct_venda_cobertura?: number | null;
    acordo_descricao?: string | null;
    por_assessor: Array<{ nome?: string; empresa?: string; vgv?: number; transacoes?: number; animais?: number; pct_total?: number }> | null;
    lances: Array<{ lote?: string | number; fazenda?: string; comprador?: string; uf?: string; assessor?: string; empresa?: string; animais?: number; parcela?: number; vgv?: number }> | null;
}

interface Props {
    initialAccounts: Account[];
    initialTransactions: Transaction[];
    initialCategories: Category[];
    initialLeiloes?: BulaLeilao[];
    initialFechamentos?: FechamentoLite[];
    mode?: 'financeiro' | 'conciliacao';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

const today = () => new Date().toISOString().split('T')[0];

const CAT_COLORS = [
    '#D4A85C', '#10B981', '#F43F5E', '#3B82F6', '#8B5CF6',
    '#F97316', '#06B6D4', '#EC4899', '#84CC16', '#6366F1',
    '#F59E0B', '#14B8A6', '#EF4444', '#60A5FA', '#A78BFA',
];

// Parse currency-ish text (ex: "R$ 12.500,00" | "12500" | "12.500,50") → number
const parseMoneyText = (raw: unknown): number => {
    if (raw == null) return 0;
    if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;
    const s = String(raw).trim();
    if (!s) return 0;
    const clean = s.replace(/[^\d,.\-]/g, '').replace(/\./g, '').replace(',', '.');
    const v = parseFloat(clean);
    return isNaN(v) ? 0 : v;
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function FinanceiroClient({ initialAccounts, initialTransactions, initialCategories, initialLeiloes = [], initialFechamentos = [], mode = 'financeiro' }: Props) {
    const router = useRouter();

    // ── State ────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState(mode === 'conciliacao' ? 'conciliacao' : 'dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    useEffect(() => { setAccounts(initialAccounts); }, [initialAccounts]);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
    const [saving, setSaving] = useState(false);

    // Delete transaction
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Category modal
    const [showCatModal, setShowCatModal] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [catForm, setCatForm] = useState({ name: '', type: 'expense' });
    const [savingCat, setSavingCat] = useState(false);
    const [deleteCatConfirm, setDeleteCatConfirm] = useState<string | null>(null);
    const [deletingCat, setDeletingCat] = useState(false);

    // Account modal
    const [showAccModal, setShowAccModal] = useState(false);
    const [editingAcc, setEditingAcc] = useState<Account | null>(null);
    const [accForm, setAccForm] = useState({ name: '', type: 'bank', initial_balance: '' });
    const [savingAcc, setSavingAcc] = useState(false);
    const [deleteAccConfirm, setDeleteAccConfirm] = useState<string | null>(null);
    const [deletingAcc, setDeletingAcc] = useState(false);

    // Form
    const [form, setForm] = useState({
        description: '',
        amount: '',
        transaction_date: today(),
        account_id: '',
        category_id: '',
        status: 'pending',
        observacao: '',
    });

    // Inline observation editing
    const [editingObsId, setEditingObsId] = useState<string | null>(null);
    const [obsValue, setObsValue] = useState('');

    // Conciliação filters & bulk selection
    const [concStatusFilter, setConcStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [concTypeFilter, setConcTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [concAccountFilter, setConcAccountFilter] = useState<string>('');
    const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());

    // Sync props → state after router.refresh()
    useEffect(() => { setTransactions(initialTransactions); }, [initialTransactions]);

    // ── Computed ──────────────────────────────────────────────────────────────
    // Saldo real = initial_balance de todas as contas + transações completed
    const totalBalance = useMemo(() => {
        const initial = accounts.reduce((s, a) => s + Number(a.initial_balance || 0), 0);
        const txNet = transactions
            .filter(t => t.status === 'completed')
            .reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
        return initial + txNet;
    }, [accounts, transactions]);

    const currentMonth = new Date().toISOString().substring(0, 7);
    const previousMonth = useMemo(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return d.toISOString().substring(0, 7);
    }, []);

    const monthlyStats = useMemo(() => {
        let income = 0, expense = 0;
        let prevIncome = 0, prevExpense = 0;
        for (const tx of transactions) {
            const m = tx.transaction_date?.substring(0, 7);
            const amt = Number(tx.amount);
            if (m === currentMonth) {
                if (tx.type === 'income') income += amt;
                else if (tx.type === 'expense') expense += amt;
            } else if (m === previousMonth) {
                if (tx.type === 'income') prevIncome += amt;
                else if (tx.type === 'expense') prevExpense += amt;
            }
        }
        const pct = (cur: number, prev: number) => {
            if (prev === 0) return cur === 0 ? 0 : 100;
            return ((cur - prev) / Math.abs(prev)) * 100;
        };
        return {
            income, expense,
            prevIncome, prevExpense,
            incomeDelta: pct(income, prevIncome),
            expenseDelta: pct(expense, prevExpense),
            netDelta: pct(income - expense, prevIncome - prevExpense),
        };
    }, [transactions, currentMonth, previousMonth]);

    const pendingCount = useMemo(
        () => transactions.filter(t => t.status === 'pending').length,
        [transactions],
    );

    // Conciliação-specific metrics
    const concStats = useMemo(() => {
        let pendingIncome = 0, pendingExpense = 0;
        let completedIncome = 0, completedExpense = 0;
        let completedCount = 0;
        for (const t of transactions) {
            const amt = Number(t.amount);
            if (t.status === 'pending') {
                if (t.type === 'income') pendingIncome += amt;
                else if (t.type === 'expense') pendingExpense += amt;
            } else if (t.status === 'completed') {
                completedCount++;
                if (t.type === 'income') completedIncome += amt;
                else if (t.type === 'expense') completedExpense += amt;
            }
        }
        const total = transactions.length;
        const pct = total > 0 ? (completedCount / total) * 100 : 0;
        return {
            pendingIncome, pendingExpense,
            pendingNet: pendingIncome - pendingExpense,
            completedIncome, completedExpense,
            completedCount,
            total,
            pct,
        };
    }, [transactions]);

    const filtered = useMemo(() => {
        let list = transactions;
        if (mode === 'conciliacao') {
            if (concStatusFilter !== 'all') list = list.filter(tx => tx.status === concStatusFilter);
            if (concTypeFilter !== 'all') list = list.filter(tx => tx.type === concTypeFilter);
            if (concAccountFilter) list = list.filter(tx => tx.account_id === concAccountFilter);
        }
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(tx =>
            tx.description?.toLowerCase().includes(q) ||
            tx.account?.name?.toLowerCase().includes(q) ||
            tx.category?.name?.toLowerCase().includes(q),
        );
    }, [transactions, searchTerm, mode, concStatusFilter, concTypeFilter, concAccountFilter]);

    const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
    const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

    // ── Resumo Leilões para o Dashboard ──────────────────────────────────────
    const leiloesResumo = useMemo(() => {
        let receita = 0, comissao = 0, vgv = 0;
        const porLeilao: Array<{ id: string; nome: string; data: string; receita: number; comissao: number; sobra: number; vgv: number }> = [];
        for (const f of initialFechamentos) {
            const r = Number(f.receita_bula) || 0;
            const c = Number(f.comissao_assessoria) || 0;
            const v = Number(f.vgv_total) || 0;
            const storedSobra = Number(f.sobra_bruta) || 0;
            const sobra = storedSobra !== 0 ? storedSobra : r - c;
            receita += r;
            comissao += c;
            vgv += v;
            if (r > 0 || c > 0) {
                porLeilao.push({ id: f.id, nome: f.nome, data: f.data, receita: r, comissao: c, sobra, vgv: v });
            }
        }
        porLeilao.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
        return { receita, comissao, sobra: receita - comissao, vgv, porLeilao };
    }, [initialFechamentos]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const openNew = (type: 'income' | 'expense') => {
        setEditingTx(null);
        setModalType(type);
        setForm({ description: '', amount: '', transaction_date: today(), account_id: accounts[0]?.id || '', category_id: '', status: 'pending', observacao: '' });
        setShowModal(true);
    };

    const openEdit = (tx: Transaction) => {
        setEditingTx(tx);
        setModalType(tx.type as 'income' | 'expense');
        setForm({
            description: tx.description || '',
            amount: String(tx.amount),
            transaction_date: tx.transaction_date,
            account_id: tx.account_id || accounts[0]?.id || '',
            category_id: tx.category_id || '',
            status: tx.status,
            observacao: tx.observacao || '',
        });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingTx(null); setSaving(false); };

    const handleSave = async () => {
        if (!form.description.trim() || !form.amount || !form.account_id) return;
        setSaving(true);
        const res = await saveTransaction({
            id: editingTx?.id,
            account_id: form.account_id,
            type: modalType,
            amount: parseFloat(form.amount),
            description: form.description.trim(),
            transaction_date: form.transaction_date,
            status: form.status,
            category_id: form.category_id || null,
            observacao: form.observacao.trim() || null,
        });
        if (res.success) { closeModal(); router.refresh(); }
        else { alert('Erro ao salvar: ' + res.error); setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        setDeleting(true);
        const res = await deleteTransaction(id);
        if (res.success) { setDeleteConfirm(null); setDeleting(false); closeModal(); router.refresh(); }
        else { alert('Erro ao excluir: ' + res.error); setDeleting(false); }
    };

    const handleConciliar = async (id: string) => {
        setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'completed' } : tx));
        const res = await updateTransactionStatus(id, 'completed');
        if (!res.success) setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: 'pending' } : tx));
    };

    const handleConciliarTodos = async () => {
        const ids = transactions.filter(t => t.status === 'pending').map(t => t.id);
        if (!ids.length) return;
        setTransactions(prev => prev.map(tx => tx.status === 'pending' ? { ...tx, status: 'completed' } : tx));
        const res = await conciliarMultiplos(ids);
        if (!res.success) router.refresh();
    };

    const handleConciliarSelecionados = async () => {
        const ids = Array.from(selectedTxIds).filter(id => {
            const tx = transactions.find(t => t.id === id);
            return tx && tx.status === 'pending';
        });
        if (!ids.length) return;
        setTransactions(prev => prev.map(tx => ids.includes(tx.id) ? { ...tx, status: 'completed' } : tx));
        setSelectedTxIds(new Set());
        const res = await conciliarMultiplos(ids);
        if (!res.success) router.refresh();
    };

    const toggleSelectTx = (id: string) => {
        setSelectedTxIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAllVisible = () => {
        const visiblePending = filtered.filter(t => t.status === 'pending').map(t => t.id);
        setSelectedTxIds(prev => {
            const allSelected = visiblePending.every(id => prev.has(id));
            if (allSelected) {
                const next = new Set(prev);
                visiblePending.forEach(id => next.delete(id));
                return next;
            }
            const next = new Set(prev);
            visiblePending.forEach(id => next.add(id));
            return next;
        });
    };

    const handleCatChange = async (txId: string, catId: string) => {
        const cat = categories.find(c => c.id === catId);
        setTransactions(prev => prev.map(tx =>
            tx.id === txId ? { ...tx, category_id: catId, category: cat ? { id: cat.id, name: cat.name, type: cat.type } : null } : tx,
        ));
        const res = await updateTransactionCategory(txId, catId || null);
        if (!res.success) router.refresh();
    };

    const handleObsSave = async (txId: string) => {
        const trimmed = obsValue.trim();
        setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, observacao: trimmed || null } : tx));
        setEditingObsId(null);
        await saveObservacao(txId, trimmed);
    };

    const openNewCat = (type: 'income' | 'expense') => {
        setEditingCat(null);
        setCatForm({ name: '', type });
        setShowCatModal(true);
    };

    const openEditCat = (cat: Category) => {
        setEditingCat(cat);
        setCatForm({ name: cat.name, type: cat.type });
        setShowCatModal(true);
    };

    const closeCatModal = () => { setShowCatModal(false); setEditingCat(null); setSavingCat(false); };

    const handleSaveCat = async () => {
        if (!catForm.name.trim()) return;
        setSavingCat(true);
        const res = await saveCategory({ id: editingCat?.id, name: catForm.name.trim(), type: catForm.type });
        if (res.success) { closeCatModal(); router.refresh(); }
        else { alert('Erro ao salvar: ' + res.error); setSavingCat(false); }
    };

    const handleDeleteCat = async (id: string) => {
        setDeletingCat(true);
        const res = await deleteCategory(id);
        if (res.success) { setDeleteCatConfirm(null); setDeletingCat(false); closeCatModal(); router.refresh(); }
        else { alert('Erro ao excluir: ' + res.error); setDeletingCat(false); }
    };

    const openNewAcc = () => {
        setEditingAcc(null);
        setAccForm({ name: '', type: 'bank', initial_balance: '' });
        setShowAccModal(true);
    };
    const openEditAcc = (acc: Account) => {
        setEditingAcc(acc);
        setAccForm({ name: acc.name, type: acc.type || 'bank', initial_balance: String(acc.initial_balance ?? 0) });
        setShowAccModal(true);
    };
    const closeAccModal = () => { setShowAccModal(false); setEditingAcc(null); setSavingAcc(false); };
    const handleSaveAcc = async () => {
        if (!accForm.name.trim()) return;
        setSavingAcc(true);
        const res = await saveAccount({
            id: editingAcc?.id,
            name: accForm.name.trim(),
            type: accForm.type,
            initial_balance: parseFloat(accForm.initial_balance || '0') || 0,
        });
        if (res.success) { closeAccModal(); router.refresh(); }
        else { alert('Erro ao salvar conta: ' + res.error); setSavingAcc(false); }
    };
    const handleDeleteAcc = async (id: string) => {
        setDeletingAcc(true);
        const res = await deleteAccount(id);
        if (res.success) { setDeleteAccConfirm(null); setDeletingAcc(false); closeAccModal(); router.refresh(); }
        else { alert(res.error || 'Erro ao excluir conta'); setDeletingAcc(false); setDeleteAccConfirm(null); }
    };

    // ── Shared sub-renders ───────────────────────────────────────────────────
    const statusBadge = (status: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            completed: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Efetivado' },
            pending: { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Pendente' },
            cancelled: { cls: 'bg-gray-500/10 text-gray-400 border-gray-500/20', label: 'Cancelado' },
        };
        const s = map[status] || map.pending;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${s.cls}`}>
                {s.label}
            </span>
        );
    };

    const accountIcon = (type: string) => {
        switch (type) {
            case 'checking': return <Building2 className="w-5 h-5" />;
            case 'savings': return <PiggyBank className="w-5 h-5" />;
            case 'credit_card': return <CreditCard className="w-5 h-5" />;
            default: return <Banknote className="w-5 h-5" />;
        }
    };

    const accountLabel = (type: string) => {
        const m: Record<string, string> = { checking: 'Conta Corrente', savings: 'Poupança', credit_card: 'Cartão de Crédito', cash: 'Caixa' };
        return m[type] || type;
    };

    const accountIconColor = (type: string) => {
        const m: Record<string, string> = { checking: 'bg-blue-500/10 text-blue-400', savings: 'bg-emerald-500/10 text-emerald-400', credit_card: 'bg-purple-500/10 text-purple-400' };
        return m[type] || 'bg-[#D4A85C]/10 text-[#D4A85C]';
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* ─── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4A85C] via-[#FFF8DC] to-[#D4A85C] text-transparent bg-clip-text">
                            {mode === 'conciliacao' ? 'Conciliação' : 'Financeiro'}
                        </h2>
                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                            {mode === 'conciliacao' ? 'Movimentações, conciliação e categorias' : 'Gestão de contas, receitas e despesas'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => openNew('income')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-emerald-500/50 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20"
                        >
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Nova Receita
                        </button>
                        <button
                            onClick={() => openNew('expense')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black rounded-xl text-sm font-bold shadow-lg shadow-[#A0792E]/20 hover:scale-105 transition-all"
                        >
                            <ArrowDownRight className="w-4 h-4" /> Nova Despesa
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                {mode === 'conciliacao' && (
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 bg-gray-100 dark:bg-[#111] p-1.5 rounded-2xl w-fit">
                        {([
                            { key: 'conciliacao', icon: CheckCircle2, label: 'Movimentações' },
                            { key: 'contas', icon: Banknote, label: 'Contas' },
                            { key: 'categorias', icon: Tag, label: 'Categorias' },
                        ] as const).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-white dark:bg-[#222] text-[#D4A85C] shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════════
                DASHBOARD TAB
               ═══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Saldo */}
                        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#A0792E]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <Wallet className="w-24 h-24 text-[#D4A85C]" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Saldo Consolidado</p>
                                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">{fmt(totalBalance)}</h3>
                                <div className="mt-4 flex items-center text-xs font-semibold bg-emerald-500/10 w-fit px-2.5 py-1 rounded-md text-emerald-400">
                                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                                    <span>{accounts.length} conta{accounts.length !== 1 ? 's' : ''} ativa{accounts.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                        {/* Receitas Mês */}
                        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <ArrowUpRight className="w-24 h-24 text-emerald-500" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Receitas (Mês)</p>
                                <h3 className="text-4xl font-extrabold text-emerald-500 mt-2 tracking-tight">{fmt(monthlyStats.income)}</h3>
                                <div className="mt-4 flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md ${monthlyStats.incomeDelta >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {monthlyStats.incomeDelta >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                        {monthlyStats.incomeDelta >= 0 ? '+' : ''}{monthlyStats.incomeDelta.toFixed(1)}% vs mês ant.
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-400 dark:text-[#666] uppercase tracking-widest">
                                        {transactions.filter(tx => tx.type === 'income' && tx.transaction_date?.substring(0, 7) === currentMonth).length} lanç.
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Despesas Mês */}
                        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-rose-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                                <ArrowDownRight className="w-24 h-24 text-rose-500" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Despesas (Mês)</p>
                                <h3 className="text-4xl font-extrabold text-rose-500 mt-2 tracking-tight">{fmt(monthlyStats.expense)}</h3>
                                <div className="mt-4 flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md ${monthlyStats.expenseDelta <= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {monthlyStats.expenseDelta <= 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                                        {monthlyStats.expenseDelta >= 0 ? '+' : ''}{monthlyStats.expenseDelta.toFixed(1)}% vs mês ant.
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-400 dark:text-[#666] uppercase tracking-widest">
                                        {transactions.filter(tx => tx.type === 'expense' && tx.transaction_date?.substring(0, 7) === currentMonth).length} conta(s)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leilões — Receita × Comissão (full width) */}
                    {leiloesResumo.porLeilao.length > 0 && (
                        <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#A0792E]/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A0792E] to-[#9A7209] flex items-center justify-center shadow-lg">
                                        <Gavel className="w-5 h-5 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Leilões · Receita × Comissão</h3>
                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                            {leiloesResumo.porLeilao.length} fechamento(s) · VGV participação {fmt(leiloesResumo.vgv)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/leiloes')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#A0792E]/10 text-[#A0792E] border border-[#A0792E]/30 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#A0792E] hover:text-black transition-all"
                                >
                                    Gerenciar lançamentos
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-100 dark:bg-[#1A1A1A]">
                                <div className="p-5 bg-white dark:bg-[#0F0F0F]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">A Receber · Receita Bula</span>
                                    </div>
                                    <p className="text-2xl font-black text-emerald-500">{fmt(leiloesResumo.receita)}</p>
                                </div>
                                <div className="p-5 bg-white dark:bg-[#0F0F0F]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                                        <span className="text-[10px] uppercase tracking-widest text-rose-500 font-bold">A Pagar · Comissão Assessores</span>
                                    </div>
                                    <p className="text-2xl font-black text-rose-500">{fmt(leiloesResumo.comissao)}</p>
                                </div>
                                <div className="p-5 bg-white dark:bg-[#0F0F0F]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Trophy className={`w-3.5 h-3.5 ${leiloesResumo.sobra >= 0 ? 'text-[#A0792E]' : 'text-rose-500'}`} />
                                        <span className={`text-[10px] uppercase tracking-widest font-bold ${leiloesResumo.sobra >= 0 ? 'text-[#A0792E]' : 'text-rose-500'}`}>Sobra Bruta</span>
                                    </div>
                                    <p className={`text-2xl font-black ${leiloesResumo.sobra >= 0 ? 'text-[#A0792E]' : 'text-rose-500'}`}>
                                        {leiloesResumo.sobra >= 0 ? '+' : ''}{fmt(leiloesResumo.sobra)}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        margem {leiloesResumo.receita > 0 ? ((leiloesResumo.sobra / leiloesResumo.receita) * 100).toFixed(1) : '0'}%
                                    </p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-[10px] uppercase tracking-wider text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-bold">Data</th>
                                            <th className="px-6 py-3 text-left font-bold">Leilão</th>
                                            <th className="px-6 py-3 text-right font-bold">VGV Bula</th>
                                            <th className="px-6 py-3 text-right font-bold">Receita</th>
                                            <th className="px-6 py-3 text-right font-bold">Comissão</th>
                                            <th className="px-6 py-3 text-right font-bold">Sobra</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leiloesResumo.porLeilao.slice(0, 6).map(p => {
                                            const margem = p.receita > 0 ? (p.sobra / p.receita) * 100 : 0;
                                            return (
                                                <tr key={p.id} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50/50 dark:hover:bg-[#141414]">
                                                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{fmtDate(p.data)}</td>
                                                    <td className="px-6 py-3">
                                                        <p className="font-bold text-gray-900 dark:text-white">{p.nome}</p>
                                                        {p.receita > 0 && <p className="text-[10px] text-gray-500">margem {margem.toFixed(1)}%</p>}
                                                    </td>
                                                    <td className="px-6 py-3 text-right font-mono text-xs text-gray-500">{p.vgv > 0 ? fmt(p.vgv) : '—'}</td>
                                                    <td className="px-6 py-3 text-right font-black text-emerald-500">{p.receita > 0 ? fmt(p.receita) : '—'}</td>
                                                    <td className="px-6 py-3 text-right font-black text-rose-500">{p.comissao > 0 ? fmt(p.comissao) : '—'}</td>
                                                    <td className={`px-6 py-3 text-right font-black ${p.sobra >= 0 ? 'text-[#A0792E]' : 'text-rose-500'}`}>
                                                        {p.sobra !== 0 ? `${p.sobra >= 0 ? '+' : ''}${fmt(p.sobra)}` : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Accounts + Transactions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Contas Bancárias */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                                <div className="p-5 border-b border-gray-100 dark:border-[#222] flex justify-between items-center bg-gray-50 dark:bg-[#141414]">
                                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Contas Bancárias</h3>
                                </div>
                                <div className="p-3 space-y-2">
                                    {accounts.length > 0 ? accounts.map(acc => (
                                        <div key={acc.id} className="p-4 rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-all flex items-center justify-between border border-gray-200 dark:border-[#222] hover:border-[#A0792E]/40">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accountIconColor(acc.type)}`}>
                                                    {accountIcon(acc.type)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{acc.name}</p>
                                                    <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-widest mt-0.5">{accountLabel(acc.type)}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-extrabold text-[#D4A85C]">{fmt(Number(acc.current_balance))}</p>
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center text-sm text-gray-400 dark:text-[#555] uppercase tracking-widest font-bold">Nenhuma conta cadastrada</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Últimas Movimentações */}
                        <div className="lg:col-span-2">
                            <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden flex flex-col h-full">
                                <div className="p-5 border-b border-gray-100 dark:border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-[#141414]">
                                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Últimas Movimentações</h3>
                                    <div className="relative flex-1 sm:w-64 sm:flex-initial group/search">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#555] group-focus-within/search:text-[#D4A85C] transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl focus:outline-none focus:border-[#A0792E]/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-auto max-h-[500px]">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-[10px] text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222] uppercase tracking-widest sticky top-0">
                                            <tr>
                                                <th className="px-6 py-4 font-bold">Data</th>
                                                <th className="px-6 py-4 font-bold">Descrição</th>
                                                <th className="px-6 py-4 font-bold">Conta</th>
                                                <th className="px-6 py-4 font-bold text-right">Valor</th>
                                                <th className="px-6 py-4 font-bold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.length > 0 ? filtered.slice(0, 15).map(tx => (
                                                <tr
                                                    key={tx.id}
                                                    onClick={() => openEdit(tx)}
                                                    className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 text-gray-500 dark:text-[#888] font-mono text-xs">{fmtDate(tx.transaction_date)}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{tx.description || '-'}</td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-[#888]">{tx.account?.name || '-'}</td>
                                                    <td className={`px-6 py-4 text-right font-extrabold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {tx.type === 'income' ? '+' : '-'} {fmt(Number(tx.amount))}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{statusBadge(tx.status)}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 dark:text-[#555] font-bold uppercase tracking-widest text-xs">
                                                        {searchTerm ? 'Nenhum resultado encontrado.' : 'Nenhuma movimentação registrada.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                CONCILIAÇÃO TAB
               ═══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'conciliacao' && (
                <div className="animate-in fade-in duration-500 space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5 shadow-xl relative overflow-hidden">
                            <div className="absolute right-[-10%] bottom-[-20%] opacity-5 text-[#D4A85C]">
                                <Building2 className="w-32 h-32" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Saldo Consolidado</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 tracking-tight">{fmt(totalBalance)}</h3>
                            <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1 uppercase tracking-widest">{accounts.length} conta{accounts.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="bg-white dark:bg-[#111111] border border-emerald-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Entradas Pendentes</p>
                            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">{fmt(concStats.pendingIncome)}</h3>
                            <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1 uppercase tracking-widest">
                                {transactions.filter(t => t.status === 'pending' && t.type === 'income').length} lançamento{transactions.filter(t => t.status === 'pending' && t.type === 'income').length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#111111] border border-rose-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-widest">Saídas Pendentes</p>
                            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 tracking-tight">{fmt(concStats.pendingExpense)}</h3>
                            <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1 uppercase tracking-widest">
                                {transactions.filter(t => t.status === 'pending' && t.type === 'expense').length} lançamento{transactions.filter(t => t.status === 'pending' && t.type === 'expense').length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#111111] border border-[#D4A85C]/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                            <p className="text-[10px] font-bold text-[#A0792E] uppercase tracking-widest">% Conciliado</p>
                            <h3 className="text-2xl font-extrabold text-[#D4A85C] mt-1 tracking-tight">{concStats.pct.toFixed(1)}%</h3>
                            <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1 uppercase tracking-widest">{concStats.completedCount} de {concStats.total}</p>
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-[#1A1A1A]">
                                <div className="h-full bg-gradient-to-r from-[#A0792E] to-[#D4A85C] transition-all" style={{ width: `${concStats.pct}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Progress + Quick actions */}
                    <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-5 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest flex items-center gap-2">
                                        <Percent className="w-3.5 h-3.5" /> Progresso de Conciliação
                                    </p>
                                    <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{concStats.completedCount} / {concStats.total}</span>
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#D4A85C] transition-all" style={{ width: `${concStats.pct}%` }} />
                                </div>
                                <div className="flex items-center gap-6 mt-3 text-[11px]">
                                    <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                                        <Clock className="w-3.5 h-3.5" /> {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {concStats.completedCount} efetivado{concStats.completedCount !== 1 ? 's' : ''}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-gray-500 font-semibold">
                                        Saldo pendente: <span className={`font-mono ${concStats.pendingNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{fmt(concStats.pendingNet)}</span>
                                    </span>
                                </div>
                            </div>
                            {pendingCount > 0 && (
                                <button
                                    onClick={handleConciliarTodos}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all whitespace-nowrap"
                                >
                                    <CheckCheck className="w-4 h-4" /> Conciliar Todos
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-3">
                        <Filter className="w-4 h-4 text-gray-400 dark:text-[#555]" />
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#0A0A0A] p-1 rounded-xl">
                            {([
                                { key: 'all' as const, label: 'Todos' },
                                { key: 'pending' as const, label: 'Pendentes' },
                                { key: 'completed' as const, label: 'Efetivados' },
                            ]).map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => setConcStatusFilter(opt.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${concStatusFilter === opt.key ? 'bg-white dark:bg-[#222] text-[#D4A85C] shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#0A0A0A] p-1 rounded-xl">
                            {([
                                { key: 'all' as const, label: 'Todos' },
                                { key: 'income' as const, label: 'Receitas' },
                                { key: 'expense' as const, label: 'Despesas' },
                            ]).map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => setConcTypeFilter(opt.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${concTypeFilter === opt.key ? 'bg-white dark:bg-[#222] text-[#D4A85C] shadow' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <select
                            value={concAccountFilter}
                            onChange={e => setConcAccountFilter(e.target.value)}
                            className="px-3 py-2 text-xs font-semibold bg-gray-100 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] text-gray-700 dark:text-gray-300 rounded-xl focus:outline-none focus:border-[#D4A85C]/50"
                        >
                            <option value="">Todas as contas</option>
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <span className="text-xs text-gray-400 dark:text-[#666] ml-auto font-mono">
                            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Bulk action bar */}
                    {selectedTxIds.size > 0 && (
                        <div className="bg-gradient-to-r from-[#A0792E]/10 to-[#D4A85C]/5 border border-[#D4A85C]/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
                            <p className="text-sm font-bold text-[#A0792E] dark:text-[#D4A85C]">
                                {selectedTxIds.size} selecionado{selectedTxIds.size !== 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setSelectedTxIds(new Set())}
                                    className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-widest"
                                >
                                    Limpar
                                </button>
                                <button
                                    onClick={handleConciliarSelecionados}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                                >
                                    <CheckCheck className="w-4 h-4" /> Conciliar Selecionados
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Transactions Table */}
                    <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-[#141414]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#D4A85C]/10 flex items-center justify-center border border-[#D4A85C]/20">
                                    <Building2 className="w-5 h-5 text-[#D4A85C]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white tracking-widest text-sm uppercase">Movimentações</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-[#888] font-mono tracking-widest mt-0.5">BANCO DE DADOS (ERP)</p>
                                </div>
                            </div>
                            <div className="relative sm:w-64 group/search">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#555] group-focus-within/search:text-[#D4A85C] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl focus:outline-none focus:border-[#A0792E]/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] transition-all"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222] uppercase tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-4 font-bold w-10">
                                            <input
                                                type="checkbox"
                                                checked={filtered.filter(t => t.status === 'pending').length > 0 && filtered.filter(t => t.status === 'pending').every(t => selectedTxIds.has(t.id))}
                                                onChange={toggleSelectAllVisible}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-[#333] bg-white dark:bg-[#111] text-[#D4A85C] focus:ring-[#D4A85C]/50 cursor-pointer"
                                                title="Selecionar todos pendentes visíveis"
                                            />
                                        </th>
                                        <th className="px-6 py-4 font-bold">Data</th>
                                        <th className="px-6 py-4 font-bold">Descrição</th>
                                        <th className="px-6 py-4 font-bold">Conta</th>
                                        <th className="px-6 py-4 font-bold">Categoria</th>
                                        <th className="px-6 py-4 font-bold">Observação</th>
                                        <th className="px-6 py-4 font-bold text-right">Valor</th>
                                        <th className="px-6 py-4 font-bold text-center">Status</th>
                                        <th className="px-6 py-4 font-bold text-center">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? filtered.map(tx => (
                                        <tr key={tx.id} className={`border-b border-gray-100 dark:border-[#1A1A1A] transition-colors group ${selectedTxIds.has(tx.id) ? 'bg-[#D4A85C]/5' : tx.status === 'completed' ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-gray-50 dark:hover:bg-[#141414]'}`}>
                                            <td className="px-4 py-4">
                                                {tx.status === 'pending' ? (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTxIds.has(tx.id)}
                                                        onChange={() => toggleSelectTx(tx.id)}
                                                        className="w-4 h-4 rounded border-gray-300 dark:border-[#333] bg-white dark:bg-[#111] text-[#D4A85C] focus:ring-[#D4A85C]/50 cursor-pointer"
                                                    />
                                                ) : null}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-[#888] font-mono text-xs">{fmtDate(tx.transaction_date)}</td>
                                            <td
                                                className="px-6 py-4 font-bold text-gray-900 dark:text-white max-w-[250px] truncate cursor-pointer hover:text-[#D4A85C] transition-colors"
                                                title={tx.description}
                                                onClick={() => openEdit(tx)}
                                            >
                                                {tx.description}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 dark:text-[#888] max-w-[140px] truncate" title={tx.account?.name || ''}>{tx.account?.name || '—'}</td>
                                            <td className="px-6 py-4">
                                                {categories.length > 0 ? (
                                                    <div className="relative">
                                                        <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                        <select
                                                            value={tx.category_id || ''}
                                                            onChange={e => handleCatChange(tx.id, e.target.value)}
                                                            className="w-[160px] appearance-none bg-white dark:bg-[#0A0A0A] border border-gray-300 dark:border-[#333] hover:border-[#D4A85C]/50 rounded-lg pl-9 pr-8 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#D4A85C]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            disabled={tx.status === 'completed'}
                                                        >
                                                            <option value="">Classificar...</option>
                                                            {(tx.type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                            ))}
                                                            {(tx.type === 'income' ? incomeCategories : expenseCategories).length === 0 && categories.map(cat => (
                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                            ))}
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 dark:text-[#555] italic">
                                                        {tx.category?.name || '—'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 min-w-[180px]">
                                                {editingObsId === tx.id ? (
                                                    <textarea
                                                        autoFocus
                                                        value={obsValue}
                                                        onChange={e => setObsValue(e.target.value)}
                                                        onBlur={() => handleObsSave(tx.id)}
                                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleObsSave(tx.id); } if (e.key === 'Escape') { setEditingObsId(null); } }}
                                                        rows={2}
                                                        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#A0792E]/50 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#D4A85C]/50 resize-none transition-all"
                                                        placeholder="Adicionar observação..."
                                                    />
                                                ) : (
                                                    <button
                                                        onClick={() => { setEditingObsId(tx.id); setObsValue(tx.observacao || ''); }}
                                                        className={`w-full text-left text-xs px-3 py-2 rounded-lg border transition-all ${tx.observacao ? 'border-[#A0792E]/20 text-gray-700 dark:text-gray-300 bg-[#A0792E]/5 hover:border-[#A0792E]/40' : 'border-dashed border-gray-300 dark:border-[#333] text-gray-400 dark:text-[#555] hover:border-gray-400 dark:hover:border-[#555]'}`}
                                                    >
                                                        {tx.observacao || 'Adicionar obs...'}
                                                    </button>
                                                )}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-extrabold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {tx.type === 'income' ? '+' : '-'} {fmt(Number(tx.amount))}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {statusBadge(tx.status === 'completed' ? 'completed' : 'pending')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => openEdit(tx)}
                                                        className="p-2 rounded-full text-gray-400 dark:text-[#555] hover:text-[#D4A85C] hover:bg-[#D4A85C]/10 transition-all"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    {tx.status !== 'completed' && (
                                                        <button
                                                            onClick={() => handleConciliar(tx.id)}
                                                            className="p-2 rounded-full text-gray-400 dark:text-[#555] hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                                            title="Conciliar"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-16 text-center text-gray-400 dark:text-[#555] font-bold uppercase tracking-widest text-xs">
                                                {searchTerm || concStatusFilter !== 'all' || concTypeFilter !== 'all' || concAccountFilter ? 'Nenhum resultado encontrado para os filtros aplicados.' : 'Nenhuma movimentação registrada.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* ═══════════════════════════════════════════════════════════════════
                CONTAS TAB
               ═══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'contas' && (
                <div className="animate-in fade-in duration-500 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl p-5 shadow-xl">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Total de Contas</p>
                            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{accounts.length}</h3>
                        </div>
                        <div className="bg-white dark:bg-[#111111] border border-emerald-500/20 rounded-2xl p-5 shadow-xl">
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Saldo Consolidado</p>
                            <h3 className="text-2xl font-extrabold text-emerald-500 mt-1">{fmt(totalBalance)}</h3>
                        </div>
                        <div className="bg-white dark:bg-[#111111] border border-[#D4A85C]/30 rounded-2xl p-5 shadow-xl">
                            <p className="text-[10px] font-bold text-[#A0792E] uppercase tracking-widest">Saldo Inicial Cumulativo</p>
                            <h3 className="text-2xl font-extrabold text-[#D4A85C] mt-1">{fmt(accounts.reduce((s, a) => s + Number(a.initial_balance || 0), 0))}</h3>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-[#222] flex items-center justify-between bg-gray-50 dark:bg-[#141414]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#D4A85C]/10 flex items-center justify-center border border-[#D4A85C]/20">
                                    <Banknote className="w-5 h-5 text-[#D4A85C]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white tracking-widest text-sm uppercase">Contas Bancárias & Caixa</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-[#888] font-mono tracking-widest mt-0.5">GESTÃO DE CONTAS • {accounts.length} ATIVA{accounts.length !== 1 ? 'S' : ''}</p>
                                </div>
                            </div>
                            <button
                                onClick={openNewAcc}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 transition-all"
                            >
                                <Plus className="w-4 h-4" /> Nova Conta
                            </button>
                        </div>

                        {accounts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222]">
                                        <tr>
                                            <th className="px-5 py-3 text-left font-bold">Nome</th>
                                            <th className="px-5 py-3 text-left font-bold">Tipo</th>
                                            <th className="px-5 py-3 text-right font-bold">Saldo Inicial</th>
                                            <th className="px-5 py-3 text-right font-bold">Saldo Atual</th>
                                            <th className="px-5 py-3 text-center font-bold">Lançamentos</th>
                                            <th className="px-5 py-3 text-center font-bold">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accounts.map(a => {
                                            const txs = transactions.filter(t => t.account_id === a.id);
                                            const net = txs.filter(t => t.status === 'completed')
                                                .reduce((s, t) => s + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0);
                                            const saldo = Number(a.initial_balance || 0) + net;
                                            return (
                                                <tr key={a.id} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors group">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A0792E]/20 to-[#D4A85C]/10 flex items-center justify-center border border-[#D4A85C]/20">
                                                                {a.type === 'cash' ? <Wallet className="w-4 h-4 text-[#D4A85C]" /> : a.type === 'credit' ? <CreditCard className="w-4 h-4 text-[#D4A85C]" /> : <Building2 className="w-4 h-4 text-[#D4A85C]" />}
                                                            </div>
                                                            <span className="font-bold text-gray-900 dark:text-white">{a.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#333]">
                                                            {a.type === 'bank' ? 'Banco' : a.type === 'cash' ? 'Caixa' : a.type === 'credit' ? 'Cartão' : a.type === 'investment' ? 'Investimento' : a.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-mono text-gray-500 dark:text-[#888]">{fmt(Number(a.initial_balance || 0))}</td>
                                                    <td className={`px-5 py-4 text-right font-mono font-extrabold ${saldo >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{fmt(saldo)}</td>
                                                    <td className="px-5 py-4 text-center text-xs text-gray-500 dark:text-[#888] font-mono">{txs.length}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => openEditAcc(a)}
                                                                className="p-2 rounded-full text-gray-400 dark:text-[#555] hover:text-[#D4A85C] hover:bg-[#D4A85C]/10 transition-all"
                                                                title="Editar"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteAccConfirm(a.id)}
                                                                className="p-2 rounded-full text-gray-400 dark:text-[#555] hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                                                                title="Excluir"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Banknote className="w-12 h-12 text-gray-300 dark:text-[#333] mx-auto mb-4" />
                                <p className="text-sm font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Nenhuma conta cadastrada</p>
                                <p className="text-xs text-gray-400 dark:text-[#666] mb-6">Cadastre sua primeira conta bancária ou caixa para começar a registrar movimentações.</p>
                                <button
                                    onClick={openNewAcc}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg hover:scale-105 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Cadastrar Primeira Conta
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                CATEGORIAS TAB
               ═══════════════════════════════════════════════════════════════════ */}
            {activeTab === 'categorias' && (
                <div className="animate-in fade-in duration-500 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Receitas */}
                        <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-[#222] flex items-center justify-between bg-gray-50 dark:bg-[#141414]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Receitas</h3>
                                    <span className="text-xs text-gray-400 dark:text-[#666] bg-gray-100 dark:bg-[#222] px-2 py-0.5 rounded-full font-mono">{incomeCategories.length}</span>
                                </div>
                                <button
                                    onClick={() => openNewCat('income')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-lg transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Nova
                                </button>
                            </div>
                            <div className="p-3 space-y-1.5">
                                {incomeCategories.length > 0 ? incomeCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] border border-gray-200 dark:border-[#222] hover:border-emerald-500/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                                        </div>
                                        <button
                                            onClick={() => openEditCat(cat)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-[#D4A85C] hover:bg-[#D4A85C]/10 transition-all"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center text-xs text-gray-400 dark:text-[#555] font-bold uppercase tracking-widest">
                                        Nenhuma categoria de receita
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Despesas */}
                        <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-[#222] flex items-center justify-between bg-gray-50 dark:bg-[#141414]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                                        <ArrowDownRight className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Despesas</h3>
                                    <span className="text-xs text-gray-400 dark:text-[#666] bg-gray-100 dark:bg-[#222] px-2 py-0.5 rounded-full font-mono">{expenseCategories.length}</span>
                                </div>
                                <button
                                    onClick={() => openNewCat('expense')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold rounded-lg transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Nova
                                </button>
                            </div>
                            <div className="p-3 space-y-1.5">
                                {expenseCategories.length > 0 ? expenseCategories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] border border-gray-200 dark:border-[#222] hover:border-rose-500/30 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                                        </div>
                                        <button
                                            onClick={() => openEditCat(cat)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-[#D4A85C] hover:bg-[#D4A85C]/10 transition-all"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center text-xs text-gray-400 dark:text-[#555] font-bold uppercase tracking-widest">
                                        Nenhuma categoria de despesa
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                CATEGORY MODAL
               ═══════════════════════════════════════════════════════════════════ */}
            {showCatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeCatModal} />
                    <div className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 fade-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#222]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#D4A85C]/10 flex items-center justify-center">
                                    <Tag className="w-5 h-5 text-[#D4A85C]" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {editingCat ? 'Editar Categoria' : 'Nova Categoria'}
                                </h3>
                            </div>
                            <button onClick={closeCatModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Type toggle */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCatForm(f => ({ ...f, type: 'income' }))}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${catForm.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Receita
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCatForm(f => ({ ...f, type: 'expense' }))}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${catForm.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Despesa
                                </button>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Nome</label>
                                <input
                                    type="text"
                                    value={catForm.name}
                                    onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                                    onKeyDown={e => e.key === 'Enter' && handleSaveCat()}
                                    placeholder="Ex: Marketing, Salários..."
                                    autoFocus
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] focus:outline-none focus:border-[#A0792E]/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-[#222]">
                            <div>
                                {editingCat && (
                                    <button
                                        onClick={() => setDeleteCatConfirm(editingCat.id)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" /> Excluir
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={closeCatModal} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveCat}
                                    disabled={savingCat || !catForm.name.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black rounded-xl text-sm font-bold shadow-lg shadow-[#A0792E]/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {savingCat && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {savingCat ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category delete confirmation */}
            {deleteCatConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteCatConfirm(null)} />
                    <div className="relative bg-white dark:bg-[#111] border border-rose-500/20 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 fade-in duration-200">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Excluir Categoria?</h3>
                        <p className="text-sm text-gray-500 dark:text-[#888] mb-6">Lançamentos vinculados perderão a categoria.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteCatConfirm(null)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#1A1A1A] rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteCat(deleteCatConfirm)}
                                disabled={deletingCat}
                                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-all disabled:opacity-50"
                            >
                                {deletingCat && <Loader2 className="w-4 h-4 animate-spin" />}
                                {deletingCat ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                ACCOUNT MODAL
               ═══════════════════════════════════════════════════════════════════ */}
            {showAccModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeAccModal} />
                    <div className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 fade-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#222]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#D4A85C]/10 flex items-center justify-center">
                                    <Banknote className="w-5 h-5 text-[#D4A85C]" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                    {editingAcc ? 'Editar Conta' : 'Nova Conta'}
                                </h3>
                            </div>
                            <button onClick={closeAccModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Nome da Conta</label>
                                <input
                                    type="text"
                                    value={accForm.name}
                                    onChange={e => setAccForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Ex: Banco Inter - C/C, Caixa Interno..."
                                    autoFocus
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] focus:outline-none focus:border-[#A0792E]/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Tipo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {([
                                        { key: 'bank', label: 'Banco', icon: Building2 },
                                        { key: 'cash', label: 'Caixa', icon: Wallet },
                                        { key: 'credit', label: 'Cartão', icon: CreditCard },
                                        { key: 'investment', label: 'Investimento', icon: PiggyBank },
                                    ] as const).map(opt => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => setAccForm(f => ({ ...f, type: opt.key }))}
                                            className={`flex items-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${accForm.type === opt.key ? 'bg-[#D4A85C]/10 border-[#D4A85C]/40 text-[#D4A85C]' : 'bg-gray-50 dark:bg-[#0A0A0A] border-gray-200 dark:border-[#222] text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                        >
                                            <opt.icon className="w-4 h-4" /> {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Saldo Inicial (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={accForm.initial_balance}
                                    onChange={e => setAccForm(f => ({ ...f, initial_balance: e.target.value }))}
                                    placeholder="0,00"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] focus:outline-none focus:border-[#A0792E]/50 transition-all font-mono"
                                />
                                <p className="text-[10px] text-gray-400 dark:text-[#666] mt-2 uppercase tracking-widest">Saldo antes das movimentações do ERP</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-[#222]">
                            <div>
                                {editingAcc && (
                                    <button
                                        onClick={() => setDeleteAccConfirm(editingAcc.id)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" /> Excluir
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={closeAccModal} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveAcc}
                                    disabled={savingAcc || !accForm.name.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black rounded-xl text-sm font-bold shadow-lg shadow-[#A0792E]/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {savingAcc && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {savingAcc ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Account delete confirmation */}
            {deleteAccConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteAccConfirm(null)} />
                    <div className="relative bg-white dark:bg-[#111] border border-rose-500/20 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 fade-in duration-200">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Excluir Conta?</h3>
                        <p className="text-sm text-gray-500 dark:text-[#888] mb-6">A conta só pode ser excluída se não houver lançamentos vinculados.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteAccConfirm(null)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#1A1A1A] rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDeleteAcc(deleteAccConfirm)}
                                disabled={deletingAcc}
                                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-all disabled:opacity-50"
                            >
                                {deletingAcc && <Loader2 className="w-4 h-4 animate-spin" />}
                                {deletingAcc ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                TRANSACTION MODAL
               ═══════════════════════════════════════════════════════════════════ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className={`flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#222] rounded-t-2xl ${modalType === 'income' ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${modalType === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {modalType === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                        {editingTx ? 'Editar' : 'Nova'} {modalType === 'income' ? 'Receita' : 'Despesa'}
                                    </h3>
                                    {editingTx && <p className="text-[10px] text-gray-400 dark:text-[#666] font-mono tracking-widest">ID: {editingTx.id.substring(0, 8)}...</p>}
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Type Toggle */}
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalType('income')}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${modalType === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Receita
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModalType('expense')}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${modalType === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#666] hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Despesa
                                </button>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Descrição</label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Ex: Pix enviado - Fornecedor"
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] focus:outline-none focus:border-[#A0792E]/50 transition-all"
                                />
                            </div>

                            {/* Amount + Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.amount}
                                        onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="0,00"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] focus:outline-none focus:border-[#A0792E]/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Data</label>
                                    <input
                                        type="date"
                                        value={form.transaction_date}
                                        onChange={e => setForm(f => ({ ...f, transaction_date: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#A0792E]/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Account + Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Conta</label>
                                    <select
                                        value={form.account_id}
                                        onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#A0792E]/50 transition-all appearance-none"
                                    >
                                        <option value="">Selecionar...</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#A0792E]/50 transition-all appearance-none"
                                    >
                                        <option value="pending">Pendente</option>
                                        <option value="completed">Efetivado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            {/* Category */}
                            {categories.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Categoria</label>
                                    <select
                                        value={form.category_id}
                                        onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#A0792E]/50 transition-all appearance-none"
                                    >
                                        <option value="">Sem categoria</option>
                                        {(modalType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                        {(modalType === 'income' ? incomeCategories : expenseCategories).length === 0 && categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Observation */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest mb-2">Observação</label>
                                <textarea
                                    value={form.observacao}
                                    onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
                                    placeholder="Informações adicionais sobre o lançamento..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] focus:outline-none focus:border-[#A0792E]/50 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-100 dark:border-[#222]">
                            <div>
                                {editingTx && (
                                    <button
                                        onClick={() => setDeleteConfirm(editingTx.id)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" /> Excluir
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !form.description.trim() || !form.amount || !form.account_id}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black rounded-xl text-sm font-bold shadow-lg shadow-[#A0792E]/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                DELETE CONFIRMATION
               ═══════════════════════════════════════════════════════════════════ */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative bg-white dark:bg-[#111] border border-rose-500/20 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 fade-in duration-200">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Excluir Lançamento?</h3>
                        <p className="text-sm text-gray-500 dark:text-[#888] mb-6">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-[#1A1A1A] rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={deleting}
                                className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-bold hover:bg-rose-600 transition-all disabled:opacity-50"
                            >
                                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {deleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════════════════════
// LEILÕES INTEGRATION SUB-COMPONENT
// Conecta bula_leiloes.comissao_receber → A Receber (income pending)
// Conecta bula_leilao_fechamento.comissao_assessoria → A Pagar (expense pending)
// ═════════════════════════════════════════════════════════════════════════════
export function LeiloesIntegracao({
    accounts, categories, transactions, leiloes, fechamentos, onDone,
}: {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
    leiloes: BulaLeilao[];
    fechamentos: FechamentoLite[];
    onDone: () => void;
}) {
    const [busy, setBusy] = useState<string | null>(null);
    const [hideLancados, setHideLancados] = useState(false);
    const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
    const [catReceber, setCatReceber] = useState<string>('');
    const [catPagar, setCatPagar] = useState<string>('');

    // Detectar transações já vinculadas (via observacao com tag [LEILAO:id] ou [FECHAMENTO:id])
    const linkedSet = useMemo(() => {
        const set = new Set<string>();
        for (const tx of transactions) {
            const obs = tx.observacao || '';
            const m = obs.match(/\[([A-Z]+:[^\]]+)\]/);
            if (m) set.add(m[1]);
        }
        return set;
    }, [transactions]);

    // ── A RECEBER ────────────────────────────────────────────────────────────
    // Duas fontes:
    //   (1) bula_leiloes.comissao_receber − recebido   → tag LEILAO:<id>
    //   (2) bula_leilao_fechamento.receita_bula        → tag FECHAMENTO:<id>:RECEITA
    type Receivable = {
        sourceTag: string; origem: 'leilao' | 'fechamento'; refId: string;
        nome: string; criador: string; data: string;
        total: number; recebido: number; saldo: number;
        comissaoPct: string; status: string; alreadyLinked: boolean;
    };
    const receivables = useMemo<Receivable[]>(() => {
        const out: Receivable[] = [];
        for (const l of leiloes ?? []) {
            const total = parseMoneyText(l.comissao_receber);
            const recebido = parseMoneyText(l.recebido);
            const saldo = total - recebido;
            if (saldo <= 0) continue;
            const sourceTag = `LEILAO:${l.id}`;
            out.push({
                sourceTag, origem: 'leilao', refId: l.id,
                nome: l.nome, criador: l.criador || '', data: l.data || '',
                total, recebido, saldo,
                comissaoPct: l.comissao || '',
                status: l.status || '',
                alreadyLinked: linkedSet.has(sourceTag),
            });
        }
        for (const f of fechamentos ?? []) {
            const receita = Number(f.receita_bula) || 0;
            if (receita <= 0) continue;
            const sourceTag = `FECHAMENTO:${f.id}:RECEITA`;
            out.push({
                sourceTag, origem: 'fechamento', refId: f.id,
                nome: f.nome, criador: 'Receita Bula (fechamento)', data: f.data || '',
                total: receita, recebido: 0, saldo: receita,
                comissaoPct: '', status: '',
                alreadyLinked: linkedSet.has(sourceTag),
            });
        }
        return out.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    }, [leiloes, fechamentos, linkedSet]);

    // ── A PAGAR (comissão p/ assessores a partir dos fechamentos) ───────────
    type Payable = {
        sourceTag: string; fechamentoId: string; leilaoNome: string;
        data: string; assessor: string; empresa: string; valor: number;
        vgvAssessor: number; alreadyLinked: boolean;
    };
    const payables = useMemo<Payable[]>(() => {
        const out: Payable[] = [];
        for (const f of fechamentos ?? []) {
            const comissaoTotal = Number(f.comissao_assessoria) || 0;
            if (comissaoTotal <= 0) continue;
            // Mescla assessores centralizados (Pedro Barnabé / Matheus Amormino →
            // Marcelo Carneiro) antes de calcular a comissão por share.
            const assessorMap = new Map<string, { nome: string; empresa: string; vgv: number }>();
            for (const a of f.por_assessor ?? []) {
                const canon = normalizeAssessorNome(a?.nome);
                if (!canon) continue;
                const cur = assessorMap.get(canon) ?? { nome: canon, empresa: a?.empresa || '', vgv: 0 };
                cur.vgv += Number(a?.vgv) || 0;
                if (!cur.empresa && a?.empresa) cur.empresa = a.empresa;
                assessorMap.set(canon, cur);
            }
            const assessores = Array.from(assessorMap.values());
            const totalVgv = assessores.reduce((s, a) => s + a.vgv, 0);

            if (assessores.length > 0 && totalVgv > 0) {
                // split proporcional ao VGV de cada assessor canônico
                for (const a of assessores) {
                    const share = a.vgv / totalVgv;
                    const valor = comissaoTotal * share;
                    if (valor < 0.01) continue;
                    const key = a.nome.toUpperCase().replace(/\s+/g, '_').slice(0, 40);
                    const sourceTag = `FECHAMENTO:${f.id}:ASSESSOR:${key}`;
                    out.push({
                        sourceTag,
                        fechamentoId: f.id,
                        leilaoNome: f.nome,
                        data: f.data,
                        assessor: a.nome,
                        empresa: a.empresa,
                        valor,
                        vgvAssessor: a.vgv,
                        alreadyLinked: linkedSet.has(sourceTag),
                    });
                }
            } else {
                // lump sum único
                const sourceTag = `FECHAMENTO:${f.id}:COMISSAO`;
                out.push({
                    sourceTag,
                    fechamentoId: f.id,
                    leilaoNome: f.nome,
                    data: f.data,
                    assessor: 'Equipe de assessoria',
                    empresa: '',
                    valor: comissaoTotal,
                    vgvAssessor: 0,
                    alreadyLinked: linkedSet.has(sourceTag),
                });
            }
        }
        return out.sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    }, [fechamentos, linkedSet]);

    // ── Totais ──────────────────────────────────────────────────────────────
    const totReceberPend = receivables.filter(r => !r.alreadyLinked).reduce((s, r) => s + r.saldo, 0);
    const totReceberTotal = receivables.reduce((s, r) => s + r.saldo, 0);
    const totPagarPend = payables.filter(p => !p.alreadyLinked).reduce((s, p) => s + p.valor, 0);
    const totPagarTotal = payables.reduce((s, p) => s + p.valor, 0);
    const resultadoLiquido = totReceberTotal - totPagarTotal;

    const receiveList = hideLancados ? receivables.filter(r => !r.alreadyLinked) : receivables;
    const payList = hideLancados ? payables.filter(p => !p.alreadyLinked) : payables;

    const incomeCats = categories.filter(c => c.type === 'income');
    const expenseCats = categories.filter(c => c.type === 'expense');

    // ── P&L por fechamento ──────────────────────────────────────────────────
    type FechamentoPnL = {
        id: string; nome: string; data: string;
        vgv: number; fatLeiloeira: number | null;
        acordo: AcordoLeilao | null;
        receita: number; comissao: number; sobra: number;
        receberTag: string; receberLancado: boolean; receberAmt: number;
        pagarTags: string[]; pagarLancados: number; pagarTotal: number;
    };
    const fechamentoPnL = useMemo<FechamentoPnL[]>(() => {
        return (fechamentos ?? []).map(f => {
            const receita = Number(f.receita_bula) || 0;
            const comissao = Number(f.comissao_assessoria) || 0;
            const storedSobra = Number(f.sobra_bruta) || 0;
            const sobra = storedSobra !== 0 ? storedSobra : receita - comissao;
            const receberTag = `FECHAMENTO:${f.id}:RECEITA`;
            const payTags = payables.filter(p => p.fechamentoId === f.id).map(p => p.sourceTag);
            const pagarLancados = payables.filter(p => p.fechamentoId === f.id && p.alreadyLinked).length;
            const pagarTotal = payables.filter(p => p.fechamentoId === f.id).reduce((s, p) => s + p.valor, 0);
            return {
                id: f.id, nome: f.nome, data: f.data,
                vgv: Number(f.vgv_total) || 0,
                fatLeiloeira: f.faturamento_total_leilao ?? null,
                acordo: resolverAcordo(f),
                receita, comissao, sobra,
                receberTag,
                receberLancado: linkedSet.has(receberTag),
                receberAmt: receita,
                pagarTags: payTags,
                pagarLancados,
                pagarTotal,
            };
        }).filter(x => x.receita > 0 || x.comissao > 0)
          .sort((a, b) => (b.data || '').localeCompare(a.data || ''));
    }, [fechamentos, payables, linkedSet]);

    // ── Filtros do "Resumo por Fechamento" ──────────────────────────────────
    const [fechSearch, setFechSearch] = useState('');
    const [fechDataFrom, setFechDataFrom] = useState('');
    const [fechDataTo, setFechDataTo] = useState('');
    const [fechStatusReceber, setFechStatusReceber] = useState<'all' | 'pendente' | 'lancado' | 'sem'>('all');
    const [fechStatusPagar, setFechStatusPagar] = useState<'all' | 'pendente' | 'parcial' | 'lancado' | 'sem'>('all');

    const filteredFechamentoPnL = useMemo(() => {
        const q = fechSearch.trim().toLowerCase();
        return fechamentoPnL.filter(p => {
            if (q && !p.nome.toLowerCase().includes(q)) return false;
            if (fechDataFrom && (!p.data || p.data < fechDataFrom)) return false;
            if (fechDataTo && (!p.data || p.data > fechDataTo)) return false;

            if (fechStatusReceber !== 'all') {
                if (fechStatusReceber === 'sem' && p.receita > 0) return false;
                if (fechStatusReceber === 'pendente' && (p.receita <= 0 || p.receberLancado)) return false;
                if (fechStatusReceber === 'lancado' && (p.receita <= 0 || !p.receberLancado)) return false;
            }

            if (fechStatusPagar !== 'all') {
                const tot = p.pagarTags.length;
                const lanc = p.pagarLancados;
                if (fechStatusPagar === 'sem' && tot > 0) return false;
                if (fechStatusPagar === 'pendente' && (tot === 0 || lanc > 0)) return false;
                if (fechStatusPagar === 'parcial' && (tot === 0 || lanc === 0 || lanc >= tot)) return false;
                if (fechStatusPagar === 'lancado' && (tot === 0 || lanc < tot)) return false;
            }

            return true;
        });
    }, [fechamentoPnL, fechSearch, fechDataFrom, fechDataTo, fechStatusReceber, fechStatusPagar]);

    const fechFiltersActive =
        fechSearch.trim() !== '' || fechDataFrom !== '' || fechDataTo !== '' ||
        fechStatusReceber !== 'all' || fechStatusPagar !== 'all';

    const limparFiltrosFech = () => {
        setFechSearch('');
        setFechDataFrom('');
        setFechDataTo('');
        setFechStatusReceber('all');
        setFechStatusPagar('all');
    };

    // ── Export CSV do "Resumo por Fechamento" ───────────────────────────────
    const exportFechamentosCSV = () => {
        if (filteredFechamentoPnL.length === 0) {
            alert('Nada para exportar.');
            return;
        }
        const head = [
            'Data', 'Leilão', 'Acordo', 'Fat. Leiloeira', 'VGV Cobertura',
            'Fat. Bula', 'Comissão', 'Lucro Bruto', 'Margem %',
            'Receber (status)', 'Pagar (lançados/total)',
        ];
        const esc = (v: unknown) => {
            const s = v == null ? '' : String(v);
            if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
        };
        const numBR = (n: number) =>
            n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const rows = filteredFechamentoPnL.map(p => {
            const margem = p.receita > 0 ? (p.sobra / p.receita) * 100 : 0;
            const receberStatus = p.receita <= 0 ? '—' : p.receberLancado ? 'Lançado' : 'Pendente';
            const pagarStatus = p.pagarTags.length === 0
                ? '—'
                : `${p.pagarLancados}/${p.pagarTags.length}`;
            return [
                p.data ? fmtDate(p.data) : '',
                p.nome,
                p.acordo ? formatarAcordoCurto(p.acordo) : '',
                p.fatLeiloeira != null ? numBR(p.fatLeiloeira) : '',
                p.vgv > 0 ? numBR(p.vgv) : '',
                p.receita > 0 ? numBR(p.receita) : '',
                p.comissao > 0 ? numBR(p.comissao) : '',
                p.sobra !== 0 ? numBR(p.sobra) : '',
                p.receita > 0 ? `${margem.toFixed(1)}%` : '',
                receberStatus,
                pagarStatus,
            ].map(esc).join(';');
        });
        const totFat = filteredFechamentoPnL.reduce((s, x) => s + (x.fatLeiloeira || 0), 0);
        const totVgv = filteredFechamentoPnL.reduce((s, x) => s + x.vgv, 0);
        const totRec = filteredFechamentoPnL.reduce((s, x) => s + x.receita, 0);
        const totCom = filteredFechamentoPnL.reduce((s, x) => s + x.comissao, 0);
        const totSob = filteredFechamentoPnL.reduce((s, x) => s + x.sobra, 0);
        const totalRow = [
            '', 'TOTAIS', '',
            numBR(totFat), numBR(totVgv), numBR(totRec), numBR(totCom), numBR(totSob),
            '', '', '',
        ].map(esc).join(';');

        const csv = '﻿' + [head.map(esc).join(';'), ...rows, totalRow].join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resumo-fechamentos-${today()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // ── Lançar um único ──────────────────────────────────────────────────────
    const lancarUm = async (tipo: 'income' | 'expense', itemTag: string) => {
        if (!accountId) { alert('Selecione uma conta ERP primeiro.'); return; }
        setBusy(itemTag);
        try {
            if (tipo === 'income') {
                const r = receivables.find(x => x.sourceTag === itemTag);
                if (!r) return;
                const prefix = r.origem === 'fechamento' ? 'Receita Bula' : 'Comissão a receber';
                await registrarLeiloesLote([{
                    type: 'income',
                    amount: r.saldo,
                    description: `${prefix} — ${r.nome}`,
                    transaction_date: r.data || today(),
                    account_id: accountId,
                    category_id: catReceber || null,
                    sourceTag: itemTag,
                }]);
            } else {
                const p = payables.find(x => x.sourceTag === itemTag);
                if (!p) return;
                await registrarLeiloesLote([{
                    type: 'expense',
                    amount: p.valor,
                    description: `Comissão assessor ${p.assessor} — ${p.leilaoNome}`,
                    transaction_date: p.data || today(),
                    account_id: accountId,
                    category_id: catPagar || null,
                    sourceTag: itemTag,
                }]);
            }
            onDone();
        } finally {
            setBusy(null);
        }
    };

    // ── Lançar tudo pendente ─────────────────────────────────────────────────
    const lancarTudo = async () => {
        if (!accountId) { alert('Selecione uma conta ERP primeiro.'); return; }
        const pendReceb = receivables.filter(r => !r.alreadyLinked);
        const pendPag = payables.filter(p => !p.alreadyLinked);
        if (pendReceb.length + pendPag.length === 0) return;
        if (!confirm(`Lançar ${pendReceb.length} a receber e ${pendPag.length} a pagar como pendentes no ERP?`)) return;

        setBusy('all');
        try {
            const items: Parameters<typeof registrarLeiloesLote>[0] = [
                ...pendReceb.map(r => ({
                    type: 'income' as const,
                    amount: r.saldo,
                    description: `${r.origem === 'fechamento' ? 'Receita Bula' : 'Comissão a receber'} — ${r.nome}`,
                    transaction_date: r.data || today(),
                    account_id: accountId,
                    category_id: catReceber || null,
                    sourceTag: r.sourceTag,
                })),
                ...pendPag.map(p => ({
                    type: 'expense' as const,
                    amount: p.valor,
                    description: `Comissão assessor ${p.assessor} — ${p.leilaoNome}`,
                    transaction_date: p.data || today(),
                    account_id: accountId,
                    category_id: catPagar || null,
                    sourceTag: p.sourceTag,
                })),
            ];
            const res = await registrarLeiloesLote(items);
            if (res.success) alert(`✓ ${res.created} criados, ${res.skipped} já existentes, ${res.failed} falharam.`);
            onDone();
        } finally {
            setBusy(null);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 space-y-6">
            {/* ── Resumo ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/25 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                    <div className="flex items-center gap-2 mb-2 relative">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">A Receber — Leilões</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-500 leading-tight">{fmt(totReceberTotal)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {receivables.length} leilão(ões) com comissão pendente · {fmt(totReceberPend)} ainda não lançados
                    </p>
                </div>

                <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/25 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
                    <div className="flex items-center gap-2 mb-2 relative">
                        <ArrowDownRight className="w-4 h-4 text-rose-500" />
                        <span className="text-[10px] uppercase tracking-widest text-rose-500 font-bold">A Pagar — Comissões</span>
                    </div>
                    <p className="text-3xl font-black text-rose-500 leading-tight">{fmt(totPagarTotal)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {payables.length} comissão(ões) · {fmt(totPagarPend)} ainda não lançadas
                    </p>
                </div>

                <div className={`bg-gradient-to-br border rounded-2xl p-6 relative overflow-hidden ${resultadoLiquido >= 0
                    ? 'from-[#A0792E]/15 via-[#A0792E]/5 to-transparent border-[#A0792E]/30'
                    : 'from-rose-600/15 via-rose-500/5 to-transparent border-rose-500/30'}`}>
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#A0792E]/10 rounded-full blur-3xl" />
                    <div className="flex items-center gap-2 mb-2 relative">
                        <Trophy className={`w-4 h-4 ${resultadoLiquido >= 0 ? 'text-[#A0792E]' : 'text-rose-500'}`} />
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${resultadoLiquido >= 0 ? 'text-[#A0792E]' : 'text-rose-500'}`}>
                            Resultado líquido esperado
                        </span>
                    </div>
                    <p className={`text-3xl font-black leading-tight ${resultadoLiquido >= 0 ? 'text-[#A0792E]' : 'text-rose-500'}`}>
                        {resultadoLiquido >= 0 ? '+' : ''}{fmt(resultadoLiquido)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Sobre o histórico de leilões com dados financeiros
                    </p>
                </div>
            </div>

            {/* ── Toolbar ─────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl p-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A0792E]" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Lançar no ERP</span>
                </div>
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                    <select value={accountId} onChange={e => setAccountId(e.target.value)}
                        className="px-3 py-2 text-xs font-semibold bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-[#A0792E] outline-none">
                        <option value="">Conta ERP…</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select value={catReceber} onChange={e => setCatReceber(e.target.value)}
                        className="px-3 py-2 text-xs font-semibold bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none">
                        <option value="">Categoria (receber)…</option>
                        {incomeCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={catPagar} onChange={e => setCatPagar(e.target.value)}
                        className="px-3 py-2 text-xs font-semibold bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500 outline-none">
                        <option value="">Categoria (pagar)…</option>
                        {expenseCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={hideLancados} onChange={e => setHideLancados(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#A0792E]" />
                    Ocultar já lançados
                </label>
                <button onClick={lancarTudo} disabled={busy !== null || !accountId}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A0792E] to-[#9A7209] text-black rounded-lg text-xs font-bold shadow-md hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100">
                    {busy === 'all' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                    Lançar tudo pendente
                </button>
            </div>

            {/* ── P&L por Fechamento ────────────────────────────────────── */}
            {fechamentoPnL.length > 0 && (
                <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-[#A0792E]/10 rounded-xl">
                                <Trophy className="w-4 h-4 text-[#A0792E]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Resumo por Fechamento</h3>
                                <p className="text-[10px] text-gray-500 mt-0.5">Acordo · Fat. Leiloeira (referência) · VGV Cobertura · <span className="text-emerald-500 font-bold">Faturamento Bula</span> · Comissões · Lucro Bruto</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                                {filteredFechamentoPnL.length === fechamentoPnL.length
                                    ? `${fechamentoPnL.length} fechamento(s)`
                                    : `${filteredFechamentoPnL.length} de ${fechamentoPnL.length} fechamento(s)`}
                            </span>
                            <button
                                onClick={exportFechamentosCSV}
                                disabled={filteredFechamentoPnL.length === 0}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A0792E]/10 text-[#A0792E] border border-[#A0792E]/30 rounded-lg text-xs font-bold hover:bg-[#A0792E] hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Exportar CSV (Excel)"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Exportar CSV
                            </button>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="px-5 py-3 border-b border-gray-100 dark:border-[#1E1E1E] bg-gray-50/50 dark:bg-[#0A0A0A] flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-gray-500 mr-1">
                            <Filter className="w-3 h-3" />
                            Filtros
                        </div>
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={fechSearch}
                                onChange={e => setFechSearch(e.target.value)}
                                placeholder="Buscar leilão…"
                                className="pl-7 pr-3 py-1.5 text-xs font-semibold bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-[#A0792E] outline-none w-44"
                            />
                        </div>
                        <input
                            type="date"
                            value={fechDataFrom}
                            onChange={e => setFechDataFrom(e.target.value)}
                            title="Data inicial"
                            className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-[#A0792E] outline-none"
                        />
                        <span className="text-[10px] text-gray-400">até</span>
                        <input
                            type="date"
                            value={fechDataTo}
                            onChange={e => setFechDataTo(e.target.value)}
                            title="Data final"
                            className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-[#A0792E] outline-none"
                        />
                        <select
                            value={fechStatusReceber}
                            onChange={e => setFechStatusReceber(e.target.value as typeof fechStatusReceber)}
                            title="Status do A Receber"
                            className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                            <option value="all">Receber: todos</option>
                            <option value="pendente">Receber: pendente</option>
                            <option value="lancado">Receber: lançado</option>
                            <option value="sem">Receber: sem receita</option>
                        </select>
                        <select
                            value={fechStatusPagar}
                            onChange={e => setFechStatusPagar(e.target.value as typeof fechStatusPagar)}
                            title="Status do A Pagar"
                            className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500 outline-none"
                        >
                            <option value="all">Pagar: todos</option>
                            <option value="pendente">Pagar: pendente</option>
                            <option value="parcial">Pagar: parcial</option>
                            <option value="lancado">Pagar: lançado</option>
                            <option value="sem">Pagar: sem comissão</option>
                        </select>
                        {fechFiltersActive && (
                            <button
                                onClick={limparFiltrosFech}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                title="Limpar filtros"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Limpar
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-[10px] uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-3 py-3 text-left font-bold">Data</th>
                                    <th className="px-3 py-3 text-left font-bold">Leilão</th>
                                    <th className="px-3 py-3 text-left font-bold">Acordo</th>
                                    <th className="px-3 py-3 text-right font-bold">Fat. Leiloeira</th>
                                    <th className="px-3 py-3 text-right font-bold">VGV Cobertura</th>
                                    <th className="px-3 py-3 text-right font-bold text-emerald-500">Fat. Bula</th>
                                    <th className="px-3 py-3 text-right font-bold">Comissão</th>
                                    <th className="px-3 py-3 text-right font-bold">Lucro Bruto</th>
                                    <th className="px-3 py-3 text-center font-bold">Receber</th>
                                    <th className="px-3 py-3 text-center font-bold">Pagar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFechamentoPnL.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="px-3 py-12 text-center text-xs text-gray-400">
                                            Nenhum fechamento corresponde aos filtros aplicados.
                                        </td>
                                    </tr>
                                )}
                                {filteredFechamentoPnL.map(p => {
                                    const margemPct = p.receita > 0 ? (p.sobra / p.receita) * 100 : 0;
                                    const pagarTotalCount = p.pagarTags.length;
                                    const pagarAllDone = pagarTotalCount > 0 && p.pagarLancados === pagarTotalCount;
                                    const pagarPartial = p.pagarLancados > 0 && p.pagarLancados < pagarTotalCount;
                                    return (
                                        <tr key={p.id} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50/50 dark:hover:bg-[#0E0E0E]">
                                            <td className="px-3 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{fmtDate(p.data)}</td>
                                            <td className="px-3 py-3">
                                                <p className="font-bold text-gray-900 dark:text-white">{p.nome}</p>
                                                <p className="text-[10px] text-gray-500">margem {margemPct.toFixed(1)}%</p>
                                            </td>
                                            <td className="px-3 py-3">
                                                {p.acordo ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#A0792E]/15 text-[#A0792E] text-[10px] font-black tracking-wide" title={p.acordo.descricao}>
                                                        {formatarAcordoCurto(p.acordo)}
                                                    </span>
                                                ) : <span className="text-gray-300 text-[10px]">—</span>}
                                            </td>
                                            <td className="px-3 py-3 text-right font-mono text-xs text-gray-400 dark:text-[#666]">
                                                {p.fatLeiloeira ? fmt(p.fatLeiloeira) : <span className="text-gray-300 dark:text-gray-700">—</span>}
                                            </td>
                                            <td className="px-3 py-3 text-right font-mono text-xs text-gray-700 dark:text-gray-300">{p.vgv > 0 ? fmt(p.vgv) : '—'}</td>
                                            <td className="px-3 py-3 text-right font-black text-emerald-500">{p.receita > 0 ? fmt(p.receita) : '—'}</td>
                                            <td className="px-3 py-3 text-right font-black text-rose-500">{p.comissao > 0 ? fmt(p.comissao) : '—'}</td>
                                            <td className={`px-3 py-3 text-right font-black ${p.sobra >= 0 ? 'text-[#A0792E]' : 'text-rose-500'}`}>
                                                {p.sobra !== 0 ? `${p.sobra >= 0 ? '+' : ''}${fmt(p.sobra)}` : '—'}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {p.receita <= 0 ? (
                                                    <span className="text-[10px] text-gray-400">—</span>
                                                ) : p.receberLancado ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        <CheckCheck className="w-3 h-3" /> Lançado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                        Pendente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                {pagarTotalCount === 0 ? (
                                                    <span className="text-[10px] text-gray-400">—</span>
                                                ) : pagarAllDone ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                        <CheckCheck className="w-3 h-3" /> {p.pagarLancados}/{pagarTotalCount}
                                                    </span>
                                                ) : pagarPartial ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20">
                                                        {p.pagarLancados}/{pagarTotalCount}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                        0/{pagarTotalCount}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-gray-50 dark:bg-[#0A0A0A] text-xs font-black">
                                <tr>
                                    <td className="px-3 py-3 text-gray-500 uppercase tracking-wider" colSpan={3}>Totais</td>
                                    <td className="px-3 py-3 text-right text-gray-500 dark:text-[#666]">{fmt(filteredFechamentoPnL.reduce((s, x) => s + (x.fatLeiloeira || 0), 0))}</td>
                                    <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">{fmt(filteredFechamentoPnL.reduce((s, x) => s + x.vgv, 0))}</td>
                                    <td className="px-3 py-3 text-right text-emerald-500">{fmt(filteredFechamentoPnL.reduce((s, x) => s + x.receita, 0))}</td>
                                    <td className="px-3 py-3 text-right text-rose-500">{fmt(filteredFechamentoPnL.reduce((s, x) => s + x.comissao, 0))}</td>
                                    <td className="px-3 py-3 text-right text-[#A0792E]">{fmt(filteredFechamentoPnL.reduce((s, x) => s + x.sobra, 0))}</td>
                                    <td className="px-3 py-3" colSpan={2} />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* ── A Receber ──────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">A Receber — Receita de Leilões</h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Fontes: <code className="bg-gray-100 dark:bg-[#1A1A1A] px-1 rounded">bula_leiloes</code> (comissão pendente) + <code className="bg-gray-100 dark:bg-[#1A1A1A] px-1 rounded">bula_leilao_fechamento.receita_bula</code></p>
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        {receivables.filter(r => !r.alreadyLinked).length} pendente(s)
                    </span>
                </div>

                {receiveList.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Gavel className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{hideLancados ? 'Tudo lançado — parabéns!' : 'Nenhuma comissão a receber cadastrada.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-[10px] uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold">Data</th>
                                    <th className="px-4 py-3 text-left font-bold">Leilão · Origem</th>
                                    <th className="px-4 py-3 text-left font-bold">Comissão %</th>
                                    <th className="px-4 py-3 text-right font-bold">Total</th>
                                    <th className="px-4 py-3 text-right font-bold">Recebido</th>
                                    <th className="px-4 py-3 text-right font-bold">Saldo</th>
                                    <th className="px-4 py-3 text-center font-bold">Status</th>
                                    <th className="px-4 py-3 text-right font-bold">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receiveList.map(r => (
                                    <tr key={r.sourceTag} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50/50 dark:hover:bg-[#0E0E0E]">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.data ? fmtDate(r.data) : '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${r.origem === 'fechamento' ? 'bg-[#A0792E]/15 text-[#A0792E]' : 'bg-sky-500/15 text-sky-500'}`}>
                                                    {r.origem === 'fechamento' ? 'Fech.' : 'Leilão'}
                                                </span>
                                                <p className="font-bold text-gray-900 dark:text-white">{r.nome}</p>
                                            </div>
                                            {r.criador && <p className="text-[10px] text-gray-500 mt-0.5">{r.criador}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{r.comissaoPct || '—'}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">{fmt(r.total)}</td>
                                        <td className="px-4 py-3 text-right text-xs text-gray-500">{r.recebido > 0 ? fmt(r.recebido) : '—'}</td>
                                        <td className="px-4 py-3 text-right font-black text-emerald-500">{fmt(r.saldo)}</td>
                                        <td className="px-4 py-3 text-center">
                                            {r.alreadyLinked ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <CheckCheck className="w-3 h-3" /> Lançado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {r.alreadyLinked ? (
                                                <span className="text-[10px] text-gray-400">—</span>
                                            ) : (
                                                <button onClick={() => lancarUm('income', r.sourceTag)}
                                                    disabled={busy !== null || !accountId}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-lg text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
                                                    {busy === r.sourceTag ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                                    Lançar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── A Pagar ────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-500/10 rounded-xl">
                            <Users className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">A Pagar — Comissões de Assessores</h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Split proporcional ao VGV de cada assessor dentro de <code className="bg-gray-100 dark:bg-[#1A1A1A] px-1 rounded">bula_leilao_fechamento.comissao_assessoria</code></p>
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                        {payables.filter(p => !p.alreadyLinked).length} pendente(s)
                    </span>
                </div>

                {payList.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">{hideLancados ? 'Tudo quitado — sem pendências.' : 'Nenhum fechamento com comissão de assessoria cadastrada.'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-[#0A0A0A] text-[10px] uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold">Data</th>
                                    <th className="px-4 py-3 text-left font-bold">Leilão</th>
                                    <th className="px-4 py-3 text-left font-bold">Assessor</th>
                                    <th className="px-4 py-3 text-right font-bold">VGV Próprio</th>
                                    <th className="px-4 py-3 text-right font-bold">Valor</th>
                                    <th className="px-4 py-3 text-center font-bold">Status</th>
                                    <th className="px-4 py-3 text-right font-bold">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payList.map(p => (
                                    <tr key={p.sourceTag} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50/50 dark:hover:bg-[#0E0E0E]">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{fmtDate(p.data)}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{p.leilaoNome}</td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{p.assessor}</p>
                                            {p.empresa && <p className="text-[10px] text-gray-500">{p.empresa}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-right text-xs text-gray-500">{p.vgvAssessor > 0 ? fmt(p.vgvAssessor) : '—'}</td>
                                        <td className="px-4 py-3 text-right font-black text-rose-500">{fmt(p.valor)}</td>
                                        <td className="px-4 py-3 text-center">
                                            {p.alreadyLinked ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                    <CheckCheck className="w-3 h-3" /> Lançado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {p.alreadyLinked ? (
                                                <span className="text-[10px] text-gray-400">—</span>
                                            ) : (
                                                <button onClick={() => lancarUm('expense', p.sourceTag)}
                                                    disabled={busy !== null || !accountId}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/30 rounded-lg text-xs font-bold hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
                                                    {busy === p.sourceTag ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                                    Lançar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Ajuda ──────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-[#A0792E]/5 to-transparent border border-[#A0792E]/20 rounded-2xl p-5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <div className="flex items-start gap-3">
                    <ChevronRight className="w-4 h-4 text-[#A0792E] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p><strong className="text-[#A0792E]">Como funciona:</strong> cada comissão de leilão vira uma conta a receber e cada comissão de assessor vira uma conta a pagar, ambas como <em>Pendentes</em> no ERP.</p>
                        <p><strong className="text-[#A0792E]">Deduplicação:</strong> o sistema marca o lançamento com uma tag na observação (<code className="bg-gray-100 dark:bg-[#1A1A1A] px-1 rounded">[LEILAO:&lt;id&gt;]</code> / <code className="bg-gray-100 dark:bg-[#1A1A1A] px-1 rounded">[FECHAMENTO:&lt;id&gt;:ASSESSOR:&lt;nome&gt;]</code>) evitando duplicatas ao re-lançar.</p>
                        <p><strong className="text-[#A0792E]">Conciliar:</strong> depois de recebido/pago, vá em <em>Conciliação</em> e mude o status para Efetivado — isso atualiza o saldo real da conta.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
