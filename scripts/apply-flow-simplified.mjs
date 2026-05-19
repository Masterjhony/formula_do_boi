/**
 * Reseta o grafo da Central WhatsApp pra versão simplificada:
 *   - Welcome só dispara no subgrafo new_lead (lead cadastrado no CRM).
 *   - Inbound espontâneo de estranho → silêncio (Matheus trata pelo Inbox).
 *   - Lane human só responde dentro da janela do welcome v2 (resposta "1"),
 *     enviando o link de agendamento. Fora dessa janela → silêncio.
 *   - Lane interest: bate-papo pendente → menu de interesses (bate-papo-recusado);
 *     senão → triagem dinâmica por interesse.
 *   - Lanes opt-out e resubscribe mantidas (LGPD + conveniência).
 *
 * Atualiza a linha `is_active=true` em `whatsapp_flows` com o grafo abaixo.
 * Preserva `settings`, `name`, `description`, `is_active`.
 *
 * O JSON do grafo aqui é o output de `buildDefaultGraph()` em
 * src/lib/whatsapp-flow-engine.ts — mantém em sincronia se mudar de lá.
 *
 * Uso:
 *   node --env-file=.env.local scripts/apply-flow-simplified.mjs
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
    console.error('❌ Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
    process.exit(1)
}

const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
})

// Helpers — espelham os do buildDefaultGraph()
const COL = [80, 380, 680, 980, 1280]
const ROW = (r) => 60 + r * 120
const n = (id, type, col, row, data, label) => ({
    id,
    type,
    position: { x: COL[col] ?? COL[2], y: ROW(row) },
    label,
    ...(data ? { data } : {}),
})
const e = (id, source, target, sourceHandle, label) => ({ id, source, target, sourceHandle, label })

const BATE_PAPO_PENDENTE_TAG = 'whatsapp:bate_papo_pendente'
const BATE_PAPO_ACEITO_TAG = 'whatsapp:bate_papo_aceito'
const MENU_INTERESSES_V2_TAG = 'whatsapp:menu_interesses_v2'

const NL_BASE_ROW = 13

const nodes = [
    // ── Subgrafo INBOUND ──────────────────────────────────────────
    n('start', 'start', 2, 0, { trigger: 'inbound' }, 'Início (inbound)'),
    n('classify', 'classify', 2, 1.2, undefined, 'Classifica intenção'),

    // Lane 0 — opt-out
    n('act_optout', 'action', 0, 3, { kind: 'apply_optout' }, 'Aplica opt-out (CRM + tabela)'),
    n('send_optout', 'send_template', 0, 4.1, {
        slug: 'optout-confirmacao',
        bot_step: 'optout',
        contact_note: 'Lead solicitou opt-out via WhatsApp',
        fallback: 'Tudo certo, {nome}! Você foi removido(a) da nossa lista.',
    }, 'Confirmação de opt-out'),
    n('end_optout', 'end', 0, 5.2, { bot_step: 'optout' }, 'Resposta enviada (opt-out)'),

    // Lane 1 — resubscribe
    n('act_resub', 'action', 1, 3, { kind: 'apply_resubscribe' }, 'Reativa lead (limpa opt-out)'),
    n('send_resub', 'send_template', 1, 4.1, {
        slug: 'resubscribe-msg',
        bot_step: 'resubscribe',
        fallback: 'Que ótimo, {nome}! Você voltou a receber nossas comunicações.',
    }, 'Mensagem de reativação'),
    n('end_resub', 'end', 1, 5.2, { bot_step: 'resubscribe' }, 'Resposta enviada (resubscribe)'),

    // Lane 2 — humano (só responde na janela do welcome v2)
    n('h_gate1', 'condition', 2, 3, { expr: 'lead.optout_whatsapp' }, 'Lead em opt-out?'),
    n('h_sil1', 'silence', 2, 3.9, { reason: 'lead_optout' }, 'Silêncio (lead em opt-out)'),
    n('h_gate2', 'condition', 2, 5, { expr: 'lead.handoff_humano' }, 'Já em handoff humano?'),
    n('h_sil2', 'silence', 2, 5.9, { reason: 'lead_handoff' }, 'Silêncio (já em handoff)'),
    n('h_gate_bp', 'condition', 2, 7, { expr: 'lead.is_bate_papo_pendente' }, 'Bate-papo pendente? (resposta ao welcome v2)'),
    n('h_sil_manual', 'silence', 2, 7.9, { reason: 'human_manual' }, 'Silêncio (Matheus trata manual pelo Inbox)'),
    n('h_act_handoff', 'action', 2, 9, { kind: 'apply_handoff' }, 'Marca handoff humano'),
    n('h_bp_swap_tags', 'action', 2, 10.1, { kind: 'add_tag', tag: BATE_PAPO_ACEITO_TAG }, 'Marca tag bate-papo aceito'),
    n('h_bp_clear', 'action', 2, 11.2, { kind: 'remove_tag', tag: BATE_PAPO_PENDENTE_TAG }, 'Limpa tag bate-papo pendente'),
    n('send_bp_aceito', 'send_template', 2, 12.3, {
        slug: 'bate-papo-aceito',
        bot_step: 'bate_papo_aceito',
        contact_note: 'Lead aceitou bate-papo — link de agendamento enviado',
        fallback: 'Que ótimo, {nome}! Vou te mandar o link da agenda.',
    }, 'Envia bate-papo-aceito (link agendamento)'),
    n('end_bp_aceito', 'end', 2, 13.4, { bot_step: 'bate_papo_aceito' }, 'Resposta enviada (bate-papo aceito)'),

    // Lane 3 — interesse
    n('i_gate1', 'condition', 3, 3, { expr: 'lead.optout_whatsapp' }, 'Lead em opt-out?'),
    n('i_sil1', 'silence', 3, 3.9, { reason: 'lead_optout' }, 'Silêncio (lead em opt-out)'),
    n('i_gate2', 'condition', 3, 5, { expr: 'lead.handoff_humano' }, 'Já em handoff humano?'),
    n('i_sil2', 'silence', 3, 5.9, { reason: 'lead_handoff' }, 'Silêncio (já em handoff)'),
    n('act_interest', 'action', 3, 7, { kind: 'apply_interest' }, 'Aplica interesse no CRM'),
    n('i_gate_bp', 'condition', 3, 8.1, { expr: 'lead.is_bate_papo_pendente' }, 'Bate-papo pendente?'),
    n('i_bp_swap_tags', 'action', 4, 9.2, { kind: 'add_tag', tag: MENU_INTERESSES_V2_TAG }, 'Marca tag menu_interesses_v2'),
    n('i_bp_clear', 'action', 4, 10.3, { kind: 'remove_tag', tag: BATE_PAPO_PENDENTE_TAG }, 'Limpa tag bate-papo pendente'),
    n('send_bp_recusado', 'send_template', 4, 11.4, {
        slug: 'bate-papo-recusado',
        bot_step: 'bate_papo_recusado',
        contact_note: 'Lead recusou bate-papo — menu de interesses enviado',
        fallback: 'Combinado, {nome}. Me responde com o número que mais faz sentido pro seu momento.',
    }, 'Envia bate-papo-recusado (menu interesses)'),
    n('end_bp_recusado', 'end', 4, 12.5, { bot_step: 'bate_papo_recusado' }, 'Resposta enviada (bate-papo recusado)'),
    n('send_triagem', 'send_template', 3, 9.2, {
        slug: '',
        dynamic: 'triagem_by_interesse',
        bot_step: 'triagem',
        contact_note: 'Interesse identificado',
        fallback: 'Anotado, {nome}! Vou repassar para o time comercial.',
    }, 'Triagem dinâmica (triagem-{interesse})'),
    n('end_interest', 'end', 3, 10.3, { bot_step: 'triagem' }, 'Resposta enviada (triagem)'),

    // Lane 4 — sem match: silêncio direto
    n('u_sil', 'silence', 4, 3, { reason: 'unknown_intent_no_auto_welcome' }, 'Silêncio (Matheus trata manual)'),

    // ── Subgrafo NEW_LEAD ─────────────────────────────────────────
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

const edges = [
    e('e_start', 'start', 'classify'),

    e('e_cls_optout', 'classify', 'act_optout', 'optout', 'opt-out'),
    e('e_opt1', 'act_optout', 'send_optout'),
    e('e_opt2', 'send_optout', 'end_optout'),

    e('e_cls_resub', 'classify', 'act_resub', 'resubscribe', 'resubscribe'),
    e('e_resub1', 'act_resub', 'send_resub'),
    e('e_resub2', 'send_resub', 'end_resub'),

    e('e_cls_human', 'classify', 'h_gate1', 'human', 'humano'),
    e('e_h_g1_T', 'h_gate1', 'h_sil1', 'true', 'sim'),
    e('e_h_g1_F', 'h_gate1', 'h_gate2', 'false', 'não'),
    e('e_h_g2_T', 'h_gate2', 'h_sil2', 'true', 'sim'),
    e('e_h_g2_F', 'h_gate2', 'h_gate_bp', 'false', 'não'),
    e('e_h_bp_T', 'h_gate_bp', 'h_act_handoff', 'true', 'sim'),
    e('e_h_bp_F', 'h_gate_bp', 'h_sil_manual', 'false', 'não'),
    e('e_h_act', 'h_act_handoff', 'h_bp_swap_tags'),
    e('e_h_bp_swap', 'h_bp_swap_tags', 'h_bp_clear'),
    e('e_h_bp_clear', 'h_bp_clear', 'send_bp_aceito'),
    e('e_h_bp_send', 'send_bp_aceito', 'end_bp_aceito'),

    e('e_cls_int', 'classify', 'i_gate1', 'interest', 'interesse'),
    e('e_i_g1_T', 'i_gate1', 'i_sil1', 'true', 'sim'),
    e('e_i_g1_F', 'i_gate1', 'i_gate2', 'false', 'não'),
    e('e_i_g2_T', 'i_gate2', 'i_sil2', 'true', 'sim'),
    e('e_i_g2_F', 'i_gate2', 'act_interest', 'false', 'não'),
    e('e_i_act', 'act_interest', 'i_gate_bp'),
    e('e_i_bp_T', 'i_gate_bp', 'i_bp_swap_tags', 'true', 'sim'),
    e('e_i_bp_F', 'i_gate_bp', 'send_triagem', 'false', 'não'),
    e('e_i_bp_swap', 'i_bp_swap_tags', 'i_bp_clear'),
    e('e_i_bp_clear', 'i_bp_clear', 'send_bp_recusado'),
    e('e_i_bp_send', 'send_bp_recusado', 'end_bp_recusado'),
    e('e_i_send', 'send_triagem', 'end_interest'),

    e('e_cls_unk', 'classify', 'u_sil', 'unknown', 'sem match'),

    e('e_nl_start', 'nl_start', 'nl_gate_academia'),
    e('e_nl_aca_T', 'nl_gate_academia', 'nl_send_academia', 'true', 'sim'),
    e('e_nl_aca_F', 'nl_gate_academia', 'nl_gate_matheus', 'false', 'não'),
    e('e_nl_aca_send', 'nl_send_academia', 'nl_end_academia'),

    e('e_nl_mat_T', 'nl_gate_matheus', 'nl_send_matheus', 'true', 'sim'),
    e('e_nl_mat_F', 'nl_gate_matheus', 'nl_send_default', 'false', 'não'),
    e('e_nl_mat_send', 'nl_send_matheus', 'nl_end_matheus'),

    e('e_nl_def_send', 'nl_send_default', 'nl_end_default'),
]

const graph = {
    version: 2,
    startId: 'start',
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
    updatedBy: 'script:apply-flow-simplified',
}

// Acha a flow ativa, mostra o que tá ativo agora, atualiza o grafo.
const { data: active, error: fetchErr } = await supabase
    .from('whatsapp_flows')
    .select('id, name, description, is_active, last_activated_at')
    .eq('is_active', true)
    .maybeSingle()

if (fetchErr) {
    console.error(`❌ Erro ao ler whatsapp_flows: ${fetchErr.message}`)
    process.exit(1)
}

if (!active) {
    console.log('ℹ️  Nenhuma flow ativa em whatsapp_flows.')
    console.log('    O loader vai cair em site_settings.whatsapp_flow_v2 ou no buildDefaultGraph em código.')
    console.log('    Vou criar uma flow nova e ativá-la com o grafo simplificado.\n')

    const { data: created, error: insErr } = await supabase
        .from('whatsapp_flows')
        .insert({
            name: 'Default (bate-papo simplificado)',
            description: 'Welcome só em novo lead. Inbound estranho = silêncio. Só executa: welcome → agendamento OU welcome → registro de interesse.',
            graph,
            is_active: true,
            last_activated_at: new Date().toISOString(),
        })
        .select('id, name')
        .single()

    if (insErr) {
        console.error(`❌ Erro ao criar flow: ${insErr.message}`)
        process.exit(1)
    }
    console.log(`✅ Flow criada e ativada: ${created.name} (id=${created.id})`)
    console.log(`   ${nodes.length} nós · ${edges.length} edges`)
    process.exit(0)
}

console.log(`📋 Flow ativa atual: "${active.name}" (id=${active.id})`)
console.log(`   ${active.description || '(sem descrição)'}`)
console.log(`   Última ativação: ${active.last_activated_at || '—'}\n`)

const { error: updErr } = await supabase
    .from('whatsapp_flows')
    .update({
        graph,
        last_activated_at: new Date().toISOString(),
    })
    .eq('id', active.id)

if (updErr) {
    console.error(`❌ Erro ao atualizar grafo: ${updErr.message}`)
    process.exit(1)
}

console.log(`✅ Grafo atualizado.`)
console.log(`   ${nodes.length} nós · ${edges.length} edges`)
console.log(`   Próxima inbound já usa o fluxo novo (sem cache do lado Next).`)
