import { createClient } from '@/utils/supabase/server';
import FinanceiroClient from './FinanceiroClient';

export default async function FinanceiroPage() {
    const supabase = await createClient();

    const { data: accounts } = await supabase
        .from('erp_finance_accounts')
        .select('*')
        .order('name');

    const { data: transactions } = await supabase
        .from('erp_finance_transactions')
        .select(`
            id, amount, type, description, observacao, transaction_date, status, account_id, category_id,
            account:erp_finance_accounts(id, name, type),
            category:erp_finance_categories(id, name, type)
        `)
        .order('transaction_date', { ascending: false })
        .limit(200);

    const { data: categories } = await supabase
        .from('erp_finance_categories')
        .select('*')
        .order('name');

    return (
        <FinanceiroClient
            initialAccounts={accounts || []}
            initialTransactions={(transactions as any[]) || []}
            initialCategories={categories || []}
        />
    );
}
