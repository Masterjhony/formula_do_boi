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
}) {
    const supabase = await createClient();

    const payload: Record<string, unknown> = {
        account_id: data.account_id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        transaction_date: data.transaction_date,
        status: data.status || 'pending',
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
