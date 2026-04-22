'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { CRMConfig, DEFAULT_STAGES, DEFAULT_CRM_CONFIG } from '@/lib/crm-types';

export async function getCRMConfig(): Promise<CRMConfig> {
    const supabase = await createClient();

    const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'crm_config')
        .single();

    if (!data?.value) return DEFAULT_CRM_CONFIG;

    const config = data.value as Partial<CRMConfig>;
    return {
        stages: config.stages?.length ? config.stages : DEFAULT_STAGES,
        custom_fields: config.custom_fields || [],
    };
}

export async function saveCRMConfig(config: CRMConfig): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('site_settings')
        .upsert(
            { key: 'crm_config', value: config, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
        );

    if (error) throw new Error(`Error saving CRM config: ${error.message}`);

    revalidatePath('/web-admin/crm');
}
