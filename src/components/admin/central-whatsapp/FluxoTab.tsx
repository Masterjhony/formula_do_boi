"use client"

import { useEffect, useMemo, useState } from "react"
import {
    PlayCircle, ShieldAlert, Brain, MessageSquareText,
    Tag, Database, Send, Hand,
    Save, X, Loader2, AlertCircle, CheckCircle2, Sparkles, Pencil,
} from "lucide-react"
import type { Template } from "./types"

/* ────────────────────────────────────────────────────────────────────
 * Mapa de fluxo da Central WhatsApp
 *
 * Espelha a lógica determinística em src/app/api/whatsapp/inbound/route.ts.
 * Não é um construtor livre — os caminhos são fixos. Editar o corpo
 * de um bloco "template" altera o registro real em whatsapp_templates,
 * que o bot lê a cada mensagem.
 * ──────────────────────────────────────────────────────────────────── */

type NodeKind =
    | "start"      // entrada (decorativo)
    | "process"    // step de back-end (sem edição)
    | "gate"       // decisão (sim/não)
    | "branch"     // ramificação a partir do classificador
    | "template"   // mensagem que vai pro lead — editável
    | "crm"        // efeito colateral no CRM (descritivo)
    | "end"        // saída do fluxo
    | "silence"    // bot fica em silêncio

interface FlowNode {
    id: string
    kind: NodeKind
    title: string
    subtitle?: string
    /** Para kind=template, slug do template em whatsapp_templates. */
    templateSlug?: string
    /** Para template "triagem-XXX" — dropdown com vários slugs. */
    templateChoices?: { id: string; label: string; slug: string }[]
    /** Texto explicativo no painel lateral (para kind != template). */
    description?: string
    /** Coordenadas em pixels (centro horizontal e topo vertical). */
    cx: number
    y: number
    w: number
    h: number
}

interface FlowEdge {
    from: string
    to: string
    label?: string
    /** Lado de saída do nó origem: "bottom" (default) ou "right". */
    fromSide?: "bottom" | "right"
    /** Lado de entrada do nó destino. */
    toSide?: "top" | "left"
    /** Cor da edge. */
    tone?: "default" | "muted" | "branch"
}

/* ─── Layout fixo ──────────────────────────────────────────────────── */

const CANVAS_W = 1180
const CANVAS_H = 1100

// 5 colunas (uma por ramo da classificação)
const COLS = [110, 320, 540, 760, 970]

