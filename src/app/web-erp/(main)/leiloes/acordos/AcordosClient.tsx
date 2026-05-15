'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Handshake, Plus, Trash2, Save, X, Building2, Tractor } from 'lucide-react';
import type { AcordoConfig } from './page';
import { saveAcordos } from './actions';

const PCT = (v: number | null) => v == null ? '' : (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
const FMT_PCT = (v: number | null) => v == null ? '—' : `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}%`;

function newAcordo(): AcordoConfig {
    return {
        id: crypto.randomUUID(),
        contraparte: '',
        tipo: 'criador',
        pct_faturamento: null,
        pct_venda_cobertura: null,
        descricao: '',
        vigencia_inicio: new Date().toISOString().slice(0, 10),
        vigencia_fim: null,
    };
}

export default function AcordosClient({ initial }: { initial: AcordoConfig[] }) {
    const router = useRouter();
    const [acordos, setAcordos] = useState<AcordoConfig[]>(initial);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState<AcordoConfig | null>(null);
    const [pending, startTransition] = useTransition();

    const startEdit = (a: AcordoConfig) => {
        setEditingId(a.id);
        setDraft({ ...a });
    };
    const startNew = () => {
        const a = newAcordo();
        setAcordos([a, ...acordos]);
        setEditingId(a.id);
        setDraft({ ...a });
    };
    const cancelEdit = () => {
        // se for um novo não salvo, remove
        if (draft && !initial.find(x => x.id === draft.id)) {
            setAcordos(acordos.filter(x => x.id !== draft.id));
        }
        setEditingId(null);
        setDraft(null);
    };

    const persist = (next: AcordoConfig[]) => {
        startTransition(async () => {
            const res = await saveAcordos(next);
            if (res.ok) {
                setAcordos(next);
                router.refresh();
            } else {
                alert(`Erro ao salvar: ${res.error}`);
            }
        });
    };

    const saveDraft = () => {
        if (!draft) return;
        if (!draft.contraparte.trim()) { alert('Informe a contraparte'); return; }
        if (!draft.descricao.trim()) { alert('Descreva o acordo'); return; }
        const next = acordos.map(a => a.id === draft.id ? draft : a);
        persist(next);
        setEditingId(null);
        setDraft(null);
    };

    const removeAcordo = (id: string) => {
        if (!confirm('Remover este acordo?')) return;
        const next = acordos.filter(a => a.id !== id);
        persist(next);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A0792E] to-[#9A7209] flex items-center justify-center shadow-lg">
                        <Handshake className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Acordos com Criadores</h1>
                        <p className="text-sm text-gray-500 dark:text-[#888] uppercase tracking-widest mt-1">
                            Percentuais combinados com cada contraparte (criador ou leiloeira própria)
                        </p>
                    </div>
                </div>
                <button onClick={startNew} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#A0792E] hover:bg-[#9A7209] text-black font-bold text-sm rounded-xl shadow-lg transition-all">
                    <Plus className="w-4 h-4" /> Novo Acordo
                </button>
            </div>

            {/* Explainer */}
            <div className="rounded-2xl border border-[#A0792E]/25 bg-[#A0792E]/5 p-5 text-sm leading-relaxed">
                <p className="font-bold text-[#A0792E] uppercase tracking-widest text-[10px] mb-2">Modelo do acordo</p>
                <p className="text-gray-700 dark:text-gray-300">
                    Cada leilão tem 3 atores: a <b>leiloeira</b> que organiza, o <b>criador</b> dono dos animais, e nós (<b>Bula Assessoria / Fórmula do Boi</b>) que trazemos compradores.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                    O acordo de assessoria é em regra com o <b>criador</b>. <span className="text-amber-600 dark:text-amber-400 font-semibold">Exceção</span>: quando a leiloeira é a própria <b>Bula Remates</b> (leiloeira do Bulinha), o acordo é com a leiloeira — vale para IPB, Cachoeirão, MRA, Vanguarda etc.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                    Receita Bula = <code className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1A1A1A] text-[#A0792E] text-xs">% fat.</code> × Faturamento Leiloeira <span className="text-gray-400">+</span> <code className="px-1.5 py-0.5 rounded bg-white dark:bg-[#1A1A1A] text-[#A0792E] text-xs">% venda</code> × VGV Cobertura.
                </p>
            </div>

            {/* Tabela de acordos */}
            <div className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-[10px] text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222] uppercase tracking-widest">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold">Tipo</th>
                                <th className="px-4 py-3 text-left font-bold">Contraparte</th>
                                <th className="px-4 py-3 text-left font-bold">Descrição</th>
                                <th className="px-4 py-3 text-right font-bold">% Faturamento</th>
                                <th className="px-4 py-3 text-right font-bold">% Venda Cobertura</th>
                                <th className="px-4 py-3 text-left font-bold">Vigência</th>
                                <th className="px-4 py-3 text-right font-bold w-32">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {acordos.length === 0 && editingId == null && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        Nenhum acordo cadastrado ainda. Clique em <span className="font-bold text-[#A0792E]">Novo Acordo</span> para começar.
                                    </td>
                                </tr>
                            )}
                            {acordos.map(a => {
                                const editing = editingId === a.id && draft;
                                if (editing) {
                                    return (
                                        <tr key={a.id} className="bg-[#A0792E]/5 border-b border-[#A0792E]/20">
                                            <td className="px-4 py-3 align-top">
                                                <select
                                                    value={draft.tipo}
                                                    onChange={e => setDraft({ ...draft, tipo: e.target.value as 'criador' | 'leiloeira_propria' })}
                                                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-xs"
                                                >
                                                    <option value="criador">Criador</option>
                                                    <option value="leiloeira_propria">Leiloeira própria (Bula Remates)</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    value={draft.contraparte}
                                                    onChange={e => setDraft({ ...draft, contraparte: e.target.value })}
                                                    placeholder="Ex: Fazenda Garoa"
                                                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-sm font-bold"
                                                />
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    value={draft.descricao}
                                                    onChange={e => setDraft({ ...draft, descricao: e.target.value })}
                                                    placeholder='Ex: "1% do faturamento total"'
                                                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-xs"
                                                />
                                            </td>
                                            <td className="px-4 py-3 align-top text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <input
                                                        type="number" step="0.001" min={0}
                                                        value={PCT(draft.pct_faturamento)}
                                                        onChange={e => setDraft({ ...draft, pct_faturamento: e.target.value === '' ? null : Number(e.target.value) / 100 })}
                                                        placeholder="—"
                                                        className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-xs text-right"
                                                    />
                                                    <span className="text-xs text-gray-500">%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <input
                                                        type="number" step="0.001" min={0}
                                                        value={PCT(draft.pct_venda_cobertura)}
                                                        onChange={e => setDraft({ ...draft, pct_venda_cobertura: e.target.value === '' ? null : Number(e.target.value) / 100 })}
                                                        placeholder="—"
                                                        className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-xs text-right"
                                                    />
                                                    <span className="text-xs text-gray-500">%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 align-top">
                                                <input
                                                    type="date"
                                                    value={draft.vigencia_inicio ?? ''}
                                                    onChange={e => setDraft({ ...draft, vigencia_inicio: e.target.value || null })}
                                                    className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-xs"
                                                />
                                            </td>
                                            <td className="px-4 py-3 align-top text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={saveDraft} disabled={pending} className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50" title="Salvar">
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-gray-200 dark:bg-[#222] text-gray-600 dark:text-gray-300 hover:bg-gray-300" title="Cancelar">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={a.id} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors">
                                        <td className="px-4 py-4">
                                            {a.tipo === 'leiloeira_propria' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 text-purple-500 text-[10px] font-bold uppercase tracking-wide">
                                                    <Building2 className="w-3 h-3" /> Leiloeira
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wide">
                                                    <Tractor className="w-3 h-3" /> Criador
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">{a.contraparte}</td>
                                        <td className="px-4 py-4 text-gray-600 dark:text-gray-300 text-xs max-w-md">{a.descricao}</td>
                                        <td className="px-4 py-4 text-right font-mono font-bold text-[#A0792E]">{FMT_PCT(a.pct_faturamento)}</td>
                                        <td className="px-4 py-4 text-right font-mono font-bold text-[#A0792E]">{FMT_PCT(a.pct_venda_cobertura)}</td>
                                        <td className="px-4 py-4 text-xs text-gray-500 font-mono">
                                            {a.vigencia_inicio ? new Date(a.vigencia_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—'}
                                            {a.vigencia_fim ? ` → ${new Date(a.vigencia_fim).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}` : ' → atual'}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => startEdit(a)} className="px-2.5 py-1 rounded-lg bg-[#A0792E]/10 text-[#A0792E] text-xs font-bold hover:bg-[#A0792E]/20">
                                                    Editar
                                                </button>
                                                <button onClick={() => removeAcordo(a.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10" title="Remover">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {pending && (
                    <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-100 dark:border-[#1A1A1A]">
                        Salvando…
                    </div>
                )}
            </div>
        </div>
    );
}
