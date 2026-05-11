import { createClient } from '@/utils/supabase/server';
import ConciliacaoOfxClient from './ConciliacaoOfxClient';

export default async function ConciliacaoOfxPage() {
    const supabase = await createClient();

    const [{ data: accounts }, { data: categories }] = await Promise.all([
        supabase.from('erp_finance_accounts').select('id, name, type').order('name'),
        supabase.from('erp_finance_categories').select('id, name, type').order('name'),
    ]);

    return (
        <ConciliacaoOfxClient
            accounts={accounts || []}
            categories={categories || []}
        />
    );
}
