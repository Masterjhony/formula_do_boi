'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { CRMConfig, CRMFunnel, DEFAULT_STAGES, DEFAULT_CRM_CONFIG } from '@/lib/crm-types';

export async function getCRMConfig(): Promise<CRMConfig> {
    const supabase = await createClient();

    const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'crm_config')
        .single();

    if (!data?.value) return DEFAULT_CRM_CONFIG;

    const config = data.value as Partial<CRMConfig>;
    const stages = config.stages?.length ? config.stages : DEFAULT_STAGES;
    const custom_fields = config.custom_fields || [];

    // Migrate: if no funnels array, build one from existing stages/custom_fields
    let funnels: CRMFunnel[] = config.funnels || [];
    if (funnels.length === 0) {
        funnels = [{ id: 'default', name: 'Pipeline Principal', color: 'yellow', stages, custom_fields }];
    }

    return {
        stages,
        custom_fields,
        funnels,
        responsaveis: config.responsaveis || [],
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
