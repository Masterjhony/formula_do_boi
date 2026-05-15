import { createClient } from '@/utils/supabase/server';
import LeiloesClient from './LeiloesClient';

export default async function LeiloesPage() {
    const supabase = await createClient();

    const [
        { data: accounts },
        { data: transactions },
        { data: categories },
        { data: leiloes },
        { data: fechamentos },
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
        supabase.from('bula_leiloes')
            .select('id, nome, data, criador, status, comissao, comissao_receber, recebido, faturamento_realizado, venda_bula, realizado_bula')
            .order('data', { ascending: false }),
        supabase.from('bula_leilao_fechamento')
            .select('id, nome, data, vgv_total, faturamento_total_leilao, comissao_assessoria, receita_bula, sobra_bruta, por_assessor, lances')
            .order('data', { ascending: false }),
    ]);

    return (
        <LeiloesClient
            accounts={accounts || []}
            transactions={(transactions as any[]) || []}
            categories={categories || []}
            leiloes={(leiloes as any[]) || []}
            fechamentos={(fechamentos as any[]) || []}
        />
    );
}
