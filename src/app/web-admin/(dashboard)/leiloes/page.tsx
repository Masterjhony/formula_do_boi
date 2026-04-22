'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Edit2, Trash2, X, ExternalLink, CalendarDays, Users, Tv, Tag,
  Check, Link2, Loader2, BookOpen, Clock, MapPin, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Circle, FileText, ChevronRight,
  TableProperties, List, Save,
} from 'lucide-react'
import type { BulaLeilao, LeilaoGrupo, LeilaoTask, LeilaoSubtask } from '@/lib/bula/types'

// ── Helpers ──────────────────────────────────────────────────────────────────

const MES_NAMES = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DIA_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

function parseDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return { dia: d, mesNum: m, mesNome: MES_NAMES[m], diaSemana: DIA_NAMES[dt.getDay()] }
}

function checklistProgress(groups: LeilaoGrupo[]): { done: number; total: number } {
  let done = 0, total = 0
  for (const g of groups ?? []) {
    for (const t of g.tasks ?? []) {
      for (const s of t.subs ?? []) {
        total++
        if (s.done) done++
      }
    }
  }
  return { done, total }
}

const STATUS_STYLES: Record<string, string> = {
  confirmado: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  negociacao: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  prospecto:  'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  concluido:  'bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400',
}
const STATUS_LABELS: Record<string, string> = {
  confirmado: 'Confirmado', negociacao: 'Em negociação',
  prospecto: 'Prospecto', concluido: 'Concluído',
}

const DEFAULT_TASKS: LeilaoGrupo[] = [
  {
    nome: 'Pré-Leilão', cor: '#4A8FBF',
    tasks: [
      { id: 'pre1', nome: 'Contrato', ini: '', fim: '', resp: { nome: 'Equipe Bula', ini: 'B' }, subs: [
        { lbl: 'Minuta enviada', done: false },
        { lbl: 'Contrato assinado', done: false },
      ]},
      { id: 'pre2', nome: 'Catálogo', ini: '', fim: '', resp: { nome: 'Equipe Bula', ini: 'B' }, subs: [
        { lbl: 'Fotos recebidas', done: false },
        { lbl: 'Catálogo criado', done: false },
        { lbl: 'Catálogo aprovado', done: false },
      ]},
      { id: 'pre3', nome: 'Divulgação', ini: '', fim: '', resp: { nome: 'Equipe Bula', ini: 'B' }, subs: [
        { lbl: 'Posts programados', done: false },
        { lbl: 'WhatsApp disparado', done: false },
        { lbl: 'E-mail marketing enviado', done: false },
      ]},
    ],
  },
  {
    nome: 'Dia do Leilão', cor: '#C8A96E',
    tasks: [
      { id: 'dia1', nome: 'Operação', ini: '', fim: '', resp: { nome: 'Equipe Bula', ini: 'B' }, subs: [
        { lbl: 'Assessor escalado confirmado', done: false },
        { lbl: 'Transmissão online OK', done: false },
        { lbl: 'Lotes conferidos', done: false },
        { lbl: 'Resultados anotados', done: false },
      ]},
    ],
  },
  {
    nome: 'Pós-Leilão', cor: '#6B8F5C',
    tasks: [
      { id: 'pos1', nome: 'Pós-venda', ini: '', fim: '', resp: { nome: 'Equipe Bula', ini: 'B' }, subs: [
        { lbl: 'Resultado registrado no sistema', done: false },
        { lbl: 'Comissão lançada', done: false },
        { lbl: 'Relatório enviado ao criador', done: false },
      ]},
    ],
  },
]

type FormState = Omit<BulaLeilao, 'id' | 'assessores' | 'tasks'> & { catalogo_url: string }

function emptyForm(): FormState {
  return {
    nome: '', data: '', tipo: '', local: '', animais: 0,
    expectativa: 0, meta_bula: 0, realizado_bula: 0,
    status: 'confirmado', img: '',
    horario: '', transmissao: '', modelo: 'PRESENCIAL',
    leiloeira: 'BULA', condicao: '', frete_gratis: '', acordo_comissao: '',
    catalogo_url: '',
  }
}

// ── ChecklistPanel ────────────────────────────────────────────────────────────

