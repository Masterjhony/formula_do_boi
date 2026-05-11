"use client"

import { useEffect, useState } from "react"
import {
    Plus, Send, Loader2, AlertCircle, CheckCircle2,
    Megaphone, Trash2, RefreshCw, ImageIcon, X,
} from "lucide-react"
import type { Campaign, Template } from "./types"
import { INTERESSE_GROUPS } from "./types"
import { useR2Upload, type MediaType } from "./useR2Upload"

interface Props {
    templates: Template[]
}

const STATUS_LABELS: Record<Campaign["status"], string> = {
    rascunho: "Rascunho",
    enviando: "Enviando",
    concluida: "Concluída",
    cancelada: "Cancelada",
    erro: "Erro",
}
const STATUS_COLORS: Record<Campaign["status"], string> = {
    rascunho: "bg-gray-500/15 text-gray-600 dark:text-gray-300",
    enviando: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    concluida: "bg-green-500/15 text-green-600 dark:text-green-400",
    cancelada: "bg-red-500/15 text-red-600 dark:text-red-400",
    erro: "bg-red-500/15 text-red-600 dark:text-red-400",
}

export function CampaignsTab({ templates }: Props) {
    const [list, setList] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null)

    async function fetchList() {
        setLoading(true)
        try {
            const res = await fetch(`/api/whatsapp/central/campaigns`)
            const data = await res.json()
            setList(data.campaigns ?? [])
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => { fetchList() }, [])

    async function handleSendCampaign(id: string) {
        if (!confirm("Disparar esta campanha agora? Os envios começarão imediatamente.")) return
        const res = await fetch(`/api/whatsapp/central/campaigns/${id}/send`, { method: "POST" })
        const data = await res.json()
        if (!res.ok) {
            setFeedback({ type: "err", msg: data.error ?? "Falha ao disparar" })
        } else {
            setFeedback({ type: "ok", msg: `Campanha disparada — ${data.queued} envios na fila.` })
        }
        fetchList()
    }

    async function handleDelete(id: string) {
        if (!confirm("Deletar esta campanha em rascunho?")) return
        await fetch(`/api/whatsapp/central/campaigns/${id}`, { method: "DELETE" })
        fetchList()
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                    Listas de transmissão segmentadas usando os filtros do CRM. Opt-outs são sempre excluídos automaticamente.
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={fetchList}
                        className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg border hover:bg-muted"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Atualizar
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-sm flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90"
                    >
                        <Plus className="h-3.5 w-3.5" /> Nova campanha
                    </button>
                </div>
            </div>

            {feedback && (
                <p
                    className={`text-sm flex items-center gap-2 px-3 py-2 rounded-lg border ${
                        feedback.type === "ok"
                            ? "bg-green-500/5 border-green-500/30 text-green-600 dark:text-green-400"
                            : "bg-red-500/5 border-red-500/30 text-red-600 dark:text-red-400"
                    }`}
                >
                    {feedback.type === "ok"
                        ? <CheckCircle2 className="h-4 w-4" />
                        : <AlertCircle className="h-4 w-4" />}
                    {feedback.msg}
                </p>
            )}

            {showForm && (
                <CampaignForm
                    templates={templates}
                    onClose={() => setShowForm(false)}
                    onCreated={() => {
                        setShowForm(false)
                        fetchList()
                    }}
                />
            )}

            <div className="bg-card text-card-foreground rounded-xl border overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : list.length === 0 ? (
                    <div className="p-10 text-center text-sm text-muted-foreground space-y-2">
                        <Megaphone className="h-8 w-8 mx-auto opacity-40" />
                        <p>Nenhuma campanha criada ainda.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {list.map(c => (
                            <div key={c.id} className="px-5 py-4 flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold truncate">{c.name}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                                            {STATUS_LABELS[c.status]}
                                        </span>
                                    </div>
                                    {c.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                            {c.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                        <span>{c.total_recipients} destinatários</span>
                                        <span className="text-green-600 dark:text-green-400">✓ {c.sent_count}</span>
                                        <span className="text-red-600 dark:text-red-400">✕ {c.failed_count}</span>
                                        {c.started_at && (
                                            <span>
                                                disparada em {new Date(c.started_at).toLocaleString("pt-BR")}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {c.status === "rascunho" && (
                                        <>
                                            <button
                                                onClick={() => handleSendCampaign(c.id)}
                                                className="text-xs flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90"
                                            >
                                                <Send className="h-3 w-3" /> Disparar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                className="text-xs p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                title="Deletar"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function CampaignForm({
    templates, onClose, onCreated,
}: {
    templates: Template[]
    onClose: () => void
    onCreated: () => void
}) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        template_id: "" as string,
        body: "",
        interesseGroup: "" as string,    // label do INTERESSE_GROUPS
        stage: "" as string,
        // Mídia direta (opcional, sobrescreve a do template se houver)
        media_url: null as string | null,
        media_type: null as MediaType | null,
        media_mime: null as string | null,
        media_filename: null as string | null,
        media_caption: null as string | null,
    })
    const [preview, setPreview] = useState<{ total: number; sample: { nome: string; telefone: string }[] } | null>(null)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState<string | null>(null)
    const { fileInputRef, uploading, uploadFile } = useR2Upload()

    function buildSegment() {
        const seg: Record<string, unknown> = {}
        if (form.interesseGroup) {
            const g = INTERESSE_GROUPS.find(x => x.label === form.interesseGroup)
            if (g) seg.interesse_principal = g.ids.length === 1 ? g.ids[0] : g.ids
        }
        if (form.stage) seg.stage = form.stage
        return seg
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        setErr(null)
        try {
            const up = await uploadFile(file)
            setForm(f => ({
                ...f,
                media_url: up.key,
                media_type: up.type,
                media_mime: up.mime,
                media_filename: up.filename,
            }))
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : "Erro no upload")
        }
    }

    function clearMedia() {
        setForm(f => ({
            ...f,
            media_url: null, media_type: null, media_mime: null,
            media_filename: null, media_caption: null,
        }))
    }

    async function handlePreview() {
        setLoading(true)
        setErr(null)
        try {
            const res = await fetch(`/api/whatsapp/central/campaigns/preview`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ segment: buildSegment() }),
            })
            const data = await res.json()
            if (!res.ok) {
                setErr(data.error ?? "Erro no preview")
                return
            }
            setPreview(data)
        } finally {
            setLoading(false)
        }
    }

    async function handleCreate() {
        if (!form.name.trim()) {
            setErr("Nome é obrigatório.")
            return
        }
        const hasContent = form.template_id || form.body.trim() || form.media_url
        if (!hasContent) {
            setErr("Selecione um template, escreva o corpo ou anexe mídia.")
            return
        }
        setLoading(true)
        setErr(null)
        try {
            const res = await fetch(`/api/whatsapp/central/campaigns`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    description: form.description.trim() || null,
                    segment: buildSegment(),
                    template_id: form.template_id || null,
                    body: form.body.trim() || null,
                    media_url: form.media_url,
                    media_type: form.media_type,
                    media_mime: form.media_mime,
                    media_filename: form.media_filename,
                    media_caption: form.media_caption,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setErr(data.error ?? "Erro ao criar campanha")
                return
            }
            onCreated()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-card text-card-foreground rounded-xl border p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Nova campanha
                </h3>
                <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">
                    Fechar
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium">Nome</label>
                    <input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                        placeholder="Ex: Aviso leilão maio"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Descrição</label>
                    <input
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                        placeholder="(opcional)"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium">Filtrar por interesse</label>
                    <select
                        value={form.interesseGroup}
                        onChange={e => setForm(f => ({ ...f, interesseGroup: e.target.value }))}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                    >
                        <option value="">Todos</option>
                        {INTERESSE_GROUPS.map(g => (
                            <option key={g.label} value={g.label}>
                                {g.label}{g.ids.length > 1 ? ` (${g.ids.length} variantes)` : ''}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium">Filtrar por stage</label>
                    <select
                        value={form.stage}
                        onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                    >
                        <option value="">Todos</option>
                        <option value="novo">Novo</option>
                        <option value="contato">Contato</option>
                        <option value="proposta">Proposta</option>
                        <option value="fechado">Fechado</option>
                        <option value="perdido">Perdido</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium">Template (opcional — se vazio, use o corpo livre abaixo)</label>
                <select
                    value={form.template_id}
                    onChange={e => setForm(f => ({ ...f, template_id: e.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                >
                    <option value="">— Nenhum —</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.id}>[{t.category}] {t.title}</option>
                    ))}
                </select>
            </div>

            {!form.template_id && (
                <div className="space-y-1">
                    <label className="text-xs font-medium">Mensagem livre</label>
                    <textarea
                        value={form.body}
                        onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                        rows={5}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"
                        placeholder={"Olá {nome}, novidades por aqui…"}
                    />
                </div>
            )}

            {/* Mídia anexa à campanha — sobrescreve a do template, se houver */}
            <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" /> Anexar mídia (opcional)
                    </label>
                    {form.media_url && (
                        <button
                            onClick={clearMedia}
                            className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5"
                        >
                            <X className="h-3 w-3" /> Remover
                        </button>
                    )}
                </div>

                {form.media_url ? (
                    <div className="rounded-md border bg-muted/30 p-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-blue-500" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{form.media_filename}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    {form.media_type} · {form.media_mime}
                                </p>
                            </div>
                        </div>
                        <input
                            value={form.media_caption ?? ''}
                            onChange={e => setForm(f => ({ ...f, media_caption: e.target.value || null }))}
                            placeholder="Legenda da mídia (opcional — vazio usa o texto da mensagem como legenda)"
                            className="w-full rounded-md border bg-background px-2 py-1 text-xs"
                        />
                    </div>
                ) : (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*,audio/*,application/pdf"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="block w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer"
                        />
                        {uploading && (
                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" /> Enviando para Cloudflare R2…
                            </p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Foto/vídeo/áudio/PDF, máx 50MB. Vai antes do texto. Se a campanha
                            usa template, esta mídia <strong>sobrescreve</strong> a do template.
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
                <button
                    onClick={handlePreview}
                    disabled={loading}
                    className="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-md border hover:bg-muted disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    Pré-visualizar público
                </button>
                {preview && (
                    <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">{preview.total}</strong> leads no segmento
                        {preview.total > 0 && (
                            <span className="ml-2">
                                (ex: {preview.sample.slice(0, 3).map(s => s.nome).join(", ")})
                            </span>
                        )}
                    </p>
                )}
            </div>

            {err && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> {err}
                </p>
            )}

            <div className="flex gap-2 justify-end pt-2 border-t">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md text-sm border hover:bg-muted"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Salvar como rascunho
                </button>
            </div>
        </div>
    )
}
