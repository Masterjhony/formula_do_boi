import { createClient } from '@/utils/supabase/server';
import FluxoCaixaClient from './FluxoCaixaClient';
import type { Account, Transaction } from '../_lib/types';

export default async function FluxoCaixaPage() {
    const supabase = await createClient();

    const [
        { data: accounts },
        { data: transactions },
    ] = await Promise.all([
        supabase.from('erp_finance_accounts').select('*').order('name'),
        supabase.from('erp_finance_transactions')
            .select(`
                id, amount, type, description, observacao, transaction_date, status, account_id, category_id,
                account:erp_finance_accounts(id, name, type),
                category:erp_finance_categories(id, name, type)
            `)
            .order('transaction_date', { ascending: false })
            .limit(5000),
    ]);

    return (
        <FluxoCaixaClient
            accounts={(accounts as unknown as Account[]) || []}
            transactions={(transactions as unknown as Transaction[]) || []}
        />
    );
}
