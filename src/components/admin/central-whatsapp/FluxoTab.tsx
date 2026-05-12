"use client"

/**
 * Editor visual do fluxo da Central WhatsApp (Path B — data-driven).
 *
 * O grafo persistido em site_settings.whatsapp_flow_v2 é carregado, exibido
 * como ReactFlow e pode ser editado livremente. Salvar dispara um POST que
 * passa pelo validateGraph antes de gravar — qualquer alteração impacta o
 * próximo inbound, porque o /api/whatsapp/inbound carrega o grafo a cada
 * mensagem e roda o interpretador.
 */

import "@xyflow/react/dist/style.css"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    Panel,
    Handle,
    Position,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    type Connection,
    type Edge as RFEdge,
    type EdgeChange,
    type Node as RFNode,
    type NodeChange,
    type NodeProps,
} from "@xyflow/react"
import {
    PlayCircle,
    Brain,
    GitBranch,
    Wand2,
    MessageSquareText,
    Hand,
    Send,
    Save,
    RotateCcw,
    Loader2,
    Trash2,
    AlertCircle,
    CheckCircle2,
    X,
    Sparkles,
    Maximize2,
    Minimize2,
    Info,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import type {
    ActionKind,
    ConditionExpr,
    FlowEdge as EngineEdge,
    FlowGraphV2,
    FlowNode as EngineNode,
    NodeType,
} from "@/lib/whatsapp-flow-engine"
import type { Template } from "./types"

/* ─── Tipos auxiliares ───────────────────────────────────────────── */

interface NodeConfig {
    expr?: ConditionExpr
    kind?: ActionKind
    tag?: string
    note?: string
    slug?: string
    dynamic?: "triagem_by_interesse"
    bot_step?: string
    fallback?: string
    contact_note?: string
    reason?: string
}

interface RFNodeData extends Record<string, unknown> {
    label: string
    config: NodeConfig | null
}

type RFFlowNode = RFNode<RFNodeData>

/* ─── Conversão grafo persistido ↔ ReactFlow ────────────────────── */

function engineToRF(graph: FlowGraphV2): { nodes: RFFlowNode[]; edges: RFEdge[] } {
    const nodes: RFFlowNode[] = graph.nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
            label: n.label ?? defaultLabel(n.type),
            config: ("data" in n && n.data ? { ...(n.data as NodeConfig) } : null),
        },
    }))
    const edges: RFEdge[] = graph.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        label: e.label,
        animated: e.sourceHandle === "true" ? false : e.sourceHandle === "false" ? false : false,
        style: edgeStyle(e.sourceHandle),
        labelStyle: { fontSize: 10, fontWeight: 500 },
    }))
    return { nodes, edges }
}

function rfToEngine(graph: FlowGraphV2, rfNodes: RFFlowNode[], rfEdges: RFEdge[]): FlowGraphV2 {
    const nodes: EngineNode[] = rfNodes.map(rf => {
        const base = {
            id: rf.id,
            position: rf.position,
            label: rf.data.label,
        }
        const cfg = rf.data.config ?? undefined
        switch (rf.type as NodeType) {
            case "start":
                return { ...base, type: "start" } as EngineNode
            case "classify":
                return { ...base, type: "classify" } as EngineNode
            case "condition":
                return { ...base, type: "condition", data: { expr: cfg?.expr ?? "lead.exists" } } as EngineNode
            case "action":
                return {
                    ...base,
                    type: "action",
                    data: { kind: cfg?.kind ?? "add_tag", tag: cfg?.tag, note: cfg?.note },
                } as EngineNode
            case "send_template":
                return {
                    ...base,
                    type: "send_template",
                    data: {
                        slug: cfg?.slug ?? "",
                        dynamic: cfg?.dynamic,
                        bot_step: cfg?.bot_step,
                        fallback: cfg?.fallback,
                        contact_note: cfg?.contact_note,
                    },
                } as EngineNode
            case "silence":
                return { ...base, type: "silence", data: { reason: cfg?.reason ?? "flow_silence" } } as EngineNode
            case "end":
                return { ...base, type: "end", data: { bot_step: cfg?.bot_step } } as EngineNode
            default:
                return { ...base, type: "end" } as EngineNode
        }
    })
    const edges: EngineEdge[] = rfEdges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        label: typeof e.label === "string" ? e.label : undefined,
    }))
    return { ...graph, nodes, edges }
}

function defaultLabel(type: NodeType): string {
    switch (type) {
        case "start":          return "Início"
        case "classify":       return "Classifica intenção"
        case "condition":      return "Condição"
        case "action":         return "Ação"
        case "send_template":  return "Enviar template"
        case "silence":        return "Silêncio"
        case "end":            return "Resposta enviada"
    }
}

