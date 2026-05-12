/**
 * Engine de fluxo da Central WhatsApp
 *
 * O grafo é persistido em site_settings (key='whatsapp_flow_v2') como JSON.
 * Cada inbound do bot é executado por runFlow(), que caminha pelos nós do
 * grafo aplicando ações no CRM e produzindo a resposta final.
 *
 * Tipos de nó:
 *   - start             entrada (1 saída)
 *   - classify          executa classifyMessage(), saída = kind (5 handles)
 *   - condition         avalia uma expressão; saídas 'true' / 'false'
 *   - action            efeito colateral (apply_optout, apply_handoff, etc)
 *   - send_template     busca template por slug, renderiza e armazena reply
 *   - silence           terminal — bot fica em silêncio
 *   - end               terminal — devolve a reply armazenada
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
    classifyMessage,
    INTERESSES,
    renderTemplate,
    firstName,
    ACADEMIA_TAG,
    LISTA_MATHEUS_TAG,
    type Classification,
    type Interesse,
} from './whatsapp-central'

/**
 * Override de slugs por audiência. Quando o lead carrega `ACADEMIA_TAG`,
 * o engine tenta resolver primeiro a variante mapeada aqui; se o template
 * variante não existir/estiver arquivado, cai no slug original.
 *
 * Cobre: welcome, triagens, handoff e confirmação de opt-out. Isso permite
 * usar os mesmos nós do grafo padrão sem precisar de uma cópia do fluxo
 * só para a Academia.
 */
const ACADEMIA_SLUG_OVERRIDES: Record<string, string> = {
    'welcome-default': 'welcome-academia-nelore-po',
    'triagem-semen': 'triagem-semen-academia',
    'triagem-embrioes': 'triagem-embrioes-academia',
    'triagem-leiloes': 'triagem-leiloes-academia',
    'consultor-handoff': 'consultor-handoff-matheus',
    'optout-confirmacao': 'optout-confirmacao-academia',
    'resubscribe-msg': 'resubscribe-msg-academia',
}

function audienceOverrideSlug(slug: string, lead: LeadShape | null): string | null {
    if (!slug || !lead) return null
    const tags = lead.tags_whatsapp ?? []
    if (!tags.includes(ACADEMIA_TAG)) return null
    return ACADEMIA_SLUG_OVERRIDES[slug] ?? null
}

/* ─── Tipos do grafo ───────────────────────────────────────────────── */

export type NodeType =
    | 'start'
    | 'classify'
    | 'condition'
    | 'action'
    | 'send_template'
    | 'silence'
    | 'end'

/**
 * Gatilhos suportados. O grafo pode ter um start node por gatilho — o engine
 * acha o start node certo via `findStartId(graph, trigger)`. Backcompat: um
 * start sem `data.trigger` é tratado como `'inbound'`.
 *
 *   - inbound:  toda inbound recebida pelo VPS (Central WhatsApp). Roda pelo
 *               /api/whatsapp/inbound.
 *   - new_lead: lead novo capturado no CRM (LP, admin, Sheets). Roda pelo
 *               /api/whatsapp/render-welcome quando o VPS pede o template
 *               do welcome — o grafo decide o slug por audiência/condição.
 */
export type TriggerKind = 'inbound' | 'new_lead'

export type ConditionExpr =
    | 'lead.exists'
    | 'lead.optout_whatsapp'
    | 'lead.handoff_humano'
    | 'lead.has_interesse'
    | 'lead.has_menu_sent_tag'
    | 'lead.welcome_eligible' // !has_interesse && !has_menu_sent_tag
    | 'lead.is_academia_audience'    // tags_whatsapp inclui grupo_academia_nelore_po
    | 'lead.is_matheus_audience'     // tags_whatsapp inclui lista_matheus_personalizada

export type ActionKind =
    | 'apply_optout'
    | 'apply_resubscribe'
    | 'apply_handoff'
    | 'apply_interest'
    | 'add_tag'

export interface NodeBase {
    id: string
    position: { x: number; y: number }
    label?: string
}

export interface StartNode extends NodeBase {
    type: 'start'
    /** Gatilho que esse start node responde. Default 'inbound' quando ausente. */
    data?: { trigger?: TriggerKind }
}
export interface ClassifyNode extends NodeBase { type: 'classify' }

export interface ConditionNode extends NodeBase {
    type: 'condition'
    data: { expr: ConditionExpr }
}

export interface ActionNode extends NodeBase {
    type: 'action'
    data: { kind: ActionKind; tag?: string; note?: string }
}

export interface SendTemplateNode extends NodeBase {
    type: 'send_template'
    data: {
        slug: string
        /** se preenchido, ignora `slug` e calcula em runtime */
        dynamic?: 'triagem_by_interesse'
        bot_step?: string
        /** corpo usado se o template não existir no banco */
        fallback?: string
        /** anota no contact_history do lead após enviar */
        contact_note?: string
    }
}

export interface SilenceNode extends NodeBase {
    type: 'silence'
    data: { reason: string }
}

export interface EndNode extends NodeBase {
    type: 'end'
    data?: { bot_step?: string }
}