const NODES: FlowNode[] = [
    // — Coluna central, top to bottom —
    {
        id: "start",
        kind: "start",
        title: "Lead envia mensagem",
        subtitle: "WhatsApp inbound chega no VPS e é encaminhado pra cá",
        cx: 540, y: 30, w: 280, h: 70,
        description: "Toda mensagem individual recebida pelo número da Central é enviada do VPS para /api/whatsapp/inbound com webhook secret. Mensagens de grupo seguem outra rota.",
    },
    {
        id: "locate",
        kind: "process",
        title: "Localiza ou cria lead no CRM",
        subtitle: "Match por telefone (com variantes 55 / sem 9)",
        cx: 540, y: 140, w: 320, h: 70,
        description: "Procura crm_leads.telefone aceitando variantes (com/sem DDI 55, com/sem 9º dígito). Se não existir, insere lead novo com origem='whatsapp-central' e stage='novo'. A inbound sempre é registrada em whatsapp_messages, mesmo se o bot ficar em silêncio.",
    },
    {
        id: "gates",
        kind: "gate",
        title: "Lead em opt-out ou handoff?",
        subtitle: "Se sim → silêncio (humano cuida)",
        cx: 540, y: 260, w: 340, h: 70,
        description: "Antes de classificar, dois portões de silêncio: (1) lead com optout_whatsapp=true não recebe nada do bot — só a confirmação de opt-out se ele mandar PARAR de novo; (2) lead com handoff_humano=true também silencia, porque um atendente assumiu.",
    },
    {
        id: "silence-gate",
        kind: "silence",
        title: "Silêncio",
        subtitle: "Bot não responde",
        cx: 970, y: 260, w: 180, h: 70,
        description: "Quando um dos gates dispara, retorna { silent: true } pro VPS. A mensagem fica registrada na inbox, mas nenhuma resposta automática é enviada.",
    },
    {
        id: "classify",
        kind: "process",
        title: "Classifica intenção da mensagem",
        subtitle: "Regras determinísticas (sem IA)",
        cx: 540, y: 380, w: 320, h: 80,
        description: "Função classifyMessage() em src/lib/whatsapp-central.ts. Ordem: (1) palavras de opt-out PARAR/SAIR/CANCELAR; (2) reativação VOLTAR/REATIVAR; (3) pedido humano CONSULTOR/HUMANO/ATENDENTE; (4) número 1-7 do menu; (5) palavras-chave touros/matriz/embri/sêmen/leil/vender. Senão → unknown.",
    },

    // — Linha de branches (5 colunas) —
    {
        id: "branch-optout",
        kind: "branch",
        title: "Opt-out detectado",
        subtitle: "PARAR / SAIR / CANCELAR",
        cx: COLS[0], y: 530, w: 200, h: 64,
    },
    {
        id: "branch-resub",
        kind: "branch",
        title: "Re-subscribe",
        subtitle: "VOLTAR / REATIVAR",
        cx: COLS[1], y: 530, w: 200, h: 64,
    },
    {
        id: "branch-human",
        kind: "branch",
        title: "Pediu humano",
        subtitle: "CONSULTOR / ATENDENTE",
        cx: COLS[2], y: 530, w: 200, h: 64,
    },
    {
        id: "branch-interest",
        kind: "branch",
        title: "Interesse identificado",
        subtitle: "Touros / Matrizes / etc.",
        cx: COLS[3], y: 530, w: 200, h: 64,
    },
    {
        id: "branch-unknown",
        kind: "branch",
        title: "Sem classificação",
        subtitle: "Lead novo recebe welcome",
        cx: COLS[4], y: 530, w: 200, h: 64,
    },

    // — Templates (editáveis) —
    {
        id: "tpl-optout",
        kind: "template",
        title: "Confirmação de opt-out",
        subtitle: "{nome}",
        templateSlug: "optout-confirmacao",
        cx: COLS[0], y: 660, w: 200, h: 96,
    },
    {
        id: "tpl-resub",
        kind: "template",
        title: "Mensagem de reativação",
        subtitle: "(texto fixo no código)",
        templateSlug: "resubscribe-msg",
        cx: COLS[1], y: 660, w: 200, h: 96,
    },
    {
        id: "tpl-human",
        kind: "template",
        title: "Encaminhamento ao consultor",
        subtitle: "{nome}",
        templateSlug: "consultor-handoff",
        cx: COLS[2], y: 660, w: 200, h: 96,
    },
    {
        id: "tpl-triagem",
        kind: "template",
        title: "Triagem por interesse",
        subtitle: "7 templates (um por interesse)",
        templateChoices: [
            { id: "touros",          label: "Touros",                slug: "triagem-touros" },
            { id: "matrizes",        label: "Matrizes",              slug: "triagem-matrizes" },
            { id: "embrioes",        label: "Embriões",              slug: "triagem-embrioes" },
            { id: "semen",           label: "Sêmen",                 slug: "triagem-semen" },
            { id: "leiloes",         label: "Leilões",               slug: "triagem-leiloes" },
            { id: "venda_genetica",  label: "Venda de genética",     slug: "triagem-venda-genetica" },
            { id: "consultor",       label: "Consultor (handoff)",   slug: "consultor-handoff" },
        ],
        cx: COLS[3], y: 660, w: 200, h: 96,
    },
    {
        id: "tpl-welcome",
        kind: "template",
        title: "Welcome (1ª vez)",
        subtitle: "Só dispara se nunca recebeu menu",
        templateSlug: "welcome-default",
        cx: COLS[4], y: 660, w: 200, h: 96,
    },

    // — CRM side-effects —
    {
        id: "crm-optout",
        kind: "crm",
        title: "Marca opt-out no CRM",
        subtitle: "+ adiciona em whatsapp_optouts",
        cx: COLS[0], y: 810, w: 200, h: 80,
        description: "Setta crm_leads.optout_whatsapp=true, optout_at=now(), handoff_humano=true. Faz upsert em whatsapp_optouts (cache rápido por telefone) com reason='user_request'. A partir daqui, qualquer mensagem do bot pra esse número é bloqueada.",
    },
    {
        id: "crm-resub",
        kind: "crm",
        title: "Reativa lead",
        subtitle: "Limpa optout_whatsapp",
        cx: COLS[1], y: 810, w: 200, h: 80,
        description: "Setta optout_whatsapp=false, optout_at=null. Apaga o registro do lead em whatsapp_optouts. O bot volta a poder enviar mensagens.",
    },
    {
        id: "crm-handoff",
        kind: "crm",
        title: "Marca handoff humano",
        subtitle: "+ histórico de contato",
        cx: COLS[2], y: 810, w: 200, h: 80,
        description: "Setta handoff_humano=true e handoff_at=now(). Adiciona entry em contact_history com tipo whatsapp e by='bot'. Daqui pra frente o bot fica em silêncio nesse lead — o atendente humano cuida pela inbox.",
    },
    {
        id: "crm-interest",
        kind: "crm",
        title: "Atualiza interesse e tags",
        subtitle: "interesse_principal, tags_whatsapp",
        cx: COLS[3], y: 810, w: 200, h: 80,
        description: "Setta interesse_principal (id) e interesse (label PT-BR). Adiciona tag whatsapp:{interesse} em tags_whatsapp. Se status='Lead' ainda, promove pra 'Qualificado'. Adiciona entry em contact_history.",
    },

    // — Saídas (resposta enviada / silêncio) —
    {
        id: "end-optout",
        kind: "end",
        title: "Resposta enviada",
        cx: COLS[0], y: 940, w: 200, h: 56,
    },
    {
        id: "end-resub",
        kind: "end",
        title: "Resposta enviada",
        cx: COLS[1], y: 940, w: 200, h: 56,
    },
    {
        id: "end-human",
        kind: "end",
        title: "Resposta enviada",
        cx: COLS[2], y: 940, w: 200, h: 56,
    },
    {
        id: "end-interest",
        kind: "end",
        title: "Resposta enviada",
        cx: COLS[3], y: 940, w: 200, h: 56,
    },
    {
        id: "end-unknown",
        kind: "end",
        title: "Resposta enviada (1ª vez)",
        subtitle: "Caso contrário: silêncio",
        cx: COLS[4], y: 940, w: 200, h: 64,
    },
]

