'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ComissoesPadrao } from './page';

export async function saveComissoes(value: ComissoesPadrao): Promise<{ ok: true } | { ok: false; error: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Não autenticado' };

    const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'bula_comissoes_padrao', value, updated_by: user.id }, { onConflict: 'key' });

    if (error) return { ok: false, error: error.message };
    revalidatePath('/leiloes/comissoes');
    return { ok: true };
}
