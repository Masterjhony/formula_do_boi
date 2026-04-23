'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Edit2, Trash2, X, Loader2, AlertCircle, Save,
  MapPin, Users, TrendingUp, Award, BarChart3, DollarSign,
  ChevronRight, Calendar, Target, Percent, Hash, Star,
  ArrowUp, ArrowDown, Minus, Dna, ShoppingCart,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

type Assessor = {
  posicao: number; nome: string; empresa: string
  transacoes: number; animais: number; vgv: number
  ticket_medio: number; pct_total: number
}

type Estado = {
  uf: string; estado: string; lotes: number
  animais: number; vgv: number; pct_total: number
}

type Comprador = {
  rank: number; fazenda: string; comprador: string
  cidade: string; uf: string; lotes: number; animais: number; vgv: number
}

type Lance = {
  lote: string; fazenda: string; comprador: string; uf: string
  assessor: string; empresa: string; animais: number; parcela: number; vgv: number
}

type PerfilGenetico = {
  indices: Array<{ fonte: string; media_vendida: number; media_catalogo: number; diferenca: string; classificacao: string }>
  crias_sexo: Array<{ sexo: string; quantidade: number; pct: number; observacao: string }>
}

export type Fechamento = {
  id: string; nome: string; data: string; local: string
  lotes_ofertados: number; lotes_vendidos: number; animais_vendidos: number
  vgv_total: number; ticket_medio: number; maior_lance: number
  compradores_unicos: number; estados_alcancados: number
  por_assessor: Assessor[]; por_estado: Estado[]
  compradores: Comprador[]; lances: Lance[]
  perfil_genetico: PerfilGenetico | null
  comissao_assessoria: number; observacoes: string; created_at: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const R = (v: number | null | undefined) =>
  v ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : 'R$ —'

const PCT = (v: number) => `${(v * 100).toFixed(1)}%`

const MES: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return { dia: Number(d), mes: MES[m] ?? m, ano: y, full: `${Number(d)} ${MES[m] ?? m} ${y}` }
}