const EDGES: FlowEdge[] = [
    { from: "start",         to: "locate" },
    { from: "locate",        to: "gates" },
    { from: "gates",         to: "silence-gate", label: "se sim", fromSide: "right", toSide: "left", tone: "muted" },
    { from: "gates",         to: "classify",     label: "se não" },

    { from: "classify", to: "branch-optout",   tone: "branch" },
    { from: "classify", to: "branch-resub",    tone: "branch" },
    { from: "classify", to: "branch-human",    tone: "branch" },
    { from: "classify", to: "branch-interest", tone: "branch" },
    { from: "classify", to: "branch-unknown",  tone: "branch" },

    { from: "branch-optout",   to: "tpl-optout"   },
    { from: "branch-resub",    to: "tpl-resub"    },
    { from: "branch-human",    to: "tpl-human"    },
    { from: "branch-interest", to: "tpl-triagem"  },
    { from: "branch-unknown",  to: "tpl-welcome"  },

    { from: "tpl-optout",   to: "crm-optout"   },
    { from: "tpl-resub",    to: "crm-resub"    },
    { from: "tpl-human",    to: "crm-handoff"  },
    { from: "tpl-triagem",  to: "crm-interest" },

    { from: "crm-optout",   to: "end-optout"   },
    { from: "crm-resub",    to: "end-resub"    },
    { from: "crm-handoff",  to: "end-human"    },
    { from: "crm-interest", to: "end-interest" },
    { from: "tpl-welcome",  to: "end-unknown"  },
]

