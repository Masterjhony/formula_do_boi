'use client'

import '../../dashboard.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3, Calendar, ChevronRight, Download, FileBarChart, Hash,
  Layers, Loader2, MapPin, Percent, Sparkles, Target, TrendingDown,
  TrendingUp, Trophy, Users, Activity, Funnel as FunnelIcon, DollarSign,
  GitBranch, RadioTower, Tag, Briefcase,
} from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────────────

type Assessor = {
  posicao: number; nome: string; empresa: string
  transacoes: number; animais: number; vgv: number
  ticket_medio: number; pct_total: number
}
type Estado = { uf: string; estado: string; lotes: number; animais: number; vgv: number; pct_total: number }
type Comprador = { rank: number; fazenda: string; comprador: string; cidade: string; uf: string; lotes: number; animais: number; vgv: number }
type Lance = { lote: string; fazenda: string; comprador: string; uf: string; assessor: string; empresa: string; animais: number; parcela: number; vgv: number }

type Fechamento = {
  id: string; nome: string; data: string; local: string
  lotes_ofertados: number; lotes_vendidos: number; animais_vendidos: number
  vgv_total: number; ticket_medio: number; maior_lance: number
  compradores_unicos: number; estados_alcancados: number
  por_assessor: Assessor[]; por_estado: Estado[]
  compradores: Comprador[]; lances: Lance[]
  comissao_assessoria: number; receita_bula: number; sobra_bruta: number
  observacoes: string
}

type Cronograma = {
  id: string; data: string; dia_semana: string | null; hora: string | null
  nome: string; criador: string | null; presencial: string | null
  leiloeira: string | null; raca: string | null; qtd_animais: number | null
  sexo: string | null; comissao: string | null; contrato: string | null
  faturamento_previsto: number | null; faturamento_realizado: number | null
  venda_bula: number | null; comissao_receber: string | null; recebido: string | null
}

type Lead = {
  id: string; nome: string; status: string | null; prioridade: string | null
  interesse: string | null; source: string | null; medium: string | null
  campaign: string | null; origem: string | null; stage: string | null
  valor_estimado: number | null; probabilidade: number | null
  created_at: string; data_estimada_fechamento: string | null
  estado: string | null; cidade: string | null
}

type Payload = {
  fechamentos: Fechamento[]
  cronograma: Cronograma[]
  leads: Lead[]
  range: { from: string | null; to: string | null }
}

type ReportKey =
  | 'mensal' | 'comparativo' | 'comissoes' | 'assessor' | 'cobertura'
  | 'categoria' | 'ranking' | 'leads' | 'conversao' | 'origem'

// ── Helpers ─────────────────────────────────────────────────────────────────

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v || 0)

const fmtBRLCompact = (v: number) => {
  const abs = Math.abs(v); const sign = v < 0 ? '−' : ''
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2).replace('.', ',')}M`
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(0)}k`
  return fmtBRL(v)
}
const fmtNum = (v: number) => (v || 0).toLocaleString('pt-BR')
const PCT = (v: number) => `${(v * 100).toFixed(1)}%`

const MES_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function ymKey(iso: string) {
  // YYYY-MM
  return iso.slice(0, 7)
}
function ymLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return `${MES_ABBR[m - 1] ?? '—'}/${String(y).slice(2)}`
}

function normalize(s: string | null | undefined) {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
}

const EMPRESA_BULA_FORMULA = 'Bula × Fórmula'
function normalizeEmpresaGrupo(empresa: string | null | undefined): string {
  const e = (empresa ?? '').trim()
  if (!e) return 'Não informado'
  const lower = e.toLowerCase()
  if (lower.startsWith('bula') || lower.startsWith('fórmula') || lower.startsWith('formula')) {
    return EMPRESA_BULA_FORMULA
  }
  return e
}

