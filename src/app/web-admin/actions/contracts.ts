'use server';

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export interface ClickSignSignerRecord {
    key: string;
    name: string;
    email: string;
    request_signature_key: string;
    signed_at?: string | null;
}

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
    clicksign_document_key?: string | null;
    clicksign_status?: string | null;
    clicksign_url?: string | null;
    clicksign_signers?: ClickSignSignerRecord[] | null;
    clicksign_sent_at?: string | null;
    clicksign_finished_at?: string | null;
    clicksign_signed_url?: string | null;
    created_at: string;
    updated_at: string;
}

export type ContractInput = Omit<
    Contract,
    | 'id' | 'created_at' | 'updated_at'
    | 'clicksign_document_key' | 'clicksign_status' | 'clicksign_url'
    | 'clicksign_signers' | 'clicksign_sent_at' | 'clicksign_finished_at'
    | 'clicksign_signed_url'
>;

export interface ClickSignSendInput {
    contractId: string;
    signers: Array<{
        name: string;
        email: string;
        phone_number?: string;
        documentation?: string;
        auths?: Array<'email' | 'sms' | 'whatsapp' | 'pix' | 'icp_brasil'>;
        sign_as?: string;
    }>;
    deadlineAt?: string;
    message?: string;
    sequenceEnabled?: boolean;
}

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

// ────────────────────────────────────────────────────────────
// ClickSign — wrappers tipados em volta das rotas /api/clicksign
// ────────────────────────────────────────────────────────────

import {
    sendDocumentForSignature,
    fileUrlToBase64DataUri,
    getDocument as csGetDocument,
    cancelDocument as csCancelDocument,
} from '@/lib/clicksign';

async function getCurrentContract(id: string): Promise<Contract> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('tactical_contracts').select('*').eq('id', id).single();
    if (error || !data) throw new Error('Contrato não encontrado.');
    return data as Contract;
}

export async function sendContractToClickSign(input: ClickSignSendInput): Promise<Contract> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado.');
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') throw new Error('Acesso restrito a administradores.');

    if (!input.signers?.length) throw new Error('Pelo menos um signatário é obrigatório.');
    for (const s of input.signers) {
        if (!s.name?.trim() || !s.email?.trim()) throw new Error('Cada signatário precisa de nome e email.');
    }

    const contract = await getCurrentContract(input.contractId);
    if (contract.clicksign_document_key) {
        throw new Error('Contrato já enviado ao ClickSign. Cancele o anterior antes de reenviar.');
    }
    if (!contract.file_url) throw new Error('Anexe o PDF do contrato antes de enviar para assinatura.');

    const contentBase64 = await fileUrlToBase64DataUri(contract.file_url);
    const filename = (contract.file_name || `contrato-${input.contractId}.pdf`).replace(/[^\w.\- ]+/g, '_');
    const result = await sendDocumentForSignature({
        path: `/Formula do Boi/${filename}`,
        contentBase64,
        signers: input.signers.map(s => ({
            name: s.name,
            email: s.email,
            phone_number: s.phone_number,
            documentation: s.documentation,
            auths: s.auths && s.auths.length ? s.auths : ['email'],
            sign_as: s.sign_as || 'party',
        })),
        deadlineAt: input.deadlineAt,
        message: input.message,
        sequenceEnabled: !!input.sequenceEnabled,
    });

    const signersJson: ClickSignSignerRecord[] = result.signers.map(s => ({
        key: s.key,
        name: s.name,
        email: s.email,
        request_signature_key: s.request_signature_key,
        signed_at: null,
    }));

    const { data: updated, error: uErr } = await supabase
        .from('tactical_contracts')
        .update({
            clicksign_document_key: result.document.key,
            clicksign_status: result.document.status,
            clicksign_url: `https://app.clicksign.com/documents/${result.document.key}`,
            clicksign_signers: signersJson,
            clicksign_sent_at: new Date().toISOString(),
            status: 'Pendente',
        })
        .eq('id', input.contractId)
        .select()
        .single();
    if (uErr) throw new Error(uErr.message);
    revalidatePath('/web-admin/contratos');
    return updated as Contract;
}

export async function syncContractFromClickSign(contractId: string): Promise<Contract> {
    const supabase = await createClient();
    const contract = await getCurrentContract(contractId);
    if (!contract.clicksign_document_key) throw new Error('Contrato não foi enviado ao ClickSign.');

    const doc = await csGetDocument(contract.clicksign_document_key);
    const localSigners = contract.clicksign_signers ?? [];
    const updatedSigners = localSigners.map(local => {
        const remote = doc.signers?.find(r => r.key === local.key);
        return remote ? { ...local, signed_at: remote.signed_at ?? local.signed_at ?? null } : local;
    });
    const isClosed = doc.status === 'closed' || doc.status === 'auto_closed';
    const isCancelled = doc.status === 'cancelled' || doc.status === 'canceled';

    const update: Record<string, unknown> = {
        clicksign_status: doc.status,
        clicksign_signers: updatedSigners,
        clicksign_signed_url: doc.signed_file_url ?? null,
        clicksign_finished_at: isClosed ? (doc.finished_at || new Date().toISOString()) : null,
    };
    if (isClosed && contract.status !== 'Ativo') update.status = 'Ativo';
    if (isCancelled && contract.status !== 'Cancelado') update.status = 'Cancelado';

    const { data, error } = await supabase
        .from('tactical_contracts')
        .update(update)
        .eq('id', contractId)
        .select()
        .single();
    if (error) throw new Error(error.message);
    revalidatePath('/web-admin/contratos');
    return data as Contract;
}

export async function cancelContractClickSign(contractId: string): Promise<Contract> {
    const supabase = await createClient();
    const contract = await getCurrentContract(contractId);
    if (!contract.clicksign_document_key) throw new Error('Contrato sem documento ClickSign vinculado.');

    const doc = await csCancelDocument(contract.clicksign_document_key);
    const { data, error } = await supabase
        .from('tactical_contracts')
        .update({
            clicksign_status: doc.status,
            status: 'Cancelado',
            clicksign_finished_at: new Date().toISOString(),
        })
        .eq('id', contractId)
        .select()
        .single();
    if (error) throw new Error(error.message);
    revalidatePath('/web-admin/contratos');
    return data as Contract;
}