/* ─── Helpers ─────────────────────────────────────────────────────── */

function nodeById(id: string): FlowNode | null {
    return NODES.find(n => n.id === id) ?? null
}

function anchor(node: FlowNode, side: "top" | "bottom" | "left" | "right") {
    const x = node.cx
    const y = node.y
    const w = node.w
    const h = node.h
    switch (side) {
        case "top":    return { x, y }
        case "bottom": return { x, y: y + h }
        case "left":   return { x: x - w / 2, y: y + h / 2 }
        case "right":  return { x: x + w / 2, y: y + h / 2 }
    }
}

function edgePath(edge: FlowEdge): { d: string; mid: { x: number; y: number } } | null {
    const from = nodeById(edge.from)
    const to = nodeById(edge.to)
    if (!from || !to) return null
    const fromSide = edge.fromSide ?? "bottom"
    const toSide = edge.toSide ?? "top"
    const a = anchor(from, fromSide)
    const b = anchor(to, toSide)
    // controle de bezier — vertical preferencial
    const dx = b.x - a.x
    const dy = b.y - a.y
    let c1x = a.x, c1y = a.y, c2x = b.x, c2y = b.y
    if (fromSide === "bottom" && toSide === "top") {
        c1y = a.y + Math.max(40, dy / 2)
        c2y = b.y - Math.max(40, dy / 2)
    } else if (fromSide === "right" && toSide === "left") {
        c1x = a.x + Math.max(40, dx / 2)
        c2x = b.x - Math.max(40, dx / 2)
    } else {
        c1y = a.y + 40
        c2y = b.y - 40
    }
    const d = `M ${a.x} ${a.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${b.x} ${b.y}`
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    return { d, mid }
}

const KIND_STYLE: Record<NodeKind, { ring: string; bg: string; text: string; icon: typeof PlayCircle; label: string }> = {
    start:    { ring: "ring-slate-300",  bg: "bg-slate-50",   text: "text-slate-900", icon: PlayCircle,      label: "Entrada" },
    process:  { ring: "ring-sky-300",    bg: "bg-sky-50",     text: "text-sky-900",   icon: Database,        label: "Processo" },
    gate:     { ring: "ring-amber-300",  bg: "bg-amber-50",   text: "text-amber-900", icon: ShieldAlert,     label: "Gate" },
    branch:   { ring: "ring-violet-300", bg: "bg-violet-50",  text: "text-violet-900",icon: Brain,           label: "Ramificação" },
    template: { ring: "ring-emerald-400",bg: "bg-emerald-50", text: "text-emerald-900",icon: MessageSquareText,label: "Template editável" },
    crm:      { ring: "ring-blue-300",   bg: "bg-blue-50",    text: "text-blue-900",  icon: Tag,             label: "Atualização CRM" },
    end:      { ring: "ring-slate-300",  bg: "bg-white",      text: "text-slate-700", icon: Send,            label: "Saída" },
    silence:  { ring: "ring-zinc-300",   bg: "bg-zinc-50",    text: "text-zinc-700",  icon: Hand,            label: "Silêncio" },
}

/* ─── Componente ──────────────────────────────────────────────────── */

interface Props {
    templates: Template[]
    onTemplatesChanged: () => void
}

