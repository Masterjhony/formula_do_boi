import { createClient } from '@/utils/supabase/server';
import FinanceiroClient from './FinanceiroClient';

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
        .limit(100);

    return <FinanceiroClient initialAccounts={accounts} initialTransactions={transactions} />;
}
