'use client';

import { useState } from 'react';
import {
  TacticalObjective, TacticalKeyResult,
  createObjective, updateObjective, deleteObjective,
  createKeyResult, updateKeyResult, deleteKeyResult,
} from '@/app/web-admin/actions/tactical-strategic';
import { Target, Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight } from 'lucide-react';

const COLORS = ['#B8860B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4'];
const QUARTERS = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027'];

interface Props {
  objectives: TacticalObjective[];
  onObjectivesChange: (objs: TacticalObjective[]) => void;
}

function progressColor(pct: number) {
  if (pct >= 70) return 'bg-emerald-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function statusBadge(pct: number) {
  if (pct >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20';
  if (pct >= 40) return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20';
  return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20';
}

export function OKRView({ objectives, onObjectivesChange }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingObjId, setEditingObjId] = useState<string | null>(null);
  const [addingKRForObj, setAddingKRForObj] = useState<string | null>(null);
  const [showNewObj, setShowNewObj] = useState(false);

  // Form states
  const [newObjTitle, setNewObjTitle] = useState('');
  const [newObjDesc, setNewObjDesc] = useState('');
  const [newObjQuarter, setNewObjQuarter] = useState('Q2 2026');
  const [newObjColor, setNewObjColor] = useState(COLORS[0]);
  const [newKRTitle, setNewKRTitle] = useState('');
  const [newKRTarget, setNewKRTarget] = useState('100');
  const [newKRUnit, setNewKRUnit] = useState('%');
  const [editKR, setEditKR] = useState<{ id: string; current: string } | null>(null);

  const toggleExpanded = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const handleAddObjective = async () => {
    if (!newObjTitle.trim()) return;
    const obj = await createObjective({
      title: newObjTitle.trim(),
      description: newObjDesc.trim() || undefined,
      quarter: newObjQuarter,
      color: newObjColor,
    });
    onObjectivesChange([...objectives, { ...obj, key_results: [] }]);
    setNewObjTitle(''); setNewObjDesc(''); setShowNewObj(false);
  };

  const handleDeleteObjective = async (id: string) => {
    if (!confirm('Excluir este Objetivo e todos os seus KRs?')) return;
    await deleteObjective(id);
    onObjectivesChange(objectives.filter(o => o.id !== id));
  };

  const handleAddKR = async (objectiveId: string) => {
    if (!newKRTitle.trim()) return;
    const kr = await createKeyResult({
      objective_id: objectiveId,
      title: newKRTitle.trim(),
      target_value: parseFloat(newKRTarget) || 100,
      unit: newKRUnit,
    });
    const progress = 0;
    onObjectivesChange(objectives.map(o =>
      o.id === objectiveId
        ? { ...o, key_results: [...(o.key_results || []), { ...kr, progress }] }
        : o
    ));
    setNewKRTitle(''); setNewKRTarget('100'); setNewKRUnit('%');
    setAddingKRForObj(null);
  };

  const handleUpdateKRValue = async (kr: TacticalKeyResult, rawValue: string) => {
    const current_value = parseFloat(rawValue);
    if (isNaN(current_value)) return;
    const updated = await updateKeyResult(kr.id, { current_value });
    const progress = kr.target_value > 0
      ? Math.min(100, Math.round((current_value / kr.target_value) * 100))
      : 0;
    onObjectivesChange(objectives.map(o => ({
      ...o,
      key_results: (o.key_results || []).map(k =>
        k.id === kr.id ? { ...updated, progress } : k
      ),
    })));
    setEditKR(null);
  };

  const handleDeleteKR = async (objectiveId: string, krId: string) => {
    await deleteKeyResult(krId);
    onObjectivesChange(objectives.map(o =>
      o.id === objectiveId
        ? { ...o, key_results: (o.key_results || []).filter(k => k.id !== krId) }
        : o
    ));
  };

  const overallProgress = () => {
    const all = objectives.flatMap(o => o.key_results || []);
    if (!all.length) return 0;
    return Math.round(all.reduce((a, kr) => a + (kr.progress ?? 0), 0) / all.length);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-2 space-y-6">

      {/* Header Summary */}
      <div className="bg-gradient-to-r from-[#B8860B]/10 to-[#D4AF37]/5 border border-[#B8860B]/20 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            <Target size={20} className="text-[#B8860B]" /> Objetivos & Resultados-Chave
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {objectives.length} objetivo{objectives.length !== 1 ? 's' : ''} · progresso geral{' '}
            <span className="font-bold text-gray-800 dark:text-white">{overallProgress()}%</span>
          </p>
        </div>
        <button
          onClick={() => setShowNewObj(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-[#B8860B]/20 transition-all hover:-translate-y-0.5"
        >
          <Plus size={16} /> Novo Objetivo
        </button>
      </div>

      {/* New Objective Form */}
      {showNewObj && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-5 border border-[#B8860B]/30 shadow-lg space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Novo Objetivo</h3>
          <input
            autoFocus
            value={newObjTitle}
            onChange={e => setNewObjTitle(e.target.value)}
            placeholder="Ex: Dominar o mercado de genética Nelore PO no Triângulo Mineiro"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl outline-none focus:ring-2 focus:ring-[#B8860B] text-sm text-gray-900 dark:text-white"
          />
          <textarea
            value={newObjDesc}
            onChange={e => setNewObjDesc(e.target.value)}
            placeholder="Descrição (opcional)"
            rows={2}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl outline-none focus:ring-2 focus:ring-[#B8860B] text-sm text-gray-900 dark:text-white resize-none"
          />
          <div className="flex gap-4 flex-wrap">
            <select
              value={newObjQuarter}
              onChange={e => setNewObjQuarter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-lg text-sm outline-none text-gray-900 dark:text-white"
            >
              {QUARTERS.map(q => <option key={q}>{q}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Cor:</span>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewObjColor(c)}
                  className={`w-5 h-5 rounded-full transition-all ${newObjColor === c ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddObjective}
              disabled={!newObjTitle.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-lg font-bold text-sm disabled:opacity-50"
            >
              Criar Objetivo
            </button>
            <button
              onClick={() => { setShowNewObj(false); setNewObjTitle(''); setNewObjDesc(''); }}
              className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Objectives List */}
      {objectives.length === 0 && !showNewObj && (
        <div className="text-center py-16 text-gray-400">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum objetivo definido ainda.</p>
          <p className="text-sm mt-1">Clique em "Novo Objetivo" para começar.</p>
        </div>
      )}

      {objectives.map(obj => {
        const krs = obj.key_results || [];
        const objProgress = krs.length > 0
          ? Math.round(krs.reduce((a, kr) => a + (kr.progress ?? 0), 0) / krs.length)
          : 0;
        const isExpanded = expanded[obj.id] !== false; // expanded by default

        return (
          <div key={obj.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-sm overflow-hidden">
            {/* Objective Header */}
            <div className="p-5">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleExpanded(obj.id)}
                  className="mt-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors shrink-0"
                >
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                <span className="w-3 h-3 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: obj.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{obj.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 bg-gray-50 dark:bg-[#111111] px-2 py-0.5 rounded-md border border-gray-100 dark:border-[#222222]">
                        {obj.quarter}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${statusBadge(objProgress)}`}>
                        {objProgress}%
                      </span>
                      <button
                        onClick={() => handleDeleteObjective(obj.id)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {obj.description && (
                    <p className="text-xs text-gray-500 mt-1">{obj.description}</p>
                  )}
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-gray-100 dark:bg-[#111111] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${progressColor(objProgress)}`}
                      style={{ width: `${objProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Results */}
            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-[#222222] px-5 pb-5 pt-4 space-y-3">
                {krs.length === 0 && addingKRForObj !== obj.id && (
                  <p className="text-sm text-gray-400">Nenhum resultado-chave. Adicione abaixo.</p>
                )}

                {krs.map(kr => {
                  const pct = kr.progress ?? 0;
                  return (
                    <div key={kr.id} className="flex items-center gap-3 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{kr.title}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {editKR?.id === kr.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={editKR.current}
                                  onChange={e => setEditKR({ id: kr.id, current: e.target.value })}
                                  className="w-16 px-2 py-0.5 text-xs bg-gray-50 dark:bg-[#111111] border border-[#B8860B] rounded focus:outline-none text-gray-900 dark:text-white"
                                />
                                <span className="text-xs text-gray-400">/ {kr.target_value}{kr.unit}</span>
                                <button onClick={() => handleUpdateKRValue(kr, editKR.current)} className="text-emerald-500 hover:text-emerald-400">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => setEditKR(null)} className="text-gray-400 hover:text-gray-600">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditKR({ id: kr.id, current: String(kr.current_value) })}
                                  className="text-xs font-medium text-gray-500 hover:text-[#B8860B] flex items-center gap-1"
                                >
                                  <Edit2 size={10} />
                                  {kr.current_value}{kr.unit} / {kr.target_value}{kr.unit}
                                </button>
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${statusBadge(pct)}`}>{pct}%</span>
                                <button
                                  onClick={() => handleDeleteKR(obj.id, kr.id)}
                                  className="p-0.5 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#111111] rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${progressColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add KR Form */}
                {addingKRForObj === obj.id ? (
                  <div className="flex gap-2 flex-wrap pt-2">
                    <input
                      autoFocus
                      value={newKRTitle}
                      onChange={e => setNewKRTitle(e.target.value)}
                      placeholder="Ex: Atingir 50 leads qualificados/mês"
                      className="flex-1 min-w-[200px] px-3 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#B8860B] text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      value={newKRTarget}
                      onChange={e => setNewKRTarget(e.target.value)}
                      placeholder="Meta"
                      className="w-20 px-3 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#B8860B] text-gray-900 dark:text-white"
                    />
                    <input
                      value={newKRUnit}
                      onChange={e => setNewKRUnit(e.target.value)}
                      placeholder="Unidade"
                      className="w-16 px-3 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#B8860B] text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleAddKR(obj.id)}
                      disabled={!newKRTitle.trim()}
                      className="px-3 py-2 bg-[#B8860B] text-black rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => { setAddingKRForObj(null); setNewKRTitle(''); }}
                      className="px-3 py-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg text-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingKRForObj(obj.id); setNewKRTitle(''); }}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#B8860B] transition-colors pt-1"
                  >
                    <Plus size={14} /> Adicionar Resultado-Chave
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