export type FlowNode =
    | StartNode | ClassifyNode | ConditionNode
    | ActionNode | SendTemplateNode | SilenceNode | EndNode

export interface FlowEdge {
    id: string
    source: string
    target: string
    /** Para classify: 'optout'|'resubscribe'|'human'|'interest'|'unknown'
     *  Para condition: 'true'|'false'
     *  Para os demais: ignorado (qualquer edge serve como saída única) */
    sourceHandle?: string
    label?: string
}

export interface FlowGraphV2 {
    version: 2
    startId: string
    nodes: FlowNode[]
    edges: FlowEdge[]
    updatedAt?: string
    updatedBy?: string | null
}

/* ─── Lead shape compartilhado ─────────────────────────────────────── */

export type ContactEntry = {
    id: string
    type: string
    date: string
    notes?: string | null
    by?: string | null
}

export interface LeadShape {
    id: string
    nome: string
    telefone: string | null
    interesse_principal: string | null
    handoff_humano: boolean | null
    handoff_at: string | null
    optout_whatsapp: boolean | null
    contact_history: ContactEntry[] | null
    contact_count: number | null
    tags_whatsapp: string[] | null
    stage: string | null
    status: string | null
    notes: string | null
}

/* ─── Default graph ────────────────────────────────────────────────── */

/**
 * Reproduz o comportamento real do inbound da Central em forma de grafo.
 *
 * A engine só roda quando uma inbound chega do VPS (após o gate de pausa global
 * em /api/whatsapp/inbound). A primeira mensagem (welcome) é disparada em DOIS
 * lugares e este grafo cobre apenas o segundo — o primeiro está documentado no
 * painel "Como o welcome é disparado" no editor:
 *   • LP/admin: lead novo → dispatchWelcome() respeita opt-out + dedup 24h e
 *     pede ao VPS render-welcome (template welcome-default). NÃO passa por
 *     esta engine.
 *   • Inbound desconhecido: chega aqui, classifica como "sem match", aplica
 *     gates (opt-out / handoff) e envia welcome SE o lead ainda não tem
 *     interesse_principal e não tem a tag whatsapp:menu_enviado — ramo "Sem
 *     match" deste grafo, abaixo.
 *
 * Estrutura do grafo (5 lanes, da esquerda pra direita: opt-out, resubscribe,
 * humano, interesse, sem match):
 *
 *   ─── Subgrafo "Inbound" (trigger='inbound') ────────────────────────
 *   start → classify (5 saídas)
 *   classify[optout]      → action(marcar opt-out)   → send(optout-confirmacao) → end
 *   classify[resubscribe] → action(reativar lead)    → send(resubscribe-msg)    → end
 *   classify[human]       → gate(opt-out?)─sim→ silêncio
 *                                          ─não→ gate(handoff?)─sim→ silêncio
 *                                                                ─não→ action(marcar handoff) → send(consultor-handoff) → end
 *   classify[interest]    → mesmos gates → action(aplicar interesse) → send(triagem dinâmica) → end
 *   classify[unknown]     → mesmos gates → gate(elegível p/ welcome?)
 *                                              ─sim→ action(tag menu_enviado) → send(welcome-default) → end
 *                                              ─não→ silêncio (já foi atendido / já recebeu menu)
 *
 *   ─── Subgrafo "Boas-vindas" (trigger='new_lead') ────────────────────
 *   start[new_lead] → gate(Academia?)─sim→ send(welcome-academia-nelore-po) → end
 *                                     ─não→ gate(Lista Matheus?)
 *                                              ─sim→ send(welcome-matheus-institucional) → end
 *                                              ─não→ send(welcome-default) → end
 *
 *   O `resolveWelcomeDispatch()` percorre só este subgrafo a partir do start
 *   'new_lead' para decidir qual slug o /api/whatsapp/render-welcome deve
 *   renderizar quando o VPS pedir o welcome (chamada do dispatchWelcome).
 */
