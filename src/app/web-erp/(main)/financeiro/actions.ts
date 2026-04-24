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

// ─── Baixa (pagamento/recebimento) ─────────────────────────────────────────
// Marca uma transação como `completed` e opcionalmente atualiza a data/conta
// com a data/local reais em que a quitação ocorreu.
export async function baixarTransacao(data: {
    id: string;
    actualDate?: string;
    accountId?: string | null;
    note?: string | null;
}) {
    const supabase = await createClient();
    try {
        const payload: Record<string, unknown> = { status: 'completed' };
        if (data.actualDate) payload.transaction_date = data.actualDate;
        if (data.accountId) payload.account_id = data.accountId;

        if (data.note && data.note.trim()) {
            const { data: curr } = await supabase
                .from('erp_finance_transactions')
                .select('observacao')
                .eq('id', data.id)
                .maybeSingle();
            const prev = (curr?.observacao ?? '').trim();
            payload.observacao = prev
                ? `${prev}\n[BAIXA ${new Date().toISOString().slice(0, 10)}] ${data.note.trim()}`
                : `[BAIXA ${new Date().toISOString().slice(0, 10)}] ${data.note.trim()}`;
        }

        const { error } = await supabase
            .from('erp_finance_transactions')
            .update(payload)
            .eq('id', data.id);
        if (error) throw error;
        revalidatePath(PATH);
        revalidatePath('/web-erp/financeiro/a-receber');
        revalidatePath('/web-erp/financeiro/a-pagar');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function baixarEmLote(ids: string[], actualDate?: string) {
    const supabase = await createClient();
    try {
        const payload: Record<string, unknown> = { status: 'completed' };
        if (actualDate) payload.transaction_date = actualDate;
        const { error } = await supabase
            .from('erp_finance_transactions')
            .update(payload)
            .in('id', ids);
        if (error) throw error;
        revalidatePath(PATH);
        revalidatePath('/web-erp/financeiro/a-receber');
        revalidatePath('/web-erp/financeiro/a-pagar');
        return { success: true, count: ids.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function reabrirTransacao(id: string) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('erp_finance_transactions')
            .update({ status: 'pending' })
            .eq('id', id);
        if (error) throw error;
        revalidatePath(PATH);
        revalidatePath('/web-erp/financeiro/a-receber');
        revalidatePath('/web-erp/financeiro/a-pagar');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function cancelarTransacao(id: string) {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('erp_finance_transactions')
            .update({ status: 'cancelled' })
            .eq('id', id);
        if (error) throw error;
        revalidatePath(PATH);
        revalidatePath('/web-erp/financeiro/a-receber');
        revalidatePath('/web-erp/financeiro/a-pagar');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Baixa parcial: cria uma nova transação "pagamento/recebimento parcial"
// referenciando a original e reduz a intenção de pagamento restante via
// atualização do valor. Mantém a original como pending até baixa total.
export async function baixaParcial(data: {
    originalId: string;
    amountPaid: number;
    actualDate: string;
    accountId: string;
    note?: string | null;
}) {
    const supabase = await createClient();
    try {
        const { data: original, error: fetchErr } = await supabase
            .from('erp_finance_transactions')
            .select('id, amount, type, description, category_id, observacao, account_id')
            .eq('id', data.originalId)
            .single();
        if (fetchErr || !original) throw fetchErr || new Error('Transação não encontrada');

        const currentAmount = Number(original.amount) || 0;
        const paid = Math.min(data.amountPaid, currentAmount);
        const remaining = currentAmount - paid;

        // 1) cria transação de baixa parcial (completed)
        const { error: insErr } = await supabase
            .from('erp_finance_transactions')
            .insert([{
                type: original.type,
                amount: paid,
                description: `[BAIXA PARCIAL] ${original.description}`,
                transaction_date: data.actualDate,
                account_id: data.accountId,
                category_id: original.category_id || null,
                status: 'completed',
                observacao: `[PARCIAL_OF:${original.id}] ${data.note?.trim() || ''}`.trim(),
            }]);
        if (insErr) throw insErr;

        // 2) atualiza original: se resto for zero → completed; senão → reduz valor
        if (remaining < 0.01) {
            await supabase
                .from('erp_finance_transactions')
                .update({ status: 'completed', amount: currentAmount })
                .eq('id', original.id);
        } else {
            await supabase
                .from('erp_finance_transactions')
                .update({ amount: remaining })
                .eq('id', original.id);
        }

        revalidatePath(PATH);
        revalidatePath('/web-erp/financeiro/a-receber');
        revalidatePath('/web-erp/financeiro/a-pagar');
        return { success: true, paid, remaining };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
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

export async function saveAccount(data: { id?: string; name: string; type: string; initial_balance: number }) {
    const supabase = await createClient();
    try {
        if (data.id) {
            const { error } = await supabase
                .from('erp_finance_accounts')
                .update({ name: data.name, type: data.type, initial_balance: data.initial_balance })
                .eq('id', data.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('erp_finance_accounts')
                .insert([{ name: data.name, type: data.type, initial_balance: data.initial_balance, current_balance: data.initial_balance }]);
            if (error) throw error;
        }
        revalidatePath(PATH);
        revalidatePath('/web-erp/financeiro/conciliacao');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAccount(id: string) {
    const supabase = await createClient();
    try {
        const { count } = await supabase
            .from('erp_finance_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('account_id', id);
        if ((count ?? 0) > 0) {
            return { success: false, error: `Esta conta possui ${count} lançamento(s). Remova-os antes de excluir.` };
        }
        const { error } = await supabase
            .from('erp_finance_accounts')
            .delete()
            .eq('id', id);
        if (error) throw error;
        revalidatePath(PATH);
        revalidatePath('/web-erp/financeiro/conciliacao');
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