function ChecklistPanel({ leilao, onUpdate }: {
  leilao: BulaLeilao
  onUpdate: (tasks: LeilaoGrupo[]) => void
}) {
  const [groups, setGroups] = useState<LeilaoGrupo[]>(leilao.tasks ?? DEFAULT_TASKS)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(groups.map(g => g.nome)))

  const toggle = async (gi: number, ti: number, si: number) => {
    const next = groups.map((g, gIdx) => ({
      ...g,
      tasks: g.tasks.map((t, tIdx) => ({
        ...t,
        subs: t.subs.map((s, sIdx) =>
          gIdx === gi && tIdx === ti && sIdx === si ? { ...s, done: !s.done } : s
        ),
      })),
    }))
    setGroups(next)
    setSaving(true)
    try {
      await fetch(`/api/bula/leiloes/${leilao.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: next }),
      })
      onUpdate(next)
    } finally {
      setSaving(false)
    }
  }

  const toggleGroup = (nome: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(nome) ? next.delete(nome) : next.add(nome)
      return next
    })
  }

  const { done, total } = checklistProgress(groups)
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? '#22c55e' : 'linear-gradient(to right, #B8860B, #D4AF37)',
            }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-14 text-right">
          {done}/{total} {saving && <Loader2 size={10} className="inline animate-spin ml-1" />}
        </span>
      </div>

      {/* Groups */}
      {groups.map((group, gi) => {
        const isOpen = expanded.has(group.nome)
        const gDone = group.tasks.flatMap(t => t.subs).filter(s => s.done).length
        const gTotal = group.tasks.flatMap(t => t.subs).length
        return (
          <div key={group.nome} className="rounded-xl border border-gray-100 dark:border-[#222222] overflow-hidden">
            <button
              onClick={() => toggleGroup(group.nome)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-[#151515] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: group.cor }}
              />
              <span className="flex-1 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
                {group.nome}
              </span>
              <span className="text-xs text-gray-400">{gDone}/{gTotal}</span>
              {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-50 dark:divide-[#1A1A1A]">
                {group.tasks.map((task, ti) => (
                  <div key={task.id} className="px-4 py-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">
                      {task.nome}
                    </p>
                    <div className="space-y-2">
                      {task.subs.map((sub, si) => (
                        <button
                          key={si}
                          onClick={() => toggle(gi, ti, si)}
                          className="flex items-center gap-2.5 w-full text-left group"
                        >
                          <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                            sub.done
                              ? 'bg-[#B8860B] border-[#B8860B]'
                              : 'border-gray-200 dark:border-[#333333] group-hover:border-[#B8860B]/50'
                          }`}>
                            {sub.done && <Check size={10} className="text-black" />}
                          </span>
                          <span className={`text-sm transition-colors ${
                            sub.done
                              ? 'line-through text-gray-400 dark:text-gray-600'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {sub.lbl}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── DetailDrawer ──────────────────────────────────────────────────────────────

function DetailDrawer({ leilao, onClose, onEdit, onDelete, onTasksUpdate }: {
  leilao: BulaLeilao
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onTasksUpdate: (tasks: LeilaoGrupo[]) => void
}) {
  const dt = parseDate(leilao.data)
  const { done, total } = checklistProgress(leilao.tasks ?? [])
  const isVirtual = leilao.modelo?.toUpperCase() === 'VIRTUAL'
  const catalogoUrl = (leilao as BulaLeilao & { catalogo_url?: string }).catalogo_url

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#111111] h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-[#1E1E1E] px-6 py-4 flex items-start gap-4">
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl border border-[#B8860B]/30 bg-[#B8860B]/8 flex-shrink-0">
            <span className="text-[#B8860B] font-black text-xl leading-none">{dt.dia}</span>
            <span className="text-[#B8860B]/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
              {dt.mesNome.slice(0, 3)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-gray-900 dark:text-white text-lg leading-tight uppercase">{leilao.nome}</h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[leilao.status]}`}>
                {STATUS_LABELS[leilao.status]}
              </span>
              {isVirtual ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500">
                  <Tv size={9} /> Virtual
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/25 text-[#B8860B]">
                  <Users size={9} /> Presencial
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-400 transition-colors flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-6">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: CalendarDays, label: 'Data', value: `${dt.diaSemana}, ${dt.dia} de ${dt.mesNome}` },
              { icon: Clock, label: 'Horário', value: leilao.horario || '—' },
              { icon: Tag, label: 'Categoria', value: leilao.tipo || '—' },
              { icon: Users, label: 'Animais', value: leilao.animais ? `${leilao.animais.toLocaleString('pt-BR')} animais` : '—' },
              { icon: MapPin, label: 'Local', value: leilao.local || '—' },
              { icon: FileText, label: 'Leiloeira', value: leilao.leiloeira || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 dark:bg-[#151515] rounded-xl px-3.5 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className="text-[#B8860B]" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{value}</p>
              </div>
            ))}
          </div>

          {/* Financial */}
          {(leilao.expectativa > 0 || leilao.meta_bula > 0) && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Expectativa', value: leilao.expectativa },
                { label: 'Meta Bula', value: leilao.meta_bula },
                { label: 'Realizado', value: leilao.realizado_bula },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-gray-50 dark:bg-[#151515] rounded-xl py-2.5 px-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {value ? `R$ ${(value / 1000).toFixed(0)}k` : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Extra fields */}
          {(leilao.condicao || leilao.frete_gratis || leilao.acordo_comissao || leilao.transmissao) && (
            <div className="space-y-2">
              {[
                { label: 'Condição', value: leilao.condicao },
                { label: 'Frete grátis', value: leilao.frete_gratis },
                { label: 'Comissão', value: leilao.acordo_comissao },
                { label: 'Transmissão', value: leilao.transmissao },
              ].filter(x => x.value).map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 dark:text-gray-500 w-24 flex-shrink-0">{label}:</span>
                  <span className="text-gray-700 dark:text-gray-300">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Catálogo */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Catálogo</p>
            {catalogoUrl ? (
              <a
                href={catalogoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B8860B]/10 border border-[#B8860B]/30 text-[#B8860B] text-sm font-semibold hover:bg-[#B8860B]/20 transition-colors"
              >
                <BookOpen size={15} />
                Abrir catálogo
                <ExternalLink size={12} className="ml-auto opacity-60" />
              </a>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-[#151515] border border-dashed border-gray-200 dark:border-[#2A2A2A] text-sm text-gray-400">
                <Link2 size={15} />
                Nenhum catálogo adicionado
              </div>
            )}
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Checklist</p>
              <span className="text-xs text-gray-400">{done}/{total} concluídas</span>
            </div>
            <ChecklistPanel leilao={leilao} onUpdate={onTasksUpdate} />
          </div>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white dark:bg-[#111111] border-t border-gray-100 dark:border-[#1E1E1E] px-6 py-4 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B8860B] hover:bg-[#D4AF37] text-black text-sm font-semibold rounded-xl transition-colors"
          >
            <Edit2 size={15} /> Editar
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── FormModal ─────────────────────────────────────────────────────────────────

function FormModal({ initial, onClose, onSaved }: {
  initial: (BulaLeilao & { catalogo_url?: string }) | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          nome: initial.nome, data: initial.data, tipo: initial.tipo,
          local: initial.local, animais: initial.animais,
          expectativa: initial.expectativa, meta_bula: initial.meta_bula,
          realizado_bula: initial.realizado_bula, status: initial.status,
          img: initial.img ?? '',
          horario: initial.horario ?? '', transmissao: initial.transmissao ?? '',
          modelo: initial.modelo ?? 'PRESENCIAL', leiloeira: initial.leiloeira ?? 'BULA',
          condicao: initial.condicao ?? '', frete_gratis: initial.frete_gratis ?? '',
          acordo_comissao: initial.acordo_comissao ?? '',
          catalogo_url: initial.catalogo_url ?? '',
        }
      : emptyForm()
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof FormState, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.data) { setError('Preencha nome e data'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = { ...form }
      if (isEdit) {
        const res = await fetch(`/api/bula/leiloes/${initial!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Erro ao salvar')
      } else {
        const res = await fetch('/api/bula/leiloes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, tasks: DEFAULT_TASKS, assessor_ids: [] }),
        })
        if (!res.ok) throw new Error('Erro ao criar')
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#B8860B] transition-colors"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#1E1E1E]">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">
            {isEdit ? 'Editar Leilão' : 'Novo Leilão'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome / Criador" required>
              <input className={`${inputCls} col-span-2`} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Fazenda São Geraldo" />
            </Field>
            <Field label="Data" required>
              <input type="date" className={inputCls} value={form.data} onChange={e => set('data', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria (tipo)">
              <input className={inputCls} value={form.tipo} onChange={e => set('tipo', e.target.value)} placeholder="Ex: Touros P.O." />
            </Field>
            <Field label="Nº de Animais">
              <input type="number" className={inputCls} value={form.animais || ''} onChange={e => set('animais', Number(e.target.value))} placeholder="0" min={0} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Modelo">
              <select className={inputCls} value={form.modelo} onChange={e => set('modelo', e.target.value)}>
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </Field>
            <Field label="Horário">
              <input className={inputCls} value={form.horario} onChange={e => set('horario', e.target.value)} placeholder="Ex: 13:00" />
            </Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value as FormState['status'])}>
                <option value="confirmado">Confirmado</option>
                <option value="negociacao">Em negociação</option>
                <option value="prospecto">Prospecto</option>
                <option value="concluido">Concluído</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Leiloeira">
              <input className={inputCls} value={form.leiloeira} onChange={e => set('leiloeira', e.target.value)} placeholder="Ex: BULA" />
            </Field>
            <Field label="Transmissão">
              <input className={inputCls} value={form.transmissao} onChange={e => set('transmissao', e.target.value)} placeholder="Ex: RURALPLAY" />
            </Field>
          </div>

          <Field label="Local">
            <input className={inputCls} value={form.local} onChange={e => set('local', e.target.value)} placeholder="Cidade / Fazenda" />
          </Field>

          <Field label="URL do Catálogo">
            <div className="relative">
              <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${inputCls} pl-9`} value={form.catalogo_url} onChange={e => set('catalogo_url', e.target.value)} placeholder="https://..." type="url" />
            </div>
          </Field>

          <div className="pt-1 border-t border-gray-100 dark:border-[#1E1E1E]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Financeiro (opcional)</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'expectativa' as keyof FormState, label: 'Expectativa (R$)' },
                { key: 'meta_bula' as keyof FormState, label: 'Meta Bula (R$)' },
                { key: 'realizado_bula' as keyof FormState, label: 'Realizado (R$)' },
              ].map(({ key, label }) => (
                <Field key={key} label={label}>
                  <input type="number" className={inputCls} value={(form[key] as number) || ''} onChange={e => set(key, Number(e.target.value))} placeholder="0" min={0} />
                </Field>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Condição">
              <input className={inputCls} value={form.condicao} onChange={e => set('condicao', e.target.value)} placeholder="Ex: 30(2+2+…)" />
            </Field>
            <Field label="Frete grátis">
              <input className={inputCls} value={form.frete_gratis} onChange={e => set('frete_gratis', e.target.value)} placeholder="Ex: Brasil inteiro" />
            </Field>
            <Field label="Comissão">
              <input className={inputCls} value={form.acordo_comissao} onChange={e => set('acordo_comissao', e.target.value)} placeholder="Ex: 8% comprador" />
            </Field>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#1E1E1E] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B8860B] hover:bg-[#D4AF37] text-black text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Salvar alterações' : 'Criar leilão'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── LeilaoCard ────────────────────────────────────────────────────────────────

function LeilaoCard({ leilao, selected, onClick }: {
  leilao: BulaLeilao & { catalogo_url?: string }
  selected: boolean
  onClick: () => void
}) {
  const dt = parseDate(leilao.data)
  const isVirtual = leilao.modelo?.toUpperCase() === 'VIRTUAL'
  const { done, total } = checklistProgress(leilao.tasks ?? [])
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <button
      onClick={onClick}
      className={`w-full text-left group grid grid-cols-[64px_1fr_auto] items-center gap-4 sm:gap-5 p-4 rounded-2xl border transition-all duration-200 ${
        selected
          ? 'border-[#B8860B]/50 bg-[#B8860B]/5 dark:bg-[#B8860B]/8 shadow-md shadow-[#B8860B]/10'
          : 'border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111] hover:border-[#B8860B]/30 hover:bg-[#B8860B]/3'
      }`}
    >
      {/* Day badge */}
      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border flex-shrink-0 transition-colors ${
        selected ? 'border-[#B8860B]/40 bg-[#B8860B]/12' : 'border-[#B8860B]/20 bg-[#B8860B]/6 group-hover:border-[#B8860B]/35'
      }`}>
        <span className="text-[#B8860B] font-black text-2xl leading-none">{dt.dia}</span>
        <span className="text-[#B8860B]/70 text-[10px] font-bold uppercase tracking-wider mt-0.5">
          {dt.mesNome.slice(0, 3)}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <p className="text-gray-900 dark:text-white font-black text-sm uppercase leading-tight">
            {leilao.nome}
          </p>
          {isVirtual ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 dark:border-white/15">
              <Tv size={9} /> Virtual
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-[#B8860B]/10 border border-[#B8860B]/20 text-[#B8860B]">
              <Users size={9} /> Presencial
            </span>
          )}
          <span className={`inline-flex items-center text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${STATUS_STYLES[leilao.status]}`}>
            {STATUS_LABELS[leilao.status]}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#B8860B]">
            <Tag size={10} /> {leilao.tipo}
            <span className="text-gray-400 font-normal">· {leilao.animais} animais</span>
          </span>
          <span className="text-[11px] text-gray-500">
            {dt.diaSemana}{leilao.horario ? ` · ${leilao.horario}` : ''}
          </span>
          {leilao.leiloeira && (
            <span className="text-[10px] text-gray-400 uppercase">{leilao.leiloeira}{leilao.transmissao ? ` · ${leilao.transmissao}` : ''}</span>
          )}
        </div>
        {/* Checklist mini progress */}
        {total > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 max-w-24 bg-gray-100 dark:bg-[#1A1A1A] rounded-full h-1 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: pct === 100 ? '#22c55e' : '#B8860B' }}
              />
            </div>
            <span className="text-[10px] text-gray-400">{done}/{total}</span>
            {pct === 100 && <CheckCircle2 size={11} className="text-emerald-500" />}
          </div>
        )}
      </div>

      {/* Catalog indicator */}
      <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
        {leilao.catalogo_url && (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#B8860B] bg-[#B8860B]/10 px-2 py-1 rounded-lg">
            <BookOpen size={11} /> Catálogo
          </span>
        )}
        <ChevronRight size={16} className={`text-gray-300 dark:text-gray-700 transition-transform ${selected ? 'rotate-90 text-[#B8860B]' : 'group-hover:text-gray-500'}`} />
      </div>
    </button>
  )
}

// ── CronogramaTab ─────────────────────────────────────────────────────────────

type DbLeilao = {
  id: string
  data: string
  dia_semana: string
  hora: string
  nome: string
  criador: string
  presencial: string
  leiloeira: string
  raca: string
  qtd_animais: number | null
  sexo: string
  comissao: string
  contrato: string
  faturamento_previsto: number | null
  faturamento_realizado: number | null
  venda_bula: number | null
  comissao_receber: string
  recebido: string
}

type DbForm = Omit<DbLeilao, 'id'>

const EMPTY_FORM: DbForm = {
  data: '', dia_semana: '', hora: '', nome: '', criador: '',
  presencial: '', leiloeira: '', raca: '', qtd_animais: null,
  sexo: '', comissao: '', contrato: '', faturamento_previsto: null,
  faturamento_realizado: null, venda_bula: null, comissao_receber: '', recebido: '',
}

const PRESENCIAL_STYLES: Record<string, string> = {
  VIRTUAL:    'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  PRESENCIAL: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  EXPOGRANDE: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  EXPOZEBU:   'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
}

const MES_LABELS: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
}

const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A] text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-[#B8860B] transition-colors"

function CronogramaFormModal({ initial, onClose, onSaved }: {
  initial: DbLeilao | null
  onClose: () => void
  onSaved: (row: DbLeilao) => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState<DbForm>(initial
    ? { ...initial }
    : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof DbForm>(k: K, v: DbForm[K]) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nome.trim() || !form.data) { setError('Preencha nome e data'); return }
    setSaving(true); setError(null)
    try {
      const res = isEdit
        ? await fetch(`/api/bula/cronograma/${initial!.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await fetch('/api/bula/cronograma', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error(await res.text())
      onSaved(await res.json())
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#111111] rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#1E1E1E]">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">
            {isEdit ? 'Editar Leilão' : 'Novo Leilão no Cronograma'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Row 1: Data + hora + dia_semana */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Data *">
              <input type="date" className={inputCls} value={form.data} onChange={e => set('data', e.target.value)} required />
            </Field>
            <Field label="Hora">
              <input className={inputCls} value={form.hora} onChange={e => set('hora', e.target.value)} placeholder="Ex: 19:30" />
            </Field>
            <Field label="Dia da Semana">
              <input className={inputCls} value={form.dia_semana} onChange={e => set('dia_semana', e.target.value)} placeholder="Ex: Sexta-feira" />
            </Field>
          </div>

          {/* Row 2: Nome */}
          <Field label="Nome do Leilão *">
            <input className={inputCls} value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: NELORE KATAYAMA - TRIOLOGIA" required />
          </Field>

          {/* Row 3: Criador + Raça */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Criador">
              <input className={inputCls} value={form.criador} onChange={e => set('criador', e.target.value)} placeholder="Nome do criador" />
            </Field>
            <Field label="Raça">
              <input className={inputCls} value={form.raca} onChange={e => set('raca', e.target.value)} placeholder="Ex: Nelore Padrão" />
            </Field>
          </div>

          {/* Row 4: Modalidade + Leiloeira + Qtd + Sexo */}
          <div className="grid grid-cols-4 gap-3">
            <Field label="Modalidade">
              <select className={inputCls} value={form.presencial} onChange={e => set('presencial', e.target.value)}>
                <option value="">—</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="EXPOGRANDE">ExpoGrande</option>
                <option value="EXPOZEBU">ExpoZebu</option>
              </select>
            </Field>
            <Field label="Leiloeira">
              <input className={inputCls} value={form.leiloeira} onChange={e => set('leiloeira', e.target.value)} placeholder="Ex: E-RURAL" />
            </Field>
            <Field label="Qtd. Animais">
              <input type="number" className={inputCls} value={form.qtd_animais ?? ''} onChange={e => set('qtd_animais', e.target.value ? Number(e.target.value) : null)} placeholder="0" min={0} />
            </Field>
            <Field label="Sexo">
              <select className={inputCls} value={form.sexo} onChange={e => set('sexo', e.target.value)}>
                <option value="">—</option>
                <option value="MACHOS">Machos</option>
                <option value="FÊMEAS">Fêmeas</option>
                <option value="MACHOS E FÊMEAS">Machos e Fêmeas</option>
                <option value="TOUROS">Touros</option>
                <option value="EMBRIÕES">Embriões</option>
              </select>
            </Field>
          </div>

          {/* Row 5: Comissão + Contrato */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Negociação de Comissão">
              <input className={inputCls} value={form.comissao} onChange={e => set('comissao', e.target.value)} placeholder="Ex: 1% do Faturamento" />
            </Field>
            <Field label="Contrato">
              <select className={inputCls} value={form.contrato} onChange={e => set('contrato', e.target.value)}>
                <option value="">—</option>
                <option value="SIM">SIM</option>
                <option value="NÃO">NÃO</option>
              </select>
            </Field>
          </div>

          {/* Row 6: Financeiro */}
          <div className="pt-2 border-t border-gray-100 dark:border-[#1E1E1E]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Financeiro (opcional)</p>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Fat. Previsto (R$)">
                <input type="number" className={inputCls} value={form.faturamento_previsto ?? ''} onChange={e => set('faturamento_previsto', e.target.value ? Number(e.target.value) : null)} placeholder="0" min={0} />
              </Field>
              <Field label="Fat. Realizado (R$)">
                <input type="number" className={inputCls} value={form.faturamento_realizado ?? ''} onChange={e => set('faturamento_realizado', e.target.value ? Number(e.target.value) : null)} placeholder="0" min={0} />
              </Field>
              <Field label="Venda Bula (R$)">
                <input type="number" className={inputCls} value={form.venda_bula ?? ''} onChange={e => set('venda_bula', e.target.value ? Number(e.target.value) : null)} placeholder="0" min={0} />
              </Field>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#1E1E1E] flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B8860B] hover:bg-[#D4AF37] text-black text-sm font-semibold disabled:opacity-50 transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isEdit ? 'Salvar alterações' : 'Adicionar leilão'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CronogramaTab() {
  const [rows, setRows] = useState<DbLeilao[]>([])
  const [loading, setLoading] = useState(true)
  const [mesFiltro, setMesFiltro] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<DbLeilao | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bula/cronograma')
      if (res.ok) setRows(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const handleDelete = async (row: DbLeilao) => {
    if (!confirm(`Excluir "${row.nome}"?`)) return
    await fetch(`/api/bula/cronograma/${row.id}`, { method: 'DELETE' })
    setRows(prev => prev.filter(r => r.id !== row.id))
  }

  const handleSaved = (saved: DbLeilao) => {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === saved.id)
      return idx >= 0 ? prev.map(r => r.id === saved.id ? saved : r) : [saved, ...prev]
    })
  }

  const fmtBrl = (v: number | null) =>
    v ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : '—'

  const mesesDisponiveis = Array.from(new Set(rows.map(r => r.data?.slice(0, 7)))).filter(Boolean).sort()

  const filtered = mesFiltro === 'todos' ? rows : rows.filter(r => r.data?.startsWith(mesFiltro))

  const grupos: Record<string, DbLeilao[]> = {}
  for (const l of filtered) {
    const key = l.data?.slice(0, 7) ?? ''
    if (!grupos[key]) grupos[key] = []
    grupos[key].push(l)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin text-[#B8860B]" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header do cronograma */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Total', value: rows.length, accent: true },
            { label: 'Com comissão', value: rows.filter(l => l.comissao && l.comissao !== 'A DEFINIR').length },
            { label: 'Presencial / Expo', value: rows.filter(l => ['EXPOZEBU', 'EXPOGRANDE', 'PRESENCIAL'].includes(l.presencial)).length },
            { label: 'Virtuais', value: rows.filter(l => l.presencial === 'VIRTUAL').length },
          ].map(s => (
            <div key={s.label} className={`px-4 py-2.5 rounded-2xl border text-center min-w-[80px] ${s.accent ? 'border-[#B8860B]/30 bg-[#B8860B]/8' : 'border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111]'}`}>
              <p className={`text-xl font-black leading-none mb-0.5 ${s.accent ? 'text-[#B8860B]' : 'text-gray-900 dark:text-white'}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B8860B] hover:bg-[#D4AF37] text-black rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-[#B8860B]/20"
        >
          <Plus size={15} /> Novo Leilão
        </button>
      </div>

      {/* Filtro de mês */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setMesFiltro('todos')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${mesFiltro === 'todos' ? 'bg-[#B8860B] text-black border-[#B8860B]' : 'border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-gray-400 hover:border-[#B8860B]/40 hover:text-[#B8860B]'}`}
        >
          Todos
        </button>
        {mesesDisponiveis.map(m => (
          <button
            key={m}
            onClick={() => setMesFiltro(m)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${mesFiltro === m ? 'bg-[#B8860B] text-black border-[#B8860B]' : 'border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-gray-400 hover:border-[#B8860B]/40 hover:text-[#B8860B]'}`}
          >
            {MES_LABELS[m.slice(5)] ?? m}
          </button>
        ))}
      </div>

      {/* Tabela por mês */}
      {Object.entries(grupos).map(([mesKey, leiloes]) => (
        <div key={mesKey}>
          <div className="flex items-center gap-3 mb-3">
            <CalendarDays size={14} className="text-[#B8860B] flex-shrink-0" />
            <span className="text-[#B8860B] text-xs font-black uppercase tracking-[0.2em]">
              {MES_LABELS[mesKey.slice(5)] ?? mesKey} {mesKey.slice(0, 4)}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#B8860B]/20 to-transparent" />
            <span className="text-[10px] text-gray-400">{leiloes.length} leilão{leiloes.length !== 1 ? 'ões' : ''}</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-[#1E1E1E]">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#151515] border-b border-gray-100 dark:border-[#1E1E1E]">
                  {['Data', 'Hora', 'Leilão', 'Criador', 'Modalidade', 'Leiloeira', 'Raça', 'Qtd', 'Sexo', 'Comissão', 'Fat. Realizado', ''].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#1A1A1A]">
                {leiloes.map((l) => (
                  <tr key={l.id} className="group bg-white dark:bg-[#111111] hover:bg-[#B8860B]/3 transition-colors">
                    {/* Data */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center justify-center w-9 h-9 rounded-lg border border-[#B8860B]/20 bg-[#B8860B]/6 flex-shrink-0">
                          <span className="text-[#B8860B] font-black text-sm leading-none">{l.data?.slice(8)}</span>
                          <span className="text-[#B8860B]/60 text-[8px] font-bold uppercase">{MES_LABELS[l.data?.slice(5, 7) ?? '']?.slice(0, 3)}</span>
                        </div>
                        <span className="text-gray-400 text-[10px]">{l.dia_semana?.slice(0, 3)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">{l.hora || '—'}</td>
                    <td className="px-3 py-2.5 font-bold text-gray-900 dark:text-white uppercase max-w-[220px]">
                      <span className="line-clamp-2 leading-tight">{l.nome}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 max-w-[160px]">
                      <span className="line-clamp-1">{l.criador || '—'}</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {l.presencial ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${PRESENCIAL_STYLES[l.presencial] ?? 'bg-gray-100 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400'}`}>
                          {l.presencial === 'VIRTUAL' ? <Tv size={9} /> : <Users size={9} />}
                          {l.presencial}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-400 uppercase font-medium">{l.leiloeira || '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-400">{l.raca || '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-center font-semibold text-gray-700 dark:text-gray-300">{l.qtd_animais ?? '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-gray-600 dark:text-gray-400">{l.sexo || '—'}</td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 max-w-[180px]">
                      <span className="line-clamp-2 leading-tight">{l.comissao || '—'}</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">{fmtBrl(l.faturamento_realizado)}</td>
                    {/* Ações */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditTarget(l); setShowForm(true) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#B8860B] hover:bg-[#B8860B]/10 transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(l)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {filtered.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <TableProperties size={40} className="text-gray-200 dark:text-gray-800" />
          <p className="text-sm text-gray-500">Nenhum leilão encontrado</p>
          <button onClick={() => { setEditTarget(null); setShowForm(true) }} className="text-sm text-[#B8860B] hover:underline">
            Adicionar primeiro leilão
          </button>
        </div>
      )}

      {showForm && (
        <CronogramaFormModal
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AgendaLeiloesPage() {
  const [aba, setAba] = useState<'agenda' | 'cronograma'>('agenda')
  const [leiloes, setLeiloes] = useState<(BulaLeilao & { catalogo_url?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<(BulaLeilao & { catalogo_url?: string }) | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<(BulaLeilao & { catalogo_url?: string }) | null>(null)
  const [mesFiltro, setMesFiltro] = useState('Todos')
  const [deleting, setDeleting] = useState(false)

  const fetchLeiloes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bula/leiloes')
      if (res.ok) {
        const data = await res.json()
        setLeiloes(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeiloes() }, [fetchLeiloes])

  // Keep selected in sync after refresh
  useEffect(() => {
    if (selected) {
      const updated = leiloes.find(l => l.id === selected.id)
      if (updated) setSelected(updated)
    }
  }, [leiloes]) // eslint-disable-line react-hooks/exhaustive-deps

  // Derived
  const meses = ['Todos', ...Array.from(new Set(
    leiloes.map(l => { const { mesNome } = parseDate(l.data); return mesNome })
  ))]

  const listFiltered = mesFiltro === 'Todos'
    ? leiloes
    : leiloes.filter(l => parseDate(l.data).mesNome === mesFiltro)

  const grupos: Record<string, typeof leiloes> = {}
  for (const l of listFiltered) {
    const { mesNome } = parseDate(l.data)
    if (!grupos[mesNome]) grupos[mesNome] = []
    grupos[mesNome].push(l)
  }

  const totalAnimais = leiloes.reduce((s, l) => s + (l.animais || 0), 0)

  const handleDelete = async () => {
    if (!selected) return
    if (!confirm(`Excluir o leilão "${selected.nome}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    await fetch(`/api/bula/leiloes/${selected.id}`, { method: 'DELETE' })
    setDeleting(false)
    setSelected(null)
    fetchLeiloes()
  }

  const handleTasksUpdate = (tasks: LeilaoGrupo[]) => {
    setLeiloes(prev => prev.map(l => l.id === selected?.id ? { ...l, tasks } : l))
    if (selected) setSelected(s => s ? { ...s, tasks } : s)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Leilões
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {leiloes.length} leilões na agenda
          </p>
        </div>
        {aba === 'agenda' && (
          <button
            onClick={() => { setEditTarget(null); setShowForm(true) }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B8860B] hover:bg-[#D4AF37] text-black rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-[#B8860B]/20"
          >
            <Plus size={16} /> Novo Leilão
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-[#151515] w-fit">
        {([
          { key: 'agenda',     label: 'Agenda de Leilões', icon: List },
          { key: 'cronograma', label: 'Cronograma 2026',   icon: TableProperties },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setAba(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              aba === key
                ? 'bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Cronograma tab */}
      {aba === 'cronograma' && <CronogramaTab />}

      {/* Agenda tab content below */}
      {aba === 'agenda' && <>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Leilões', value: leiloes.length, accent: true },
          { label: 'Animais', value: totalAnimais.toLocaleString('pt-BR') },
          { label: 'Confirmados', value: leiloes.filter(l => l.status === 'confirmado').length },
          { label: 'Com catálogo', value: leiloes.filter(l => l.catalogo_url).length },
        ].map(s => (
          <div key={s.label} className={`px-5 py-3 rounded-2xl border text-center min-w-[90px] ${
            s.accent
              ? 'border-[#B8860B]/30 bg-[#B8860B]/8'
              : 'border-gray-100 dark:border-[#1E1E1E] bg-white dark:bg-[#111111]'
          }`}>
            <p className={`text-2xl font-black leading-none mb-0.5 ${s.accent ? 'text-[#B8860B]' : 'text-gray-900 dark:text-white'}`}>
              {s.value}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Month filter */}
      <div className="flex gap-2 flex-wrap">
        {meses.map(mes => (
          <button
            key={mes}
            onClick={() => setMesFiltro(mes)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
              mesFiltro === mes
                ? 'bg-[#B8860B] text-black border-[#B8860B]'
                : 'border-gray-200 dark:border-[#2A2A2A] text-gray-500 dark:text-gray-400 hover:border-[#B8860B]/40 hover:text-[#B8860B]'
            }`}
          >
            {mes}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#B8860B]" />
        </div>
      ) : Object.keys(grupos).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Circle size={40} className="text-gray-200 dark:text-gray-800" />
          <p className="text-sm text-gray-500">Nenhum leilão cadastrado</p>
          <button
            onClick={() => { setEditTarget(null); setShowForm(true) }}
            className="text-sm text-[#B8860B] hover:underline"
          >
            Adicionar primeiro leilão
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grupos).map(([mes, events]) => (
            <div key={mes}>
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays size={14} className="text-[#B8860B] flex-shrink-0" />
                <span className="text-[#B8860B] text-xs font-black uppercase tracking-[0.2em]">{mes}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#B8860B]/20 to-transparent" />
                <span className="text-[10px] text-gray-400">{events.length} evento{events.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2.5">
                {events.map(leilao => (
                  <LeilaoCard
                    key={leilao.id}
                    leilao={leilao}
                    selected={selected?.id === leilao.id}
                    onClick={() => setSelected(s => s?.id === leilao.id ? null : leilao)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <DetailDrawer
          leilao={selected}
          onClose={() => setSelected(null)}
          onEdit={() => { setEditTarget(selected); setShowForm(true) }}
          onDelete={handleDelete}
          onTasksUpdate={handleTasksUpdate}
        />
      )}

      {/* Delete loading overlay */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Loader2 size={32} className="animate-spin text-white" />
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <FormModal
          initial={editTarget}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSaved={() => { fetchLeiloes(); setSelected(null) }}
        />
      )}

      </>}
    </div>
  )
}