function edgeStyle(handle: string | undefined): React.CSSProperties {
    // Cores escolhidas com luminância média — legíveis no claro e no escuro
    switch (handle) {
        case "true":         return { stroke: "#10b981", strokeWidth: 1.6 }
        case "false":        return { stroke: "#f87171", strokeWidth: 1.6, strokeDasharray: "4 4" }
        case "optout":       return { stroke: "#f43f5e", strokeWidth: 1.6 }
        case "resubscribe":  return { stroke: "#38bdf8", strokeWidth: 1.6 }
        case "human":        return { stroke: "#c084fc", strokeWidth: 1.6 }
        case "interest":     return { stroke: "#fbbf24", strokeWidth: 1.6 }
        case "unknown":      return { stroke: "#94a3b8", strokeWidth: 1.6 }
        default:             return { stroke: "#94a3b8", strokeWidth: 1.5 }
    }
}

/* ─── Custom nodes ────────────────────────────────────────────────── */

const NODE_THEME: Record<NodeType, { ring: string; bg: string; text: string; sub: string; icon: typeof PlayCircle }> = {
    start:         { ring: "ring-slate-400/70 dark:ring-slate-400/50",
                     bg:   "bg-slate-100 dark:bg-slate-800/70",
                     text: "text-slate-900 dark:text-slate-100",
                     sub:  "text-slate-700 dark:text-slate-300",
                     icon: PlayCircle },
    classify:      { ring: "ring-violet-400/70 dark:ring-violet-400/50",
                     bg:   "bg-violet-50 dark:bg-violet-900/40",
                     text: "text-violet-900 dark:text-violet-100",
                     sub:  "text-violet-800 dark:text-violet-200",
                     icon: Brain },
    condition:     { ring: "ring-amber-400/70 dark:ring-amber-400/50",
                     bg:   "bg-amber-50 dark:bg-amber-900/40",
                     text: "text-amber-900 dark:text-amber-100",
                     sub:  "text-amber-800 dark:text-amber-200",
                     icon: GitBranch },
    action:        { ring: "ring-blue-400/70 dark:ring-blue-400/50",
                     bg:   "bg-blue-50 dark:bg-blue-900/40",
                     text: "text-blue-900 dark:text-blue-100",
                     sub:  "text-blue-800 dark:text-blue-200",
                     icon: Wand2 },
    send_template: { ring: "ring-emerald-400/70 dark:ring-emerald-400/50",
                     bg:   "bg-emerald-50 dark:bg-emerald-900/40",
                     text: "text-emerald-900 dark:text-emerald-100",
                     sub:  "text-emerald-800 dark:text-emerald-200",
                     icon: MessageSquareText },
    silence:       { ring: "ring-zinc-400/70 dark:ring-zinc-500/50",
                     bg:   "bg-zinc-100 dark:bg-zinc-800/70",
                     text: "text-zinc-700 dark:text-zinc-200",
                     sub:  "text-zinc-600 dark:text-zinc-300",
                     icon: Hand },
    end:           { ring: "ring-slate-400/70 dark:ring-slate-400/50",
                     bg:   "bg-white dark:bg-zinc-900/70",
                     text: "text-slate-700 dark:text-slate-200",
                     sub:  "text-slate-600 dark:text-slate-400",
                     icon: Send },
}

/** Rótulo PT-BR para o tipo de nó — exibido no header de cada card. */
const NODE_TYPE_LABEL: Record<NodeType, string> = {
    start:         "início",
    classify:      "classificação",
    condition:     "condição",
    action:        "ação",
    send_template: "envia template",
    silence:       "silêncio",
    end:           "fim",
}

