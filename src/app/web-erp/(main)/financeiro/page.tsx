import { createClient } from '@/utils/supabase/server';
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Search, Plus, Filter, Building2, CreditCard } from 'lucide-react';

export default async function FinanceiroPage() {
    const supabase = await createClient();

    // Fetch accounts
    const { data: accounts } = await supabase
        .from('erp_finance_accounts')
        .select('*')
        .order('name');

    // Fetch transactions
    const { data: transactions } = await supabase
        .from('erp_finance_transactions')
        .select(`
            id,
            amount,
            type,
            description,
            transaction_date,
            status,
            account:erp_finance_accounts(name)
        `)
        .order('transaction_date', { ascending: false })
        .limit(10);

    const totalBalance = accounts?.reduce((acc, account) => acc + Number(account.current_balance), 0) || 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-wide uppercase bg-gradient-to-r from-[#D4AF37] via-[#FFF8DC] to-[#D4AF37] text-transparent bg-clip-text">
                        Financeiro
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-[#888] font-medium tracking-wider uppercase">
                        Gestão de contas, receitas e despesas
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-300 dark:border-[#333] hover:border-emerald-500/50 text-gray-900 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20">
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Nova Receita
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#9A7209] text-black rounded-xl text-sm font-bold shadow-lg shadow-[#B8860B]/20 hover:scale-105 transition-all">
                        <ArrowDownRight className="w-4 h-4" /> Nova Despesa
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Wallet className="w-24 h-24 text-[#D4AF37]" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Saldo Consolidado</p>
                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">{formatCurrency(totalBalance)}</h3>
                        <div className="mt-4 flex items-center text-xs font-semibold bg-emerald-500/10 w-fit px-2.5 py-1 rounded-md text-emerald-400">
                            <TrendingUp className="w-3.5 h-3.5 mr-1" />
                            <span>+0.0% vs. mês passado</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <ArrowUpRight className="w-24 h-24 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Receitas (Mês)</p>
                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">R$ 0,00</h3>
                        <div className="mt-4 text-xs font-semibold text-gray-400 dark:text-[#666] uppercase tracking-widest">
                            0 títulos previstos
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#B8860B]/40 rounded-2xl p-6 shadow-xl transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <ArrowDownRight className="w-24 h-24 text-rose-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-gray-500 dark:text-[#888] uppercase tracking-widest">Despesas (Mês)</p>
                        <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">R$ 0,00</h3>
                        <div className="mt-4 text-xs font-semibold text-gray-400 dark:text-[#666] uppercase tracking-widest">
                            0 contas a pagar
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid for Accounts and Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Accounts Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-[#222] flex justify-between items-center bg-gray-50 dark:bg-[#141414]">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Contas Bancárias</h3>
                            <button className="text-[#D4AF37] hover:text-[#9A7209] p-1.5 rounded-lg hover:bg-[#D4AF37]/20 transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-3 space-y-2">
                            {accounts && accounts.length > 0 ? (
                                accounts.map((account) => (
                                    <div key={account.id} className="p-4 rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-all flex items-center justify-between group cursor-pointer border border-gray-200 dark:border-[#222] hover:border-[#B8860B]/40">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${account.type === 'checking' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                                {account.type === 'checking' ? <Building2 className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{account.name}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-[#666] uppercase tracking-widest mt-0.5">{account.type === 'checking' ? 'Conta Corrente' : account.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-extrabold text-[#D4AF37]">{formatCurrency(Number(account.current_balance))}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-sm text-gray-400 dark:text-[#555] uppercase tracking-widest font-bold">Nenhuma conta cadastrada</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-gray-200 dark:border-[#222] shadow-xl overflow-hidden flex flex-col h-full">
                        <div className="p-5 border-b border-gray-100 dark:border-[#222] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-[#141414]">
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Últimas Movimentações</h3>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64 group/search">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#555] group-focus-within/search:text-[#D4AF37] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#222] rounded-xl focus:outline-none focus:border-[#B8860B]/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#444] transition-all"
                                    />
                                </div>
                                <button className="p-2.5 border border-gray-200 dark:border-[#222] rounded-xl text-gray-500 dark:text-[#888] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222] uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Data</th>
                                        <th className="px-6 py-4 font-bold">Descrição</th>
                                        <th className="px-6 py-4 font-bold">Conta</th>
                                        <th className="px-6 py-4 font-bold text-right">Valor</th>
                                        <th className="px-6 py-4 font-bold text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions && transactions.length > 0 ? (
                                        transactions.map((tx: any) => (
                                            <tr key={tx.id} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors">
                                                <td className="px-6 py-4 text-gray-500 dark:text-[#888] font-mono text-xs">{formatDate(tx.transaction_date)}</td>
                                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{tx.description || '-'}</td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-[#888]">
                                                    {tx.account?.name || '-'}
                                                </td>
                                                <td className={`px-6 py-4 text-right font-extrabold ${tx.type === 'income' ? 'text-emerald-500' : tx.type === 'expense' ? 'text-rose-500' : 'text-gray-400 dark:text-[#888]'}`}>
                                                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''} {formatCurrency(Number(tx.amount))}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                                                        tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                        'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                                                    }`}>
                                                        {tx.status === 'completed' ? 'Efetivado' : tx.status === 'pending' ? 'Pendente' : 'Cancelado'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center text-gray-400 dark:text-[#555] font-bold uppercase tracking-widest text-xs">
                                                Nenhuma movimentação.
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
    );
}