export function FluxoTab({ templates, onTemplatesChanged }: Props) {
    const [selected, setSelected] = useState<string | null>(null)
    const [triagemPick, setTriagemPick] = useState<string>("touros")

    const selectedNode = selected ? nodeById(selected) : null
    const templateBySlug = useMemo(() => {
        const m = new Map<string, Template>()
        templates.forEach(t => m.set(t.slug, t))
        return m
    }, [templates])

    function getNodeTemplate(node: FlowNode): Template | null {
        if (node.templateSlug) return templateBySlug.get(node.templateSlug) ?? null
        if (node.templateChoices) {
            const choice = node.templateChoices.find(c => c.id === triagemPick)
            return choice ? templateBySlug.get(choice.slug) ?? null : null
        }
        return null
    }

    const edgePaths = EDGES.map(e => ({ edge: e, geom: edgePath(e) })).filter(x => x.geom)

    return (
        <div className="bg-card text-card-foreground rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600" /> Mapa do fluxo de atendimento
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Visualização do que o bot faz com cada mensagem inbound. Clique em um bloco para ver detalhes;
                        blocos em verde abrem o editor da mensagem que vai pro lead.
                    </p>
                </div>
                <Legend />
            </div>

            {/* Canvas — scrollável horizontalmente em telas estreitas */}
            <div className="overflow-auto bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:18px_18px]">
                <div
                    className="relative mx-auto my-6"
                    style={{ width: CANVAS_W, height: CANVAS_H }}
                >
                    {/* SVG layer (edges) */}
                    <svg
                        width={CANVAS_W}
                        height={CANVAS_H}
                        className="absolute inset-0 pointer-events-none"
                    >
                        <defs>
                            <marker
                                id="arrow-default"
                                viewBox="0 0 10 10"
                                refX="9"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                            </marker>
                            <marker
                                id="arrow-muted"
                                viewBox="0 0 10 10"
                                refX="9"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
                            </marker>
                            <marker
                                id="arrow-branch"
                                viewBox="0 0 10 10"
                                refX="9"
                                refY="5"
                                markerWidth="6"
                                markerHeight="6"
                                orient="auto-start-reverse"
                            >
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa" />
                            </marker>
                        </defs>
                        {edgePaths.map(({ edge, geom }, i) => {
                            const stroke = edge.tone === "muted" ? "#cbd5e1"
                                : edge.tone === "branch" ? "#a78bfa"
                                : "#64748b"
                            const marker = edge.tone === "muted" ? "url(#arrow-muted)"
                                : edge.tone === "branch" ? "url(#arrow-branch)"
                                : "url(#arrow-default)"
                            return (
                                <g key={i}>
                                    <path
                                        d={geom!.d}
                                        fill="none"
                                        stroke={stroke}
                                        strokeWidth={1.6}
                                        strokeDasharray={edge.tone === "muted" ? "5 4" : undefined}
                                        markerEnd={marker}
                                    />
                                    {edge.label && (
                                        <text
                                            x={geom!.mid.x}
                                            y={geom!.mid.y - 4}
                                            textAnchor="middle"
                                            className="text-[10px] fill-slate-500"
                                            style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3 }}
                                        >
                                            {edge.label}
                                        </text>
                                    )}
                                </g>
                            )
                        })}
                    </svg>

                    {/* Nodes layer */}
                    {NODES.map(node => {
                        const tpl = getNodeTemplate(node)
                        const tplExists = node.kind === "template" ? Boolean(tpl) : true
                        const isSelected = selected === node.id
                        return (
                            <NodeCard
                                key={node.id}
                                node={node}
                                template={tpl}
                                templateExists={tplExists}
                                selected={isSelected}
                                onClick={() => setSelected(node.id)}
                            />
                        )
                    })}
                </div>
            </div>

            {/* Side panel */}
            {selectedNode && (
                <SidePanel
                    node={selectedNode}
                    template={getNodeTemplate(selectedNode)}
                    onClose={() => setSelected(null)}
                    onSaved={onTemplatesChanged}
                    triagemPick={triagemPick}
                    onTriagemPickChange={setTriagemPick}
                />
            )}
        </div>
    )
}