function csvEscape(v: unknown) {
  const s = v == null ? '' : String(v)
  return `"${s.replace(/"/g, '""')}"`
}
function downloadCSV(filename: string, rows: (string | number)[][]) {
  const csv = '﻿' + rows.map(r => r.map(csvEscape).join(';')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Mapeia fechamentos para itens do cronograma (mesma data + match por nome/criador)
function matchFechamentoToCronograma(f: Fechamento, cronos: Cronograma[]): Cronograma | null {
  const sameDate = cronos.filter(c => c.data === f.data)
  if (sameDate.length === 0) return null
  if (sameDate.length === 1) return sameDate[0]
  const fNorm = normalize(f.nome)
  const fragment = fNorm.slice(0, 6)
  return (
    sameDate.find(c => normalize(c.nome).includes(fragment))
    ?? sameDate.find(c => normalize(c.criador).includes(fragment))
    ?? sameDate[0]
  )
}

// ── Section UI ──────────────────────────────────────────────────────────────

const REPORTS: { key: ReportKey; label: string; icon: React.ElementType; tag: 'essencial' | 'importante' | 'extra' }[] = [
  { key: 'mensal',      label: 'Fechamento Mensal',      icon: Calendar,    tag: 'essencial' },
  { key: 'comparativo', label: 'Comparativo entre Leilões', icon: BarChart3, tag: 'essencial' },
  { key: 'comissoes',   label: 'Comissões',              icon: DollarSign,  tag: 'essencial' },
  { key: 'assessor',    label: 'Por Assessor',           icon: Briefcase,   tag: 'importante' },
  { key: 'cobertura',   label: 'Cobertura de Leilões',   icon: RadioTower,  tag: 'essencial' },
  { key: 'categoria',   label: 'Por Categoria',          icon: Tag,         tag: 'importante' },
  { key: 'ranking',     label: 'Ranking de Leilões',     icon: Trophy,      tag: 'importante' },
  { key: 'leads',       label: 'Leads',                  icon: Users,       tag: 'essencial' },
  { key: 'conversao',   label: 'Conversão',              icon: FunnelIcon,  tag: 'essencial' },
  { key: 'origem',      label: 'Origem dos Leads',       icon: GitBranch,   tag: 'importante' },
]

// ── Page ────────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const today = new Date()
  const defaultFrom = new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString().slice(0, 10)
  const defaultTo = today.toISOString().slice(0, 10)

  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Payload | null>(null)
  const [report, setReport] = useState<ReportKey>('mensal')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const qs = new URLSearchParams({ from, to }).toString()
      const res = await fetch(`/api/leiloes/relatorios?${qs}`, { cache: 'no-store' })
      if (res.ok) setData(await res.json())
    } finally { setLoading(false) }
  }, [from, to])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="dcl-root rl-root">
      {/* Page header */}
      <div className="dcl-pagehead">
        <div>
          <h1>Relatórios <span className="dcl-serif">de leilão</span></h1>
          <div className="dcl-sub">Inteligência consolidada de fechamentos, cronograma e funil comercial</div>
        </div>
        <div className="dcl-pagehead-right">
          <div className="rl-rangebox">
            <Calendar size={13} className="rl-rng-ico" />
            <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} className="rl-rng-input" />
            <span className="rl-rng-sep">→</span>
            <input type="date" value={to} min={from} onChange={e => setTo(e.target.value)} className="rl-rng-input" />
          </div>
          <Link href="/leiloes/fechamento" className="rl-link">
            <FileBarChart size={13} /> Ver fechamentos
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="rl-tabs">
        {REPORTS.map(r => {
          const Icon = r.icon
          const active = report === r.key
          return (
            <button
              key={r.key}
              onClick={() => setReport(r.key)}
              className={`rl-tab${active ? ' rl-tab-on' : ''}`}
              data-tag={r.tag}
            >
              <Icon size={13} />
              <span>{r.label}</span>
            </button>
          )
        })}
      </div>

      {/* Body */}
      {loading || !data ? (
        <div className="rl-loading">
          <Loader2 size={28} className="rl-spin" />
          <span>Carregando relatório…</span>
        </div>
      ) : (
        <ReportRouter report={report} data={data} from={from} to={to} />
      )}

      <style jsx global>{`
        .rl-root { min-height: 100%; padding-bottom: 40px; }

        .rl-rangebox {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 10px; border-radius: 10px;
          background: var(--dcl-bg-card); border: 1px solid var(--dcl-line);
        }
        .rl-rng-ico { color: var(--dcl-gold); }
        .rl-rng-sep { color: var(--dcl-ink-3); font-size: 12px; }
        .rl-rng-input {
          background: transparent; border: none; outline: none;
          color: var(--dcl-ink); font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 12px; padding: 2px 0;
          color-scheme: dark;
        }
        :where(html:not(.dark)) .rl-rng-input { color-scheme: light; }
        .rl-link {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 10px;
          background: var(--dcl-gold-bg); border: 1px solid var(--dcl-gold-line);
          color: var(--dcl-gold); font-size: 12px; font-weight: 500;
          letter-spacing: -0.005em; text-decoration: none;
          transition: background .15s, border-color .15s;
        }
        .rl-link:hover { background: rgba(212,168,92,0.14); border-color: rgba(212,168,92,0.45); }

        .rl-tabs {
          display: flex; gap: 4px; flex-wrap: wrap;
          margin: 18px 0 22px;
          padding: 5px;
          background: var(--dcl-bg-card); border: 1px solid var(--dcl-line);
          border-radius: 12px;
        }
        .rl-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 12px; border-radius: 8px;
          font-size: 12px; font-weight: 500; letter-spacing: -0.005em;
          color: var(--dcl-ink-3);
          transition: background .15s, color .15s, border-color .15s;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
        }
        .rl-tab:hover { color: var(--dcl-ink); background: var(--dcl-bg-card-2); }
        .rl-tab.rl-tab-on {
          color: var(--dcl-gold);
          background: var(--dcl-gold-bg);
          border-color: var(--dcl-gold-line);
          box-shadow: 0 0 0 1px var(--dcl-gold-line) inset;
        }
        .rl-tab[data-tag="essencial"] .rl-dot { background: var(--dcl-gold); }

        .rl-loading {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          padding: 80px 0; color: var(--dcl-ink-3);
        }
        .rl-spin { color: var(--dcl-gold); animation: rl-spin 0.9s linear infinite; }
        @keyframes rl-spin { to { transform: rotate(360deg); } }

        /* Report shell */
        .rl-section { display: grid; gap: 16px; }
        .rl-section-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          padding: 4px 0 10px;
        }
        .rl-section-head h2 {
          margin: 0 0 4px; font-size: 22px; font-weight: 500;
          letter-spacing: -0.018em; color: var(--dcl-ink);
        }
        .rl-section-head h2 .dcl-serif { color: var(--dcl-gold); font-weight: 400; }
        .rl-section-head .rl-sub { color: var(--dcl-ink-3); font-size: 12.5px; }

        .rl-export {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 11px; border-radius: 8px;
          background: var(--dcl-bg-card); border: 1px solid var(--dcl-line);
          color: var(--dcl-ink-2); font-size: 11.5px; font-weight: 500;
          cursor: pointer;
          transition: border-color .15s, color .15s;
          letter-spacing: -0.005em;
        }
        .rl-export:hover { border-color: var(--dcl-gold-line); color: var(--dcl-gold); }

        .rl-grid { display: grid; gap: 12px; }
        .rl-grid-3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
        .rl-grid-4 { grid-template-columns: repeat(4, minmax(0,1fr)); }
        .rl-grid-5 { grid-template-columns: repeat(5, minmax(0,1fr)); }
        @media (max-width: 1024px) { .rl-grid-3, .rl-grid-4, .rl-grid-5 { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (max-width: 640px) { .rl-grid-3, .rl-grid-4, .rl-grid-5 { grid-template-columns: 1fr; } }

        .rl-stat {
          background: var(--dcl-bg-card); border: 1px solid var(--dcl-line);
          border-radius: 12px; padding: 14px 16px; min-height: 96px;
        }
        .rl-stat .rl-stat-label {
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--dcl-ink-3); display: flex; align-items: center; gap: 6px;
        }
        .rl-stat .rl-stat-val {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 22px; font-weight: 500; letter-spacing: -0.02em;
          margin-top: 8px; color: var(--dcl-ink);
        }
        .rl-stat .rl-stat-sub {
          font-size: 11px; color: var(--dcl-ink-3); margin-top: 4px;
        }
        .rl-stat.rl-stat-gold {
          background: linear-gradient(135deg, rgba(212,168,92,0.10), rgba(212,168,92,0.02));
          border-color: var(--dcl-gold-line);
        }
        .rl-stat.rl-stat-gold .rl-stat-val { color: var(--dcl-gold); }

        /* Tables */
        .rl-table-wrap {
          background: var(--dcl-bg-card); border: 1px solid var(--dcl-line);
          border-radius: 14px; overflow: hidden;
        }
        .rl-table-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px; border-bottom: 1px solid var(--dcl-line-soft);
          gap: 12px; flex-wrap: wrap;
        }
        .rl-table-head h3 {
          margin: 0; font-size: 13.5px; font-weight: 600;
          color: var(--dcl-ink); letter-spacing: -0.005em;
        }
        .rl-table-head .rl-sub { font-size: 11px; color: var(--dcl-ink-3); margin-top: 2px; }
        .rl-table-scroll { overflow-x: auto; }
        .rl-table { width: 100%; border-collapse: collapse; }
        .rl-table thead th {
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          font-weight: 600; color: var(--dcl-ink-3);
          padding: 10px 14px; text-align: left;
          background: var(--dcl-bg-card-2);
          border-bottom: 1px solid var(--dcl-line);
          white-space: nowrap;
        }
        .rl-table tbody td {
          padding: 12px 14px; font-size: 12.5px; color: var(--dcl-ink-2);
          border-top: 1px solid var(--dcl-line-soft); vertical-align: middle;
        }
        .rl-table tbody tr:hover td { background: rgba(212,168,92,0.04); }
        .rl-table .rl-num {
          font-family: var(--font-mono), ui-monospace, monospace;
          color: var(--dcl-ink); font-feature-settings: 'tnum';
        }
        .rl-table .rl-gold { color: var(--dcl-gold); font-weight: 500; }
        .rl-table .rl-dim { color: var(--dcl-ink-3); }

        /* Bars */
        .rl-bar {
          position: relative; height: 6px; border-radius: 99px;
          background: var(--dcl-bg-card-2); overflow: hidden;
          min-width: 60px;
        }
        .rl-bar > span {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: linear-gradient(90deg, var(--dcl-gold-2), var(--dcl-gold));
          border-radius: 99px;
          transition: width .3s ease;
        }
        .rl-bar.rl-bar-blue > span { background: linear-gradient(90deg, #3a5d99, #6a8fd4); }
        .rl-bar.rl-bar-green > span { background: linear-gradient(90deg, #2c8d4e, #5db87a); }
        .rl-bar.rl-bar-red > span { background: linear-gradient(90deg, #b34a3d, #e26a5b); }

        /* Pill */
        .rl-tag {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 8px; border-radius: 999px;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          background: var(--dcl-bg-card-2); border: 1px solid var(--dcl-line);
          color: var(--dcl-ink-2);
        }
        .rl-tag.rl-tag-gold { background: var(--dcl-gold-bg); border-color: var(--dcl-gold-line); color: var(--dcl-gold); }
        .rl-tag.rl-tag-green { background: rgba(93,184,122,0.10); border-color: rgba(93,184,122,0.30); color: #5db87a; }
        .rl-tag.rl-tag-red { background: rgba(226,106,91,0.10); border-color: rgba(226,106,91,0.30); color: #e26a5b; }
        .rl-tag.rl-tag-blue { background: rgba(106,143,212,0.10); border-color: rgba(106,143,212,0.30); color: #6a8fd4; }
        .rl-tag.rl-tag-violet { background: rgba(155,134,196,0.10); border-color: rgba(155,134,196,0.30); color: #9b86c4; }

        /* Empty */
        .rl-empty {
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          padding: 60px 16px; color: var(--dcl-ink-3);
          background: var(--dcl-bg-card); border: 1px dashed var(--dcl-line);
          border-radius: 14px; text-align: center;
        }
        .rl-empty h4 { margin: 0; color: var(--dcl-ink-2); font-size: 13.5px; font-weight: 500; }
        .rl-empty p { margin: 0; font-size: 12px; }

        /* Card */
        .rl-card {
          background: var(--dcl-bg-card); border: 1px solid var(--dcl-line);
          border-radius: 14px; padding: 16px 18px;
        }
        .rl-card-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; margin-bottom: 14px;
        }
        .rl-card-head h3 {
          margin: 0; font-size: 13.5px; font-weight: 600;
          color: var(--dcl-ink); letter-spacing: -0.005em;
        }
        .rl-card-head .rl-sub { font-size: 11px; color: var(--dcl-ink-3); margin-top: 2px; }

        .rl-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
        @media (max-width: 1024px) { .rl-bento { grid-template-columns: repeat(6, 1fr); } }
        @media (max-width: 640px) { .rl-bento { grid-template-columns: 1fr; } }
        .rl-c12 { grid-column: span 12; } .rl-c8 { grid-column: span 8; }
        .rl-c7 { grid-column: span 7; } .rl-c6 { grid-column: span 6; }
        .rl-c5 { grid-column: span 5; } .rl-c4 { grid-column: span 4; }
        @media (max-width: 1024px) {
          .rl-c8, .rl-c7, .rl-c5, .rl-c4 { grid-column: span 6; }
        }
        @media (max-width: 640px) {
          .rl-c12, .rl-c8, .rl-c7, .rl-c6, .rl-c5, .rl-c4 { grid-column: span 1; }
        }

        /* Compare cards */
        .rl-compare-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(260px,1fr)); }
        .rl-cmp-card { padding: 14px 16px; border-radius: 12px; border: 1px solid var(--dcl-line); background: var(--dcl-bg-card); }
        .rl-cmp-card .rl-cmp-name { font-size: 12.5px; font-weight: 600; color: var(--dcl-ink); margin: 0; line-height: 1.3; }
        .rl-cmp-card .rl-cmp-date { font-family: var(--font-mono), ui-monospace, monospace; font-size: 10px; color: var(--dcl-ink-3); margin-top: 2px; }
        .rl-cmp-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--dcl-line-soft); }
        .rl-cmp-row:first-of-type { padding-top: 0; border-top: none; }
        .rl-cmp-row .rl-cmp-label { font-size: 10.5px; color: var(--dcl-ink-3); letter-spacing: 0.04em; }
        .rl-cmp-row .rl-cmp-value { font-family: var(--font-mono), ui-monospace, monospace; font-size: 13px; color: var(--dcl-ink); font-weight: 500; }
        .rl-cmp-row .rl-cmp-value.rl-gold { color: var(--dcl-gold); }
      `}</style>
    </div>
  )
}