function coveragePct(vendidos: number, ofertados: number) {
  if (!ofertados) return 0
  return Math.round((vendidos / ofertados) * 100)
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#B8860B] transition-colors"

// ── Empty Form ─────────────────────────────────────────────────────────────────

function emptyForm(): Omit<Fechamento, 'id' | 'created_at'> {
  return {
    nome: '', data: '', local: '',
    lotes_ofertados: 0, lotes_vendidos: 0, animais_vendidos: 0,
    vgv_total: 0, ticket_medio: 0, maior_lance: 0,
    compradores_unicos: 0, estados_alcancados: 0,
    por_assessor: [], por_estado: [], compradores: [], lances: [],
    perfil_genetico: null, comissao_assessoria: 0, observacoes: '',
  }
}

// ── KPI Card ───────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, gold }: {
  icon: React.ElementType; label: string; value: string; sub?: string; gold?: boolean
}) {
  return (
    <div className={`rounded-2xl border px-5 py-4 ${gold ? 'border-[#B8860B]/30 bg-[#B8860B]/8' : 'border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className={gold ? 'text-[#B8860B]' : 'text-gray-400'} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      </div>
      <p className={`text-2xl font-black leading-none ${gold ? 'text-[#B8860B]' : 'text-gray-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Fechamento Card ────────────────────────────────────────────────────────────

function FechamentoCard({ f, selected, onClick }: { f: Fechamento; selected: boolean; onClick: () => void }) {
  const dt = fmtDate(f.data)
  const pct = coveragePct(f.lotes_vendidos, f.lotes_ofertados)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden
        ${selected
          ? 'border-[#B8860B]/50 bg-[#B8860B]/5 dark:bg-[#B8860B]/8 shadow-md shadow-[#B8860B]/10'
          : 'border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] hover:border-[#B8860B]/30 hover:shadow-sm'
        }`}
    >
      {/* Coverage bar accent */}
      <div className="h-1 w-full bg-gray-100 dark:bg-[#1A1A1A]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: pct >= 60 ? '#22c55e' : pct >= 30 ? '#B8860B' : '#ef4444' }}
        />
      </div>

      <div className="p-4 flex gap-4">
        {/* Date badge */}
        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border flex-shrink-0 transition-colors
          ${selected ? 'border-[#B8860B]/40 bg-[#B8860B]/12' : 'border-[#B8860B]/20 bg-[#B8860B]/6'}`}>
          <span className="text-[#B8860B] font-black text-xl leading-none">{dt.dia}</span>
          <span className="text-[#B8860B]/70 text-[9px] font-bold uppercase tracking-wider mt-0.5">{dt.mes}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-gray-900 dark:text-white font-black text-sm uppercase leading-tight line-clamp-2">{f.nome}</p>
          {f.local && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <MapPin size={9} /> <span className="truncate">{f.local}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-xs font-black text-[#B8860B]">{R(f.vgv_total)}</span>
            <span className="text-[10px] text-gray-500">
              {f.lotes_vendidos}/{f.lotes_ofertados} lotes <span className="font-semibold">{pct}%</span>
            </span>
            <span className="text-[10px] text-gray-400">{f.animais_vendidos} animais</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {f.por_assessor.slice(0, 3).map(a => (
              <span key={a.nome} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#B8860B]/10 text-[#B8860B] font-bold uppercase">
                {a.nome.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        <ChevronRight size={15} className={`flex-shrink-0 self-center text-gray-300 dark:text-gray-700 transition-transform ${selected ? 'rotate-90 text-[#B8860B]' : ''}`} />
      </div>
    </button>
  )
}

// ── Drawer Tabs ────────────────────────────────────────────────────────────────

type DrawerTab = 'resumo' | 'assessores' | 'compradores' | 'lances' | 'estados' | 'genetica'

function DrawerTabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-2 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors
        ${active ? 'border-b-2 border-[#B8860B] text-[#B8860B]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border-b-2 border-transparent'}`}
    >
      {children}
    </button>
  )
}

// ── Detail Drawer ──────────────────────────────────────────────────────────────

function FechamentoDrawer({ f, onClose, onEdit, onDelete }: {
  f: Fechamento; onClose: () => void; onEdit: () => void; onDelete: () => void
}) {
  const [tab, setTab] = useState<DrawerTab>('resumo')
  const dt = fmtDate(f.data)
  const pct = coveragePct(f.lotes_vendidos, f.lotes_ofertados)
  const maxVgv = f.por_assessor.length ? Math.max(...f.por_assessor.map(a => a.vgv)) : 1
  const maxVgvEstado = f.por_estado.length ? Math.max(...f.por_estado.map(e => e.vgv)) : 1

  const EMPRESA_COLORS: Record<string, string> = {
    'Bula Remates': '#B8860B',
    'Fórmula do Boi': '#4A8FBF',
  }

  const hasPerfil = !!f.perfil_genetico?.indices?.length

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#111111] h-full overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-[#1E1E1E] px-6 py-4 flex items-start gap-4">
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl border border-[#B8860B]/30 bg-[#B8860B]/8 flex-shrink-0">
            <span className="text-[#B8860B] font-black text-xl leading-none">{dt.dia}</span>
            <span className="text-[#B8860B]/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">{dt.mes}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-gray-900 dark:text-white text-base leading-tight uppercase">{f.nome}</h2>
            {f.local && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin size={10} />{f.local}</p>}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 max-w-32 bg-gray-100 dark:bg-[#1A1A1A] rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 60 ? '#22c55e' : '#B8860B' }} />
              </div>
              <span className="text-[10px] font-bold text-gray-500">{f.lotes_vendidos}/{f.lotes_ofertados} lotes · {pct}%</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-400 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-[#1E1E1E] px-4 overflow-x-auto">
          <DrawerTabBtn active={tab === 'resumo'} onClick={() => setTab('resumo')}>Resumo</DrawerTabBtn>
          <DrawerTabBtn active={tab === 'assessores'} onClick={() => setTab('assessores')}>Assessores</DrawerTabBtn>
          <DrawerTabBtn active={tab === 'compradores'} onClick={() => setTab('compradores')}>Compradores</DrawerTabBtn>
          <DrawerTabBtn active={tab === 'lances'} onClick={() => setTab('lances')}>Lances</DrawerTabBtn>
          <DrawerTabBtn active={tab === 'estados'} onClick={() => setTab('estados')}>Estados</DrawerTabBtn>
          {hasPerfil && <DrawerTabBtn active={tab === 'genetica'} onClick={() => setTab('genetica')}>Genética</DrawerTabBtn>}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ── RESUMO ── */}
          {tab === 'resumo' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: DollarSign, label: 'VGV Total', value: R(f.vgv_total), gold: true },
                  { icon: TrendingUp, label: 'Ticket Médio', value: R(f.ticket_medio) },
                  { icon: BarChart3, label: 'Lotes Vendidos', value: `${f.lotes_vendidos}/${f.lotes_ofertados}`, sub: `${pct}% de cobertura` },
                  { icon: Hash, label: 'Animais Vendidos', value: f.animais_vendidos.toString() },
                  { icon: Target, label: 'Maior Lance', value: f.maior_lance ? `R$ ${f.maior_lance.toLocaleString('pt-BR')}/parc.` : '—' },
                  { icon: Users, label: 'Compradores Únicos', value: f.compradores_unicos.toString(), sub: f.por_assessor.filter(a => a.nome).length ? `${f.por_assessor.reduce((s, a) => s + a.transacoes, 0)} transações` : undefined },
                  { icon: MapPin, label: 'Estados Alcançados', value: f.estados_alcancados.toString(), sub: f.por_estado.map(e => e.uf).join(' · ') || undefined },
                  { icon: Award, label: 'Comissão Assessoria', value: f.comissao_assessoria ? R(f.comissao_assessoria) : '—' },
                ].map(({ icon: Icon, label, value, sub, gold }) => (
                  <div key={label} className={`rounded-xl border p-3.5 ${gold ? 'border-[#B8860B]/30 bg-[#B8860B]/8' : 'border-gray-100 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#151515]'}`}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon size={11} className={gold ? 'text-[#B8860B]' : 'text-gray-400'} />
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
                    </div>
                    <p className={`text-lg font-black leading-tight ${gold ? 'text-[#B8860B]' : 'text-gray-900 dark:text-white'}`}>{value}</p>
                    {sub && <p className="text-[9px] text-gray-400 mt-0.5">{sub}</p>}
                  </div>
                ))}
              </div>

              {/* VGV por empresa */}
              {f.por_assessor.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">VGV por Empresa</p>
                  {(() => {
                    const byEmpresa: Record<string, number> = {}
                    for (const a of f.por_assessor) {
                      byEmpresa[a.empresa] = (byEmpresa[a.empresa] || 0) + a.vgv
                    }
                    const total = Object.values(byEmpresa).reduce((s, v) => s + v, 0)
                    return Object.entries(byEmpresa).map(([empresa, vgv]) => (
                      <div key={empresa} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{empresa}</span>
                          <span className="text-gray-500">{R(vgv)} · {((vgv / total) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${(vgv / total) * 100}%`, background: EMPRESA_COLORS[empresa] ?? '#B8860B' }} />
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}

              {f.observacoes && (
                <div className="bg-gray-50 dark:bg-[#151515] rounded-xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Observações</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{f.observacoes}</p>
                </div>
              )}
            </div>
          )}

          {/* ── ASSESSORES ── */}
          {tab === 'assessores' && (
            <div className="space-y-4">
              {f.por_assessor.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-12">Nenhum dado de assessor registrado</p>
              ) : f.por_assessor.map((a, i) => (
                <div key={a.nome} className="rounded-2xl border border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0
                      ${i === 0 ? 'bg-[#B8860B] text-black' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400'}`}>
                      {i === 0 ? <Star size={16} /> : a.posicao}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{a.nome}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{a.empresa}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#B8860B] text-base">{R(a.vgv)}</p>
                      <p className="text-[10px] text-gray-400">{PCT(a.pct_total)} do total</p>
                    </div>
                  </div>
                  {/* VGV bar */}
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] mb-3 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(a.vgv / maxVgv) * 100}%`, background: EMPRESA_COLORS[a.empresa] ?? '#B8860B' }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Transações', value: a.transacoes },
                      { label: 'Animais', value: a.animais },
                      { label: 'Ticket Médio', value: R(a.ticket_medio) },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg bg-gray-50 dark:bg-[#151515] px-3 py-2 text-center">
                        <p className="text-[9px] uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── COMPRADORES ── */}
          {tab === 'compradores' && (
            <div>
              {f.compradores.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-12">Nenhum comprador registrado</p>
              ) : (
                <div className="space-y-2.5">
                  {f.compradores.map(c => (
                    <div key={c.rank} className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] p-3.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0
                        ${c.rank === 1 ? 'bg-[#B8860B] text-black' : c.rank === 2 ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200' : c.rank === 3 ? 'bg-amber-700 text-white' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500'}`}>
                        {c.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{c.fazenda}</p>
                        {c.comprador !== c.fazenda && <p className="text-[10px] text-gray-400 truncate">{c.comprador}</p>}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] text-gray-400 flex items-center gap-1"><MapPin size={8} />{c.cidade}, {c.uf}</span>
                          <span className="text-[9px] text-gray-400">{c.lotes} lote{c.lotes !== 1 ? 's' : ''} · {c.animais} animal{c.animais !== 1 ? 'is' : ''}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-[#B8860B] text-sm">{R(c.vgv)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── LANCES ── */}
          {tab === 'lances' && (
            <div>
              {f.lances.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-12">Nenhum lance registrado</p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-[#1E1E1E]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#151515] border-b border-gray-100 dark:border-[#1E1E1E]">
                        {['Lote', 'Fazenda / Comprador', 'UF', 'Assessor', 'Anim.', 'Parcela', 'VGV'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-[#1A1A1A]">
                      {f.lances.map((l, i) => (
                        <tr key={i} className="bg-white dark:bg-[#111111] hover:bg-[#B8860B]/3 transition-colors">
                          <td className="px-3 py-2.5 font-bold text-[#B8860B] whitespace-nowrap">{l.lote}</td>
                          <td className="px-3 py-2.5 max-w-[160px]">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">{l.fazenda}</p>
                            {l.comprador !== l.fazenda && <p className="text-gray-400 truncate">{l.comprador}</p>}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400">{l.uf}</span>
                          </td>
                          <td className="px-3 py-2.5 max-w-[120px]">
                            <p className="font-semibold text-gray-700 dark:text-gray-300 truncate">{l.assessor}</p>
                            <p className="text-gray-400 truncate" style={{ color: EMPRESA_COLORS[l.empresa] ?? undefined }}>{l.empresa}</p>
                          </td>
                          <td className="px-3 py-2.5 text-center font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">{l.animais}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">
                            {l.parcela ? `R$ ${l.parcela.toLocaleString('pt-BR')}` : '—'}
                          </td>
                          <td className="px-3 py-2.5 whitespace-nowrap font-black text-[#B8860B]">{R(l.vgv)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 dark:bg-[#151515] border-t border-gray-100 dark:border-[#1E1E1E]">
                        <td colSpan={4} className="px-3 py-2.5 font-bold text-gray-600 dark:text-gray-400 text-[10px] uppercase tracking-wider">Total</td>
                        <td className="px-3 py-2.5 text-center font-black text-gray-900 dark:text-white">
                          {f.lances.reduce((s, l) => s + l.animais, 0)}
                        </td>
                        <td></td>
                        <td className="px-3 py-2.5 font-black text-[#B8860B]">
                          {R(f.lances.reduce((s, l) => s + l.vgv, 0))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ESTADOS ── */}
          {tab === 'estados' && (
            <div className="space-y-3">
              {f.por_estado.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-12">Nenhum dado por estado</p>
              ) : f.por_estado.map(e => (
                <div key={e.uf} className="rounded-xl border border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] p-4">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#B8860B]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#B8860B] font-black text-xs">{e.uf}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{e.estado}</p>
                      <p className="text-[10px] text-gray-400">{e.lotes} lote{e.lotes !== 1 ? 's' : ''} · {e.animais} animal{e.animais !== 1 ? 'is' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#B8860B] text-sm">{R(e.vgv)}</p>
                      <p className="text-[10px] text-gray-400">{PCT(e.pct_total)} do total</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(e.vgv / maxVgvEstado) * 100}%`, background: '#B8860B' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── PERFIL GENÉTICO ── */}
          {tab === 'genetica' && hasPerfil && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Índices Genéticos — Ventres Vendidos</p>
                <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-[#1E1E1E]">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-[#151515] border-b border-gray-100 dark:border-[#1E1E1E]">
                        {['Índice', 'Média Vendida', 'Média Catálogo', 'Diferença', 'Classificação'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-[#1A1A1A]">
                      {f.perfil_genetico!.indices.map(idx => {
                        const diff = parseFloat(idx.diferenca)
                        return (
                          <tr key={idx.fonte} className="bg-white dark:bg-[#111111]">
                            <td className="px-3 py-3 font-semibold text-gray-800 dark:text-gray-200">{idx.fonte}</td>
                            <td className="px-3 py-3 font-black text-[#B8860B]">{idx.media_vendida}</td>
                            <td className="px-3 py-3 text-gray-600 dark:text-gray-400">{idx.media_catalogo}</td>
                            <td className="px-3 py-3">
                              <span className={`inline-flex items-center gap-1 font-bold
                                ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {diff > 0 ? <ArrowUp size={10} /> : diff < 0 ? <ArrowDown size={10} /> : <Minus size={10} />}
                                {idx.diferenca}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                                {idx.classificacao}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {f.perfil_genetico!.crias_sexo?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Sexo das Crias ao Pé</p>
                  <div className="space-y-3">
                    {f.perfil_genetico!.crias_sexo.map(s => (
                      <div key={s.sexo} className="rounded-xl border border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{s.sexo}</p>
                            <p className="text-[10px] text-gray-400">{s.observacao}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-[#B8860B] text-lg">{s.quantidade}</p>
                            <p className="text-[10px] text-gray-400">{PCT(s.pct)}</p>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 dark:bg-[#1A1A1A] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: PCT(s.pct), background: '#B8860B' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-[#1E1E1E] px-6 py-4 flex gap-3">
          <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-100 dark:border-red-500/20 transition-colors">
            <Trash2 size={14} /> Excluir
          </button>
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B8860B] hover:bg-[#D4AF37] text-black text-sm font-semibold transition-colors">
            <Edit2 size={14} /> Editar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Form Modal ─────────────────────────────────────────────────────────────────

type FormData = Omit<Fechamento, 'id' | 'created_at' | 'por_assessor' | 'por_estado' | 'compradores' | 'lances' | 'perfil_genetico'> & {
  por_assessor_json: string
  por_estado_json: string
  compradores_json: string
  lances_json: string
  perfil_genetico_json: string
}

function toFormData(f: Fechamento | null): FormData {
  if (!f) return {
    ...emptyForm(),
    por_assessor_json: '[]', por_estado_json: '[]',
    compradores_json: '[]', lances_json: '[]', perfil_genetico_json: '',
  }
  return {
    nome: f.nome, data: f.data, local: f.local,
    lotes_ofertados: f.lotes_ofertados, lotes_vendidos: f.lotes_vendidos,
    animais_vendidos: f.animais_vendidos, vgv_total: f.vgv_total,
    ticket_medio: f.ticket_medio, maior_lance: f.maior_lance,
    compradores_unicos: f.compradores_unicos, estados_alcancados: f.estados_alcancados,
    comissao_assessoria: f.comissao_assessoria, observacoes: f.observacoes,
    por_assessor_json: JSON.stringify(f.por_assessor, null, 2),
    por_estado_json: JSON.stringify(f.por_estado, null, 2),
    compradores_json: JSON.stringify(f.compradores, null, 2),
    lances_json: JSON.stringify(f.lances, null, 2),
    perfil_genetico_json: f.perfil_genetico ? JSON.stringify(f.perfil_genetico, null, 2) : '',
  }
}

function FechamentoFormModal({ initial, onClose, onSaved }: {
  initial: Fechamento | null; onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState<FormData>(() => toFormData(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formTab, setFormTab] = useState<'basico' | 'assessores' | 'compradores' | 'lances' | 'estados' | 'genetica'>('basico')

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.nome.trim() || !form.data) { setError('Preencha nome e data'); return }
    setSaving(true); setError(null)
    try {
      let por_assessor, por_estado, compradores, lances, perfil_genetico = null
      try { por_assessor = JSON.parse(form.por_assessor_json || '[]') } catch { throw new Error('JSON inválido em Assessores') }
      try { por_estado = JSON.parse(form.por_estado_json || '[]') } catch { throw new Error('JSON inválido em Estados') }
      try { compradores = JSON.parse(form.compradores_json || '[]') } catch { throw new Error('JSON inválido em Compradores') }
      try { lances = JSON.parse(form.lances_json || '[]') } catch { throw new Error('JSON inválido em Lances') }
      if (form.perfil_genetico_json.trim()) {
        try { perfil_genetico = JSON.parse(form.perfil_genetico_json) } catch { throw new Error('JSON inválido em Perfil Genético') }
      }
      const payload = {
        nome: form.nome, data: form.data, local: form.local,
        lotes_ofertados: form.lotes_ofertados, lotes_vendidos: form.lotes_vendidos,
        animais_vendidos: form.animais_vendidos, vgv_total: form.vgv_total,
        ticket_medio: form.ticket_medio, maior_lance: form.maior_lance,
        compradores_unicos: form.compradores_unicos, estados_alcancados: form.estados_alcancados,
        comissao_assessoria: form.comissao_assessoria, observacoes: form.observacoes,
        por_assessor, por_estado, compradores, lances, perfil_genetico,
      }
      const url = isEdit ? `/api/bula/fechamento/${initial!.id}` : '/api/bula/fechamento'
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error(await res.text())
      onSaved(); onClose()
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erro ao salvar') }
    finally { setSaving(false) }
  }

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )

  const JsonEditor = ({ label, field }: { label: string; field: keyof FormData }) => (
    <Field label={label}>
      <textarea
        className={`${inputCls} font-mono text-[11px] h-48 resize-none`}
        value={form[field] as string}
        onChange={e => set(field, e.target.value as FormData[typeof field])}
        placeholder="[]"
        spellCheck={false}
      />
    </Field>
  )

  const FORM_TABS = [
    { key: 'basico', label: 'Básico' },
    { key: 'assessores', label: 'Assessores' },
    { key: 'compradores', label: 'Compradores' },
    { key: 'lances', label: 'Lances' },
    { key: 'estados', label: 'Estados' },
    { key: 'genetica', label: 'Genética' },
  ] as const

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#1E1E1E]">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">{isEdit ? 'Editar Fechamento' : 'Novo Fechamento'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        {/* Form tabs */}
        <div className="flex border-b border-gray-100 dark:border-[#1E1E1E] px-4 overflow-x-auto flex-shrink-0">
          {FORM_TABS.map(t => (
            <button key={t.key} onClick={() => setFormTab(t.key)}
              className={`px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors
                ${formTab === t.key ? 'border-b-2 border-[#B8860B] text-[#B8860B]' : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {formTab === 'basico' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nome do Leilão" required><input className={inputCls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Nelore MRA 50 Anos" /></Field>
                <Field label="Data" required><input type="date" className={inputCls} value={form.data} onChange={e => set('data', e.target.value)} /></Field>
              </div>
              <Field label="Local"><input className={inputCls} value={form.local} onChange={e => set('local', e.target.value)} placeholder="Ex: Fazenda Paraíso – Terenos, MS" /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Lotes Ofertados"><input type="number" className={inputCls} value={form.lotes_ofertados || ''} onChange={e => set('lotes_ofertados', Number(e.target.value))} min={0} /></Field>
                <Field label="Lotes Vendidos"><input type="number" className={inputCls} value={form.lotes_vendidos || ''} onChange={e => set('lotes_vendidos', Number(e.target.value))} min={0} /></Field>
                <Field label="Animais Vendidos"><input type="number" className={inputCls} value={form.animais_vendidos || ''} onChange={e => set('animais_vendidos', Number(e.target.value))} min={0} /></Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="VGV Total (R$)"><input type="number" className={inputCls} value={form.vgv_total || ''} onChange={e => set('vgv_total', Number(e.target.value))} min={0} /></Field>
                <Field label="Ticket Médio (R$)"><input type="number" className={inputCls} value={form.ticket_medio || ''} onChange={e => set('ticket_medio', Number(e.target.value))} min={0} /></Field>
                <Field label="Maior Lance (R$/parc.)"><input type="number" className={inputCls} value={form.maior_lance || ''} onChange={e => set('maior_lance', Number(e.target.value))} min={0} /></Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Compradores Únicos"><input type="number" className={inputCls} value={form.compradores_unicos || ''} onChange={e => set('compradores_unicos', Number(e.target.value))} min={0} /></Field>
                <Field label="Estados Alcançados"><input type="number" className={inputCls} value={form.estados_alcancados || ''} onChange={e => set('estados_alcancados', Number(e.target.value))} min={0} /></Field>
                <Field label="Comissão Assessoria (R$)"><input type="number" className={inputCls} value={form.comissao_assessoria || ''} onChange={e => set('comissao_assessoria', Number(e.target.value))} min={0} /></Field>
              </div>
              <Field label="Observações">
                <textarea className={`${inputCls} h-24 resize-none`} value={form.observacoes} onChange={e => set('observacoes', e.target.value)} placeholder="Notas sobre o fechamento..." />
              </Field>
            </>
          )}
          {formTab === 'assessores' && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">Formato esperado: array de objetos com campos <code className="text-[#B8860B]">posicao, nome, empresa, transacoes, animais, vgv, ticket_medio, pct_total</code></p>
              <JsonEditor label="Por Assessor (JSON)" field="por_assessor_json" />
            </div>
          )}
          {formTab === 'compradores' && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">Campos: <code className="text-[#B8860B]">rank, fazenda, comprador, cidade, uf, lotes, animais, vgv</code></p>
              <JsonEditor label="Compradores (JSON)" field="compradores_json" />
            </div>
          )}
          {formTab === 'lances' && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">Campos: <code className="text-[#B8860B]">lote, fazenda, comprador, uf, assessor, empresa, animais, parcela, vgv</code></p>
              <JsonEditor label="Lances (JSON)" field="lances_json" />
            </div>
          )}
          {formTab === 'estados' && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">Campos: <code className="text-[#B8860B]">uf, estado, lotes, animais, vgv, pct_total</code></p>
              <JsonEditor label="Por Estado (JSON)" field="por_estado_json" />
            </div>
          )}
          {formTab === 'genetica' && (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400">Objeto com campos <code className="text-[#B8860B]">indices</code> (array) e <code className="text-[#B8860B]">crias_sexo</code> (array). Deixe vazio se não houver.</p>
              <JsonEditor label="Perfil Genético (JSON)" field="perfil_genetico_json" />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#1E1E1E] flex justify-end gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B8860B] hover:bg-[#D4AF37] text-black text-sm font-semibold disabled:opacity-50 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Salvar alterações' : 'Criar fechamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main View ──────────────────────────────────────────────────────────────────

export default function FechamentoView() {
  const [items, setItems] = useState<Fechamento[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Fechamento | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Fechamento | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bula/fechamento')
      if (res.ok) setItems(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async () => {
    if (!selected) return
    if (!confirm(`Excluir fechamento "${selected.nome}"?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/bula/fechamento/${selected.id}`, { method: 'DELETE' })
      setSelected(null)
      fetchAll()
    } finally { setDeleting(false) }
  }

  const handleEdit = (f: Fechamento) => {
    setEditItem(f)
    setShowForm(true)
    setSelected(null)
  }

  // Aggregate KPIs
  const totalVgv = items.reduce((s, f) => s + f.vgv_total, 0)
  const totalAnimais = items.reduce((s, f) => s + f.animais_vendidos, 0)
  const totalLotesVendidos = items.reduce((s, f) => s + f.lotes_vendidos, 0)
  const totalLotesOfertados = items.reduce((s, f) => s + f.lotes_ofertados, 0)
  const coberturaMedia = totalLotesOfertados ? Math.round((totalLotesVendidos / totalLotesOfertados) * 100) : 0
  const ticketMedioGeral = totalAnimais ? Math.round(totalVgv / totalAnimais) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Fechamento de Leilões</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{items.length} leilão{items.length !== 1 ? 'ões' : ''} com resultado registrado</p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#B8860B] hover:bg-[#D4AF37] text-black rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-[#B8860B]/20"
        >
          <Plus size={16} /> Novo Fechamento
        </button>
      </div>

      {/* Aggregate KPIs */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={DollarSign} label="VGV Total" value={R(totalVgv)} gold />
          <KpiCard icon={BarChart3} label="Lotes Vendidos" value={`${totalLotesVendidos}/${totalLotesOfertados}`} />
          <KpiCard icon={Percent} label="Cobertura Média" value={`${coberturaMedia}%`} />
          <KpiCard icon={Hash} label="Animais Vendidos" value={totalAnimais.toLocaleString('pt-BR')} />
          <KpiCard icon={TrendingUp} label="Ticket Médio Geral" value={R(ticketMedioGeral)} />
          <KpiCard icon={ShoppingCart} label="Leilões Fechados" value={items.length.toString()} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-[#B8860B]" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center">
            <BarChart3 size={28} className="text-gray-300 dark:text-gray-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Nenhum fechamento registrado</p>
            <p className="text-xs text-gray-400 mt-1">Adicione o resultado de um leilão para começar</p>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowForm(true) }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B8860B] hover:bg-[#D4AF37] text-black rounded-xl font-semibold text-sm transition-colors"
          >
            <Plus size={15} /> Adicionar primeiro fechamento
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(f => (
            <FechamentoCard
              key={f.id}
              f={f}
              selected={selected?.id === f.id}
              onClick={() => setSelected(s => s?.id === f.id ? null : f)}
            />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <FechamentoDrawer
          f={selected}
          onClose={() => setSelected(null)}
          onEdit={() => handleEdit(selected)}
          onDelete={handleDelete}
        />
      )}

      {/* Delete overlay */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <FechamentoFormModal
          initial={editItem}
          onClose={() => { setShowForm(false); setEditItem(null) }}
          onSaved={() => { fetchAll(); setSelected(null) }}
        />
      )}
    </div>
  )
}
