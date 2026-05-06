"use client"

import { useEffect, useState, useCallback } from "react"
import { AlertCircle, CheckCircle2, QrCode, RefreshCw } from "lucide-react"
import type { WAStatus } from "./types"

export function ConexaoTab() {
    const [status, setStatus] = useState<WAStatus>("disconnected")
    const [qr, setQr] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

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

    useEffect(() => {
        fetchStatus()
        const t = setInterval(fetchStatus, 5000)
        return () => clearInterval(t)
    }, [fetchStatus])

    return (
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
                            Pronto para receber inbound, classificar interesses e disparar mensagens.
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
    )
}
