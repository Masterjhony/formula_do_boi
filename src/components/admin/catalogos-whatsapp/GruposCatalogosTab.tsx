"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
    Users, Plus, Pencil, Trash2, RefreshCw, CheckCircle2, XCircle, Loader2,
    ChevronDown, ChevronRight,
} from "lucide-react"

type Group = {
    id: string
    jid: string
    nome: string
    slug: string | null
    descricao: string | null
    ativo: boolean
    created_at: string
    updated_at: string
}

type VpsGroup = { id: string; subject?: string }

export function GruposCatalogosTab() {
    const [groups, setGroups] = useState<Group[]>([])
    const [vpsGroups, setVpsGroups] = useState<VpsGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<Group | null>(null)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showVpsList, setShowVpsList] = useState(false)
    const [vpsFilter, setVpsFilter] = useState("")

    const fetchGroups = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/whatsapp-catalogos/groups", { cache: "no-store" })
            if (res.ok) {
                const j = await res.json()
                setGroups(j.groups ?? [])
            }
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchVpsGroups = useCallback(async () => {
        try {
            const res = await fetch("/api/whatsapp-catalogos/vps-groups", { cache: "no-store" })
            if (res.ok) {
                const j = await res.json()
                setVpsGroups(j.groups ?? [])
            }
        } catch { /* opcional */ }
    }, [])

    useEffect(() => {
        fetchGroups()
    }, [fetchGroups])

    // VPS é caro (lista 100+ grupos) — só busca quando o operador abre o bloco
    useEffect(() => {
        if (showVpsList) fetchVpsGroups()
    }, [showVpsList, fetchVpsGroups])

    // Esconde grupos já configurados e aplica filtro de texto
    const configuredJids = useMemo(
        () => new Set(groups.map(g => g.jid).filter(Boolean)),
        [groups]
    )
    const filteredVpsGroups = useMemo(() => {
        const term = vpsFilter.trim().toLowerCase()
        return vpsGroups
            .filter(g => !configuredJids.has(g.id))
            .filter(g => !term || (g.subject || "").toLowerCase().includes(term))
    }, [vpsGroups, configuredJids, vpsFilter])

    async function saveGroup(g: Partial<Group> & { id?: string }) {
        setError(null)
        try {
            const url = g.id
                ? `/api/whatsapp-catalogos/groups/${g.id}`
                : `/api/whatsapp-catalogos/groups`
            const method = g.id ? "PUT" : "POST"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(g),
            })
            if (!res.ok) {
                const j = await res.json().catch(() => ({}))
                throw new Error(j.error || `HTTP ${res.status}`)
            }
            setEditing(null)
            setCreating(false)
            await fetchGroups()
        } catch (e) {
            setError(e instanceof Error ? e.message : "Falha ao salvar")
        }
    }

    async function deleteGroup(id: string) {
        if (!confirm("Remover este grupo do monitoramento? As detecções antigas são preservadas.")) return
        const res = await fetch(`/api/whatsapp-catalogos/groups/${id}`, { method: "DELETE" })
        if (res.ok) fetchGroups()
    }

    return (
        <div className="space-y-5">
            <div className="bg-card text-card-foreground rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" /> Grupos monitorados
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { fetchGroups(); fetchVpsGroups() }}
                            className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border hover:bg-muted"
                        >
                            <RefreshCw className="h-3 w-3" /> Atualizar
                        </button>
                        <button
                            onClick={() => setCreating(true)}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
                        >
                            <Plus className="h-3 w-3" /> Novo grupo
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="px-6 py-3 bg-red-500/10 text-red-400 text-sm border-b">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="p-10 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="p-10 text-center text-sm text-muted-foreground">
                        Nenhum grupo configurado ainda. Clique em <strong>Novo grupo</strong>.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                            <tr>
                                <th className="text-left px-6 py-2 font-medium">Nome</th>
                                <th className="text-left px-6 py-2 font-medium">JID</th>
                                <th className="text-left px-6 py-2 font-medium">Status</th>
                                <th className="text-right px-6 py-2 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(g => (
                                <tr key={g.id} className="border-t hover:bg-muted/20">
                                    <td className="px-6 py-3">
                                        <div className="font-medium">{g.nome}</div>
                                        {g.descricao && (
                                            <div className="text-xs text-muted-foreground mt-0.5">{g.descricao}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        {g.jid ? (
                                            <code className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">{g.jid}</code>
                                        ) : (
                                            <span className="text-xs text-amber-500">sem JID — não monitorado</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3">
                                        {g.ativo ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-500">
                                                <CheckCircle2 className="h-3 w-3" /> Ativo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <XCircle className="h-3 w-3" /> Inativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => setEditing(g)}
                                            className="text-xs px-2 py-1 rounded border hover:bg-muted mr-2 inline-flex items-center gap-1"
                                        >
                                            <Pencil className="h-3 w-3" /> Editar
                                        </button>
                                        <button
                                            onClick={() => deleteGroup(g.id)}
                                            className="text-xs px-2 py-1 rounded border border-red-500/40 text-red-400 hover:bg-red-500/10 inline-flex items-center gap-1"
                                        >
                                            <Trash2 className="h-3 w-3" /> Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="bg-card text-card-foreground rounded-xl border overflow-hidden">
                <button
                    onClick={() => setShowVpsList(v => !v)}
                    className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-muted/20 transition-colors"
                >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {showVpsList ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span>Procurar JID de outro grupo</span>
                        {showVpsList && vpsGroups.length > 0 && (
                            <span className="text-[11px] text-muted-foreground/70">
                                ({filteredVpsGroups.length} disponíveis · {configuredJids.size} já configurados ocultos)
                            </span>
                        )}
                    </div>
                </button>

                {showVpsList && (
                    <>
                        <div className="px-6 py-3 border-t bg-muted/10 space-y-1.5">
                            <p className="text-[11px] text-muted-foreground">
                                Lista dos grupos que o número logado participa (≠ grupos monitorados).
                                A automação só age nos grupos da tabela acima — esta lista é só pra
                                copiar o JID quando você quiser monitorar mais um.
                            </p>
                            <input
                                value={vpsFilter}
                                onChange={e => setVpsFilter(e.target.value)}
                                placeholder="Filtrar por nome do grupo…"
                                className="mt-1 w-full px-3 py-1.5 rounded-md border bg-background text-sm"
                            />
                        </div>
                        {filteredVpsGroups.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground">
                                {vpsGroups.length === 0
                                    ? "Carregando lista do VPS…"
                                    : "Nenhum grupo bate com o filtro."}
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                                    <tr>
                                        <th className="text-left px-6 py-2 font-medium">Nome</th>
                                        <th className="text-left px-6 py-2 font-medium">JID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVpsGroups.map(g => (
                                        <tr key={g.id} className="border-t">
                                            <td className="px-6 py-2">{g.subject || "—"}</td>
                                            <td className="px-6 py-2">
                                                <code className="text-xs bg-muted/40 px-1.5 py-0.5 rounded">{g.id}</code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>

            {(creating || editing) && (
                <GroupForm
                    initial={editing || undefined}
                    onClose={() => { setEditing(null); setCreating(false); setError(null) }}
                    onSave={saveGroup}
                />
            )}
        </div>
    )
}

function GroupForm({
    initial, onClose, onSave,
}: {
    initial?: Group
    onClose: () => void
    onSave: (g: Partial<Group> & { id?: string }) => Promise<void>
}) {
    const [nome, setNome] = useState(initial?.nome ?? "")
    const [jid, setJid] = useState(initial?.jid ?? "")
    const [descricao, setDescricao] = useState(initial?.descricao ?? "")
    const [ativo, setAtivo] = useState(initial?.ativo ?? true)
    const [saving, setSaving] = useState(false)

    async function submit() {
        setSaving(true)
        await onSave({
            id: initial?.id,
            nome,
            jid,
            descricao,
            ativo,
        })
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-card text-card-foreground rounded-xl border w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b">
                    <h3 className="font-semibold">{initial ? "Editar grupo" : "Novo grupo"}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Nome</label>
                        <input
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-md border bg-background text-sm"
                            placeholder="Ex: Bula Assessoria | Assessores"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">JID do grupo</label>
                        <input
                            value={jid}
                            onChange={e => setJid(e.target.value)}
                            className="mt-1 w-full px-3 py-2 rounded-md border bg-background text-sm font-mono"
                            placeholder="120363012345678901@g.us"
                        />
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Encontre na tabela de grupos visíveis na sessão (logo abaixo).
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Descrição</label>
                        <textarea
                            value={descricao}
                            onChange={e => setDescricao(e.target.value)}
                            rows={2}
                            className="mt-1 w-full px-3 py-2 rounded-md border bg-background text-sm"
                            placeholder="O que este grupo recebe (opcional)"
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={ativo}
                            onChange={e => setAtivo(e.target.checked)}
                        />
                        Ativo (monitora PDFs deste grupo)
                    </label>
                </div>
                <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-2 text-sm rounded-md border hover:bg-muted">
                        Cancelar
                    </button>
                    <button
                        onClick={submit}
                        disabled={saving || !nome.trim()}
                        className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? "Salvando…" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    )
}
