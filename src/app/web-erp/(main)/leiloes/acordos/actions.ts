'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AcordoConfig } from './page';

export async function saveAcordos(acordos: AcordoConfig[]): Promise<{ ok: true } | { ok: false; error: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Não autenticado' };

    const payload = {
        key: 'bula_acordos_criadores',
        value: { acordos, vigencia_default_inicio: '2026-01-01' },
        updated_by: user.id,
    };
    const { error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'key' });

    if (error) return { ok: false, error: error.message };
    revalidatePath('/leiloes/acordos');
    return { ok: true };
}
