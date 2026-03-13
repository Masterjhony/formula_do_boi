"use client"

import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, QrCode } from "lucide-react"

export default function WhatsAppAdminPage() {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'qr'>('disconnected')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/whatsapp/status')
        const data = await response.json()
        
        setStatus(data.status || 'disconnected')
        setQrCode(data.qr || null)
      } catch (error) {
        console.error("Failed to fetch WhatsApp status", error)
        setStatus('disconnected')
      } finally {
        setIsLoading(false)
      }
    }

    // Check immediately, then poll every 5 seconds if not connected
    checkStatus()
    
    interval = setInterval(() => {
      if (status !== 'connected') {
        checkStatus()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [status])

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Automação</h1>
          <p className="text-muted-foreground mt-2">
            Conecte o número +5531984143874 para habilitar mensagens automáticas de boas vindas para novos Leads do CRM.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Status de Conexão
            </h3>
            
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              {status === 'connected' && (
                <div className="flex flex-col items-center text-green-600 gap-4">
                  <CheckCircle2 className="h-16 w-16" />
                  <div className="text-center">
                    <h4 className="text-2xl font-bold">Conectado</h4>
                    <p className="text-muted-foreground mt-2">O WhatsApp está pronto para enviar mensagens.</p>
                  </div>
                </div>
              )}

              {status === 'qr' && qrCode && (
                <div className="flex flex-col items-center gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm border">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
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

              {(status === 'disconnected' || status === 'connecting') && (
                <div className="flex flex-col items-center text-amber-600 gap-4">
                  <div className="animate-pulse">
                    <AlertCircle className="h-16 w-16" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-2xl font-bold">
                      {status === 'connecting' ? 'Conectando...' : 'Desconectado'}
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
      </div>
    </div>
  )
}
