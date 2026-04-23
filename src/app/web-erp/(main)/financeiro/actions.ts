'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

const PATH = '/web-erp/financeiro';

export async function saveTransaction(data: {
    id?: string;
    account_id: string;
    type: string;
    amount: number;
    description: string;
    transaction_date: string;
    status?: string;
    category_id?: string | null;
    observacao?: string | null;
}) {
    const supabase = await createClient();

    const payload: Record<string, unknown> = {
        account_id: data.account_id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        transaction_date: data.transaction_date,
        status: data.status || 'pending',
        observacao: data.observacao || null,
    };

    if (data.category_id) {
        payload.category_id = data.category_id;
    } else {
        payload.category_id = null;
    }

    try {
        if (data.id) {
            const { error } = await supabase
                .from('erp_finance_transactions')
                .update(payload)
                .eq('id', data.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('erp_finance_transactions')
                .insert([payload]);
            if (error) throw error;
        }

        revalidatePath(PATH);
        return { success: true };
    } catch (error: any) {
        console.error('Error saving transaction:', error);
        return { success: false, error: error.message };
    }
}

export async function updateTransactionStatus(id: string, status: string) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('erp_finance_transactions')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
        revalidatePath(PATH);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTransactionCategory(id: string, categoryId: string | null) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('erp_finance_transactions')
            .update({ category_id: categoryId || null })
            .eq('id', id);
        if (error) throw error;
        revalidatePath(PATH);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function conciliarMultiplos(ids: string[]) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('erp_finance_transactions')
            .update({ status: 'completed' })
            .in('id', ids);
        if (error) throw error;
        revalidatePath(PATH);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTransaction(id: string) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('erp_finance_transactions')
            .delete()
            .eq('id', id);
        if (error) throw error;
        revalidatePath(PATH);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function saveObservacao(id: string, observacao: string) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('erp_finance_transactions')
            .update({ observacao: observacao || null })
            .eq('id', id);
        if (error) throw error;
        revalidatePath(PATH);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ─── Integração com Leilões ───────────────────────────────────────────────
// Lança uma transação pendente no ERP referenciada a um leilão/fechamento.
// `sourceTag` (ex.: "LEILAO:<uuid>" ou "FECHAMENTO:<uuid>:ASSESSOR:<nome>")
// vai no campo `observacao` para servir de chave idempotente.
export async function registrarLeilaoNoErp(data: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    transaction_date: string;
    account_id: string;
    category_id?: string | null;
    sourceTag: string;
}) {
    const supabase = await createClient();

    try {
        // Dedup: se já existe uma transação com o mesmo sourceTag na observação, retorna existente
        const { data: existing } = await supabase
            .from('erp_finance_transactions')
            .select('id')
            .ilike('observacao', `%${data.sourceTag}%`)
            .limit(1);

        if (existing && existing.length > 0) {
            return { success: true, id: existing[0].id, alreadyExists: true };
        }

        const { data: inserted, error } = await supabase
            .from('erp_finance_transactions')
            .insert([{
                type: data.type,
                amount: data.amount,
                description: data.description,
                transaction_date: data.transaction_date,
                account_id: data.account_id,
                category_id: data.category_id || null,
                status: 'pending',
                observacao: `[${data.sourceTag}] Origem: Leilões`,
            }])
            .select('id')
            .single();

        if (error) throw error;

        revalidatePath(PATH);
        return { success: true, id: inserted?.id };
    } catch (error: any) {
        console.error('Error registering leilao in ERP:', error);
        return { success: false, error: error.message };
    }
}

// Lançamento em lote — recebe vários itens e cria todos como pendentes, pulando duplicados.
export async function registrarLeiloesLote(items: Array<{
    type: 'income' | 'expense';
    amount: number;
    description: string;
    transaction_date: string;
    account_id: string;
    category_id?: string | null;
    sourceTag: string;
}>) {
    const supabase = await createClient();
    let created = 0, skipped = 0, failed = 0;

    for (const it of items) {
        try {
            const { data: existing } = await supabase
                .from('erp_finance_transactions')
                .select('id')
                .ilike('observacao', `%${it.sourceTag}%`)
                .limit(1);

            if (existing && existing.length > 0) { skipped++; continue; }

            const { error } = await supabase
                .from('erp_finance_transactions')
                .insert([{
                    type: it.type,
                    amount: it.amount,
                    description: it.description,
                    transaction_date: it.transaction_date,
                    account_id: it.account_id,
                    category_id: it.category_id || null,
                    status: 'pending',
                    observacao: `[${it.sourceTag}] Origem: Leilões`,
                }]);
            if (error) { failed++; continue; }
            created++;
        } catch { failed++; }
    }

    revalidatePath(PATH);
    return { success: true, created, skipped, failed };
}

export async function saveCategory(data: { id?: string; name: string; type: string }) {
    const supabase = await createClient();
    try {
        if (data.id) {
            const { error } = await supabase
                .from('erp_finance_categories')
                .update({ name: data.name, type: data.type })
                .eq('id', data.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('erp_finance_categories')
                .insert([{ name: data.name, type: data.type }]);
            if (error) throw error;
        }
        revalidatePath(PATH);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('erp_finance_categories')
            .delete()
            .eq('id', id);
        if (error) throw error;
        revalidatePath(PATH);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
