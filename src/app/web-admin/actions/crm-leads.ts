'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { sendWelcomeMessage } from '@/lib/whatsapp';

export interface CRMLead {
    id: string;
    nome: string;
    status: string;
    prioridade?: string | null;
    interesse?: string | null;
    empresa?: string | null;
    ultimo_contato?: string | null;
    data_estimada_fechamento?: string | null;
    telefone?: string | null;
    celular?: string | null;
    responsavel?: string | null;
    created_at: string;
    updated_at: string;
    position: number;
    // Campos da integração Google Sheets
    instagram?: string | null;
    estado?: string | null;
    cidade?: string | null;
    o_que_busca?: string | null;
    quantidade_animais?: string | null;
    source_page?: string | null;
    source?: string | null;
    medium?: string | null;
    campaign?: string | null;
    data_entrada?: string | null;
}

export async function getLeads(): Promise<CRMLead[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('crm_leads')
        .select('*')
        .order('position', { ascending: true });

    if (error) {
        console.error('Error fetching CRM leads:', error);
        return [];
    }

    return data as CRMLead[];
}

export async function createLead(data: Partial<CRMLead>): Promise<CRMLead> {
    const supabase = await createClient();

    const { data: newLead, error } = await supabase
        .from('crm_leads')
        .insert([data])
        .select()
        .single();

    if (error) {
        throw new Error(`Error creating lead: ${error.message}`);
    }

    if (data.telefone) {
        // Fire and forget welcome message to WhatsApp
        sendWelcomeMessage(data.telefone, data.nome || 'Amigo(a)').catch(e => {
            console.error('[CRM Action] Failed to send WhatsApp message:', e);
        });
    }

    revalidatePath('/web-admin/crm');
    return newLead as CRMLead;
}

export async function updateLead(id: string, data: Partial<CRMLead>): Promise<CRMLead> {
    const supabase = await createClient();

    const { data: updatedLead, error } = await supabase
        .from('crm_leads')
        .update(data)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Error updating lead: ${error.message}`);
    }

    revalidatePath('/web-admin/crm');
    return updatedLead as CRMLead;
}

export async function deleteLead(id: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('crm_leads')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Error deleting lead: ${error.message}`);
    }

    revalidatePath('/web-admin/crm');
}

export async function moveLead(id: string, newStatus: string, newPosition: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('crm_leads')
        .update({
            status: newStatus,
            position: newPosition
        })
        .eq('id', id);

    if (error) {
        throw new Error(`Error moving lead: ${error.message}`);
    }

    revalidatePath('/web-admin/crm');
}