/* ─── Subcomponents ────────────────────────────────────────────────── */

function NodeCard({
    node, template, templateExists, selected, onClick,
}: {
    node: FlowNode
    template: Template | null
    templateExists: boolean
    selected: boolean
    onClick: () => void
}) {
    const style = KIND_STYLE[node.kind]
    const Icon = style.icon
    const isClickable = node.kind === "template" || Boolean(node.description)
    const previewBody = template?.body?.split("\n")[0]?.slice(0, 60)

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!isClickable}
            className={`
                absolute group rounded-xl border ring-1 ${style.ring} ${style.bg} ${style.text}
                shadow-sm transition-all
                ${isClickable ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : "cursor-default"}
                ${selected ? "ring-2 ring-offset-1 ring-primary shadow-lg" : ""}
                text-left p-2.5 flex flex-col gap-1 overflow-hidden
            `}
            style={{
                left: node.cx - node.w / 2,
                top: node.y,
                width: node.w,
                height: node.h,
            }}
        >
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-70">
                <Icon className="h-3 w-3" />
                <span>{KIND_STYLE[node.kind].label}</span>
                {node.kind === "template" && (
                    templateExists
                        ? <Pencil className="h-3 w-3 ml-auto opacity-60 group-hover:opacity-100" />
                        : <span className="ml-auto text-amber-700 text-[9px] font-semibold">Não criado</span>
                )}
            </div>
            <div className="font-semibold text-[13px] leading-tight">{node.title}</div>
            {node.subtitle && (
                <div className="text-[11px] opacity-70 leading-tight line-clamp-2">{node.subtitle}</div>
            )}
            {node.kind === "template" && previewBody && (
                <div className="text-[10px] opacity-60 italic mt-auto truncate">
                    &ldquo;{previewBody}…&rdquo;
                </div>
            )}
        </button>
    )
}

