import type { Transaction, BulaLeilao, FechamentoLite, UnifiedItem } from './types';
import {
    normalizeAssessorNome,
    isFdbAssessor,
} from '@/lib/assessor-normalize';

export const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export const fmtDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const today = () => new Date().toISOString().split('T')[0];

export const parseMoneyText = (raw: unknown): number => {
    if (raw == null) return 0;
    if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;
    const s = String(raw).trim();
    if (!s) return 0;
    const clean = s.replace(/[^\d,.\-]/g, '').replace(/\./g, '').replace(',', '.');
    const v = parseFloat(clean);
    return isNaN(v) ? 0 : v;
};

// Dias de atraso (negativo = futuro). Usa UTC para evitar fuso.
export const daysOverdue = (dueDate: string): number => {
    if (!dueDate) return 0;
    const due = new Date(dueDate + 'T00:00:00Z').getTime();
    const now = new Date(today() + 'T00:00:00Z').getTime();
    return Math.round((now - due) / 86400000);
};

export type AgingBucket = 'overdue' | 'today' | 'd7' | 'd30' | 'd90' | 'future';

export const bucketOf = (dueDate: string): AgingBucket => {
    const d = daysOverdue(dueDate);
    if (d > 0) return 'overdue';
    if (d === 0) return 'today';
    if (d >= -7) return 'd7';
    if (d >= -30) return 'd30';
    if (d >= -90) return 'd90';
    return 'future';
};

export const BUCKET_LABELS: Record<AgingBucket, string> = {
    overdue: 'Vencidas',
    today: 'Vence hoje',
    d7: 'Próx. 7 dias',
    d30: 'Próx. 30 dias',
    d90: 'Próx. 90 dias',
    future: 'Futuro',
};

export const BUCKET_COLORS: Record<AgingBucket, string> = {
    overdue: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    today: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    d7: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    d30: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    d90: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    future: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

// ─── Extrai tag [X:Y] da observação de uma transação ─────────────────────
export const extractSourceTag = (obs: string | null | undefined): string | null => {
    if (!obs) return null;
    const m = obs.match(/\[([A-Z]+:[^\]]+)\]/);
    return m ? m[1] : null;
};

// ─── Quem paga a Receita Bula em cada leilão ─────────────────────────────
// Bula Assessoria emite a receita CONTRA o organizador/leiloeira do evento.
// Para leilões onde a Bula Remates é a leiloeira, ela é a pagadora.
// Para leilões assessorados por Bula em casas de terceiros, o pagador é o criador/leiloeira contratante.
const RECEITA_BULA_PAGADOR: Array<{ match: RegExp; pagador: string }> = [
    { match: /JMP/i,                              pagador: 'JMP' },
    { match: /Terra\s*Brava/i,                    pagador: 'Terra Brava' },
    { match: /IPB/i,                              pagador: 'Bula Remates' },
    { match: /Cachoeir/i,                         pagador: 'Bula Remates' },
    { match: /MRA/i,                              pagador: 'Bula Remates' },
    { match: /Vanguard/i,                         pagador: 'Bula Remates' },
];
const pagadorDoLeilao = (nomeLeilao: string): string => {
    for (const r of RECEITA_BULA_PAGADOR) if (r.match.test(nomeLeilao)) return r.pagador;
    return 'Bula Remates';
};

