import { createClient } from '@/utils/supabase/server';
import FinanceiroClient from '../FinanceiroClient';

export default async function ConciliacaoPage() {
    const supabase = await createClient();

    const [
        { data: accounts },
        { data: transactions },
        { data: categories },
    ] = await Promise.all([
        supabase.from('erp_finance_accounts').select('*').order('name'),
        supabase.from('erp_finance_transactions')
            .select(`
                id, amount, type, description, observacao, transaction_date, status, account_id, category_id,
                account:erp_finance_accounts(id, name, type),
                category:erp_finance_categories(id, name, type)
            `)
            .order('transaction_date', { ascending: false })
            .limit(2000),
        supabase.from('erp_finance_categories').select('*').order('name'),
    ]);

    return (
        <FinanceiroClient
            mode="conciliacao"
            initialAccounts={accounts || []}
            initialTransactions={(transactions as any[]) || []}
            initialCategories={categories || []}
        />
    );
}