export function buildDefaultGraph(): FlowGraphV2 {
    // 5 colunas (uma por classificação) — o subgrafo new_lead vai abaixo
    const COL = [80, 380, 680, 980, 1280]
    const ROW = (n: number) => 60 + n * 120

    const n = (
        id: string,
        type: NodeType,
        col: number,
        row: number,
        data?: Record<string, unknown>,
        label?: string,
    ): FlowNode => ({
        id,
        type,
        position: { x: COL[col] ?? COL[2], y: ROW(row) },
        label,
        ...(data ? { data } : {}),
    } as FlowNode)

    const e = (id: string, source: string, target: string, sourceHandle?: string, label?: string): FlowEdge =>
        ({ id, source, target, sourceHandle, label })

    // Linha de base do subgrafo new_lead (abaixo do inbound)
    const NL_BASE_ROW = 13

    const nodes: FlowNode[] = [
        // ── Subgrafo INBOUND (trigger='inbound') ──────────────────────
        n('start', 'start', 2, 0, { trigger: 'inbound' }, 'Início (inbound)'),
        n('classify', 'classify', 2, 1.2, undefined, 'Classifica intenção'),

        // ── Lane 0 — opt-out (cliente pediu para sair) ─────────────────
        n('act_optout', 'action', 0, 3, { kind: 'apply_optout' }, 'Aplica opt-out (CRM + tabela)'),
        n('send_optout', 'send_template', 0, 4.1, {
            slug: 'optout-confirmacao',
            bot_step: 'optout',
            contact_note: 'Lead solicitou opt-out via WhatsApp',
            fallback: 'Tudo certo, {nome}! Você foi removido(a) da nossa lista.',
        }, 'Confirmação de opt-out'),
        n('end_optout', 'end', 0, 5.2, { bot_step: 'optout' }, 'Resposta enviada (opt-out)'),

        // ── Lane 1 — resubscribe (cliente quer voltar) ─────────────────
        n('act_resub', 'action', 1, 3, { kind: 'apply_resubscribe' }, 'Reativa lead (limpa opt-out)'),
        n('send_resub', 'send_template', 1, 4.1, {
            slug: 'resubscribe-msg',
            bot_step: 'resubscribe',
            fallback: 'Que ótimo, {nome}! Você voltou a receber nossas comunicações.',
        }, 'Mensagem de reativação'),
        n('end_resub', 'end', 1, 5.2, { bot_step: 'resubscribe' }, 'Resposta enviada (resubscribe)'),

        // ── Lane 2 — humano (lead pediu falar com gente) ───────────────
        n('h_gate1', 'condition', 2, 3, { expr: 'lead.optout_whatsapp' }, 'Lead em opt-out?'),
        n('h_sil1', 'silence', 2, 3.9, { reason: 'lead_optout' }, 'Silêncio (lead em opt-out)'),
        n('h_gate2', 'condition', 2, 5, { expr: 'lead.handoff_humano' }, 'Já em handoff humano?'),
        n('h_sil2', 'silence', 2, 5.9, { reason: 'lead_handoff' }, 'Silêncio (já em handoff)'),
        n('act_handoff', 'action', 2, 7, { kind: 'apply_handoff' }, 'Marca handoff humano'),
        n('send_handoff', 'send_template', 2, 8.1, {
            slug: 'consultor-handoff',
            bot_step: 'handoff',
            contact_note: 'Lead pediu falar com consultor (handoff)',
            fallback: 'Já te chamo aqui mesmo, {nome}.',
        }, 'Mensagem de handoff'),
        n('end_handoff', 'end', 2, 9.2, { bot_step: 'handoff' }, 'Resposta enviada (handoff)'),

        // ── Lane 3 — interesse classificado ────────────────────────────
        n('i_gate1', 'condition', 3, 3, { expr: 'lead.optout_whatsapp' }, 'Lead em opt-out?'),
        n('i_sil1', 'silence', 3, 3.9, { reason: 'lead_optout' }, 'Silêncio (lead em opt-out)'),
        n('i_gate2', 'condition', 3, 5, { expr: 'lead.handoff_humano' }, 'Já em handoff humano?'),
        n('i_sil2', 'silence', 3, 5.9, { reason: 'lead_handoff' }, 'Silêncio (já em handoff)'),
        n('act_interest', 'action', 3, 7, { kind: 'apply_interest' }, 'Aplica interesse no CRM'),
        n('send_triagem', 'send_template', 3, 8.1, {
            slug: '',
            dynamic: 'triagem_by_interesse',
            bot_step: 'triagem',
            contact_note: 'Interesse identificado',
            fallback: 'Anotado, {nome}! Vou repassar para o time comercial.',
        }, 'Triagem dinâmica (triagem-{interesse})'),
        n('end_interest', 'end', 3, 9.2, { bot_step: 'triagem' }, 'Resposta enviada (triagem)'),

        // ── Lane 4 — sem match (1ª mensagem / welcome) ────────────────
        n('u_gate1', 'condition', 4, 3, { expr: 'lead.optout_whatsapp' }, 'Lead em opt-out?'),
        n('u_sil1', 'silence', 4, 3.9, { reason: 'lead_optout' }, 'Silêncio (lead em opt-out)'),
        n('u_gate2', 'condition', 4, 5, { expr: 'lead.handoff_humano' }, 'Já em handoff humano?'),
        n('u_sil2', 'silence', 4, 5.9, { reason: 'lead_handoff' }, 'Silêncio (já em handoff)'),
        n('u_welcome_elig', 'condition', 4, 7, { expr: 'lead.welcome_eligible' }, '1ª mensagem? (sem interesse e sem menu_enviado)'),
        n('u_sil3', 'silence', 4, 7.9, { reason: 'unknown_intent' }, 'Silêncio (já atendido — não repete welcome)'),
        n('u_mark_tag', 'action', 4, 8.6, { kind: 'add_tag', tag: 'whatsapp:menu_enviado' }, 'Marca tag menu_enviado'),
        n('send_welcome', 'send_template', 4, 9.7, {
            slug: 'welcome-default',
            bot_step: 'welcome',
            fallback: 'Olá {nome}! Seja bem-vindo(a) à Fórmula do Boi.',
        }, 'Envia welcome (1ª mensagem)'),
        n('end_welcome', 'end', 4, 10.8, { bot_step: 'welcome' }, 'Resposta enviada (welcome)'),

        // ── Subgrafo BOAS-VINDAS / NOVO LEAD (trigger='new_lead') ─────
        // Disparado quando o lead é capturado (LP, admin, Sheets) e o VPS
        // pede /api/whatsapp/render-welcome. O `resolveWelcomeDispatch()`
        // anda este subgrafo e devolve o slug do template ao caller.
        n('nl_start', 'start', 0, NL_BASE_ROW, { trigger: 'new_lead' }, 'Início (novo lead)'),
        n('nl_gate_academia', 'condition', 0, NL_BASE_ROW + 1.2, { expr: 'lead.is_academia_audience' }, 'Lead é Academia Nelore P.O?'),
        n('nl_send_academia', 'send_template', 0, NL_BASE_ROW + 2.4, {
            slug: 'welcome-academia-nelore-po',
            bot_step: 'welcome',
            fallback: 'Olá {nome}! Boas-vindas à Academia Nelore P.O.',
        }, 'Welcome — Academia'),
        n('nl_end_academia', 'end', 0, NL_BASE_ROW + 3.6, { bot_step: 'welcome' }, 'Welcome resolvido'),

        n('nl_gate_matheus', 'condition', 2, NL_BASE_ROW + 2.4, { expr: 'lead.is_matheus_audience' }, 'Lead é Lista Matheus?'),
        n('nl_send_matheus', 'send_template', 2, NL_BASE_ROW + 3.6, {
            slug: 'welcome-matheus-institucional',
            bot_step: 'welcome',
            fallback: 'Olá {nome}! Aqui é o Matheus, da Fórmula do Boi.',
        }, 'Welcome — Matheus institucional'),
        n('nl_end_matheus', 'end', 2, NL_BASE_ROW + 4.8, { bot_step: 'welcome' }, 'Welcome resolvido'),

        n('nl_send_default', 'send_template', 4, NL_BASE_ROW + 3.6, {
            slug: 'welcome-default',
            bot_step: 'welcome',
            fallback: 'Olá {nome}! Seja bem-vindo(a) à Fórmula do Boi.',
        }, 'Welcome — Default'),
        n('nl_end_default', 'end', 4, NL_BASE_ROW + 4.8, { bot_step: 'welcome' }, 'Welcome resolvido'),
    ]

    const edges: FlowEdge[] = [
        e('e_start', 'start', 'classify'),

        // optout lane
        e('e_cls_optout', 'classify', 'act_optout', 'optout', 'opt-out'),
        e('e_opt1', 'act_optout', 'send_optout'),
        e('e_opt2', 'send_optout', 'end_optout'),

        // resubscribe lane
        e('e_cls_resub', 'classify', 'act_resub', 'resubscribe', 'resubscribe'),
        e('e_resub1', 'act_resub', 'send_resub'),
        e('e_resub2', 'send_resub', 'end_resub'),

        // human lane
        e('e_cls_human', 'classify', 'h_gate1', 'human', 'humano'),
        e('e_h_g1_T', 'h_gate1', 'h_sil1', 'true', 'sim'),
        e('e_h_g1_F', 'h_gate1', 'h_gate2', 'false', 'não'),
        e('e_h_g2_T', 'h_gate2', 'h_sil2', 'true', 'sim'),
        e('e_h_g2_F', 'h_gate2', 'act_handoff', 'false', 'não'),
        e('e_h_act',  'act_handoff', 'send_handoff'),
        e('e_h_send', 'send_handoff', 'end_handoff'),

        // interest lane
        e('e_cls_int', 'classify', 'i_gate1', 'interest', 'interesse'),
        e('e_i_g1_T', 'i_gate1', 'i_sil1', 'true', 'sim'),
        e('e_i_g1_F', 'i_gate1', 'i_gate2', 'false', 'não'),
        e('e_i_g2_T', 'i_gate2', 'i_sil2', 'true', 'sim'),
        e('e_i_g2_F', 'i_gate2', 'act_interest', 'false', 'não'),
        e('e_i_act',  'act_interest', 'send_triagem'),
        e('e_i_send', 'send_triagem', 'end_interest'),

        // unknown lane
        e('e_cls_unk', 'classify', 'u_gate1', 'unknown', 'sem match'),
        e('e_u_g1_T', 'u_gate1', 'u_sil1', 'true', 'sim'),
        e('e_u_g1_F', 'u_gate1', 'u_gate2', 'false', 'não'),
        e('e_u_g2_T', 'u_gate2', 'u_sil2', 'true', 'sim'),
        e('e_u_g2_F', 'u_gate2', 'u_welcome_elig', 'false', 'não'),
        e('e_u_we_T', 'u_welcome_elig', 'u_mark_tag', 'true', 'sim'),
        e('e_u_we_F', 'u_welcome_elig', 'u_sil3', 'false', 'não'),
        e('e_u_mark', 'u_mark_tag', 'send_welcome'),
        e('e_u_send', 'send_welcome', 'end_welcome'),

        // ── Subgrafo new_lead ─────────────────────────────────────────
        e('e_nl_start', 'nl_start', 'nl_gate_academia'),
        e('e_nl_aca_T', 'nl_gate_academia', 'nl_send_academia', 'true', 'sim'),
        e('e_nl_aca_F', 'nl_gate_academia', 'nl_gate_matheus', 'false', 'não'),
        e('e_nl_aca_send', 'nl_send_academia', 'nl_end_academia'),

        e('e_nl_mat_T', 'nl_gate_matheus', 'nl_send_matheus', 'true', 'sim'),
        e('e_nl_mat_F', 'nl_gate_matheus', 'nl_send_default', 'false', 'não'),
        e('e_nl_mat_send', 'nl_send_matheus', 'nl_end_matheus'),

        e('e_nl_def_send', 'nl_send_default', 'nl_end_default'),
    ]

    return { version: 2, startId: 'start', nodes, edges }
}