// ─── Constrói lista unificada: A RECEBER ─────────────────────────────────
// Combina:
//   • transactions ERP (type=income)
//   • leilões (comissao_receber − recebido) — se não houver transação linkada
//   • fechamentos (receita_bula) — se não houver transação linkada
export function buildReceivables(
    transactions: Transaction[],
    leiloes: BulaLeilao[],
    fechamentos: FechamentoLite[],
): UnifiedItem[] {
    const out: UnifiedItem[] = [];
    const linkedTags = new Set<string>();

    for (const tx of transactions) {
        if (tx.type !== 'income') continue;
        if (tx.status === 'cancelled') continue;
        const tag = extractSourceTag(tx.observacao);
        if (tag) linkedTags.add(tag);

        out.push({
            key: `tx:${tx.id}`,
            sourceTag: tag,
            source: 'erp',
            txId: tx.id,
            status: tx.status as 'pending' | 'completed' | 'cancelled',
            type: 'income',
            title: tx.description,
            subtitle: tx.category?.name || '— Sem categoria',
            party: tx.category?.name || '',
            dueDate: tx.transaction_date,
            amount: Number(tx.amount) || 0,
            paid: tx.status === 'completed' ? Number(tx.amount) || 0 : 0,
            balance: tx.status === 'completed' ? 0 : Number(tx.amount) || 0,
            accountId: tx.account_id,
            accountName: tx.account?.name || null,
            categoryId: tx.category_id || null,
            categoryName: tx.category?.name || null,
            observacao: tx.observacao || null,
            refId: null,
        });
    }

    for (const l of leiloes) {
        const total = parseMoneyText(l.comissao_receber);
        const rec = parseMoneyText(l.recebido);
        const saldo = total - rec;
        if (saldo <= 0) continue;
        const tag = `LEILAO:${l.id}`;
        if (linkedTags.has(tag)) continue;
        out.push({
            key: `leilao:${l.id}`,
            sourceTag: tag,
            source: 'leilao',
            txId: null,
            status: 'virtual',
            type: 'income',
            title: `Comissão — ${l.nome}`,
            subtitle: `Leilão · ${l.criador || '—'}`,
            party: l.criador || '—',
            dueDate: l.data || today(),
            amount: total,
            paid: rec,
            balance: saldo,
            accountId: null,
            accountName: null,
            categoryId: null,
            categoryName: null,
            observacao: null,
            refId: l.id,
        });
    }

    for (const f of fechamentos) {
        const receita = Number(f.receita_bula) || 0;
        if (receita <= 0) continue;
        const tag = `FECHAMENTO:${f.id}:RECEITA`;
        if (linkedTags.has(tag)) continue;
        out.push({
            key: `fech:${f.id}`,
            sourceTag: tag,
            source: 'fechamento',
            txId: null,
            status: 'virtual',
            type: 'income',
            title: `Receita Bula — ${f.nome}`,
            subtitle: `Fechamento de leilão`,
            party: pagadorDoLeilao(f.nome),
            dueDate: f.data || today(),
            amount: receita,
            paid: 0,
            balance: receita,
            accountId: null,
            accountName: null,
            categoryId: null,
            categoryName: null,
            observacao: null,
            refId: f.id,
        });
    }

    return out.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
}

