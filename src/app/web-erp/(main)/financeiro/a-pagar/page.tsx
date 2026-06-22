import { createClient } from '@/utils/supabase/server';
import ContasClient from '../_lib/ContasClient';
import type { Transaction } from '../_lib/types';

export default async function APagarPage() {
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
            .eq('type', 'expense')
            .order('transaction_date', { ascending: false })
            .limit(1000),
        supabase.from('erp_finance_categories').select('*').eq('type', 'expense').order('name'),
    ]);

    return (
        <ContasClient
            mode="pagar"
            accounts={accounts || []}
            transactions={(transactions as unknown as Transaction[]) || []}
            categories={categories || []}
        />
    );
}