/* ─── Validação básica do grafo ────────────────────────────────────── */

export interface GraphValidation {
    valid: boolean
    errors: string[]
    warnings: string[]
}

export function validateGraph(graph: FlowGraphV2): GraphValidation {
    const errors: string[] = []
    const warnings: string[] = []
    const ids = new Set(graph.nodes.map(n => n.id))

    if (!ids.has(graph.startId)) errors.push(`startId "${graph.startId}" não existe nos nós`)
    const starts = graph.nodes.filter(n => n.type === 'start')
    if (starts.length === 0) {
        errors.push('grafo precisa de pelo menos 1 nó "start"')
    } else {
        // Múltiplos starts são permitidos, mas cada um deve ter um trigger
        // único — senão o engine não saberia qual usar.
        const triggersSeen = new Map<TriggerKind, string[]>()
        for (const s of starts) {
            const t = ((s as StartNode).data?.trigger ?? 'inbound') as TriggerKind
            const list = triggersSeen.get(t) ?? []
            list.push(s.id)
            triggersSeen.set(t, list)
        }
        for (const [trigger, nodeIds] of triggersSeen) {
            if (nodeIds.length > 1) {
                errors.push(`múltiplos nós "start" com trigger="${trigger}" (${nodeIds.join(', ')}) — só pode existir 1 entry point por gatilho`)
            }
        }
        if (!triggersSeen.has('inbound')) {
            warnings.push('grafo sem start "inbound" — toda inbound do VPS cairá em silêncio')
        }
        if (!triggersSeen.has('new_lead')) {
            warnings.push('grafo sem start "new_lead" — welcome dispatch usará o fallback hardcoded (welcome-default)')
        }
    }

    for (const edge of graph.edges) {
        if (!ids.has(edge.source)) errors.push(`edge ${edge.id}: source "${edge.source}" não existe`)
        if (!ids.has(edge.target)) errors.push(`edge ${edge.id}: target "${edge.target}" não existe`)
    }

    // Cada classify deve ter 5 handles únicos cobertos (warn se faltar)
    const classifyKinds = ['optout', 'resubscribe', 'human', 'interest', 'unknown']
    for (const node of graph.nodes) {
        if (node.type === 'classify') {
            const out = graph.edges.filter(e => e.source === node.id)
            const handles = new Set(out.map(o => o.sourceHandle))
            for (const k of classifyKinds) {
                if (!handles.has(k)) warnings.push(`classify "${node.id}" sem saída para "${k}" — bot ignora esse caso`)
            }
        }
        if (node.type === 'condition') {
            const out = graph.edges.filter(e => e.source === node.id)
            const handles = new Set(out.map(o => o.sourceHandle))
            if (!handles.has('true'))  warnings.push(`condition "${node.id}" sem saída "true"`)
            if (!handles.has('false')) warnings.push(`condition "${node.id}" sem saída "false"`)
        }
        if (node.type === 'send_template') {
            const d = (node as SendTemplateNode).data
            if (!d.dynamic && !d.slug) errors.push(`send_template "${node.id}": precisa de slug ou dynamic`)
        }
    }

    return { valid: errors.length === 0, errors, warnings }
}