// ─── Constrói lista unificada: A PAGAR ───────────────────────────────────
export function buildPayables(
    transactions: Transaction[],
    fechamentos: FechamentoLite[],
): UnifiedItem[] {
    const out: UnifiedItem[] = [];
    const linkedTags = new Set<string>();

    for (const tx of transactions) {
        if (tx.type !== 'expense') continue;
        if (tx.status === 'cancelled') continue;
        const tag = extractSourceTag(tx.observacao);
        if (tag) linkedTags.add(tag);

        out.push({
            key: `tx:${tx.id}`,
            sourceTag: tag,
            source: 'erp',
            txId: tx.id,
            status: tx.status as 'pending' | 'completed' | 'cancelled',
            type: 'expense',
            title: tx.description,
            subtitle: tx.category?.name || '— Sem categoria',
            party: tx.category?.name || '',
            dueDate: tx.transaction_date,
            amount: Number(tx.amount) || 0,
            paid: tx.status === 'completed' ? Number(tx.amount) || 0 : 0,
            balance: tx.status === 'completed' ? 0 : Number(tx.amount) || 0,
            accountId: tx.account_id,
            accountName: tx.account?.name || null,
            categoryId: tx.category_id || null,
            categoryName: tx.category?.name || null,
            observacao: tx.observacao || null,
            refId: null,
        });
    }

    for (const f of fechamentos) {
        const comissaoTotal = Number(f.comissao_assessoria) || 0;
        if (comissaoTotal <= 0) continue;
        // Considera APENAS assessores do roster FdB (Bulinha, Marcelo Carneiro,
        // Pedro Barnabé→Marcelo, Matheus Amormino→Marcelo) — regra dos 2% FdB.
        // Bula tem rotina própria e fica de fora da distribuição automática.
        const assessorMap = new Map<string, { nome: string; empresa: string; vgv: number; vgvBreakdown: Array<{ nome: string; vgv: number }> }>();
        for (const a of f.por_assessor ?? []) {
            if (!isFdbAssessor(a?.nome)) continue;
            const canon = normalizeAssessorNome(a?.nome);
            if (!canon) continue;
            const vgvA = Number(a?.vgv) || 0;
            const cur = assessorMap.get(canon) ?? { nome: canon, empresa: a?.empresa || '', vgv: 0, vgvBreakdown: [] };
            cur.vgv += vgvA;
            if (!cur.empresa && a?.empresa) cur.empresa = a.empresa;
            // Guarda contribuição do nome ORIGINAL para discriminar quando
            // houve centralização (Pedro/Matheus → Marcelo).
            const originalNome = (a?.nome || '').trim();
            if (originalNome && originalNome !== canon) {
                cur.vgvBreakdown.push({ nome: originalNome, vgv: vgvA });
            }
            assessorMap.set(canon, cur);
        }
        const assessores = Array.from(assessorMap.values());
        const totalVgv = assessores.reduce((s, a) => s + a.vgv, 0);

        if (assessores.length > 0 && totalVgv > 0) {
            for (const a of assessores) {
                const share = a.vgv / totalVgv;
                const valor = comissaoTotal * share;
                if (valor < 0.01) continue;
                const key = a.nome.toUpperCase().replace(/\s+/g, '_').slice(0, 40);
                const tag = `FECHAMENTO:${f.id}:ASSESSOR:${key}`;
                if (linkedTags.has(tag)) continue;
                // Quando houve centralização (Pedro/Matheus → Marcelo), enriquece
                // subtitle/observacao com a discriminação por nome original.
                const incluiOriginais = a.vgvBreakdown.filter(b => b.vgv > 0);
                const subtitleBase = a.empresa || 'Assessoria';
                const subtitle = incluiOriginais.length
                    ? `${subtitleBase} · pago a ${a.nome} · inclui ${incluiOriginais.map(b => b.nome).join(' · ')}`
                    : subtitleBase;
                const observacao = incluiOriginais.length
                    ? `Comissão FdB 2% paga a ${a.nome}. Discriminação por assessor original: ${incluiOriginais
                          .map(b => `${b.nome} R$ ${(comissaoTotal * (b.vgv / totalVgv)).toFixed(2)} (VGV R$ ${b.vgv.toFixed(2)})`)
                          .join(' · ')}.`
                    : null;
                out.push({
                    key: `fech-asses:${f.id}:${key}`,
                    sourceTag: tag,
                    source: 'fechamento',
                    txId: null,
                    status: 'virtual',
                    type: 'expense',
                    title: `Comissão ${a.nome} — ${f.nome}`,
                    subtitle,
                    party: a.nome,
                    dueDate: f.data || today(),
                    amount: valor,
                    paid: 0,
                    balance: valor,
                    accountId: null,
                    accountName: null,
                    categoryId: null,
                    categoryName: null,
                    observacao,
                    refId: f.id,
                });
            }
        } else {
            const tag = `FECHAMENTO:${f.id}:COMISSAO`;
            if (linkedTags.has(tag)) continue;
            out.push({
                key: `fech-comissao:${f.id}`,
                sourceTag: tag,
                source: 'fechamento',
                txId: null,
                status: 'virtual',
                type: 'expense',
                title: `Comissão assessoria — ${f.nome}`,
                subtitle: 'Equipe de assessoria',
                party: 'Equipe de assessoria',
                dueDate: f.data || today(),
                amount: comissaoTotal,
                paid: 0,
                balance: comissaoTotal,
                accountId: null,
                accountName: null,
                categoryId: null,
                categoryName: null,
                observacao: null,
                refId: f.id,
            });
        }
    }

    return out.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
}

// ─── Export CSV ─────────────────────────────────────────────────────────
export function toCSV(items: UnifiedItem[], title: string): string {
    const rows = [
        ['Vencimento', 'Parte', 'Descrição', 'Categoria', 'Conta', 'Valor', 'Pago', 'Saldo', 'Status', 'Origem'],
        ...items.map(i => [
            i.dueDate,
            i.party,
            i.title,
            i.categoryName || '',
            i.accountName || '',
            i.amount.toFixed(2).replace('.', ','),
            i.paid.toFixed(2).replace('.', ','),
            i.balance.toFixed(2).replace('.', ','),
            i.status,
            i.source,
        ]),
    ];
    return `# ${title}\n` + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
}

export function downloadCSV(filename: string, csv: string) {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