function NodeShell({
    type, label, sub, children,
}: { type: NodeType; label: string; sub?: string; children?: React.ReactNode }) {
    const theme = NODE_THEME[type]
    const Icon = theme.icon
    return (
        <div className={`min-w-[190px] max-w-[230px] rounded-xl border border-black/10 dark:border-white/10 ring-1 ${theme.ring} ${theme.bg} ${theme.text} shadow-sm dark:shadow-black/40 px-3 py-2`}>
            <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wide ${theme.sub} opacity-80`}>
                <Icon className="h-3 w-3" />
                <span>{NODE_TYPE_LABEL[type]}</span>
            </div>
            <div className="font-semibold text-[12px] leading-tight mt-0.5">{label}</div>
            {sub && <div className={`text-[11px] mt-0.5 leading-tight ${theme.sub}`}>{sub}</div>}
            {children}
        </div>
    )
}

// Handle dots — usam variáveis CSS pra ficarem visíveis em ambos os temas.
// O `background` aceita CSS var diretamente; cor de borda também.
const handleStyle: React.CSSProperties = {
    width: 9,
    height: 9,
    background: "var(--background, #fff)",
    border: "1.5px solid var(--muted-foreground, #64748b)",
}

function StartNodeView({ data }: NodeProps<RFFlowNode>) {
    return (
        <>
            <NodeShell type="start" label={data.label} sub="Entrada do fluxo — toda inbound do VPS cai aqui" />
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </>
    )
}

function ClassifyNodeView({ data }: NodeProps<RFFlowNode>) {
    return (
        <>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <NodeShell type="classify" label={data.label} sub="5 saídas: opt-out / resubscribe / humano / interesse / sem match" />
            {/* 5 source handles distribuídos no rodapé */}
            <Handle id="optout"      type="source" position={Position.Bottom} style={{ ...handleStyle, left: "10%", background: "#f43f5e", border: "1.5px solid #be123c" }} />
            <Handle id="resubscribe" type="source" position={Position.Bottom} style={{ ...handleStyle, left: "30%", background: "#38bdf8", border: "1.5px solid #0369a1" }} />
            <Handle id="human"       type="source" position={Position.Bottom} style={{ ...handleStyle, left: "50%", background: "#c084fc", border: "1.5px solid #7e22ce" }} />
            <Handle id="interest"    type="source" position={Position.Bottom} style={{ ...handleStyle, left: "70%", background: "#fbbf24", border: "1.5px solid #b45309" }} />
            <Handle id="unknown"     type="source" position={Position.Bottom} style={{ ...handleStyle, left: "90%", background: "#94a3b8", border: "1.5px solid #475569" }} />
        </>
    )
}

function ConditionNodeView({ data }: NodeProps<RFFlowNode>) {
    const expr = data.config?.expr ?? "lead.exists"
    return (
        <>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <NodeShell type="condition" label={data.label} sub={`expressão: ${expr}`} />
            <Handle id="true"  type="source" position={Position.Bottom} style={{ ...handleStyle, left: "30%", background: "#10b981", border: "1.5px solid #047857" }} />
            <Handle id="false" type="source" position={Position.Bottom} style={{ ...handleStyle, left: "70%", background: "#f87171", border: "1.5px solid #b91c1c" }} />
        </>
    )
}

function ActionNodeView({ data }: NodeProps<RFFlowNode>) {
    const kind = data.config?.kind ?? "—"
    const tag = data.config?.tag
    return (
        <>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <NodeShell type="action" label={data.label} sub={tag ? `${kind} • ${tag}` : kind} />
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </>
    )
}

function SendTemplateNodeView({ data }: NodeProps<RFFlowNode>) {
    const cfg = data.config
    const sub = cfg?.dynamic
        ? `slug dinâmico: ${cfg.dynamic}`
        : cfg?.slug ? `slug: ${cfg.slug}` : "(sem slug)"
    return (
        <>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <NodeShell type="send_template" label={data.label} sub={sub} />
            <Handle type="source" position={Position.Bottom} style={handleStyle} />
        </>
    )
}

function SilenceNodeView({ data }: NodeProps<RFFlowNode>) {
    const reason = data.config?.reason ?? "—"
    return (
        <>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <NodeShell type="silence" label={data.label} sub={`motivo: ${reason}`} />
        </>
    )
}

function EndNodeView({ data }: NodeProps<RFFlowNode>) {
    const step = data.config?.bot_step
    return (
        <>
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <NodeShell type="end" label={data.label} sub={step ? `bot_step: ${step}` : undefined} />
        </>
    )
}

const NODE_TYPES = {
    start:         StartNodeView,
    classify:      ClassifyNodeView,
    condition:     ConditionNodeView,
    action:        ActionNodeView,
    send_template: SendTemplateNodeView,
    silence:       SilenceNodeView,
    end:           EndNodeView,
} as const

/* ─── Componente principal ───────────────────────────────────────── */

interface Props {
    templates: Template[]
    onTemplatesChanged: () => void
}

export function FluxoTab({ templates }: Props) {
    const [graph, setGraph] = useState<FlowGraphV2 | null>(null)
    const [rfNodes, setRfNodes] = useState<RFFlowNode[]>([])
    const [rfEdges, setRfEdges] = useState<RFEdge[]>([])
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [validation, setValidation] = useState<{ errors: string[]; warnings: string[] } | null>(null)
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null)
    const [dirty, setDirty] = useState(false)
    const [fullscreen, setFullscreen] = useState(false)
    const [triggerInfoOpen, setTriggerInfoOpen] = useState(true)
    const [isDark, setIsDark] = useState(false)

    // ESC sai do modo tela cheia
    useEffect(() => {
        if (!fullscreen) return
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setFullscreen(false)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [fullscreen])

    // Detecta dark mode pela classe `dark` no <html> (padrão Tailwind do app).
    // O ReactFlow recebe `colorMode` correspondente — assim Controls, MiniMap
    // e Background ficam coerentes com o tema do admin.
    useEffect(() => {
        if (typeof document === "undefined") return
        const root = document.documentElement
        const update = () => setIsDark(root.classList.contains("dark"))
        update()
        const obs = new MutationObserver(update)
        obs.observe(root, { attributes: true, attributeFilter: ["class"] })
        return () => obs.disconnect()
    }, [])

    // Carrega o grafo
    useEffect(() => {
        let cancelled = false
        async function load() {
            setLoading(true)
            try {
                const res = await fetch("/api/whatsapp/central/flow", { cache: "no-store" })
                const j = await res.json()
                if (cancelled) return
                if (!res.ok) throw new Error(j.error || "Erro ao carregar grafo")
                setGraph(j.graph)
                const { nodes, edges } = engineToRF(j.graph)
                setRfNodes(nodes)
                setRfEdges(edges)
                setValidation(j.validation ?? null)
                setDirty(false)
            } catch (e) {
                const msg = e instanceof Error ? e.message : "Erro desconhecido"
                setFeedback({ type: "err", msg })
            } finally {
                setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    const onNodesChange = useCallback((changes: NodeChange<RFFlowNode>[]) => {
        setRfNodes(nds => applyNodeChanges(changes, nds))
        if (changes.some(c => c.type === "position" || c.type === "remove" || c.type === "add" || c.type === "replace")) {
            setDirty(true)
        }
    }, [])

    const onEdgesChange = useCallback((changes: EdgeChange<RFEdge>[]) => {
        setRfEdges(eds => applyEdgeChanges(changes, eds))
        if (changes.some(c => c.type === "remove" || c.type === "add")) setDirty(true)
    }, [])

    const onConnect = useCallback((params: Connection) => {
        const id = `e_${crypto.randomUUID().slice(0, 8)}`
        setRfEdges(eds => addEdge({
            ...params,
            id,
            style: edgeStyle(params.sourceHandle ?? undefined),
            label: params.sourceHandle ?? undefined,
            labelStyle: { fontSize: 10, fontWeight: 500 },
        }, eds))
        setDirty(true)
    }, [])

    const selectedNode = useMemo(
        () => rfNodes.find(n => n.id === selectedId) ?? null,
        [rfNodes, selectedId]
    )

    function updateSelected(patch: Partial<RFNodeData>) {
        if (!selectedId) return
        setRfNodes(nds => nds.map(n =>
            n.id === selectedId
                ? { ...n, data: { ...n.data, ...patch, config: patch.config !== undefined ? patch.config : n.data.config } }
                : n
        ))
        setDirty(true)
    }

    function updateSelectedConfig(patch: Partial<NodeConfig>) {
        if (!selectedId) return
        setRfNodes(nds => nds.map(n => {
            if (n.id !== selectedId) return n
            const newCfg = { ...(n.data.config ?? {}), ...patch }
            return { ...n, data: { ...n.data, config: newCfg } }
        }))
        setDirty(true)
    }

    function deleteSelected() {
        if (!selectedId) return
        const node = rfNodes.find(n => n.id === selectedId)
        if (node?.type === "start") {
            setFeedback({ type: "err", msg: "O nó Início não pode ser removido." })
            return
        }
        setRfNodes(nds => nds.filter(n => n.id !== selectedId))
        setRfEdges(eds => eds.filter(e => e.source !== selectedId && e.target !== selectedId))
        setSelectedId(null)
        setDirty(true)
    }

    function addNode(type: NodeType) {
        const id = `n_${crypto.randomUUID().slice(0, 8)}`
        const center = { x: 600 + Math.random() * 80, y: 400 + Math.random() * 80 }
        const cfg: NodeConfig | null =
            type === "condition" ? { expr: "lead.exists" } :
            type === "action" ? { kind: "add_tag", tag: "" } :
            type === "send_template" ? { slug: "", bot_step: "" } :
            type === "silence" ? { reason: "flow_silence" } :
            type === "end" ? { bot_step: "" } :
            null
        const newNode: RFFlowNode = {
            id,
            type,
            position: center,
            data: { label: defaultLabel(type), config: cfg },
        }
        setRfNodes(nds => [...nds, newNode])
        setSelectedId(id)
        setDirty(true)
    }

    async function handleSave() {
        if (!graph) return
        setSaving(true)
        setFeedback(null)
        try {
            const updated = rfToEngine(graph, rfNodes, rfEdges)
            const res = await fetch("/api/whatsapp/central/flow", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            })
            const j = await res.json()
            if (!res.ok) {
                if (j.validation) setValidation(j.validation)
                throw new Error(j.error || "Falha ao salvar")
            }
            setGraph(j.graph)
            setValidation(j.validation ?? null)
            setFeedback({ type: "ok", msg: "Fluxo salvo. O bot já está usando essa versão." })
            setDirty(false)
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro desconhecido"
            setFeedback({ type: "err", msg })
        } finally {
            setSaving(false)
        }
    }

    async function handleReset() {
        if (!confirm("Resetar o fluxo para o padrão? Suas alterações serão perdidas.")) return
        setResetting(true)
        setFeedback(null)
        try {
            const res = await fetch("/api/whatsapp/central/flow", { method: "DELETE" })
            const j = await res.json()
            if (!res.ok) throw new Error(j.error || "Falha ao resetar")
            setGraph(j.graph)
            const { nodes, edges } = engineToRF(j.graph)
            setRfNodes(nodes)
            setRfEdges(edges)
            setValidation(null)
            setFeedback({ type: "ok", msg: "Fluxo resetado para o padrão." })
            setDirty(false)
            setSelectedId(null)
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Erro desconhecido"
            setFeedback({ type: "err", msg })
        } finally {
            setResetting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando fluxo…
            </div>
        )
    }

    if (!graph) {
        return (
            <div className="flex items-center justify-center h-[400px] text-rose-600 text-sm">
                Não foi possível carregar o fluxo.
            </div>
        )
    }

    const editor = (
        <div
            className={`text-card-foreground border overflow-hidden flex flex-col ${
                fullscreen
                    ? "fixed inset-0 z-[9999] rounded-none bg-background"
                    : "flex-1 min-h-0 rounded-xl bg-card"
            }`}
        >
            <div className="px-5 py-3 border-b flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Editor de fluxo
                        {dirty && <span className="text-[10px] text-amber-800 dark:text-amber-200 bg-amber-500/15 ring-1 ring-amber-500/40 px-1.5 py-0.5 rounded">não salvo</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Cada inbound do bot executa este grafo. Edite nós, conecte handles, salve — vale na próxima mensagem.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFullscreen(f => !f)}
                        className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-md border hover:bg-muted"
                        title={fullscreen ? "Sair do modo tela cheia (Esc)" : "Modo tela cheia"}
                    >
                        {fullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                        {fullscreen ? "Sair tela cheia" : "Tela cheia"}
                    </button>
                    <button
                        onClick={handleReset}
                        disabled={resetting}
                        className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-md border hover:bg-muted disabled:opacity-50"
                    >
                        {resetting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                        Resetar p/ padrão
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !dirty}
                        className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Salvar fluxo
                    </button>
                </div>
            </div>

            {/* Painel "Como o welcome é disparado" — documenta os DOIS gatilhos
                da 1ª mensagem (LP/admin via dispatchWelcome + inbound desconhecido
                via este grafo), além do gate de pausa global. O engine só roda
                no caminho inbound — mas operadores precisam enxergar o sistema
                inteiro pra fazer ajustes manuais com confiança. */}
            <TriggerInfoPanel open={triggerInfoOpen} onToggle={() => setTriggerInfoOpen(o => !o)} />

            {feedback && (
                <div className={`px-5 py-2 text-xs flex items-start gap-1.5 border-b ${
                    feedback.type === "ok"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}>
                    {feedback.type === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5" />}
                    <span>{feedback.msg}</span>
                    <button onClick={() => setFeedback(null)} className="ml-auto opacity-60 hover:opacity-100">
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}

            {validation && (validation.errors?.length || validation.warnings?.length) ? (
                <div className="px-5 py-2 text-xs border-b bg-amber-500/10 space-y-0.5">
                    {validation.errors?.map((err, i) => (
                        <div key={`e${i}`} className="text-rose-700 dark:text-rose-300 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5" /> {err}
                        </div>
                    ))}
                    {validation.warnings?.map((w, i) => (
                        <div key={`w${i}`} className="text-amber-800 dark:text-amber-200 flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 opacity-60" /> {w}
                        </div>
                    ))}
                </div>
            ) : null}

            <div className="relative flex-1 min-h-0">
                {/* Wrapper absolute inset-0: dá ao ReactFlow dimensões explícitas
                 * desde a primeira medição (sem isso, em layout flex o fitView
                 * roda com viewport 0x0 e os nós ficam fora da tela). */}
                <div className="absolute inset-0">
                    <ReactFlow
                        nodes={rfNodes}
                        edges={rfEdges}
                        nodeTypes={NODE_TYPES}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={(_, n) => setSelectedId(n.id)}
                        onPaneClick={() => setSelectedId(null)}
                        fitView
                        fitViewOptions={{ padding: 0.18 }}
                        minZoom={0.3}
                        maxZoom={2}
                        proOptions={{ hideAttribution: true }}
                        colorMode={isDark ? "dark" : "light"}
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={18}
                            size={1}
                            color={isDark ? "rgba(148,163,184,0.25)" : "rgba(100,116,139,0.35)"}
                        />
                        <Controls position="bottom-left" />
                        <MiniMap
                            position="bottom-right"
                            zoomable
                            pannable
                            maskColor={isDark ? "rgba(15,23,42,0.7)" : "rgba(241,245,249,0.7)"}
                            style={{
                                background: isDark ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.92)",
                                border: `1px solid ${isDark ? "rgba(148,163,184,0.2)" : "rgba(100,116,139,0.2)"}`,
                            }}
                            nodeColor={n => {
                                const t = n.type as NodeType
                                const palette: Record<NodeType, string> = {
                                    start:         "#94a3b8",
                                    classify:      "#a78bfa",
                                    condition:     "#fbbf24",
                                    action:        "#60a5fa",
                                    send_template: "#34d399",
                                    silence:       "#71717a",
                                    end:           "#cbd5e1",
                                }
                                return palette[t] ?? "#94a3b8"
                            }}
                        />
                        <Panel position="top-left">
                            <Palette onAdd={addNode} />
                        </Panel>
                    </ReactFlow>
                </div>

                {selectedNode && (
                    <SidePanel
                        node={selectedNode}
                        templates={templates}
                        onChangeLabel={l => updateSelected({ label: l })}
                        onChangeConfig={updateSelectedConfig}
                        onDelete={deleteSelected}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </div>
        </div>
    )

    // Em fullscreen, renderiza no body via Portal pra escapar de qualquer
    // stacking context da árvore (navbar do admin, max-w wrappers, etc).
    if (fullscreen && typeof document !== "undefined") {
        return createPortal(editor, document.body)
    }
    return editor
}

/* ─── Palette ────────────────────────────────────────────────────── */

function Palette({ onAdd }: { onAdd: (t: NodeType) => void }) {
    const items: { type: NodeType; label: string }[] = [
        { type: "condition",     label: "+ Condição" },
        { type: "action",        label: "+ Ação CRM" },
        { type: "send_template", label: "+ Template" },
        { type: "silence",       label: "+ Silêncio" },
        { type: "end",           label: "+ Fim" },
    ]
    return (
        <div className="bg-card/95 text-card-foreground backdrop-blur rounded-lg border shadow-sm dark:shadow-black/40 p-2 space-y-1">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground px-1">Adicionar nó</div>
            {items.map(i => {
                const Icon = NODE_THEME[i.type].icon
                return (
                    <button
                        key={i.type}
                        type="button"
                        onClick={() => onAdd(i.type)}
                        className="w-full text-left text-xs flex items-center gap-1.5 px-2 py-1 rounded hover:bg-muted"
                    >
                        <Icon className="h-3 w-3" />
                        {i.label}
                    </button>
                )
            })}
        </div>
    )
}

/* ─── Trigger Info Panel ─────────────────────────────────────────── */

/**
 * Painel didático no topo do editor, explicando os DOIS pontos onde a 1ª
 * mensagem (welcome) é disparada e o gate de pausa global que cobre os dois.
 * O grafo abaixo cobre apenas o gatilho 2 (inbound). Manter este texto em
 * sincronia com /api/lp/lead, /lib/whatsapp.ts e /api/whatsapp/inbound.
 */
function TriggerInfoPanel({ open, onToggle }: { open: boolean; onToggle: () => void }) {
    return (
        <div className="border-b">
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-5 py-2 flex items-center gap-2 text-xs text-left hover:bg-muted/40 transition-colors"
            >
                <Info className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span className="font-medium">Como o welcome é disparado &amp; o que este grafo cobre</span>
                <span className="text-muted-foreground hidden sm:inline">— LP, inbound, pausa global</span>
                <span className="ml-auto text-muted-foreground">
                    {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </span>
            </button>
            {open && (
                <div className="px-5 pb-3 text-[12px] text-muted-foreground space-y-2.5 bg-muted/20">
                    <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 shrink-0">
                            Gatilho&nbsp;1
                        </span>
                        <div className="leading-relaxed">
                            <strong className="text-foreground">Lead capturado na LP ou criado no admin</strong> — não passa por este grafo.
                            O <code>dispatchWelcome()</code> em <code>/lib/whatsapp.ts</code> respeita opt-out, faz dedup
                            de 24h e pede ao VPS renderizar o template <code>welcome-default</code> via <code>/api/whatsapp/render-welcome</code>.
                            Editar o welcome aqui não afeta este caminho — edite o template na aba <strong>Templates</strong>.
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shrink-0">
                            Gatilho&nbsp;2
                        </span>
                        <div className="leading-relaxed">
                            <strong className="text-foreground">Inbound chega de um número desconhecido</strong> — entra
                            neste grafo pelo nó <em>Início</em>. O classificador roteia em 5 saídas. Quando cai em
                            <em> sem match</em> e o lead passa pelos gates (não está em opt-out, não está em handoff,
                            não tem <code>interesse_principal</code> e não tem a tag <code>whatsapp:menu_enviado</code>),
                            a engine envia o welcome e marca a tag — assim não repete.
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 shrink-0">
                            Pausa
                        </span>
                        <div className="leading-relaxed">
                            <strong className="text-foreground">Gate global</strong> em <code>site_settings.whatsapp_central_paused</code>:
                            ativado pelo botão &quot;Pausar fluxo&quot; na aba <strong>Conexão</strong>, bloqueia welcome (gatilho 1) <em>e</em>
                            qualquer execução deste grafo (gatilho 2) antes mesmo do nó Início. Inbound continua sendo logada no Inbox.
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ─── Side panel ─────────────────────────────────────────────────── */

const CONDITION_OPTIONS: { value: ConditionExpr; label: string }[] = [
    { value: "lead.exists",            label: "Lead existe?" },
    { value: "lead.optout_whatsapp",   label: "Lead em opt-out?" },
    { value: "lead.handoff_humano",    label: "Lead em handoff humano?" },
    { value: "lead.has_interesse",     label: "Lead já tem interesse_principal?" },
    { value: "lead.has_menu_sent_tag", label: "Lead já recebeu o menu de welcome?" },
    { value: "lead.welcome_eligible",  label: "Elegível p/ welcome (sem interesse e sem menu)?" },
]

const ACTION_OPTIONS: { value: ActionKind; label: string; needsTag?: boolean }[] = [
    { value: "apply_optout",      label: "Aplicar opt-out (CRM + tabela whatsapp_optouts)" },
    { value: "apply_resubscribe", label: "Reativar lead (limpa opt-out)" },
    { value: "apply_handoff",     label: "Marcar handoff humano" },
    { value: "apply_interest",    label: "Aplicar interesse classificado" },
    { value: "add_tag",           label: "Adicionar tag em tags_whatsapp", needsTag: true },
]

function SidePanel({
    node, templates, onChangeLabel, onChangeConfig, onDelete, onClose,
}: {
    node: RFFlowNode
    templates: Template[]
    onChangeLabel: (label: string) => void
    onChangeConfig: (patch: Partial<NodeConfig>) => void
    onDelete: () => void
    onClose: () => void
}) {
    const type = node.type as NodeType
    const theme = NODE_THEME[type]
    const Icon = theme.icon
    const cfg = node.data.config ?? {}

    return (
        <div className="absolute inset-y-0 right-0 z-30 w-full sm:w-[380px] bg-card border-l shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b flex items-start gap-2">
                <div className={`p-2 rounded-md ring-1 ${theme.ring} ${theme.bg}`}>
                    <Icon className={`h-4 w-4 ${theme.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase text-muted-foreground">{type.replace(/_/g, " ")}</div>
                    <div className="font-semibold text-sm truncate">{node.data.label}</div>
                </div>
                <button onClick={onClose} className="p-1.5 rounded hover:bg-muted text-muted-foreground" aria-label="Fechar">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3 text-sm">
                <Field label="Rótulo do nó">
                    <input
                        type="text"
                        value={node.data.label}
                        onChange={e => onChangeLabel(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                    />
                </Field>

                {type === "condition" && (
                    <Field label="Expressão">
                        <select
                            value={cfg.expr ?? "lead.exists"}
                            onChange={e => onChangeConfig({ expr: e.target.value as ConditionExpr })}
                            className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                        >
                            {CONDITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Saída <strong>true</strong> (verde) é tomada quando a expressão é verdadeira; <strong>false</strong> (vermelha tracejada) caso contrário.
                        </p>
                    </Field>
                )}

                {type === "action" && (
                    <>
                        <Field label="Tipo de ação">
                            <select
                                value={cfg.kind ?? "add_tag"}
                                onChange={e => onChangeConfig({ kind: e.target.value as ActionKind })}
                                className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                            >
                                {ACTION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </Field>
                        {cfg.kind === "add_tag" && (
                            <Field label="Tag a adicionar">
                                <input
                                    type="text"
                                    value={cfg.tag ?? ""}
                                    onChange={e => onChangeConfig({ tag: e.target.value })}
                                    placeholder="ex: whatsapp:menu_enviado"
                                    className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm font-mono"
                                />
                            </Field>
                        )}
                        <Field label="Nota (opcional)">
                            <input
                                type="text"
                                value={cfg.note ?? ""}
                                onChange={e => onChangeConfig({ note: e.target.value })}
                                placeholder="anotação interna"
                                className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                            />
                        </Field>
                    </>
                )}

                {type === "send_template" && (
                    <>
                        <Field label="Modo">
                            <select
                                value={cfg.dynamic ?? ""}
                                onChange={e => {
                                    const v = e.target.value
                                    onChangeConfig({ dynamic: v ? "triagem_by_interesse" : undefined })
                                }}
                                className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                            >
                                <option value="">Slug fixo</option>
                                <option value="triagem_by_interesse">Dinâmico — triagem por interesse</option>
                            </select>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                No modo dinâmico, o slug vira <code>triagem-{"{interesse}"}</code> com base na classificação.
                            </p>
                        </Field>

                        {!cfg.dynamic && (
                            <Field label="Template (slug)">
                                <select
                                    value={cfg.slug ?? ""}
                                    onChange={e => onChangeConfig({ slug: e.target.value })}
                                    className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                                >
                                    <option value="">— selecione —</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.slug}>{t.title} ({t.slug})</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Edite o corpo dos templates na aba <strong>Templates</strong>.
                                </p>
                            </Field>
                        )}

                        <Field label="bot_step (label do log)">
                            <input
                                type="text"
                                value={cfg.bot_step ?? ""}
                                onChange={e => onChangeConfig({ bot_step: e.target.value })}
                                placeholder="ex: welcome, triagem, optout"
                                className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm font-mono"
                            />
                        </Field>

                        <Field label="Mensagem de fallback">
                            <textarea
                                value={cfg.fallback ?? ""}
                                onChange={e => onChangeConfig({ fallback: e.target.value })}
                                rows={3}
                                placeholder="Usado se o template não existir no banco."
                                className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                            />
                        </Field>

                        <Field label="Nota no contact_history (opcional)">
                            <input
                                type="text"
                                value={cfg.contact_note ?? ""}
                                onChange={e => onChangeConfig({ contact_note: e.target.value })}
                                placeholder="ex: Lead solicitou opt-out via WhatsApp"
                                className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm"
                            />
                        </Field>
                    </>
                )}

                {type === "silence" && (
                    <Field label="Reason (telemetria)">
                        <input
                            type="text"
                            value={cfg.reason ?? ""}
                            onChange={e => onChangeConfig({ reason: e.target.value })}
                            placeholder="ex: lead_optout, unknown_intent"
                            className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm font-mono"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Devolvido pro VPS no JSON <code>{"{ silent: true, reason }"}</code>. Útil pra debugar por que o bot ficou em silêncio.
                        </p>
                    </Field>
                )}

                {type === "end" && (
                    <Field label="bot_step (override do log)">
                        <input
                            type="text"
                            value={cfg.bot_step ?? ""}
                            onChange={e => onChangeConfig({ bot_step: e.target.value })}
                            placeholder="vazio = usa o do send_template anterior"
                            className="w-full px-2.5 py-1.5 rounded-md border bg-background text-sm font-mono"
                        />
                    </Field>
                )}

                {type === "classify" && (
                    <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md">
                        O nó <strong>classify</strong> roda <code>classifyMessage()</code> sobre o texto recebido e tem 5 saídas
                        (handles) na borda inferior, da esquerda pra direita: <strong>opt-out</strong>, <strong>resubscribe</strong>,
                        <strong> humano</strong>, <strong>interesse</strong>, <strong>sem match</strong>. Conecte cada handle ao
                        próximo nó do ramo.
                    </div>
                )}

                {type === "start" && (
                    <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-md">
                        Nó de entrada do fluxo. Não pode ser removido nem editado — apenas rotulado e movido.
                    </div>
                )}
            </div>

            {type !== "start" && (
                <div className="border-t p-3 flex items-center gap-2">
                    <button
                        onClick={onDelete}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 text-xs font-medium border border-rose-500/30 rounded-md px-3 py-2"
                    >
                        <Trash2 className="h-3.5 w-3.5" /> Excluir nó
                    </button>
                </div>
            )}
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
            <div className="mt-1">{children}</div>
        </div>
    )
}
