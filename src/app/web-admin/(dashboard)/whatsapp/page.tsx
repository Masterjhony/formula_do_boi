"use client"

import { useEffect, useState } from "react"
import {
    QrCode, Inbox, MessageSquare, Megaphone, BarChart3, Plug,
} from "lucide-react"
import { ConexaoTab } from "@/components/admin/central-whatsapp/ConexaoTab"
import { InboxTab } from "@/components/admin/central-whatsapp/InboxTab"
import { TemplatesTab } from "@/components/admin/central-whatsapp/TemplatesTab"
import { CampaignsTab } from "@/components/admin/central-whatsapp/CampaignsTab"
import { MetricsTab } from "@/components/admin/central-whatsapp/MetricsTab"
import type { Template } from "@/components/admin/central-whatsapp/types"

type Tab = "inbox" | "templates" | "campanhas" | "metricas" | "conexao"

const TABS: { id: Tab; label: string; icon: typeof Inbox }[] = [
    { id: "inbox",     label: "Inbox",     icon: Inbox },
    { id: "templates", label: "Templates", icon: MessageSquare },
    { id: "campanhas", label: "Campanhas", icon: Megaphone },
    { id: "metricas",  label: "Métricas",  icon: BarChart3 },
    { id: "conexao",   label: "Conexão",   icon: Plug },
]

export default function CentralWhatsAppPage() {
    const [tab, setTab] = useState<Tab>("inbox")
    const [templates, setTemplates] = useState<Template[]>([])

    async function fetchTemplates() {
        const res = await fetch(`/api/whatsapp/central/templates`)
        if (res.ok) {
            const data = await res.json()
            setTemplates(data.templates ?? [])
        }
    }
    useEffect(() => { fetchTemplates() }, [])

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <QrCode className="h-6 w-6 text-primary" />
                        Central WhatsApp
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Atendimento comercial automatizado, integrado ao CRM. Triagem por interesse,
                        handoff humano, templates e campanhas segmentadas.
                    </p>
                </div>
            </div>

            <div className="border-b flex flex-wrap gap-1">
                {TABS.map(t => {
                    const Icon = t.icon
                    const active = tab === t.id
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-sm border-b-2 transition-colors -mb-px ${
                                active
                                    ? "border-primary text-foreground font-semibold"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    )
                })}
            </div>

            <div>
                {tab === "inbox"     && <InboxTab templates={templates} />}
                {tab === "templates" && <TemplatesTab templates={templates} onChange={fetchTemplates} />}
                {tab === "campanhas" && <CampaignsTab templates={templates} />}
                {tab === "metricas"  && <MetricsTab />}
                {tab === "conexao"   && <ConexaoTab />}
            </div>
        </div>
    )
}
