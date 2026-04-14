'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Activity,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  BarChart2,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface StatsExtended {
  total_lotes: number
  lotes_vendidos: number
  lotes_nao_vendidos: number
  total_valor: number
  viewers_atual: number
  taxa_conversao: number
  preco_medio: number | null
  preco_maximo: number | null
  preco_minimo: number | null
  peso_medio: number | null
  preco_medio_kg: number | null
  preco_medio_arroba: number | null
}

interface StreamStatus {
  is_live: boolean
  url: string | null
  video_id: string | null
  last_vlm_at: string | null
}

interface Lote {
  id: number
  numero_lote: string
  valor_final: number | null
  comprador: string | null
  assessoria: string | null
  nome_animal: string | null
  vendedor: string | null
  descricao_lote: string | null
  motivo: 'VENDIDO' | 'NAO_VENDIDO'
  timestamp: string
  video_id: string | null
  peso_kg: number | null
  valor_parcela: number | null
  total_parcelas: number | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] p-6 flex items-start gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          accent
            ? 'bg-gradient-to-br from-[#B8860B] to-[#D4AF37] shadow-lg shadow-[#B8860B]/20'
            : 'bg-gray-100 dark:bg-[#1A1A1A]'
        }`}
      >
        <Icon size={22} className={accent ? 'text-black' : 'text-gray-500 dark:text-gray-400'} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function MotivoBadge({ motivo }: { motivo: 'VENDIDO' | 'NAO_VENDIDO' }) {
  if (motivo === 'VENDIDO') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
        <CheckCircle2 size={11} /> Vendido
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400">
      <XCircle size={11} /> Não vendido
    </span>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeIloesPage() {
  const [stats, setStats] = useState<StatsExtended | null>(null)
  const [status, setStatus] = useState<StreamStatus | null>(null)
  const [lotes, setLotes] = useState<Lote[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [search, setSearch] = useState('')
  const [filterMotivo, setFilterMotivo] = useState<'TODOS' | 'VENDIDO' | 'NAO_VENDIDO'>('TODOS')
  const [serverError, setServerError] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setServerError(false)
    try {
      const [statsRes, statusRes, lotesRes] = await Promise.all([
        fetch('/api/leilao/stats/extended'),
        fetch('/api/leilao/status'),
        fetch('/api/leilao/lotes?limit=200'),
      ])

      if (!statsRes.ok || statusRes.status === 503 || lotesRes.status === 503) {
        setServerError(true)
        return
      }

      const [statsData, statusData, lotesData] = await Promise.all([
        statsRes.json(),
        statusRes.json(),
        lotesRes.json(),
      ])

      if (statsData.error) { setServerError(true); return }

      setStats(statsData)
      setStatus(statusData)
      setLotes(Array.isArray(lotesData) ? lotesData : [])
      setLastRefresh(new Date())
    } catch {
      setServerError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30_000)
    return () => clearInterval(interval)
  }, [fetchAll])

  // ── Filtered lotes ──
  const filteredLotes = lotes.filter((l) => {
    if (filterMotivo !== 'TODOS' && l.motivo !== filterMotivo) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.numero_lote?.toLowerCase().includes(q) ||
      l.comprador?.toLowerCase().includes(q) ||
      l.assessoria?.toLowerCase().includes(q) ||
      l.vendedor?.toLowerCase().includes(q) ||
      l.nome_animal?.toLowerCase().includes(q) ||
      l.descricao_lote?.toLowerCase().includes(q)
    )
  })

  // ── Offline state ──
  if (!loading && serverError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monitor de Leilões</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Dados extraídos em tempo real dos leilões transmitidos no YouTube</p>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] text-black rounded-xl font-medium text-sm hover:bg-[#D4AF37] transition-colors"
          >
            <RefreshCw size={16} /> Tentar novamente
          </button>
        </div>
        <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] p-12 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} className="text-gray-300 dark:text-gray-700" />
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Servidor de leilão offline</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              O monitor não está respondendo em <code className="bg-gray-100 dark:bg-[#1A1A1A] px-1 rounded">LEILAO_SERVER_URL</code>.
              <br />Verifique se o Docker do Extratoreloi está rodando.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monitor de Leilões</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Dados extraídos em tempo real dos leilões transmitidos no YouTube
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-400 dark:text-gray-600">
              Atualizado às {lastRefresh.toLocaleTimeString('pt-BR', { timeStyle: 'short' })}
            </span>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] text-black rounded-xl font-medium text-sm hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stream status banner */}
      {status && (
        <div
          className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-medium ${
            status.is_live
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
              : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-[#1A1A1A] dark:border-[#222222] dark:text-gray-400'
          }`}
        >
          {status.is_live ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <Wifi size={16} />
              <span>Transmissão ao vivo detectada</span>
              {status.video_id && (
                <a
                  href={`https://www.youtube.com/watch?v=${status.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline opacity-70 hover:opacity-100"
                >
                  {status.video_id}
                </a>
              )}
              {stats && (
                <span className="ml-auto flex items-center gap-1 text-xs opacity-70">
                  <Users size={13} /> {stats.viewers_atual.toLocaleString('pt-BR')} espectadores
                </span>
              )}
            </>
          ) : (
            <>
              <WifiOff size={16} />
              <span>Nenhuma transmissão ao vivo no momento</span>
            </>
          )}
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Lotes Vendidos"
            value={stats.lotes_vendidos.toLocaleString('pt-BR')}
            sub={`${stats.taxa_conversao}% de conversão`}
            icon={Package}
            accent
          />
          <StatCard
            label="Volume Total"
            value={formatCurrency(stats.total_valor)}
            sub={`${stats.total_lotes} lotes processados`}
            icon={DollarSign}
          />
          <StatCard
            label="Preço Médio"
            value={formatCurrency(stats.preco_medio)}
            sub={stats.preco_medio_arroba ? `${formatCurrency(stats.preco_medio_arroba)}/@ arroba` : undefined}
            icon={TrendingUp}
          />
          <StatCard
            label="Maior Lance"
            value={formatCurrency(stats.preco_maximo)}
            sub={stats.preco_minimo ? `Mín: ${formatCurrency(stats.preco_minimo)}` : undefined}
            icon={BarChart2}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] overflow-hidden">
        {/* Table header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#222222] flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#B8860B]" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
              Histórico de Lotes
            </h2>
            {filteredLotes.length > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-600">
                {filteredLotes.length} registros
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter buttons */}
            <div className="flex rounded-lg border border-gray-200 dark:border-[#333333] overflow-hidden text-xs">
              {(['TODOS', 'VENDIDO', 'NAO_VENDIDO'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterMotivo(f)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    filterMotivo === f
                      ? 'bg-[#B8860B] text-black'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                  }`}
                >
                  {f === 'TODOS' ? 'Todos' : f === 'VENDIDO' ? 'Vendidos' : 'Não vendidos'}
                </button>
              ))}
            </div>
            {/* Search */}
            <input
              type="text"
              placeholder="Buscar comprador, lote…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#333333] bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#B8860B] w-48"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B8860B]" />
          </div>
        ) : filteredLotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Package size={40} className="text-gray-200 dark:text-gray-800" />
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {search || filterMotivo !== 'TODOS' ? 'Nenhum lote encontrado com esses filtros' : 'Nenhum lote registrado ainda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#1A1A1A]">
                  {['Lote', 'Animal / Descrição', 'Comprador', 'Assessoria', 'Vendedor', 'Valor Final', 'Peso', 'Status', 'Data'].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#1A1A1A]">
                {filteredLotes.map((lote) => (
                  <tr
                    key={lote.id}
                    className="hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-[#B8860B] whitespace-nowrap">
                      #{lote.numero_lote}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      {lote.nome_animal ? (
                        <span className="font-medium text-gray-800 dark:text-gray-200 block truncate">{lote.nome_animal}</span>
                      ) : null}
                      {lote.descricao_lote ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500 block truncate">{lote.descricao_lote}</span>
                      ) : !lote.nome_animal ? (
                        <span className="text-gray-400 dark:text-gray-600">—</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {lote.comprador || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                      {lote.assessoria || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                      {lote.vendedor || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {lote.valor_final != null ? (
                        <span>
                          {formatCurrency(lote.valor_final)}
                          {lote.total_parcelas && lote.total_parcelas > 1 && (
                            <span className="text-xs font-normal text-gray-400 ml-1">
                              ({lote.total_parcelas}×)
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {lote.peso_kg != null ? `${lote.peso_kg.toLocaleString('pt-BR')} kg` : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <MotivoBadge motivo={lote.motivo} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(lote.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