/* ─── Helpers internos ─────────────────────────────────────────────── */

function getSupabase(): SupabaseClient {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

async function fetchTemplateBody(supabase: SupabaseClient, slug: string): Promise<string | null> {
    if (!slug) return null
    const { data } = await supabase
        .from('whatsapp_templates')
        .select('id, body, usage_count')
        .eq('slug', slug)
        .eq('archived', false)
        .single()
    if (!data) return null
    void supabase
        .from('whatsapp_templates')
        .update({ usage_count: (data.usage_count ?? 0) + 1 })
        .eq('id', data.id)
        .then(() => {})
    return data.body
}

/**
 * Resolve o corpo do template considerando a audiência do lead.
 * Se houver variante mapeada em ACADEMIA_SLUG_OVERRIDES e ela existir no
 * banco, ela é preferida; senão, cai para o slug original.
 */
async function fetchTemplateBodyForAudience(
    supabase: SupabaseClient,
    slug: string,
    lead: LeadShape | null,
): Promise<string | null> {
    const override = audienceOverrideSlug(slug, lead)
    if (override) {
        const variant = await fetchTemplateBody(supabase, override)
        if (variant !== null) return variant
    }
    return fetchTemplateBody(supabase, slug)
}

function evaluateCondition(expr: ConditionExpr, lead: LeadShape | null): boolean {
    switch (expr) {
        case 'lead.exists':              return Boolean(lead)
        case 'lead.optout_whatsapp':     return Boolean(lead?.optout_whatsapp)
        case 'lead.handoff_humano':      return Boolean(lead?.handoff_humano)
        case 'lead.has_interesse':       return Boolean(lead?.interesse_principal)
        case 'lead.has_menu_sent_tag':   return (lead?.tags_whatsapp ?? []).includes('whatsapp:menu_enviado')
        case 'lead.welcome_eligible':
            if (!lead) return false
            if (lead.interesse_principal) return false
            return !((lead.tags_whatsapp ?? []).includes('whatsapp:menu_enviado'))
        case 'lead.is_academia_audience':
            return (lead?.tags_whatsapp ?? []).includes(ACADEMIA_TAG)
        case 'lead.is_matheus_audience':
            return (lead?.tags_whatsapp ?? []).includes(LISTA_MATHEUS_TAG)
        default:                         return false
    }
}

async function applyOptOut(supabase: SupabaseClient, phone: string, lead: LeadShape | null) {
    void supabase.from('whatsapp_optouts').upsert({
        phone, lead_id: lead?.id ?? null, reason: 'user_request',
    }, { onConflict: 'phone' })
    if (lead) {
        const now = new Date().toISOString()
        await supabase.from('crm_leads').update({
            optout_whatsapp: true, optout_at: now,
            handoff_humano: true, handoff_at: now,
        }).eq('id', lead.id)
        lead.optout_whatsapp = true
        lead.handoff_humano = true
    }
}

async function applyResubscribe(supabase: SupabaseClient, phone: string, lead: LeadShape | null) {
    if (!lead) return
    await supabase.from('crm_leads').update({
        optout_whatsapp: false, optout_at: null,
    }).eq('id', lead.id)
    void supabase.from('whatsapp_optouts').delete().eq('phone', phone)
    lead.optout_whatsapp = false
}

async function applyHandoff(supabase: SupabaseClient, lead: LeadShape) {
    const update: Record<string, unknown> = {
        handoff_humano: true,
        handoff_at: new Date().toISOString(),
    }
    // Registra o "interesse_principal" como atendimento_humano quando o lead
    // ainda não tinha um interesse identificado — permite filtrar/segmentar
    // depois sem ambiguidade. Não sobrescreve interesses pré-existentes.
    if (!lead.interesse_principal) {
        update.interesse_principal = 'atendimento_humano'
        lead.interesse_principal = 'atendimento_humano'
    }
    await supabase.from('crm_leads').update(update).eq('id', lead.id)
    lead.handoff_humano = true
}

async function applyInteresseAction(supabase: SupabaseClient, lead: LeadShape, interesse: Interesse) {
    const tags = new Set(lead.tags_whatsapp ?? [])
    tags.add(`whatsapp:${interesse}`)
    const interesseLabel = INTERESSES.find(i => i.id === interesse)?.label || interesse
    const update: Record<string, unknown> = {
        interesse_principal: interesse,
        interesse: interesseLabel,
        tags_whatsapp: [...tags],
        last_whatsapp_at: new Date().toISOString(),
    }
    if ((lead.status ?? '') === 'Lead') update.status = 'Qualificado'
    await supabase.from('crm_leads').update(update).eq('id', lead.id)
    lead.interesse_principal = interesse
    lead.tags_whatsapp = [...tags]
    if (update.status) lead.status = String(update.status)
}

async function addTag(supabase: SupabaseClient, lead: LeadShape, tag: string) {
    const tags = new Set(lead.tags_whatsapp ?? [])
    tags.add(tag)
    await supabase.from('crm_leads').update({ tags_whatsapp: [...tags] }).eq('id', lead.id)
    lead.tags_whatsapp = [...tags]
}

async function appendContactHistory(
    supabase: SupabaseClient,
    lead: LeadShape,
    entry: { type: string; notes: string; by?: string | null }
) {
    const history: ContactEntry[] = Array.isArray(lead.contact_history) ? [...lead.contact_history] : []
    history.unshift({
        id: crypto.randomUUID(),
        type: entry.type,
        date: new Date().toISOString(),
        notes: entry.notes,
        by: entry.by ?? 'bot',
    })
    await supabase.from('crm_leads').update({
        contact_history: history,
        contact_count: history.length,
        ultimo_contato: new Date().toISOString(),
        last_whatsapp_at: new Date().toISOString(),
    }).eq('id', lead.id)
    lead.contact_history = history
    lead.contact_count = history.length
}

function logOutbound(
    supabase: SupabaseClient,
    args: { phone: string; name: string; body: string; lead_id: string | null; bot_step: string | null }
) {
    void supabase.from('whatsapp_messages').insert({
        phone: args.phone,
        name: args.name,
        status: 'sent',
        body: args.body,
        direction: 'outbound',
        origin: 'central-bot',
        lead_id: args.lead_id,
        bot_step: args.bot_step,
    }).then(({ error }) => {
        if (error) console.warn('[FlowEngine] logOutbound:', error.message)
    })
}

/* ─── Interpretador ────────────────────────────────────────────────── */

export interface FlowExecutionInput {
    phone: string
    senderName: string
    text: string
    lead: LeadShape | null
    /** Qual gatilho disparou o fluxo. Default 'inbound'. */
    trigger?: TriggerKind
}

export type FlowExecutionResult =
    | { silent: true; reason: string }
    | { reply: string; bot_step: string }

const MAX_HOPS = 60 // proteção anti-loop

/**
 * Resolve o id do start node para um gatilho específico. Procura nós do tipo
 * 'start' com `data.trigger === trigger` (ou sem trigger se trigger==='inbound'
 * — backcompat). Cai em `graph.startId` se nada bater.
 */
export function findStartId(graph: FlowGraphV2, trigger: TriggerKind): string | null {
    for (const node of graph.nodes) {
        if (node.type !== 'start') continue
        const nodeTrigger = (node as StartNode).data?.trigger ?? 'inbound'
        if (nodeTrigger === trigger) return node.id
    }
    // Fallback: pra trigger 'inbound', tenta o startId canônico do grafo
    if (trigger === 'inbound') return graph.startId
    return null
}

export async function runFlow(
    graph: FlowGraphV2,
    input: FlowExecutionInput
): Promise<FlowExecutionResult> {
    const supabase = getSupabase()
    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]))
    const edgesBySource = new Map<string, FlowEdge[]>()
    for (const edge of graph.edges) {
        const list = edgesBySource.get(edge.source) ?? []
        list.push(edge)
        edgesBySource.set(edge.source, list)
    }

    const trigger: TriggerKind = input.trigger ?? 'inbound'
    let currentId: string | null = findStartId(graph, trigger) ?? graph.startId
    const lead = input.lead
    let classification: Classification | null = null
    let pendingReply: string | null = null
    let pendingBotStep: string | null = null
    let hops = 0

    function pickNext(nodeId: string, handle?: string): string | null {
        const out = edgesBySource.get(nodeId) ?? []
        if (handle) {
            const m = out.find(e => e.sourceHandle === handle)
            if (m) return m.target
        }
        const generic = out.find(e => !e.sourceHandle)
        if (generic) return generic.target
        // Se não há generic e há só uma edge, usa ela.
        if (out.length === 1 && !handle) return out[0].target
        return null
    }

    while (currentId && hops < MAX_HOPS) {
        hops++
        const node = nodeMap.get(currentId)
        if (!node) {
            console.error('[FlowEngine] nó não encontrado:', currentId)
            return { silent: true, reason: 'flow_broken' }
        }

        switch (node.type) {
            case 'start': {
                currentId = pickNext(node.id)
                break
            }

            case 'classify': {
                classification = classifyMessage(input.text, { tags: lead?.tags_whatsapp ?? [] })
                currentId = pickNext(node.id, classification.kind)
                break
            }

            case 'condition': {
                const ok = evaluateCondition(node.data.expr, lead)
                currentId = pickNext(node.id, ok ? 'true' : 'false')
                break
            }

            case 'action': {
                const kind = node.data.kind
                if (kind === 'apply_optout') {
                    await applyOptOut(supabase, input.phone, lead)
                } else if (kind === 'apply_resubscribe') {
                    await applyResubscribe(supabase, input.phone, lead)
                } else if (kind === 'apply_handoff') {
                    if (lead) await applyHandoff(supabase, lead)
                } else if (kind === 'apply_interest') {
                    if (lead && classification?.kind === 'interest') {
                        await applyInteresseAction(supabase, lead, classification.interesse)
                    }
                } else if (kind === 'add_tag') {
                    if (lead && node.data.tag) await addTag(supabase, lead, node.data.tag)
                }
                currentId = pickNext(node.id)
                break
            }

            case 'send_template': {
                let slug = node.data.slug
                if (node.data.dynamic === 'triagem_by_interesse') {
                    const c = classification
                    if (c && c.kind === 'interest') {
                        const def = INTERESSES.find(i => i.id === c.interesse)
                        slug = def?.triagem_template_slug ?? slug
                    }
                }
                const tplBody = await fetchTemplateBodyForAudience(supabase, slug, lead)
                const body = tplBody ?? node.data.fallback ?? ''
                const reply = renderTemplate(body, {
                    nome: firstName(lead?.nome) || input.senderName || '',
                })
                pendingReply = reply
                pendingBotStep = node.data.bot_step ?? slug ?? null

                // Log + history (se houver lead)
                if (lead && reply) {
                    logOutbound(supabase, {
                        phone: input.phone,
                        name: lead.nome,
                        body: reply,
                        lead_id: lead.id,
                        bot_step: pendingBotStep,
                    })
                    if (node.data.contact_note) {
                        await appendContactHistory(supabase, lead, {
                            type: 'whatsapp',
                            notes: node.data.contact_note,
                            by: 'bot',
                        })
                    }
                }

                currentId = pickNext(node.id)
                break
            }

            case 'silence': {
                return { silent: true, reason: node.data.reason || 'flow_silence' }
            }

            case 'end': {
                if (!pendingReply) return { silent: true, reason: 'flow_no_reply' }
                return { reply: pendingReply, bot_step: node.data?.bot_step ?? pendingBotStep ?? 'flow' }
            }

            default: {
                const exhaustive: never = node
                console.error('[FlowEngine] tipo desconhecido:', exhaustive)
                return { silent: true, reason: 'flow_unknown_node' }
            }
        }
    }

    if (hops >= MAX_HOPS) {
        console.warn('[FlowEngine] limite de hops atingido')
        return { silent: true, reason: 'flow_max_hops' }
    }
    return { silent: true, reason: 'flow_dead_end' }
}