// ─── Report Router ──────────────────────────────────────────────────────────

function ReportRouter({ report, data, from, to }: { report: ReportKey; data: Payload; from: string; to: string }) {
  const period = `${from} → ${to}`
  switch (report) {
    case 'mensal':      return <ReportMensal data={data} period={period} />
    case 'comparativo': return <ReportComparativo data={data} period={period} />
    case 'comissoes':   return <ReportComissoes data={data} period={period} />
    case 'assessor':    return <ReportAssessor data={data} period={period} />
    case 'cobertura':   return <ReportCobertura data={data} period={period} />
    case 'categoria':   return <ReportCategoria data={data} period={period} />
    case 'ranking':     return <ReportRanking data={data} period={period} />
    case 'leads':       return <ReportLeads data={data} period={period} />
    case 'conversao':   return <ReportConversao data={data} period={period} />
    case 'origem':      return <ReportOrigem data={data} period={period} />
  }
}

// ── 1) Fechamento Mensal ────────────────────────────────────────────────────

function ReportMensal({ data, period }: { data: Payload; period: string }) {
  const monthly = useMemo(() => {
    const map = new Map<string, {
      ym: string; vgv: number; lotes_v: number; lotes_o: number;
      animais: number; leiloes: number; ticket: number; comissao: number; receita: number; sobra: number
    }>()
    for (const f of data.fechamentos) {
      const k = ymKey(f.data)
      const cur = map.get(k) ?? { ym: k, vgv: 0, lotes_v: 0, lotes_o: 0, animais: 0, leiloes: 0, ticket: 0, comissao: 0, receita: 0, sobra: 0 }
      cur.vgv += f.vgv_total || 0
      cur.lotes_v += f.lotes_vendidos || 0
      cur.lotes_o += f.lotes_ofertados || 0
      cur.animais += f.animais_vendidos || 0
      cur.comissao += f.comissao_assessoria || 0
      cur.receita += f.receita_bula || 0
      cur.sobra += f.sobra_bruta || 0
      cur.leiloes += 1
      map.set(k, cur)
    }
    const arr = Array.from(map.values()).sort((a, b) => a.ym.localeCompare(b.ym))
    arr.forEach(m => { m.ticket = m.animais > 0 ? m.vgv / m.animais : 0 })
    return arr
  }, [data])

  const leadsByMonth = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of data.leads) {
      const k = ymKey(l.created_at.slice(0, 10))
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return map
  }, [data])

  const totalVgv = monthly.reduce((s, m) => s + m.vgv, 0)
  const totalAnimais = monthly.reduce((s, m) => s + m.animais, 0)
  const totalLeiloes = monthly.reduce((s, m) => s + m.leiloes, 0)
  const totalReceita = monthly.reduce((s, m) => s + m.receita, 0)
  const ticketGeral = totalAnimais > 0 ? totalVgv / totalAnimais : 0

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Mês', 'Leilões', 'VGV (R$)', 'Lotes vendidos', 'Lotes ofertados', 'Cobertura (%)', 'Animais', 'Ticket médio', 'Receita Bula', 'Comissão assessoria', 'Sobra bruta', 'Leads no mês'],
      ...monthly.map(m => [
        ymLabel(m.ym), m.leiloes, Math.round(m.vgv),
        m.lotes_v, m.lotes_o, m.lotes_o ? Math.round((m.lotes_v / m.lotes_o) * 100) : 0,
        m.animais, Math.round(m.ticket), Math.round(m.receita),
        Math.round(m.comissao), Math.round(m.sobra),
        leadsByMonth.get(m.ym) ?? 0,
      ]),
    ]
    downloadCSV('relatorio-mensal.csv', rows)
  }

  return (
    <div className="rl-section">
      <SectionHead
        title="Fechamento"
        emphasis="mensal"
        subtitle={`Performance consolidada por mês · ${period}`}
        onExport={exportCsv}
      />

      <div className="rl-grid rl-grid-5">
        <Stat label="VGV total no período" value={fmtBRLCompact(totalVgv)} sub={`${totalLeiloes} leilões fechados`} gold />
        <Stat label="Receita Bula" value={fmtBRLCompact(totalReceita)} sub={totalVgv ? `${PCT(totalReceita / totalVgv)} sobre VGV` : undefined} />
        <Stat label="Animais vendidos" value={fmtNum(totalAnimais)} />
        <Stat label="Ticket médio" value={fmtBRLCompact(ticketGeral)} sub="por animal" />
        <Stat label="Meses com leilão" value={String(monthly.length)} sub={`de ${countMonthsBetween(period)} no recorte`} />
      </div>

      {monthly.length === 0 ? (
        <Empty title="Sem fechamentos no período" message="Ajuste o intervalo de datas para visualizar dados consolidados." />
      ) : (
        <>
          <BarChartCard
            title="VGV por mês"
            sub="Volume geral de vendas mensal · valores em R$"
            items={monthly.map(m => ({ label: ymLabel(m.ym), value: m.vgv, sub: `${m.leiloes} leilão${m.leiloes !== 1 ? 'ões' : ''}` }))}
            valueFmt={fmtBRLCompact}
          />

          <div className="rl-table-wrap">
            <div className="rl-table-head">
              <div>
                <h3>Detalhamento mensal</h3>
                <div className="rl-sub">VGV, cobertura e produtividade comercial</div>
              </div>
              <span className="rl-tag rl-tag-gold">{monthly.length} meses</span>
            </div>
            <div className="rl-table-scroll">
              <table className="rl-table">
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Leilões</th>
                    <th>VGV</th>
                    <th>Lotes</th>
                    <th>Cobertura</th>
                    <th>Animais</th>
                    <th>Ticket médio</th>
                    <th>Receita Bula</th>
                    <th>Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map(m => {
                    const cob = m.lotes_o ? Math.round((m.lotes_v / m.lotes_o) * 100) : 0
                    return (
                      <tr key={m.ym}>
                        <td>{ymLabel(m.ym)}</td>
                        <td className="rl-num">{m.leiloes}</td>
                        <td className="rl-num rl-gold">{fmtBRL(m.vgv)}</td>
                        <td className="rl-num">{m.lotes_v}/{m.lotes_o || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="rl-bar" style={{ width: 80 }}>
                              <span style={{ width: `${Math.min(100, cob)}%` }} />
                            </div>
                            <span className="rl-num" style={{ minWidth: 36, textAlign: 'right' }}>{cob}%</span>
                          </div>
                        </td>
                        <td className="rl-num">{fmtNum(m.animais)}</td>
                        <td className="rl-num">{fmtBRL(m.ticket)}</td>
                        <td className="rl-num">{fmtBRL(m.receita)}</td>
                        <td className="rl-num rl-dim">{fmtNum(leadsByMonth.get(m.ym) ?? 0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function countMonthsBetween(period: string) {
  const [a, b] = period.split('→').map(s => s.trim())
  if (!a || !b) return 0
  const da = new Date(a + 'T00:00:00'), dbb = new Date(b + 'T00:00:00')
  const diff = (dbb.getFullYear() - da.getFullYear()) * 12 + (dbb.getMonth() - da.getMonth())
  return Math.max(1, diff + 1)
}

// ── 2) Comparativo entre Leilões ────────────────────────────────────────────

function ReportComparativo({ data, period }: { data: Payload; period: string }) {
  void period
  const items = useMemo(() => {
    return [...data.fechamentos].sort((a, b) => a.data.localeCompare(b.data))
  }, [data])

  const topVgv = [...items].sort((a, b) => b.vgv_total - a.vgv_total).slice(0, 6)
  const topCobertura = [...items].sort((a, b) => {
    const ca = a.lotes_ofertados ? a.lotes_vendidos / a.lotes_ofertados : 0
    const cb = b.lotes_ofertados ? b.lotes_vendidos / b.lotes_ofertados : 0
    return cb - ca
  }).slice(0, 6)

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Leilão', 'Data', 'Local', 'VGV', 'Lotes vendidos', 'Lotes ofertados', 'Cobertura (%)', 'Animais', 'Ticket médio', 'Maior lance', 'Compradores únicos', 'Estados'],
      ...items.map(f => {
        const cob = f.lotes_ofertados ? Math.round((f.lotes_vendidos / f.lotes_ofertados) * 100) : 0
        return [f.nome, f.data, f.local, Math.round(f.vgv_total), f.lotes_vendidos, f.lotes_ofertados, cob, f.animais_vendidos, Math.round(f.ticket_medio), Math.round(f.maior_lance), f.compradores_unicos, f.estados_alcancados]
      }),
    ]
    downloadCSV('relatorio-comparativo.csv', rows)
  }

  return (
    <div className="rl-section">
      <SectionHead
        title="Comparativo"
        emphasis="entre leilões"
        subtitle={`Lado a lado · ${items.length} leilão${items.length !== 1 ? 'ões' : ''} no período`}
        onExport={exportCsv}
      />

      {items.length === 0 ? (
        <Empty title="Sem fechamentos no período" message="Cadastre fechamentos ou amplie o recorte." />
      ) : (
        <>
          <div className="rl-bento">
            <div className="rl-card rl-c6">
              <div className="rl-card-head">
                <div>
                  <h3>Top 6 por VGV</h3>
                  <div className="rl-sub">Maiores volumes do recorte</div>
                </div>
                <Trophy size={14} style={{ color: 'var(--dcl-gold)' }} />
              </div>
              <RankList items={topVgv.map(f => ({
                key: f.id, primary: f.nome, secondary: f.data,
                value: fmtBRLCompact(f.vgv_total), bar: f.vgv_total,
              }))} />
            </div>
            <div className="rl-card rl-c6">
              <div className="rl-card-head">
                <div>
                  <h3>Top 6 por taxa de venda</h3>
                  <div className="rl-sub">Cobertura % (lotes vendidos / ofertados)</div>
                </div>
                <Percent size={14} style={{ color: 'var(--dcl-gold)' }} />
              </div>
              <RankList items={topCobertura.map(f => {
                const cob = f.lotes_ofertados ? f.lotes_vendidos / f.lotes_ofertados : 0
                return {
                  key: f.id, primary: f.nome, secondary: `${f.lotes_vendidos}/${f.lotes_ofertados} lotes`,
                  value: PCT(cob), bar: cob,
                }
              })} />
            </div>
          </div>

          <div className="rl-table-wrap">
            <div className="rl-table-head">
              <div>
                <h3>Tabela comparativa</h3>
                <div className="rl-sub">Indicadores principais por leilão</div>
              </div>
              <span className="rl-tag">{items.length} eventos</span>
            </div>
            <div className="rl-table-scroll">
              <table className="rl-table">
                <thead>
                  <tr>
                    <th>Leilão</th>
                    <th>Data</th>
                    <th>VGV</th>
                    <th>Lotes</th>
                    <th>Cobertura</th>
                    <th>Animais</th>
                    <th>Ticket</th>
                    <th>Maior lance</th>
                    <th>Compradores</th>
                    <th>Estados</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(f => {
                    const cob = f.lotes_ofertados ? Math.round((f.lotes_vendidos / f.lotes_ofertados) * 100) : 0
                    return (
                      <tr key={f.id}>
                        <td style={{ maxWidth: 240 }}>
                          <div style={{ color: 'var(--dcl-ink)', fontWeight: 500 }}>{f.nome}</div>
                          {f.local && <div className="rl-dim" style={{ fontSize: 10.5, marginTop: 2 }}>{f.local}</div>}
                        </td>
                        <td className="rl-num rl-dim">{f.data.split('-').reverse().join('/')}</td>
                        <td className="rl-num rl-gold">{fmtBRLCompact(f.vgv_total)}</td>
                        <td className="rl-num">{f.lotes_vendidos}/{f.lotes_ofertados || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="rl-bar" style={{ width: 60 }}>
                              <span style={{ width: `${Math.min(100, cob)}%` }} />
                            </div>
                            <span className="rl-num" style={{ minWidth: 32, textAlign: 'right' }}>{cob}%</span>
                          </div>
                        </td>
                        <td className="rl-num">{fmtNum(f.animais_vendidos)}</td>
                        <td className="rl-num">{fmtBRL(f.ticket_medio)}</td>
                        <td className="rl-num rl-dim">{f.maior_lance ? `${fmtBRL(f.maior_lance)}/parc.` : '—'}</td>
                        <td className="rl-num">{f.compradores_unicos}</td>
                        <td className="rl-num">{f.estados_alcancados}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── 3) Comissões ────────────────────────────────────────────────────────────

function ReportComissoes({ data, period }: { data: Payload; period: string }) {
  const items = useMemo(() =>
    [...data.fechamentos].sort((a, b) => a.data.localeCompare(b.data)), [data])

  const totalReceita = items.reduce((s, f) => s + (f.receita_bula || 0), 0)
  const totalComissao = items.reduce((s, f) => s + (f.comissao_assessoria || 0), 0)
  const totalSobra = items.reduce((s, f) => s + (f.sobra_bruta || 0), 0)
  const totalVgv = items.reduce((s, f) => s + f.vgv_total, 0)

  // Cronograma com previsão de comissão (texto livre, mas mostra contratos pendentes)
  const cronoComCom = data.cronograma.filter(c => (c.faturamento_realizado || c.venda_bula))

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Leilão', 'Data', 'VGV', 'Receita Bula', '% sobre VGV', 'Comissão assessoria', 'Sobra bruta'],
      ...items.map(f => [
        f.nome, f.data, Math.round(f.vgv_total),
        Math.round(f.receita_bula || 0),
        f.vgv_total ? Math.round(((f.receita_bula || 0) / f.vgv_total) * 10000) / 100 : 0,
        Math.round(f.comissao_assessoria || 0),
        Math.round(f.sobra_bruta || 0),
      ]),
    ]
    downloadCSV('relatorio-comissoes.csv', rows)
  }

  return (
    <div className="rl-section">
      <SectionHead
        title="Relatório de"
        emphasis="comissões"
        subtitle={`Receita Bula × Fórmula sobre VGV · ${period}`}
        onExport={exportCsv}
      />

      <div className="rl-grid rl-grid-4">
        <Stat label="VGV total" value={fmtBRLCompact(totalVgv)} sub={`${items.length} leilões`} />
        <Stat label="Receita Bula" value={fmtBRLCompact(totalReceita)} sub={totalVgv ? `${PCT(totalReceita / totalVgv)} sobre VGV` : undefined} gold />
        <Stat label="Comissão de assessoria" value={fmtBRLCompact(totalComissao)} sub="paga aos assessores" />
        <Stat label="Sobra bruta" value={fmtBRLCompact(totalSobra)} sub="receita líquida estimada" />
      </div>

      {items.length === 0 ? (
        <Empty title="Sem fechamentos no período" message="Cadastre o resultado de leilões para calcular comissões." />
      ) : (
        <>
          <div className="rl-table-wrap">
            <div className="rl-table-head">
              <div>
                <h3>Comissões por leilão</h3>
                <div className="rl-sub">Receita Bula, comissão repassada e sobra bruta</div>
              </div>
              <Link href="/leiloes/fechamento" className="rl-link" style={{ fontSize: 11, padding: '5px 10px' }}>
                Editar fechamentos
              </Link>
            </div>
            <div className="rl-table-scroll">
              <table className="rl-table">
                <thead>
                  <tr>
                    <th>Leilão</th>
                    <th>Data</th>
                    <th>VGV</th>
                    <th>Receita Bula</th>
                    <th>% s/VGV</th>
                    <th>Comissão assessoria</th>
                    <th>Sobra bruta</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(f => {
                    const pct = f.vgv_total ? (f.receita_bula || 0) / f.vgv_total : 0
                    return (
                      <tr key={f.id}>
                        <td style={{ maxWidth: 260 }}>
                          <div style={{ color: 'var(--dcl-ink)', fontWeight: 500 }}>{f.nome}</div>
                        </td>
                        <td className="rl-num rl-dim">{f.data.split('-').reverse().join('/')}</td>
                        <td className="rl-num">{fmtBRLCompact(f.vgv_total)}</td>
                        <td className="rl-num rl-gold">{f.receita_bula ? fmtBRL(f.receita_bula) : '—'}</td>
                        <td className="rl-num rl-dim">{f.receita_bula ? PCT(pct) : '—'}</td>
                        <td className="rl-num">{f.comissao_assessoria ? fmtBRL(f.comissao_assessoria) : '—'}</td>
                        <td className="rl-num">{f.sobra_bruta ? fmtBRL(f.sobra_bruta) : '—'}</td>
                      </tr>
                    )
                  })}
                  <tr>
                    <td colSpan={2} style={{ fontWeight: 600, color: 'var(--dcl-ink)' }}>Total</td>
                    <td className="rl-num" style={{ fontWeight: 600 }}>{fmtBRL(totalVgv)}</td>
                    <td className="rl-num rl-gold" style={{ fontWeight: 600 }}>{fmtBRL(totalReceita)}</td>
                    <td className="rl-num" style={{ fontWeight: 600 }}>{totalVgv ? PCT(totalReceita / totalVgv) : '—'}</td>
                    <td className="rl-num" style={{ fontWeight: 600 }}>{fmtBRL(totalComissao)}</td>
                    <td className="rl-num" style={{ fontWeight: 600 }}>{fmtBRL(totalSobra)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {cronoComCom.length > 0 && (
            <div className="rl-table-wrap">
              <div className="rl-table-head">
                <div>
                  <h3>Cronograma · acordos comerciais</h3>
                  <div className="rl-sub">Acordos de comissão registrados em leilões agendados</div>
                </div>
                <span className="rl-tag">{cronoComCom.length} acordos</span>
              </div>
              <div className="rl-table-scroll">
                <table className="rl-table">
                  <thead>
                    <tr>
                      <th>Leilão</th>
                      <th>Data</th>
                      <th>Leiloeira</th>
                      <th>Comissão acordada</th>
                      <th>Faturamento realizado</th>
                      <th>Venda Bula</th>
                      <th>A receber</th>
                      <th>Recebido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronoComCom.slice(0, 30).map(c => (
                      <tr key={c.id}>
                        <td style={{ maxWidth: 220 }}>
                          <div style={{ color: 'var(--dcl-ink)', fontWeight: 500 }}>{c.nome}</div>
                          {c.criador && <div className="rl-dim" style={{ fontSize: 10.5, marginTop: 2 }}>{c.criador}</div>}
                        </td>
                        <td className="rl-num rl-dim">{c.data.split('-').reverse().join('/')}</td>
                        <td>{c.leiloeira || '—'}</td>
                        <td className="rl-dim" style={{ fontSize: 11.5 }}>{c.comissao || '—'}</td>
                        <td className="rl-num">{c.faturamento_realizado ? fmtBRL(c.faturamento_realizado) : '—'}</td>
                        <td className="rl-num rl-gold">{c.venda_bula ? fmtBRL(c.venda_bula) : '—'}</td>
                        <td className="rl-dim" style={{ fontSize: 11.5 }}>{c.comissao_receber || '—'}</td>
                        <td>
                          <span className={`rl-tag ${c.recebido === 'SIM' ? 'rl-tag-green' : 'rl-tag'}`}>
                            {c.recebido || 'NÃO'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── 4) Por Assessor ─────────────────────────────────────────────────────────

function ReportAssessor({ data, period }: { data: Payload; period: string }) {
  const assessores = useMemo(() => {
    const map = new Map<string, {
      nome: string; empresa: string; transacoes: number;
      animais: number; vgv: number; leiloes: Set<string>;
    }>()
    for (const f of data.fechamentos) {
      for (const a of f.por_assessor ?? []) {
        const key = a.nome
        if (!key) continue
        const cur = map.get(key) ?? { nome: a.nome, empresa: a.empresa, transacoes: 0, animais: 0, vgv: 0, leiloes: new Set() }
        cur.transacoes += a.transacoes || 0
        cur.animais += a.animais || 0
        cur.vgv += a.vgv || 0
        cur.leiloes.add(f.id)
        // priorize empresa não vazia
        if (!cur.empresa && a.empresa) cur.empresa = a.empresa
        map.set(key, cur)
      }
    }
    const arr = Array.from(map.values()).sort((a, b) => b.vgv - a.vgv)
    const total = arr.reduce((s, a) => s + a.vgv, 0)
    return arr.map((a, i) => ({
      ...a,
      pos: i + 1,
      pct: total > 0 ? a.vgv / total : 0,
      ticket: a.animais > 0 ? a.vgv / a.animais : 0,
      leiloesCount: a.leiloes.size,
    }))
  }, [data])

  const totalVgv = assessores.reduce((s, a) => s + a.vgv, 0)
  const maxVgv = assessores[0]?.vgv ?? 1

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Posição', 'Assessor', 'Empresa', 'Leilões', 'Transações', 'Animais', 'VGV (R$)', 'Ticket médio', '% do total'],
      ...assessores.map(a => [a.pos, a.nome, a.empresa, a.leiloesCount, a.transacoes, a.animais, Math.round(a.vgv), Math.round(a.ticket), (a.pct * 100).toFixed(2)]),
    ]
    downloadCSV('relatorio-por-assessor.csv', rows)
  }

  return (
    <div className="rl-section">
      <SectionHead
        title="Relatório"
        emphasis="por assessor"
        subtitle={`Produtividade comercial agregada · ${period}`}
        onExport={exportCsv}
      />

      <div className="rl-grid rl-grid-4">
        <Stat label="Assessores ativos" value={String(assessores.length)} sub={assessores[0] ? `Líder: ${assessores[0].nome.split(' ')[0]}` : undefined} gold />
        <Stat label="VGV vinculado" value={fmtBRLCompact(totalVgv)} />
        <Stat label="Animais negociados" value={fmtNum(assessores.reduce((s, a) => s + a.animais, 0))} />
        <Stat label="Transações" value={fmtNum(assessores.reduce((s, a) => s + a.transacoes, 0))} />
      </div>

      {assessores.length === 0 ? (
        <Empty title="Nenhum assessor com vendas no período" message="Cadastre fechamentos com a aba Assessores preenchida." />
      ) : (
        <div className="rl-table-wrap">
          <div className="rl-table-head">
            <div>
              <h3>Ranking de assessores</h3>
              <div className="rl-sub">Comissão e pagamento ficam restritos ao ERP</div>
            </div>
            <span className="rl-tag rl-tag-gold">{assessores.length} assessores</span>
          </div>
          <div className="rl-table-scroll">
            <table className="rl-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Assessor</th>
                  <th>Empresa</th>
                  <th>Leilões</th>
                  <th>Transações</th>
                  <th>Animais</th>
                  <th>Ticket médio</th>
                  <th>VGV</th>
                  <th>Participação</th>
                </tr>
              </thead>
              <tbody>
                {assessores.map(a => (
                  <tr key={a.nome}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif', fontStyle: 'italic',
                        fontSize: 18, color: a.pos <= 3 ? 'var(--dcl-gold)' : 'var(--dcl-ink-4)',
                      }}>{a.pos}</span>
                    </td>
                    <td>
                      <div style={{ color: 'var(--dcl-ink)', fontWeight: 500 }}>{a.nome}</div>
                    </td>
                    <td>
                      <span className={`rl-tag ${normalizeEmpresaGrupo(a.empresa) === EMPRESA_BULA_FORMULA ? 'rl-tag-gold' : ''}`}>
                        {normalizeEmpresaGrupo(a.empresa)}
                      </span>
                    </td>
                    <td className="rl-num">{a.leiloesCount}</td>
                    <td className="rl-num">{a.transacoes}</td>
                    <td className="rl-num">{fmtNum(a.animais)}</td>
                    <td className="rl-num rl-dim">{fmtBRL(a.ticket)}</td>
                    <td className="rl-num rl-gold" style={{ fontWeight: 500 }}>{fmtBRL(a.vgv)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="rl-bar" style={{ width: 80 }}>
                          <span style={{ width: `${(a.vgv / maxVgv) * 100}%` }} />
                        </div>
                        <span className="rl-num" style={{ minWidth: 44, textAlign: 'right' }}>{PCT(a.pct)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 5) Cobertura de Leilões ─────────────────────────────────────────────────

function ReportCobertura({ data, period }: { data: Payload; period: string }) {
  const status = useMemo(() => {
    const total = data.cronograma.length
    let comFechamento = 0
    const semDados: Cronograma[] = []
    const linkados: { c: Cronograma; f: Fechamento }[] = []

    const usados = new Set<string>()
    for (const f of data.fechamentos) {
      const m = matchFechamentoToCronograma(f, data.cronograma)
      if (m && !usados.has(m.id)) {
        usados.add(m.id)
        linkados.push({ c: m, f })
        comFechamento++
      }
    }
    for (const c of data.cronograma) {
      if (!usados.has(c.id)) semDados.push(c)
    }
    return { total, comFechamento, semDados, linkados }
  }, [data])

  const passados = status.semDados.filter(c => {
    const today = new Date().toISOString().slice(0, 10)
    return c.data < today
  })
  const futuros = status.semDados.filter(c => {
    const today = new Date().toISOString().slice(0, 10)
    return c.data >= today
  })

  const pct = status.total ? (status.comFechamento / status.total) : 0

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Tipo', 'Leilão', 'Data', 'Leiloeira', 'Status'],
      ...status.linkados.map(({ c, f }) => ['Coberto', c.nome, c.data, c.leiloeira ?? '', `Fechamento: ${f.nome}`]),
      ...passados.map(c => ['Pendente — passado', c.nome, c.data, c.leiloeira ?? '', 'Fechamento ausente']),
      ...futuros.map(c => ['Agendado', c.nome, c.data, c.leiloeira ?? '', 'Aguardando data']),
    ]
    downloadCSV('relatorio-cobertura.csv', rows)
  }

  return (
    <div className="rl-section">
      <SectionHead
        title="Cobertura"
        emphasis="de leilões"
        subtitle={`Cronograma vs Fechamentos · ${period}`}
        onExport={exportCsv}
      />

      <div className="rl-grid rl-grid-4">
        <Stat label="Cobertura geral" value={`${Math.round(pct * 100)}%`} sub={`${status.comFechamento} de ${status.total}`} gold />
        <Stat label="Com fechamento" value={String(status.comFechamento)} />
        <Stat label="Pendente · passado" value={String(passados.length)} sub="leilão sem registro" />
        <Stat label="Agendado · futuro" value={String(futuros.length)} sub="aguardando ocorrer" />
      </div>

      <div className="rl-bento">
        <div className="rl-card rl-c8">
          <div className="rl-card-head">
            <div>
              <h3>Pendências · leilões já realizados sem fechamento</h3>
              <div className="rl-sub">Inteligência: capture esses dados para fechar a base</div>
            </div>
            <span className={`rl-tag ${passados.length > 0 ? 'rl-tag-red' : 'rl-tag-green'}`}>
              {passados.length} pendentes
            </span>
          </div>
          {passados.length === 0 ? (
            <p style={{ color: 'var(--dcl-ink-3)', fontSize: 12.5, margin: 0 }}>Tudo em dia. Todos os leilões passados têm fechamento registrado.</p>
          ) : (
            <div className="rl-table-scroll">
              <table className="rl-table">
                <thead>
                  <tr><th>Data</th><th>Leilão</th><th>Criador</th><th>Leiloeira</th><th>Modalidade</th></tr>
                </thead>
                <tbody>
                  {passados.slice(0, 20).map(c => (
                    <tr key={c.id}>
                      <td className="rl-num rl-dim">{c.data.split('-').reverse().join('/')}</td>
                      <td><div style={{ color: 'var(--dcl-ink)', fontWeight: 500 }}>{c.nome}</div></td>
                      <td className="rl-dim">{c.criador || '—'}</td>
                      <td>{c.leiloeira || '—'}</td>
                      <td>{c.presencial ? <span className="rl-tag">{c.presencial}</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="rl-card rl-c4">
          <div className="rl-card-head">
            <div>
              <h3>Próximos eventos</h3>
              <div className="rl-sub">Cronograma à frente</div>
            </div>
            <Calendar size={14} style={{ color: 'var(--dcl-gold)' }} />
          </div>
          {futuros.length === 0 ? (
            <p style={{ color: 'var(--dcl-ink-3)', fontSize: 12.5, margin: 0 }}>Sem leilões futuros no recorte.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {futuros.slice(0, 8).map(c => (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, alignItems: 'center',
                  padding: '8px 0', borderTop: '1px solid var(--dcl-line-soft)',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif', fontStyle: 'italic', fontSize: 22, color: 'var(--dcl-ink)', lineHeight: 1 }}>
                      {Number(c.data.split('-')[2])}
                    </div>
                    <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dcl-ink-3)' }}>
                      {MES_ABBR[Number(c.data.split('-')[1]) - 1]}
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'var(--dcl-ink)', fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.nome}
                    </div>
                    <div style={{ color: 'var(--dcl-ink-3)', fontSize: 11, marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {c.hora && <span>{c.hora}</span>}
                      {c.leiloeira && <span>· {c.leiloeira}</span>}
                      {c.qtd_animais && <span>· {c.qtd_animais} animais</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 6) Por Categoria ────────────────────────────────────────────────────────

function ReportCategoria({ data, period }: { data: Payload; period: string }) {
  // Por SEXO no cronograma + fechamentos vinculados
  const buckets = useMemo(() => {
    const map = new Map<string, { categoria: string; agendados: number; realizados: number; vgv: number; animais: number }>()
    for (const c of data.cronograma) {
      const key = (c.sexo?.trim() || c.raca?.trim() || 'Sem categoria').toUpperCase()
      const cur = map.get(key) ?? { categoria: key, agendados: 0, realizados: 0, vgv: 0, animais: 0 }
      cur.agendados++
      if (c.qtd_animais) cur.animais += c.qtd_animais
      if (c.faturamento_realizado) cur.vgv += c.faturamento_realizado
      map.set(key, cur)
    }
    // Acrescenta VGV de fechamentos detalhados em cima (best effort) por matching
    for (const f of data.fechamentos) {
      const m = matchFechamentoToCronograma(f, data.cronograma)
      if (m) {
        const key = (m.sexo?.trim() || m.raca?.trim() || 'Sem categoria').toUpperCase()
        const cur = map.get(key)
        if (cur) {
          cur.realizados++
          if (cur.vgv === 0) cur.vgv = f.vgv_total
        }
      }
    }
    const arr = Array.from(map.values()).sort((a, b) => b.vgv - a.vgv || b.agendados - a.agendados)
    const totalVgv = arr.reduce((s, b) => s + b.vgv, 0) || 1
    return arr.map(b => ({ ...b, pct: b.vgv / totalVgv }))
  }, [data])

  // Por LEILOEIRA (visão complementar)
  const porLeiloeira = useMemo(() => {
    const map = new Map<string, { leiloeira: string; agendados: number; vgv: number; animais: number }>()
    for (const c of data.cronograma) {
      const key = c.leiloeira?.trim() || 'Sem leiloeira'
      const cur = map.get(key) ?? { leiloeira: key, agendados: 0, vgv: 0, animais: 0 }
      cur.agendados++
      if (c.qtd_animais) cur.animais += c.qtd_animais
      if (c.faturamento_realizado) cur.vgv += c.faturamento_realizado
      map.set(key, cur)
    }
    return Array.from(map.values()).sort((a, b) => b.vgv - a.vgv || b.agendados - a.agendados).slice(0, 8)
  }, [data])

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Categoria', 'Agendados', 'Realizados', 'Animais', 'VGV (R$)', '% sobre VGV'],
      ...buckets.map(b => [b.categoria, b.agendados, b.realizados, b.animais, Math.round(b.vgv), (b.pct * 100).toFixed(2)]),
    ]
    downloadCSV('relatorio-por-categoria.csv', rows)
  }

  const maxVgv = Math.max(1, ...buckets.map(b => b.vgv))

  return (
    <div className="rl-section">
      <SectionHead
        title="Relatório por"
        emphasis="categoria"
        subtitle={`Onde está o dinheiro · ${period}`}
        onExport={exportCsv}
      />

      {buckets.length === 0 ? (
        <Empty title="Sem categorias no período" message="Adicione cronogramas com sexo/raça preenchidos." />
      ) : (
        <div className="rl-bento">
          <div className="rl-card rl-c8">
            <div className="rl-card-head">
              <div>
                <h3>Distribuição por categoria</h3>
                <div className="rl-sub">Touros, fêmeas, embriões, sêmen e demais segmentações do cronograma</div>
              </div>
              <Layers size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {buckets.map(b => (
                <div key={b.categoria} style={{
                  display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 14,
                  alignItems: 'center', padding: '10px 0',
                  borderTop: '1px solid var(--dcl-line-soft)',
                }}>
                  <div>
                    <div style={{ color: 'var(--dcl-ink)', fontSize: 12.5, fontWeight: 500 }}>{b.categoria}</div>
                    <div style={{ color: 'var(--dcl-ink-3)', fontSize: 10.5, marginTop: 2 }}>
                      {b.agendados} agendados · {b.realizados} fechados · {fmtNum(b.animais)} animais
                    </div>
                  </div>
                  <div className="rl-bar" style={{ height: 8 }}>
                    <span style={{ width: `${(b.vgv / maxVgv) * 100}%` }} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="rl-num" style={{ color: 'var(--dcl-gold)', fontWeight: 500 }}>{fmtBRLCompact(b.vgv)}</div>
                    <div style={{ color: 'var(--dcl-ink-3)', fontSize: 10.5 }}>{PCT(b.pct)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rl-card rl-c4">
            <div className="rl-card-head">
              <div>
                <h3>Top leiloeiras</h3>
                <div className="rl-sub">Por VGV no cronograma</div>
              </div>
              <Trophy size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            <RankList items={porLeiloeira.map(l => ({
              key: l.leiloeira, primary: l.leiloeira,
              secondary: `${l.agendados} leilões · ${fmtNum(l.animais)} animais`,
              value: l.vgv > 0 ? fmtBRLCompact(l.vgv) : '—',
              bar: l.vgv,
            }))} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── 7) Ranking de Leilões ───────────────────────────────────────────────────

function ReportRanking({ data, period }: { data: Payload; period: string }) {
  const items = data.fechamentos
  const topVgv = [...items].sort((a, b) => b.vgv_total - a.vgv_total).slice(0, 10)
  const topTicket = [...items].sort((a, b) => b.ticket_medio - a.ticket_medio).slice(0, 10)
  const topLance = [...items].sort((a, b) => b.maior_lance - a.maior_lance).slice(0, 10)
  const topCobertura = [...items].sort((a, b) => {
    const ca = a.lotes_ofertados ? a.lotes_vendidos / a.lotes_ofertados : 0
    const cb = b.lotes_ofertados ? b.lotes_vendidos / b.lotes_ofertados : 0
    return cb - ca
  }).slice(0, 10)

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Categoria', 'Posição', 'Leilão', 'Data', 'Valor'],
      ...topVgv.map((f, i) => ['VGV', i + 1, f.nome, f.data, Math.round(f.vgv_total)]),
      ...topTicket.map((f, i) => ['Ticket médio', i + 1, f.nome, f.data, Math.round(f.ticket_medio)]),
      ...topLance.map((f, i) => ['Maior lance', i + 1, f.nome, f.data, Math.round(f.maior_lance)]),
      ...topCobertura.map((f, i) => {
        const pct = f.lotes_ofertados ? (f.lotes_vendidos / f.lotes_ofertados) * 100 : 0
        return ['Cobertura', i + 1, f.nome, f.data, pct.toFixed(2)]
      }),
    ]
    downloadCSV('ranking-leiloes.csv', rows)
  }

  return (
    <div className="rl-section">
      <SectionHead
        title="Ranking"
        emphasis="de leilões"
        subtitle={`Os melhores eventos por resultado · ${period}`}
        onExport={exportCsv}
      />
      {items.length === 0 ? (
        <Empty title="Sem fechamentos no período" message="Cadastre o resultado de leilões para gerar o ranking." />
      ) : (
        <div className="rl-bento">
          <div className="rl-card rl-c6">
            <div className="rl-card-head">
              <div><h3>Top 10 · VGV</h3><div className="rl-sub">Maior volume geral de vendas</div></div>
              <Trophy size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            <RankList items={topVgv.map(f => ({
              key: f.id, primary: f.nome, secondary: f.data,
              value: fmtBRLCompact(f.vgv_total), bar: f.vgv_total,
            }))} />
          </div>
          <div className="rl-card rl-c6">
            <div className="rl-card-head">
              <div><h3>Top 10 · Ticket médio</h3><div className="rl-sub">Maior valor por animal</div></div>
              <TrendingUp size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            <RankList items={topTicket.map(f => ({
              key: f.id, primary: f.nome, secondary: f.data,
              value: fmtBRLCompact(f.ticket_medio), bar: f.ticket_medio,
            }))} />
          </div>
          <div className="rl-card rl-c6">
            <div className="rl-card-head">
              <div><h3>Top 10 · Maior lance</h3><div className="rl-sub">Por parcela registrada</div></div>
              <Sparkles size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            <RankList items={topLance.map(f => ({
              key: f.id, primary: f.nome, secondary: f.data,
              value: f.maior_lance ? fmtBRL(f.maior_lance) : '—', bar: f.maior_lance,
            }))} />
          </div>
          <div className="rl-card rl-c6">
            <div className="rl-card-head">
              <div><h3>Top 10 · Cobertura</h3><div className="rl-sub">Maior taxa de venda</div></div>
              <Percent size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            <RankList items={topCobertura.map(f => {
              const cob = f.lotes_ofertados ? f.lotes_vendidos / f.lotes_ofertados : 0
              return {
                key: f.id, primary: f.nome,
                secondary: `${f.lotes_vendidos}/${f.lotes_ofertados} lotes`,
                value: PCT(cob), bar: cob,
              }
            })} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── 8) Leads ────────────────────────────────────────────────────────────────

function ReportLeads({ data, period }: { data: Payload; period: string }) {
  const total = data.leads.length
  const ativos = data.leads.filter(l => !['Fechado', 'Perdido'].includes((l.status ?? '').trim())).length
  const fechados = data.leads.filter(l => (l.status ?? '').trim() === 'Fechado').length
  const perdidos = data.leads.filter(l => (l.status ?? '').trim() === 'Perdido').length
  const quentes = data.leads.filter(l => (l.prioridade ?? '').toLowerCase().includes('alta') || (l.prioridade ?? '').toLowerCase().includes('quente')).length

  const porStatus = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of data.leads) {
      const k = (l.status ?? 'Sem Status').trim() || 'Sem Status'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count)
  }, [data])

  const porInteresse = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of data.leads) {
      const k = (l.interesse ?? '').trim() || 'Sem interesse declarado'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([k, count]) => ({ interesse: k, count })).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [data])

  const porUf = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of data.leads) {
      const k = (l.estado ?? '').trim() || '—'
      if (k === '—') continue
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([uf, count]) => ({ uf, count })).sort((a, b) => b.count - a.count).slice(0, 12)
  }, [data])

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Status', 'Quantidade', '%'],
      ...porStatus.map(r => [r.status, r.count, total ? ((r.count / total) * 100).toFixed(2) : 0]),
    ]
    downloadCSV('relatorio-leads.csv', rows)
  }

  const maxStatus = Math.max(1, ...porStatus.map(s => s.count))

  return (
    <div className="rl-section">
      <SectionHead
        title="Relatório de"
        emphasis="leads"
        subtitle={`Demanda e intenção de compra · ${period}`}
        onExport={exportCsv}
      />

      <div className="rl-grid rl-grid-5">
        <Stat label="Leads no período" value={fmtNum(total)} gold />
        <Stat label="Em pipeline" value={fmtNum(ativos)} sub="ativos" />
        <Stat label="Quentes / Alta" value={fmtNum(quentes)} sub="prioridade alta" />
        <Stat label="Fechados" value={fmtNum(fechados)} />
        <Stat label="Perdidos" value={fmtNum(perdidos)} />
      </div>

      {total === 0 ? (
        <Empty title="Sem leads no período" message="Ajuste o intervalo para incluir registros do CRM." />
      ) : (
        <div className="rl-bento">
          <div className="rl-card rl-c6">
            <div className="rl-card-head">
              <div><h3>Distribuição por status</h3><div className="rl-sub">Ocupação atual do pipeline</div></div>
              <Activity size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {porStatus.map(s => (
                <div key={s.status} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 70px', gap: 12, alignItems: 'center', padding: '6px 0' }}>
                  <span style={{ color: 'var(--dcl-ink-2)', fontSize: 12.5 }}>{s.status}</span>
                  <div className="rl-bar" style={{ height: 8 }}><span style={{ width: `${(s.count / maxStatus) * 100}%` }} /></div>
                  <span className="rl-num" style={{ textAlign: 'right' }}>{fmtNum(s.count)} <span style={{ color: 'var(--dcl-ink-3)' }}>· {PCT(s.count / total)}</span></span>
                </div>
              ))}
            </div>
          </div>
          <div className="rl-card rl-c6">
            <div className="rl-card-head">
              <div><h3>Por interesse</h3><div className="rl-sub">O que o lead disse buscar</div></div>
              <Target size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            <RankList items={porInteresse.map(r => ({
              key: r.interesse, primary: r.interesse, secondary: PCT(r.count / total),
              value: fmtNum(r.count), bar: r.count,
            }))} />
          </div>
          <div className="rl-card rl-c12">
            <div className="rl-card-head">
              <div><h3>Distribuição geográfica</h3><div className="rl-sub">Top 12 estados</div></div>
              <MapPin size={14} style={{ color: 'var(--dcl-gold)' }} />
            </div>
            {porUf.length === 0 ? (
              <p style={{ color: 'var(--dcl-ink-3)', fontSize: 12.5, margin: 0 }}>Leads sem estado preenchido.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
                {porUf.map(u => (
                  <div key={u.uf} style={{
                    background: 'var(--dcl-bg-card-2)', border: '1px solid var(--dcl-line)',
                    borderRadius: 10, padding: '10px 12px',
                  }}>
                    <div style={{ color: 'var(--dcl-gold)', fontFamily: 'var(--font-mono), ui-monospace, monospace', fontSize: 14, fontWeight: 600 }}>{u.uf}</div>
                    <div className="rl-num" style={{ marginTop: 4 }}>{fmtNum(u.count)} <span style={{ color: 'var(--dcl-ink-3)' }}>leads</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 9) Conversão (funil) ────────────────────────────────────────────────────

const FUNNEL_STAGES = ['Lead', 'Qualificado', 'Proposta', 'Negociação', 'Fechado'] as const

function ReportConversao({ data, period }: { data: Payload; period: string }) {
  const counts = useMemo(() => {
    const counters: Record<string, number> = Object.fromEntries(FUNNEL_STAGES.map(s => [s, 0]))
    for (const l of data.leads) {
      const s = (l.status ?? '').trim()
      if (counters[s] != null) counters[s] += 1
    }
    return counters
  }, [data])

  const steps = FUNNEL_STAGES.map(s => ({ stage: s, count: counts[s] }))
  const top = steps[0].count || 1
  const fechados = counts['Fechado']
  const totalLeads = data.leads.length

  const valorPipeline = data.leads.reduce((s, l) => s + (l.valor_estimado || 0), 0)
  const valorPonderado = data.leads.reduce((s, l) => s + (l.valor_estimado || 0) * ((l.probabilidade ?? 0) / 100), 0)

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Etapa', 'Quantidade', 'Conversão (%)'],
      ...steps.map(s => [s.stage, s.count, top ? ((s.count / top) * 100).toFixed(2) : 0]),
    ]
    downloadCSV('relatorio-conversao.csv', rows)
  }

  return (
    <div className="rl-section">
      <SectionHead
        title="Funil de"
        emphasis="conversão"
        subtitle={`Visualização → interesse → contato → proposta → venda · ${period}`}
        onExport={exportCsv}
      />

      <div className="rl-grid rl-grid-4">
        <Stat label="Leads totais" value={fmtNum(totalLeads)} gold />
        <Stat label="Conversão lead→fechado" value={top ? PCT(fechados / top) : '0%'} sub={`${fechados} fechados`} />
        <Stat label="Pipeline em aberto" value={fmtBRLCompact(valorPipeline)} sub="valor estimado" />
        <Stat label="Pipeline ponderado" value={fmtBRLCompact(valorPonderado)} sub="ajustado por probabilidade" />
      </div>

      {totalLeads === 0 ? (
        <Empty title="Sem leads no período" message="Cadastre leads ou amplie o recorte para visualizar o funil." />
      ) : (
        <div className="rl-card">
          <div className="rl-card-head">
            <div><h3>Funil comercial</h3><div className="rl-sub">Volume e taxa de conversão por etapa</div></div>
            <FunnelIcon size={14} style={{ color: 'var(--dcl-gold)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}>
            {steps.map((s, i) => {
              const widthPct = top > 0 ? (s.count / top) * 100 : 0
              const drop = i > 0 ? Math.max(0, steps[i - 1].count - s.count) : 0
              const conv = i > 0 && steps[i - 1].count > 0 ? (s.count / steps[i - 1].count) : 1
              return (
                <div key={s.stage}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
                    <span style={{ color: 'var(--dcl-ink)', fontSize: 13, fontWeight: 500 }}>{s.stage}</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                      <span className="rl-num" style={{ fontSize: 14, color: 'var(--dcl-ink)' }}>{fmtNum(s.count)}</span>
                      <span style={{ fontSize: 11, color: 'var(--dcl-ink-3)', fontFamily: 'var(--font-mono), ui-monospace, monospace' }}>
                        {i === 0 ? '100,0%' : PCT(conv)}
                      </span>
                    </div>
                  </div>
                  <div className="rl-bar" style={{ height: 24, borderRadius: 8 }}>
                    <span style={{ width: `${Math.max(2, widthPct)}%`, borderRadius: 8 }} />
                  </div>
                  {i > 0 && drop > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <span style={{ fontSize: 10.5, color: 'var(--dcl-ink-4)' }}>
                        <TrendingDown size={10} style={{ verticalAlign: -1, marginRight: 4 }} />
                        {fmtNum(drop)} caíram nesta etapa
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 10) Origem dos Leads ────────────────────────────────────────────────────

function ReportOrigem({ data, period }: { data: Payload; period: string }) {
  const total = data.leads.length

  const porSource = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of data.leads) {
      const k = (l.source ?? l.origem ?? '').trim() || 'Não informado'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count)
  }, [data])

  const porMedium = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of data.leads) {
      const k = (l.medium ?? '').trim() || 'Não informado'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count)
  }, [data])

  const porCampaign = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of data.leads) {
      const k = (l.campaign ?? '').trim() || 'Sem campanha'
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([k, v]) => ({ key: k, count: v })).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [data])

  const exportCsv = () => {
    const rows: (string | number)[][] = [
      ['Dimensão', 'Valor', 'Quantidade', '%'],
      ...porSource.map(s => ['Source', s.key, s.count, total ? ((s.count / total) * 100).toFixed(2) : 0]),
      ...porMedium.map(s => ['Medium', s.key, s.count, total ? ((s.count / total) * 100).toFixed(2) : 0]),
      ...porCampaign.map(s => ['Campanha', s.key, s.count, total ? ((s.count / total) * 100).toFixed(2) : 0]),
    ]
    downloadCSV('relatorio-origem-leads.csv', rows)
  }

  return (
    <div className="rl-section">
      <SectionHead
        title="Origem dos"
        emphasis="leads"
        subtitle={`De onde vem o cliente · ${period}`}
        onExport={exportCsv}
      />

      {total === 0 ? (
        <Empty title="Sem leads no período" />
      ) : (
        <div className="rl-bento">
          <div className="rl-card rl-c4">
            <div className="rl-card-head">
              <div><h3>Source</h3><div className="rl-sub">UTM source / origem do lead</div></div>
            </div>
            <RankList items={porSource.slice(0, 10).map(s => ({
              key: s.key, primary: s.key, secondary: PCT(s.count / total),
              value: fmtNum(s.count), bar: s.count,
            }))} />
          </div>
          <div className="rl-card rl-c4">
            <div className="rl-card-head">
              <div><h3>Medium</h3><div className="rl-sub">Tipo de tráfego</div></div>
            </div>
            <RankList items={porMedium.slice(0, 10).map(s => ({
              key: s.key, primary: s.key, secondary: PCT(s.count / total),
              value: fmtNum(s.count), bar: s.count,
            }))} />
          </div>
          <div className="rl-card rl-c4">
            <div className="rl-card-head">
              <div><h3>Campanhas</h3><div className="rl-sub">Top 8 ativas</div></div>
            </div>
            <RankList items={porCampaign.map(s => ({
              key: s.key, primary: s.key, secondary: PCT(s.count / total),
              value: fmtNum(s.count), bar: s.count,
            }))} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reusable components ────────────────────────────────────────────────────

function SectionHead({ title, emphasis, subtitle, onExport }: {
  title: string; emphasis: string; subtitle: string; onExport?: () => void
}) {
  return (
    <div className="rl-section-head">
      <div>
        <h2>{title} <span className="dcl-serif">{emphasis}</span></h2>
        <div className="rl-sub">{subtitle}</div>
      </div>
      {onExport && (
        <button onClick={onExport} className="rl-export">
          <Download size={12} /> Exportar CSV
        </button>
      )}
    </div>
  )
}

function Stat({ label, value, sub, gold }: { label: string; value: string; sub?: string; gold?: boolean }) {
  return (
    <div className={`rl-stat${gold ? ' rl-stat-gold' : ''}`}>
      <div className="rl-stat-label">{label}</div>
      <div className="rl-stat-val">{value}</div>
      {sub && <div className="rl-stat-sub">{sub}</div>}
    </div>
  )
}

function Empty({ title, message }: { title: string; message?: string }) {
  return (
    <div className="rl-empty">
      <Hash size={20} style={{ color: 'var(--dcl-ink-4)' }} />
      <h4>{title}</h4>
      {message && <p>{message}</p>}
    </div>
  )
}

function RankList({ items }: { items: { key: string; primary: string; secondary?: string; value: string; bar?: number }[] }) {
  if (items.length === 0) return <p style={{ color: 'var(--dcl-ink-3)', fontSize: 12.5, margin: 0 }}>Sem dados.</p>
  const max = Math.max(1, ...items.map(i => i.bar ?? 0))
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((it, i) => (
        <div key={it.key} style={{
          display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 12,
          alignItems: 'center', padding: '10px 0',
          borderTop: i === 0 ? 'none' : '1px solid var(--dcl-line-soft)',
        }}>
          <span style={{
            fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif', fontStyle: 'italic',
            fontSize: 18, color: i < 3 ? 'var(--dcl-gold)' : 'var(--dcl-ink-4)', lineHeight: 1,
          }}>{i + 1}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--dcl-ink)', fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.primary}</div>
            {it.secondary && <div style={{ color: 'var(--dcl-ink-3)', fontSize: 10.5, marginTop: 2 }}>{it.secondary}</div>}
            {it.bar != null && (
              <div className="rl-bar" style={{ marginTop: 6, height: 4 }}>
                <span style={{ width: `${(it.bar / max) * 100}%` }} />
              </div>
            )}
          </div>
          <div className="rl-num" style={{ color: 'var(--dcl-ink)', fontWeight: 500, textAlign: 'right' }}>{it.value}</div>
        </div>
      ))}
    </div>
  )
}

function BarChartCard({ title, sub, items, valueFmt }: {
  title: string; sub: string;
  items: { label: string; value: number; sub?: string }[];
  valueFmt: (v: number) => string
}) {
  const max = Math.max(1, ...items.map(i => i.value))
  return (
    <div className="rl-card">
      <div className="rl-card-head">
        <div><h3>{title}</h3><div className="rl-sub">{sub}</div></div>
        <BarChart3 size={14} style={{ color: 'var(--dcl-gold)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0,1fr))`, gap: 8, alignItems: 'end', height: 200, padding: '8px 0 4px' }}>
        {items.map(it => {
          const h = max > 0 ? Math.max(8, (it.value / max) * 168) : 0
          return (
            <div key={it.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, justifyContent: 'flex-end', minWidth: 0 }}>
              <div className="rl-num" style={{ fontSize: 11, color: 'var(--dcl-ink-2)' }}>{valueFmt(it.value)}</div>
              <div style={{
                width: '70%', height: h,
                background: 'linear-gradient(180deg, var(--dcl-gold), var(--dcl-gold-2))',
                borderRadius: 4,
                boxShadow: '0 0 0 1px rgba(212,168,92,0.25), 0 0 18px rgba(212,168,92,0.15)',
              }} />
              <div style={{ fontSize: 10, color: 'var(--dcl-ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{it.label}</div>
              {it.sub && <div style={{ fontSize: 9.5, color: 'var(--dcl-ink-4)' }}>{it.sub}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
