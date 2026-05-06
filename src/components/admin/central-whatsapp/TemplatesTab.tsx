"use client"

import { useState } from "react"
import { Plus, Save, Trash2, Archive, AlertCircle, CheckCircle2, Loader2, Edit3 } from "lucide-react"
import type { Template } from "./types"

const CATEGORIES = [
    { id: "welcome", label: "Boas-vindas" },
    { id: "triagem", label: "Triagem" },
    { id: "oportunidade", label: "Oportunidade" },
    { id: "leilao", label: "Leilão" },
    { id: "follow_up", label: "Follow-up" },
    { id: "encaminhamento", label: "Encaminhamento" },
    { id: "optout", label: "Opt-out" },
    { id: "geral", label: "Geral" },
]

interface Props {
    templates: Template[]
    onChange: () => void
}

export function TemplatesTab({ templates, onChange }: Props) {
    const [editing, setEditing] = useState<Template | null>(null)
    const [form, setForm] = useState<{ title: string; category: string; body: string }>({
        title: "",
        category: "geral",
        body: "",
    })
    const [saving, setSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null)

    function startNew() {
        setEditing(null)
        setForm({ title: "", category: "geral", body: "" })
        setFeedback(null)
    }

    function startEdit(t: Template) {
        setEditing(t)
        setForm({ title: t.title, category: t.category, body: t.body })
        setFeedback(null)
    }

    async function handleSave() {
        if (!form.title.trim() || !form.body.trim()) {
            setFeedback({ type: "err", msg: "Título e corpo são obrigatórios." })
            return
        }
        setSaving(true)
        setFeedback(null)
        try {
            const res = editing
                ? await fetch(`/api/whatsapp/central/templates/${editing.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                })
                : await fetch(`/api/whatsapp/central/templates`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                })
            const data = await res.json()
            if (!res.ok) {
                setFeedback({ type: "err", msg: data.error ?? "Erro ao salvar" })
                return
            }
            setFeedback({ type: "ok", msg: editing ? "Template atualizado." : "Template criado." })
            onChange()
            if (!editing) startNew()
        } catch (e: unknown) {
            setFeedback({ type: "err", msg: e instanceof Error ? e.message : "Erro" })
        } finally {
            setSaving(false)
        }
    }

    async function handleArchive(id: string) {
        if (!confirm("Arquivar este template? Pode ser restaurado depois.")) return
        const res = await fetch(`/api/whatsapp/central/templates/${id}`, { method: "DELETE" })
        if (res.ok) onChange()
    }

    const grouped = templates.reduce<Record<string, Template[]>>((acc, t) => {
        (acc[t.category] = acc[t.category] || []).push(t)
        return acc
    }, {})

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4">
            {/* Lista */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {templates.length} template(s) ativos. Use <code>{"{nome}"}</code> nas mensagens para inserir o nome do lead.
                    </p>
                    <button
                        onClick={startNew}
                        className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90"
                    >
                        <Plus className="h-3.5 w-3.5" /> Novo template
                    </button>
                </div>

                {Object.keys(grouped).length === 0 && (
                    <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground">
                        Nenhum template cadastrado ainda.
                    </div>
                )}

                {CATEGORIES.map(cat => {
                    const list = grouped[cat.id] ?? []
                    if (list.length === 0) return null
                    return (
                        <div key={cat.id}>
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
                                {cat.label}
                            </p>
                            <div className="bg-card text-card-foreground rounded-xl border divide-y">
                                {list.map(t => (
                                    <div
                                        key={t.id}
                                        className={`px-4 py-3 flex items-start gap-3 ${
                                            editing?.id === t.id ? "bg-primary/5 dark:bg-primary/10" : ""
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm">{t.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap mt-0.5">
                                                {t.body}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
                                                slug: <code>{t.slug}</code> · usado {t.usage_count}×
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => startEdit(t)}
                                                className="text-xs text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted"
                                                title="Editar"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleArchive(t.id)}
                                                className="text-xs text-muted-foreground hover:text-red-600 p-1 rounded hover:bg-muted"
                                                title="Arquivar"
                                            >
                                                <Archive className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Editor */}
            <div className="bg-card text-card-foreground rounded-xl border p-5 space-y-4 sticky top-4 self-start">
                <h3 className="font-semibold flex items-center gap-2">
                    {editing ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editing ? `Editar: ${editing.title}` : "Novo template"}
                </h3>

                <div className="space-y-1">
                    <label className="text-xs font-medium">Título</label>
                    <input
                        value={form.title}
                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        placeholder="Ex: Triagem · Sêmen"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium">Categoria</label>
                    <select
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                    >
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium">Mensagem</label>
                    <textarea
                        value={form.body}
                        onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                        rows={10}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/40"
                        placeholder={"Olá {nome}!\n\nObrigado pelo contato…"}
                    />
                    <p className="text-[10px] text-muted-foreground">
                        Variáveis disponíveis: <code>{"{nome}"}</code>, <code>{"{name}"}</code>
                    </p>
                </div>

                {feedback && (
                    <p
                        className={`text-xs flex items-center gap-1 ${
                            feedback.type === "ok"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                        }`}
                    >
                        {feedback.type === "ok"
                            ? <CheckCircle2 className="h-3 w-3" />
                            : <AlertCircle className="h-3 w-3" />}
                        {feedback.msg}
                    </p>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {editing ? "Salvar alterações" : "Criar template"}
                    </button>
                    {editing && (
                        <button
                            onClick={startNew}
                            className="px-4 py-2 rounded-md text-sm border hover:bg-muted"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
