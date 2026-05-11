/** Tipos compartilhados pela Central WhatsApp (UI) */

export type WAStatus = 'disconnected' | 'connecting' | 'connected' | 'qr'

export interface InboxConversation {
    phone: string
    name: string | null
    last_message: string | null
    last_direction: 'inbound' | 'outbound' | null
    last_at: string
    inbound_pending: number
    lead_id: string | null
    lead_nome: string | null
    interesse_principal: string | null
    handoff_humano: boolean
    handoff_responsavel: string | null
    optout_whatsapp: boolean
    stage: string | null
    status: string | null
}

export interface ThreadMessage {
    id: string
    phone: string
    name: string | null
    body: string | null
    direction: 'inbound' | 'outbound'
    status: string
    origin: string | null
    bot_step: string | null
    campaign_id: string | null
    template_id: string | null
    created_at: string
}

export interface ThreadLead {
    id: string
    nome: string
    telefone: string | null
    email: string | null
    status: string | null
    stage: string | null
    prioridade: string | null
    interesse: string | null
    interesse_principal: string | null
    tags_whatsapp: string[] | null
    handoff_humano: boolean
    handoff_responsavel: string | null
    handoff_at: string | null
    optout_whatsapp: boolean
    last_whatsapp_at: string | null
    contact_count: number | null
    notes: string | null
    responsavel: string | null
    source: string | null
    medium: string | null
    campaign: string | null
}

export interface Template {
    id: string
    slug: string
    title: string
    category: string
    body: string
    variables: string[] | null
    archived: boolean
    usage_count: number
    updated_at: string
    // Mídia opcional anexada ao template (foto/vídeo/áudio/documento)
    media_url: string | null            // key do R2 (ex.: libmedia/123_foto.jpg)
    media_type: 'image' | 'video' | 'audio' | 'document' | null
    media_mime: string | null
    media_filename: string | null
    media_caption: string | null
    // Enquete nativa do WhatsApp (opcional)
    poll_question: string | null
    poll_options: string[]              // sempre array, default []
    poll_selectable_count: number       // default 1
}

export interface Campaign {
    id: string
    name: string
    description: string | null
    segment: Record<string, unknown>
    template_id: string | null
    body: string | null
    status: 'rascunho' | 'enviando' | 'concluida' | 'cancelada' | 'erro'
    total_recipients: number
    sent_count: number
    failed_count: number
    optout_skip_count: number
    started_at: string | null
    finished_at: string | null
    created_at: string
    updated_at: string
}

export interface CentralMetrics {
    novos_contatos_7d: number
    leads_com_interesse: number
    aguardando_humano: number
    opt_outs: number
    mensagens_enviadas_hoje: number
    mensagens_recebidas_hoje: number
    campanhas_disparadas_30d: number
    distribuicao_interesse: Record<string, number>
}

export const INTERESSE_LABELS: Record<string, string> = {
    touros: 'Touros',
    matrizes: 'Matrizes',
    embrioes: 'Embriões',
    semen: 'Sêmen',
    leiloes: 'Leilões',
    venda_genetica: 'Venda de genética',
    oferta_genetica: 'Quero ofertar genética',
    oportunidades: 'Receber oportunidades',
    atendimento_humano: 'Atendimento humano',
    consultor: 'Consultor',
    outro: 'Outro',
}
