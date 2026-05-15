import { createClient } from '@/utils/supabase/server';
import ComissoesClient from './ComissoesClient';

export const dynamic = 'force-dynamic';

export interface AssessorComissao {
    nome: string;
    empresa: string;
    pct: number;
}

export interface ComissoesPadrao {
    vigencia_inicio: string;
    leiloes: {
        descricao: string;
        assessores: AssessorComissao[];
    };
    semen: {
        descricao: string;
        pct_proprio: number;
        pct_residual_indicacao: number;
    };
    embrioes: {
        descricao: string;
        pct_proprio: number;
    };
}

function defaultComissoes(): ComissoesPadrao {
    return {
        vigencia_inicio: '2026-05-01',
        leiloes: {
            descricao: '% da venda atribuída ao assessor no leilão.',
            assessores: [],
        },
        semen: {
            descricao: '12% sobre venda própria; 3% residual para o assessor que indicou.',
            pct_proprio: 0.12,
            pct_residual_indicacao: 0.03,
        },
        embrioes: {
            descricao: '5% sobre venda própria.',
            pct_proprio: 0.05,
        },
    };
}

export default async function ComissoesPage() {
    const supabase = await createClient();
    const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'bula_comissoes_padrao')
        .maybeSingle();

    const initial = (data?.value as ComissoesPadrao | null) ?? defaultComissoes();
    return <ComissoesClient initial={initial} />;
}
