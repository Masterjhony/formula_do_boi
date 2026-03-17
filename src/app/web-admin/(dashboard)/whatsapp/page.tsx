"use client"

import { useEffect, useState, useCallback } from "react"
import {
  AlertCircle,
  CheckCircle2,
  QrCode,
  MessageSquare,
  User,
  RefreshCw,
  Send,
  Phone,
  Clock,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WAStatus = "disconnected" | "connecting" | "connected" | "qr"
type MsgStatus = "sent" | "failed" | "not_on_whatsapp" | "no_phone"

interface WaMessage {
  id: string
  phone: string | null
  name: string
  status: MsgStatus
  reason?: string | null
  error_msg?: string | null
  created_at: string
}

interface MessagesData {
  today_count: number
  last_lead: { id: string; nome: string; created_at: string } | null
  messages: WaMessage[]
  conversations: WaMessage[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "agora"
  if (m < 60) return `${m}m atrás`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h atrás`
  return `${Math.floor(h / 24)}d atrás`
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const STATUS_CONFIG: Record<MsgStatus, { label: string; cls: string }> = {
  sent: {
    label: "Enviado",
    cls: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  failed: {
    label: "Falhou",
    cls: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  not_on_whatsapp: {
    label: "Sem WhatsApp",
    cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  no_phone: {
    label: "Sem telefone",
    cls: "bg-gray-500/10 text-gray-500 dark:text-gray-400",
  },
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WhatsAppAdminPage() {
  const [waStatus, setWaStatus] = useState<WAStatus>("disconnected")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)

  const [data, setData] = useState<MessagesData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/status")
      const json = await res.json()
      setWaStatus(json.status ?? "disconnected")
      setQrCode(json.qr ?? null)
    } catch {
      setWaStatus("disconnected")
    } finally {
      setStatusLoading(false)
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/messages")
      if (res.ok) setData(await res.json())
    } catch {
      // fail silently — table may not exist yet
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    fetchData()
    const t1 = setInterval(fetchStatus, 5000)
    const t2 = setInterval(fetchData, 30000)
    return () => {
      clearInterval(t1)
      clearInterval(t2)
    }
  }, [fetchStatus, fetchData])

  if (statusLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Automação</h1>
          <p className="text-muted-foreground mt-1">
            Mensagens automáticas de boas-vindas para novos leads do CRM.
          </p>
        </div>
        <button
          onClick={() => { fetchStatus(); fetchData() }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border rounded-lg px-3 py-2 transition-colors hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-5 flex items-center gap-4">
          <div className="bg-green-500/10 p-3 rounded-xl flex-shrink-0">
            <MessageSquare className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mensagens enviadas hoje</p>
            <p className="text-2xl font-bold">
              {dataLoading ? "—" : (data?.today_count ?? 0)}
            </p>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-5 flex items-center gap-4">
          <div className="bg-violet-500/10 p-3 rounded-xl flex-shrink-0">
            <User className="h-5 w-5 text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">Último lead recebido</p>
            {dataLoading ? (
              <p className="text-2xl font-bold">—</p>
            ) : data?.last_lead ? (
              <>
                <p className="font-semibold truncate text-sm leading-snug mt-0.5">
                  {data.last_lead.nome}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {timeAgo(data.last_lead.created_at)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground mt-0.5">Nenhum lead ainda</p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Connection Status                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Status de Conexão
          </h3>

          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {waStatus === "connected" && (
              <div className="flex flex-col items-center text-green-600 gap-4">
                <CheckCircle2 className="h-16 w-16" />
                <div className="text-center">
                  <h4 className="text-2xl font-bold">Conectado</h4>
                  <p className="text-muted-foreground mt-2">
                    O WhatsApp está pronto para enviar mensagens.
                  </p>
                </div>
              </div>
            )}

            {waStatus === "qr" && qrCode && (
              <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode}
                    alt="WhatsApp QR Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <div className="text-center max-w-sm">
                  <h4 className="text-xl font-bold mb-2">Aguardando Leitura</h4>
                  <ol className="text-sm text-muted-foreground text-left space-y-2 list-decimal list-inside">
                    <li>Abra o WhatsApp no celular</li>
                    <li>Vá em Aparelhos Conectados</li>
                    <li>Toque em Conectar um Aparelho</li>
                    <li>Aponte a câmera para este QR Code</li>
                  </ol>
                </div>
              </div>
            )}

            {(waStatus === "disconnected" || waStatus === "connecting") && (
              <div className="flex flex-col items-center text-amber-600 gap-4">
                <div className="animate-pulse">
                  <AlertCircle className="h-16 w-16" />
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold">
                    {waStatus === "connecting" ? "Conectando..." : "Desconectado"}
                  </h4>
                  <p className="text-muted-foreground mt-2">
                    Iniciando servidor do WhatsApp. O QR Code aparecerá em breve.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Conversations — last unique contact per phone                       */}
      {/* ------------------------------------------------------------------ */}
      {!dataLoading && !!data?.conversations?.length && (
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Conversas Recentes
            </h3>
            <span className="text-xs text-muted-foreground">
              última mensagem por contato
            </span>
          </div>
          <div className="divide-y">
            {data.conversations.map((conv) => {
              const cfg = STATUS_CONFIG[conv.status] ?? STATUS_CONFIG.failed
              return (
                <div
                  key={conv.id}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="bg-muted rounded-full h-9 w-9 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conv.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {conv.phone ?? "sem telefone"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground hidden sm:block tabular-nums">
                      {timeAgo(conv.created_at)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Message Log                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Send className="h-4 w-4" />
            Log de Mensagens
          </h3>
          <button
            onClick={fetchData}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-muted"
            title="Atualizar log"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {dataLoading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : !data?.messages?.length ? (
          <div className="p-10 text-center text-muted-foreground text-sm space-y-1">
            <p>Nenhuma mensagem registrada ainda.</p>
            <p className="text-xs opacity-60">
              Execute a migration <code>create_whatsapp_messages_table.sql</code> no Supabase para ativar o log.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                    Nome
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Número
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Data / Hora
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.messages.map((msg) => {
                  const cfg = STATUS_CONFIG[msg.status] ?? STATUS_CONFIG.failed
                  return (
                    <tr key={msg.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-medium max-w-[160px] truncate">
                        {msg.name}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground hidden sm:table-cell font-mono text-xs">
                        {msg.phone ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.cls}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs hidden md:table-cell tabular-nums">
                        {formatDateTime(msg.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
