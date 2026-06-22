'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Search, Plus,
    Building2, CheckCircle2, Tag, X, Trash2,
    Loader2, Pencil, AlertTriangle, PiggyBank, Banknote,
    CreditCard, CheckCheck,
    Filter, Clock, Percent,
} from 'lucide-react';
import {
    saveTransaction, updateTransactionStatus, deleteTransaction,
    conciliarMultiplos, updateTransactionCategory,
    saveCategory, deleteCategory, saveObservacao,
    saveAccount, deleteAccount,
} from './actions';

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

interface Props {
    initialAccounts: Account[];
    initialTransactions: Transaction[];
    initialCategories: Category[];
    mode?: 'financeiro' | 'conciliacao';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

const today = () => new Date().toISOString().split('T')[0];

// ─── Component ───────────────────────────────────────────────────────────────
export default function FinanceiroClient({ initialAccounts, initialTransactions, initialCategories, mode = 'financeiro' }: Props) {
    const router = useRouter();

    // ── State ────────────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState(mode === 'conciliacao' ? 'conciliacao' : 'dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    useEffect(() => { setAccounts(initialAccounts); }, [initialAccounts]);
    const categories = initialCategories;
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
