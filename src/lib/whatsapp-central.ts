/**
 * Central WhatsApp — utilitários compartilhados
 *
 * Este módulo concentra a lógica de classificação do bot, normalização de
 * telefones e renderização de templates. Usado por:
 *   - /api/whatsapp/inbound          (mensagem recebida → classifica e responde)
 *   - /api/whatsapp/render-welcome   (renderiza welcome dinâmico para o VPS)
 *   - /api/whatsapp/templates        (CRUD de templates)
 *   - /api/whatsapp/campaigns/...    (campanhas usam o renderer também)
 */

export type Interesse =
    | 'touros'
    | 'matrizes'
    | 'embrioes'
    | 'semen'
    | 'leiloes'
    | 'venda_genetica'
    | 'consultor'
    | 'outro';

export interface InteresseDef {
    id: Interesse;
    label: string;
    /** Slug do template usado para responder à triagem desse interesse. */
    triagem_template_slug: string;
}

export const INTERESSES: InteresseDef[] = [
    { id: 'touros',          label: 'Touros',                 triagem_template_slug: 'triagem-touros' },
    { id: 'matrizes',        label: 'Matrizes',               triagem_template_slug: 'triagem-matrizes' },
    { id: 'embrioes',        label: 'Embriões',               triagem_template_slug: 'triagem-embrioes' },
    { id: 'semen',           label: 'Sêmen',                  triagem_template_slug: 'triagem-semen' },
    { id: 'leiloes',         label: 'Leilões',                triagem_template_slug: 'triagem-leiloes' },
    { id: 'venda_genetica',  label: 'Venda de genética',      triagem_template_slug: 'triagem-venda-genetica' },
    { id: 'consultor',       label: 'Falar com consultor',    triagem_template_slug: 'consultor-handoff' },
];

/**
 * Normaliza um telefone para o formato armazenado em crm_leads.telefone:
 * apenas dígitos, com DDI (55) à frente. Retorna null se não puder normalizar.
 */
export function normalizePhone(input: string): string | null {
    if (!input) return null;
    let cleaned = input.replace(/\D/g, '');
    if (!cleaned) return null;
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
        // já tem DDI
    } else if (cleaned.length === 10 || cleaned.length === 11) {
        cleaned = `55${cleaned}`;
    }
    if (cleaned.length < 12 || cleaned.length > 13) return null;
    return cleaned;
}

/** Variantes do mesmo número que podem aparecer salvas no CRM histórico. */
export function phoneVariants(phone: string): string[] {
    const variants = new Set<string>();
    const onlyDigits = phone.replace(/\D/g, '');
    if (!onlyDigits) return [];

    variants.add(onlyDigits);
    if (onlyDigits.startsWith('55')) {
        variants.add(onlyDigits.slice(2));
    } else {
        variants.add(`55${onlyDigits}`);
    }

    // Variante sem o nono dígito (números mais antigos no CRM podem ter sido
    // gravados com 10 dígitos: DDD + 8 dígitos).
    const woDdi = onlyDigits.startsWith('55') ? onlyDigits.slice(2) : onlyDigits;
    if (woDdi.length === 11 && woDdi[2] === '9') {
        const drop9 = woDdi.slice(0, 2) + woDdi.slice(3);
        variants.add(drop9);
        variants.add(`55${drop9}`);
    } else if (woDdi.length === 10) {
        const add9 = woDdi.slice(0, 2) + '9' + woDdi.slice(2);
        variants.add(add9);
        variants.add(`55${add9}`);
    }

    return [...variants];
}

const STOP_WORDS = ['parar', 'sair', 'cancelar', 'remover', 'pare', 'descadastrar', 'unsubscribe'];
const RESUBSCRIBE_WORDS = ['voltar', 'reativar', 'reinscrever'];
const HUMAN_WORDS = ['consultor', 'humano', 'atendente', 'pessoa', 'falar com alguem', 'falar com alguém'];

/**
 * Classificação determinística (sem IA) da intenção da mensagem.
 *
 * Regras (em ordem):
 *   1. Opt-out: PARAR / SAIR / CANCELAR…
 *   2. Re-subscribe: VOLTAR / REATIVAR…
 *   3. Pedido explícito de humano: "consultor", "humano", "atendente"…
 *   4. Resposta numérica do menu (1..7).
 *   5. Match por palavras-chave do interesse (touro, matriz, embrião, sêmen, leilão, venda).
 *   6. Caso contrário: 'unknown' — ainda registramos a mensagem mas não
 *      respondemos automaticamente (evita spam do bot quando o lead já está
 *      conversando livremente com a equipe).
 */
export type Classification =
    | { kind: 'optout' }
    | { kind: 'resubscribe' }
    | { kind: 'human' }
    | { kind: 'interest'; interesse: Interesse }
    | { kind: 'unknown' };

export function classifyMessage(text: string): Classification {
    const raw = (text || '').trim();
    if (!raw) return { kind: 'unknown' };
    const lower = raw.toLowerCase();
    const stripped = lower.normalize('NFD').replace(/[̀-ͯ]/g, '');

    if (STOP_WORDS.some(w => stripped === w || stripped === w + '!' || stripped.includes(` ${w}`) || stripped.startsWith(w))) {
        return { kind: 'optout' };
    }
    if (RESUBSCRIBE_WORDS.some(w => stripped === w || stripped.startsWith(w))) {
        return { kind: 'resubscribe' };
    }
    if (HUMAN_WORDS.some(w => stripped.includes(w))) {
        return { kind: 'human' };
    }

    // Match numérico (1-7) — apenas se a mensagem é só o número
    const onlyNumber = raw.match(/^([1-7])\s*[️⃣]?$/);
    if (onlyNumber) {
        const idx = Number(onlyNumber[1]) - 1;
        const inter = INTERESSES[idx];
        if (inter) {
            return inter.id === 'consultor'
                ? { kind: 'human' }
                : { kind: 'interest', interesse: inter.id };
        }
    }

    // Palavras-chave
    if (/\btouros?\b/.test(stripped)) return { kind: 'interest', interesse: 'touros' };
    if (/\bmatriz/.test(stripped))    return { kind: 'interest', interesse: 'matrizes' };
    if (/\bembri/.test(stripped))     return { kind: 'interest', interesse: 'embrioes' };
    if (/\bsemen|\bsemem|\bsêmen/.test(stripped)) return { kind: 'interest', interesse: 'semen' };
    if (/\bleil/.test(stripped))      return { kind: 'interest', interesse: 'leiloes' };
    if (/\bvender?\b|\brevender|venda de genetic/.test(stripped)) return { kind: 'interest', interesse: 'venda_genetica' };

    return { kind: 'unknown' };
}

/**
 * Substitui variáveis em um corpo de template. Aceita {nome}, {name}, etc.
 * Variáveis ausentes viram string vazia (não polui a mensagem com placeholders).
 */
export function renderTemplate(body: string, vars: Record<string, string | null | undefined>): string {
    return body.replace(/\{(\w+)\}/g, (_match, key) => {
        const v = vars[key as keyof typeof vars];
        if (v === null || v === undefined) return '';
        return String(v);
    });
}

/**
 * Primeiro nome de um nome completo — útil para tornar mensagens menos
 * formais e para casar com "{nome}" nos templates.
 */
export function firstName(full?: string | null): string {
    if (!full) return '';
    return full.trim().split(/\s+/)[0] || '';
}
