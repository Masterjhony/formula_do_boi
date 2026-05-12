"use client"

import { useEffect, useState, useCallback } from "react"
import { AlertCircle, CheckCircle2, Pause, Play, QrCode, RefreshCw } from "lucide-react"
import type { WAStatus } from "./types"

type PauseState = {
    paused: boolean
    paused_at: string | null
    paused_by: string | null
}

function formatDateTime(iso: string | null): string {
    if (!iso) return ""
    try {
        return new Date(iso).toLocaleString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        })
    } catch {
        return iso
    }
}

export function ConexaoTab() {
    const [status, setStatus] = useState<WAStatus>("disconnected")
    const [qr, setQr] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const [pause, setPause] = useState<PauseState | null>(null)
    const [pauseLoading, setPauseLoading] = useState(true)
    const [pauseSaving, setPauseSaving] = useState(false)
    const [pauseError, setPauseError] = useState<string | null>(null)

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/whatsapp/status", { cache: "no-store" })
            const j = await res.json()
            setStatus(j.status ?? "disconnected")
            setQr(j.qr ?? null)
        } catch {
            setStatus("disconnected")
            setQr(null)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchPause = useCallback(async () => {
        try {
            const res = await fetch("/api/whatsapp/central/pause", { cache: "no-store" })
            if (res.ok) {
                const j = (await res.json()) as PauseState
                setPause(j)
            }
        } catch {
            // silencioso — o toggle fica desabilitado se nunca carregou
        } finally {
            setPauseLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStatus()
        fetchPause()
        const t = setInterval(fetchStatus, 5000)
        return () => clearInterval(t)
    }, [fetchStatus, fetchPause])

    async function togglePause() {
        if (!pause || pauseSaving) return
        setPauseSaving(true)
        setPauseError(null)
        const target = !pause.paused
        try {
            const res = await fetch("/api/whatsapp/central/pause", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paused: target }),
            })
            if (!res.ok) {
                const j = await res.json().catch(() => ({}))
                throw new Error(j.error || `HTTP ${res.status}`)
            }
            const j = (await res.json()) as PauseState
            setPause(j)
        } catch (e) {
            setPauseError(e instanceof Error ? e.message : "Falha ao salvar")
        } finally {
            setPauseSaving(false)
        }
    }

    const isPaused = !!pause?.paused

    return (
        <div className="space-y-5">
            <div className="bg-card text-card-foreground rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        <QrCode className="h-4 w-4" /> Status de conexão do número
                    </h3>
                    <button
                        onClick={fetchStatus}
                        className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border hover:bg-muted"
                    >
                        <RefreshCw className="h-3 w-3" /> Atualizar
                    </button>
                </div>
                <div className="p-8 flex flex-col items-center justify-center min-h-[280px]">
                    {loading && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    )}

                    {!loading && status === "connected" && (
                        <div className="text-center space-y-3">
                            <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto" />
                            <h4 className="text-xl font-bold">Número conectado</h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                                {isPaused
                                    ? "Conectado, mas em pausa: a Central não envia welcome nem executa o fluxo. Mensagens recebidas continuam aparecendo no Inbox."
                                    : "Pronto para receber inbound, classificar interesses e disparar mensagens."}
                            </p>
                        </div>
                    )}

                    {!loading && status === "qr" && qr && (
                        <div className="space-y-4 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-xl border shadow-sm">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={qr} alt="QR" className="w-60 h-60 object-contain" />
                            </div>
                            <div className="text-center max-w-sm">
                                <h4 className="font-bold mb-2">Escaneie pelo número do sócio</h4>
                                <ol className="text-xs text-muted-foreground text-left space-y-1 list-decimal list-inside">
                                    <li>Abra o WhatsApp</li>
                                    <li>Toque em Configurações → Aparelhos Conectados</li>
                                    <li>Aponte a câmera para este QR Code</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {!loading && (status === "disconnected" || status === "connecting") && (
                        <div className="text-center space-y-3">
                            <div className="animate-pulse">
                                <AlertCircle className="h-14 w-14 text-amber-500 mx-auto" />
                            </div>
                            <h4 className="text-xl font-bold">
                                {status === "connecting" ? "Conectando…" : "Desconectado"}
                            </h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Iniciando o servidor. O QR Code aparecerá em alguns segundos.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-card text-card-foreground rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                        {isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        Operação do fluxo
                    </h3>
                    <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                            isPaused
                                ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                                : "border-green-500/40 bg-green-500/10 text-green-400"
                        }`}
                    >
                        {isPaused ? "Pausado" : "Ativo"}
                    </span>
                </div>
                <div className="p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                        <p className="text-sm">
                            {isPaused
                                ? "A Central está conectada, mas todos os disparos automatizados estão suspensos."
                                : "A Central responde automaticamente: welcome em novos leads e fluxo nas mensagens recebidas."}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Pausar mantém o número logado e o histórico do Inbox atualizado, mas
                            bloqueia o welcome e o fluxo. Útil para investigar problemas ou
                            atender manualmente sem que o bot intervenha.
                        </p>
                        {isPaused && pause?.paused_at && (
                            <p className="text-xs text-muted-foreground">
                                Pausado desde {formatDateTime(pause.paused_at)}.
                            </p>
                        )}
                        {pauseError && (
                            <p className="text-xs text-red-400">{pauseError}</p>
                        )}
                    </div>
                    <button
                        onClick={togglePause}
                        disabled={pauseLoading || pauseSaving || !pause}
                        className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            isPaused
                                ? "border-green-500/40 bg-green-500/10 text-green-300 hover:bg-green-500/20"
                                : "border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        }`}
                    >
                        {pauseSaving ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : isPaused ? (
                            <Play className="h-4 w-4" />
                        ) : (
                            <Pause className="h-4 w-4" />
                        )}
                        {isPaused ? "Retomar fluxo" : "Pausar fluxo"}
                    </button>
                </div>
            </div>
        </div>
    )
}
