'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Contract {
    id: string;
    client_name: string;
    title: string;
    status: 'Ativo' | 'Pendente' | 'Vencido' | 'Cancelado';
    value?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    file_url?: string | null;
    file_path?: string | null;
    file_name?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export type ContractInput = Omit<Contract, 'id' | 'created_at' | 'updated_at'>;

export async function getContracts(): Promise<Contract[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tactical_contracts')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) { console.error('getContracts:', error); return []; }
    return data as Contract[];
}

export async function createContract(input: ContractInput): Promise<Contract> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tactical_contracts')
        .insert([input])
        .select()
        .single();
    if (error) throw new Error(error.message);
    revalidatePath('/web-admin/tactical-plan');
    return data as Contract;
}

export async function updateContract(id: string, input: Partial<ContractInput>): Promise<Contract> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tactical_contracts')
        .update(input)
        .eq('id', id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    revalidatePath('/web-admin/tactical-plan');
    return data as Contract;
}

export async function deleteContract(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from('tactical_contracts')
        .delete()
        .eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/web-admin/tactical-plan');
}
