import { createClient } from '@/utils/supabase/server';
import AcordosClient from './AcordosClient';

export const dynamic = 'force-dynamic';

export default async function AcordosCriadoresPage() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'bula_acordos_criadores')
        .maybeSingle();

    const acordos = (data?.value as { acordos?: AcordoConfig[] } | null)?.acordos ?? [];

    return <AcordosClient initial={acordos} />;
}

export interface AcordoConfig {
    id: string;
    contraparte: string;
    tipo: 'criador' | 'leiloeira_propria';
    pct_faturamento: number | null;
    pct_venda_cobertura: number | null;
    descricao: string;
    vigencia_inicio: string | null;
    vigencia_fim: string | null;
}