function Legend() {
    const items: { kind: NodeKind; label: string }[] = [
        { kind: "start",    label: "Entrada" },
        { kind: "process",  label: "Processo" },
        { kind: "gate",     label: "Gate" },
        { kind: "branch",   label: "Ramificação" },
        { kind: "template", label: "Mensagem (clique p/ editar)" },
        { kind: "crm",      label: "CRM" },
        { kind: "end",      label: "Saída" },
    ]
    return (
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {items.map(i => (
                <span
                    key={i.kind}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ring-1 ${KIND_STYLE[i.kind].ring} ${KIND_STYLE[i.kind].bg} ${KIND_STYLE[i.kind].text}`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    {i.label}
                </span>
            ))}
        </div>
    )
}

function SidePanel({
    node, template, onClose, onSaved, triagemPick, onTriagemPickChange,
}: {
    node: FlowNode
    template: Template | null
    onClose: () => void
    onSaved: () => void
    triagemPick: string
    onTriagemPickChange: (id: string) => void
}) {
    const style = KIND_STYLE[node.kind]
    const Icon = style.icon
    const isTemplate = node.kind === "template"

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-card border-l shadow-xl flex flex-col animate-in slide-in-from-right duration-150">
            <div className="px-5 py-4 border-b flex items-start gap-3">
                <div className={`p-2 rounded-lg ring-1 ${style.ring} ${style.bg}`}>
                    <Icon className={`h-4 w-4 ${style.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{style.label}</div>
                    <div className="font-semibold leading-tight">{node.title}</div>
                    {node.subtitle && <div className="text-xs text-muted-foreground mt-0.5">{node.subtitle}</div>}
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                    aria-label="Fechar"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-4">
                {isTemplate ? (
                    <TemplateEditor
                        node={node}
                        template={template}
                        triagemPick={triagemPick}
                        onTriagemPickChange={onTriagemPickChange}
                        onSaved={onSaved}
                    />
                ) : (
                    <div className="prose prose-sm max-w-none">
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {node.description || "—"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

const TEMPLATE_DEFAULTS: Record<string, { title: string; category: string; body: string }> = {
    "welcome-default": {
        title: "Welcome — menu inicial",
        category: "welcome",
        body: "Olá {nome}! Seja bem-vindo(a) à *Fórmula do Boi* 🐂\n\nMe conta seu interesse principal:\n1️⃣ Touros\n2️⃣ Matrizes\n3️⃣ Embriões\n4️⃣ Sêmen\n5️⃣ Leilões\n6️⃣ Vender genética\n7️⃣ Falar com consultor",
    },
    "optout-confirmacao": {
        title: "Opt-out — confirmação",
        category: "optout",
        body: "Tudo certo, {nome}! Você foi removido(a) da nossa lista. Se mudar de ideia, é só mandar VOLTAR. 🙏",
    },
    "consultor-handoff": {
        title: "Encaminhamento ao consultor",
        category: "encaminhamento",
        body: "Anotado, {nome}! Vou te conectar com um consultor da equipe Fórmula do Boi agora. Em instantes alguém te chama por aqui.",
    },
    "resubscribe-msg": {
        title: "Re-subscribe — boas-vindas de volta",
        category: "welcome",
        body: "Que ótimo, {nome}! Você voltou a receber nossas comunicações. ✅\n\nSe quiser, me diz seu interesse principal:\n1️⃣ Touros 2️⃣ Matrizes 3️⃣ Embriões 4️⃣ Sêmen\n5️⃣ Leilões 6️⃣ Vender genética 7️⃣ Falar com consultor",
    },
    "triagem-touros":         { title: "Triagem — Touros",          category: "triagem", body: "Show, {nome}! Temos touros PO disponíveis. Quer que eu te mande o catálogo atualizado ou prefere falar com um consultor?" },
    "triagem-matrizes":       { title: "Triagem — Matrizes",        category: "triagem", body: "Boa, {nome}! Temos matrizes PO de excelente genealogia. Posso te enviar o catálogo ou conectar com um consultor?" },
    "triagem-embrioes":       { title: "Triagem — Embriões",        category: "triagem", body: "Ótima escolha, {nome}! Trabalhamos com embriões de doadoras top. Quer ver os lotes disponíveis?" },
    "triagem-semen":          { title: "Triagem — Sêmen",           category: "triagem", body: "Perfeito, {nome}! Temos sêmen de touros provados. Posso te mandar a lista ou tirar suas dúvidas com um consultor?" },
    "triagem-leiloes":        { title: "Triagem — Leilões",         category: "triagem", body: "Bacana, {nome}! Confira nosso cronograma de leilões: https://formuladoboi.com/agenda" },
    "triagem-venda-genetica": { title: "Triagem — Venda de genética",category: "triagem", body: "Que bom, {nome}! Pra avaliar sua genética, um consultor da Fórmula vai te chamar em instantes." },
}

function TemplateEditor({
    node, template, triagemPick, onTriagemPickChange, onSaved,
}: {
    node: FlowNode
    template: Template | null
    triagemPick: string
    onTriagemPickChange: (id: string) => void
    onSaved: () => void
}) {
    const activeSlug = node.templateChoices
        ? node.templateChoices.find(c => c.id === triagemPick)?.slug ?? ""
        : node.templateSlug ?? ""

    const [title, setTitle] = useState(template?.title ?? "")
    const [body, setBody] = useState(template?.body ?? "")
    const [category, setCategory] = useState(template?.category ?? "geral")
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null)

    // Re-sync quando muda o slug ativo (troca de interesse no dropdown ou
    // mudança do template subjacente após save).
    useEffect(() => {
        setTitle(template?.title ?? "")
        setBody(template?.body ?? "")
        setCategory(template?.category ?? "geral")
        setFeedback(null)
    }, [activeSlug, template?.id, template?.title, template?.body, template?.category])

    async function handleSave() {
        if (!body.trim()) {
            setFeedback({ type: "err", msg: "O corpo da mensagem é obrigatório." })
            return
        }
        setSaving(true)
        setFeedback(null)
        try {
            if (template) {
                const res = await fetch(`/api/whatsapp/central/templates/${template.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: title.trim() || template.title, category, body }),
                })
                if (!res.ok) throw new Error((await res.json()).error || "Erro ao salvar")
            } else {
                // Cria com o slug fixo do nó
                const defaults = TEMPLATE_DEFAULTS[activeSlug]
                const res = await fetch(`/api/whatsapp/central/templates`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        slug: activeSlug,
                        title: title.trim() || defaults?.title || activeSlug,
                        category: category || defaults?.category || "geral",
                        body,
                    }),
                })
                if (!res.ok) throw new Error((await res.json()).error || "Erro ao criar")
            }
            setFeedback({ type: "ok", msg: "Salvo. O bot já está usando essa versão." })
            onSaved()
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro desconhecido"
            setFeedback({ type: "err", msg })
        } finally {
            setSaving(false)
        }
    }

    function applyDefault() {
        const defaults = TEMPLATE_DEFAULTS[activeSlug]
        if (!defaults) return
        setTitle(defaults.title)
        setBody(defaults.body)
        setCategory(defaults.category)
    }

    return (
        <div className="space-y-4">
            {/* Seletor de interesse para o nó de triagem */}
            {node.templateChoices && (
                <div>
                    <label className="text-xs font-semibold text-muted-foreground">Interesse</label>
                    <select
                        value={triagemPick}
                        onChange={e => onTriagemPickChange(e.target.value)}
                        className="mt-1 w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                    >
                        {node.templateChoices.map(c => (
                            <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Cada interesse tem um template separado em whatsapp_templates.
                    </p>
                </div>
            )}

            <div className="bg-muted/40 rounded-md px-3 py-2 text-xs flex items-center gap-2">
                <span className="font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border">
                    {activeSlug}
                </span>
                {!template && (
                    <span className="text-amber-700 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> ainda não existe
                    </span>
                )}
            </div>

            <div>
                <label className="text-xs font-semibold text-muted-foreground">Título</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={TEMPLATE_DEFAULTS[activeSlug]?.title || "Título do template"}
                    className="mt-1 w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                />
            </div>

            <div>
                <label className="text-xs font-semibold text-muted-foreground">Categoria</label>
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="mt-1 w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                >
                    <option value="welcome">Boas-vindas</option>
                    <option value="triagem">Triagem</option>
                    <option value="oportunidade">Oportunidade</option>
                    <option value="leilao">Leilão</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="encaminhamento">Encaminhamento</option>
                    <option value="optout">Opt-out</option>
                    <option value="geral">Geral</option>
                </select>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">Mensagem</label>
                    <button
                        type="button"
                        onClick={applyDefault}
                        className="text-[11px] text-primary hover:underline"
                    >
                        usar texto padrão
                    </button>
                </div>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={10}
                    placeholder="Olá {nome}! …"
                    className="mt-1 w-full px-2.5 py-2 rounded-md border bg-background text-sm font-mono leading-relaxed resize-y"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                    Variáveis suportadas: <code>{"{nome}"}</code> (primeiro nome do lead).
                    Use *negrito* WhatsApp se quiser destaque.
                </p>
            </div>

            {feedback && (
                <div className={`text-xs flex items-start gap-1.5 px-2.5 py-2 rounded-md ${
                    feedback.type === "ok"
                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                        : "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
                }`}>
                    {feedback.type === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5" />}
                    <span>{feedback.msg}</span>
                </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    {template ? "Salvar alteração" : "Criar template"}
                </button>
            </div>
        </div>
    )
}

