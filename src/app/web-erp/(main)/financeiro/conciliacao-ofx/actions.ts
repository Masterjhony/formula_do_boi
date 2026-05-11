'use server';

import { createClient } from '@/utils/supabase/server';
import { parseOfx, findMatches, type OfxTransaction, type MatchSuggestion, type MatchableTransaction } from '../_lib/ofx-parser';

export interface OfxLineWithMatches extends OfxTransaction {
    suggestions: MatchSuggestion[];
    alreadyLinkedTo: string | null;   // id da transação já vinculada (se houver)
    ignored: boolean;                 // se o FITID está marcado como ignorado
}

export interface AnalyzeOfxResult {
    success: boolean;
    error?: string;
    accountId?: string;
    summary?: {
        bankId: string | null;
        accountIdRaw: string | null;
        dateStart: string | null;
        dateEnd: string | null;
        ledgerBalance: number | null;
        ledgerDate: string | null;
        totalTrn: number;
        alreadyLinked: number;
        ignored: number;
        unlinked: number;
    };
    lines?: OfxLineWithMatches[];
}

// Recebe o texto do OFX + a conta-alvo do ERP, faz parse e devolve cada
// STMTTRN com seus candidatos (transações pendentes do ERP que casam por
// tipo+valor+data). Não persiste nada — é puro de leitura.
export async function analyzeOfx(formData: FormData): Promise<AnalyzeOfxResult> {
    try {
        const file = formData.get('file') as File | null;
        const accountId = formData.get('accountId') as string | null;
        const dayWindow = parseInt((formData.get('dayWindow') as string) || '7', 10);

        if (!accountId) return { success: false, error: 'Selecione a conta de destino.' };
        if (!file) return { success: false, error: 'Anexe o arquivo OFX.' };

        const raw = await file.text();
        const stmt = parseOfx(raw);
        if (!stmt.transactions.length) {
            return { success: false, error: 'OFX sem transações reconhecíveis.' };
        }

        const supabase = await createClient();

        // Candidatos: tudo da conta nos últimos 90 dias E nos dias do extrato + janela
        const dateStart = stmt.dateStart ?? stmt.transactions[stmt.dateEnd ? stmt.transactions.length - 1 : 0].date;
        const dateEnd = stmt.dateEnd ?? stmt.transactions[0].date;
        const widenStart = shiftDate(dateStart, -dayWindow);
        const widenEnd = shiftDate(dateEnd, dayWindow);

        const { data: candidates, error: candErr } = await supabase
            .from('erp_finance_transactions')
            .select('id, account_id, type, amount, description, transaction_date, status, observacao, ofx_fitid')
            .eq('account_id', accountId)
            .gte('transaction_date', widenStart)
            .lte('transaction_date', widenEnd)
            .order('transaction_date', { ascending: false })
            .limit(2000);
        if (candErr) throw candErr;

        const { data: ignoredRows } = await supabase
            .from('erp_finance_ofx_ignored')
            .select('fitid')
            .eq('account_id', accountId);
        const ignoredSet = new Set((ignoredRows || []).map(r => r.fitid));

        // Já vinculados: olhamos o ofx_fitid das transações
        const linkedByFitid = new Map<string, string>();
        for (const c of (candidates as MatchableTransaction[]) || []) {
            if (c.ofx_fitid) linkedByFitid.set(c.ofx_fitid, c.id);
        }

        const lines: OfxLineWithMatches[] = stmt.transactions.map(tx => {
            const linkedId = linkedByFitid.get(tx.fitid) ?? null;
            const ignored = ignoredSet.has(tx.fitid);
            // Sugestões só fazem sentido se não estiver linkada ainda
            const suggestions = linkedId
                ? []
                : findMatches(tx, accountId, (candidates as MatchableTransaction[]) || [], { dayWindow });
            return { ...tx, alreadyLinkedTo: linkedId, ignored, suggestions };
        });

        const alreadyLinked = lines.filter(l => l.alreadyLinkedTo).length;
        const ignoredCount = lines.filter(l => l.ignored).length;
        const unlinked = lines.length - alreadyLinked - ignoredCount;

        return {
            success: true,
            accountId,
            summary: {
                bankId: stmt.bankId,
                accountIdRaw: stmt.accountId,
                dateStart: stmt.dateStart,
                dateEnd: stmt.dateEnd,
                ledgerBalance: stmt.ledgerBalance,
                ledgerDate: stmt.ledgerDate,
                totalTrn: lines.length,
                alreadyLinked,
                ignored: ignoredCount,
                unlinked,
            },
            lines,
        };
    } catch (e: any) {
        return { success: false, error: e?.message || 'Falha ao analisar OFX.' };
    }
}

function shiftDate(iso: string, days: number): string {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
}