/* ─── Welcome dispatch (gatilho new_lead) ──────────────────────────── */

/**
 * Resultado de `resolveWelcomeDispatch`. Quando o grafo direciona para um
 * `send_template`, devolvemos o slug + metadados desse nó pra que o
 * `/api/whatsapp/render-welcome` busque o body/mídia/poll do template e
 * renderize. Quando o caminho termina em `silence` ou `end` sem template,
 * devolvemos silent.
 */
export type WelcomeDispatchResult =
    | { silent: true; reason: string }
    | { slug: string; bot_step?: string; fallback?: string }

/**
 * Caminha o grafo a partir do start node com trigger='new_lead' aplicando
 * SOMENTE condições (não roda actions, classify ou send_template). Quando
 * encontra um `send_template`, retorna o slug pra que o caller decida o que
 * fazer (no nosso caso, `/api/whatsapp/render-welcome` renderiza esse slug).
 *
 * Por que não usar `runFlow`? Welcome dispatch é uma decisão SÍNCRONA de
 * qual template usar — não envia mensagem, não logra outbound, não atualiza
 * CRM. O VPS pede o template, o Next.js diz qual usar. As ações (apply_tag,
 * etc.) e logging acontecem no envio real, dentro do `dispatchWelcome` / VPS.
 *
 * Se não existir start node 'new_lead' no grafo, retornamos `silent` com
 * razão `no_new_lead_trigger` — o caller cai no fallback hardcoded.
 */
