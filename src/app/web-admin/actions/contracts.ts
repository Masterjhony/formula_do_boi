'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
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

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

async function ensureBucket(admin: ReturnType<typeof getAdminClient>) {
    const { error } = await admin.storage.createBucket('contracts', { public: true });
    if (error && !error.message.includes('already exists')) throw new Error(error.message);
}

export async function uploadContractFile(formData: FormData): Promise<{ url: string; path: string; name: string }> {
    const file = formData.get('file') as File;
    if (!file) throw new Error('Nenhum arquivo enviado');
    const admin = getAdminClient();
    await ensureBucket(admin);
    const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${Date.now()}_${safeName}`;
    const bytes = await file.arrayBuffer();
    const { error } = await admin.storage.from('contracts').upload(filePath, bytes, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
    });
    if (error) throw new Error(error.message);
    const { data } = admin.storage.from('contracts').getPublicUrl(filePath);
    return { url: data.publicUrl, path: filePath, name: file.name };
}

export async function deleteContractFile(filePath: string): Promise<void> {
    const admin = getAdminClient();
    await admin.storage.from('contracts').remove([filePath]);
}

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