export function resolveWelcomeDispatch(
    graph: FlowGraphV2,
    lead: LeadShape | null,
): WelcomeDispatchResult {
    const startId = findStartId(graph, 'new_lead')
    if (!startId) return { silent: true, reason: 'no_new_lead_trigger' }

    const nodeMap = new Map(graph.nodes.map(n => [n.id, n]))
    const edgesBySource = new Map<string, FlowEdge[]>()
    for (const edge of graph.edges) {
        const list = edgesBySource.get(edge.source) ?? []
        list.push(edge)
        edgesBySource.set(edge.source, list)
    }

    function pickNext(nodeId: string, handle?: string): string | null {
        const out = edgesBySource.get(nodeId) ?? []
        if (handle) {
            const m = out.find(e => e.sourceHandle === handle)
            if (m) return m.target
        }
        const generic = out.find(e => !e.sourceHandle)
        if (generic) return generic.target
        if (out.length === 1 && !handle) return out[0].target
        return null
    }

    let currentId: string | null = startId
    let hops = 0

    while (currentId && hops < MAX_HOPS) {
        hops++
        const node = nodeMap.get(currentId)
        if (!node) return { silent: true, reason: 'flow_broken' }

        switch (node.type) {
            case 'start': {
                currentId = pickNext(node.id)
                break
            }
            case 'condition': {
                const ok = evaluateCondition(node.data.expr, lead)
                currentId = pickNext(node.id, ok ? 'true' : 'false')
                break
            }
            case 'action': {
                // Welcome dispatch ignora actions — efeitos colaterais (tags,
                // contact_history) acontecem só DEPOIS do envio efetivo. Mas
                // continuamos a caminhada pra não quebrar grafos legados.
                currentId = pickNext(node.id)
                break
            }
            case 'send_template': {
                return {
                    slug: node.data.slug,
                    bot_step: node.data.bot_step,
                    fallback: node.data.fallback,
                }
            }
            case 'silence': {
                return { silent: true, reason: node.data.reason || 'welcome_silence' }
            }
            case 'end': {
                return { silent: true, reason: 'no_template_in_path' }
            }
            case 'classify': {
                // classify não faz sentido em welcome dispatch (não há texto
                // pra classificar). Tratamos como passthrough pra não travar.
                console.warn('[WelcomeDispatch] classify node ignorado em trigger new_lead:', node.id)
                currentId = pickNext(node.id, 'unknown')
                break
            }
            default: {
                const exhaustive: never = node
                console.error('[WelcomeDispatch] tipo desconhecido:', exhaustive)
                return { silent: true, reason: 'flow_unknown_node' }
            }
        }
    }

    if (hops >= MAX_HOPS) {
        console.warn('[WelcomeDispatch] limite de hops atingido')
        return { silent: true, reason: 'flow_max_hops' }
    }
    return { silent: true, reason: 'flow_dead_end' }
}
