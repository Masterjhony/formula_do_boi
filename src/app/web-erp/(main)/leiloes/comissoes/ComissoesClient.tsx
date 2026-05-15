'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Percent, Plus, Trash2, Save, Gavel, Beaker, Egg, Info } from 'lucide-react';
import type { ComissoesPadrao, AssessorComissao } from './page';
import { saveComissoes } from './actions';

const PCT = (v: number | null | undefined) => v == null ? '' : (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
const FMT_PCT = (v: number | null | undefined) => v == null ? '—' : `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;

export default function ComissoesClient({ initial }: { initial: ComissoesPadrao }) {
    const router = useRouter();
    const [form, setForm] = useState<ComissoesPadrao>(initial);
    const [dirty, setDirty] = useState(false);
    const [pending, startTransition] = useTransition();

    const update = (patch: Partial<ComissoesPadrao>) => {
        setForm(prev => ({ ...prev, ...patch }));
        setDirty(true);
    };

    const setAssessor = (i: number, patch: Partial<AssessorComissao>) => {
        const next = form.leiloes.assessores.map((a, j) => j === i ? { ...a, ...patch } : a);
        update({ leiloes: { ...form.leiloes, assessores: next } });
    };
    const addAssessor = () => {
        update({
            leiloes: {
                ...form.leiloes,
                assessores: [...form.leiloes.assessores, { nome: '', empresa: 'Bula Assessoria', pct: 0.02 }],
            },
        });
    };
    const removeAssessor = (i: number) => {
        if (!confirm(`Remover ${form.leiloes.assessores[i].nome || 'esse assessor'} da tabela?`)) return;
        const next = form.leiloes.assessores.filter((_, j) => j !== i);
        update({ leiloes: { ...form.leiloes, assessores: next } });
    };

    const save = () => {
        startTransition(async () => {
            const res = await saveComissoes(form);
            if (res.ok) {
                setDirty(false);
                router.refresh();
            } else {
                alert(`Erro ao salvar: ${res.error}`);
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A0792E] to-[#9A7209] flex items-center justify-center shadow-lg">
                        <Percent className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Comissões de Assessores</h1>
                        <p className="text-sm text-gray-500 dark:text-[#888] uppercase tracking-widest mt-1">
                            Acordos padrão por canal — leilões · sêmen · embriões
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Vigência desde {form.vigencia_inicio ? new Date(form.vigencia_inicio + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
                    </span>
                    <button
                        onClick={save}
                        disabled={!dirty || pending}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#A0792E] hover:bg-[#9A7209] text-black font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" /> {pending ? 'Salvando…' : dirty ? 'Salvar alterações' : 'Salvo'}
                    </button>
                </div>
            </div>

            {/* ─── Leilões ─────────────────────────────────────────────── */}
            <section className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
                <header className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] bg-gradient-to-r from-[#A0792E]/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#A0792E]/10 rounded-xl">
                            <Gavel className="w-5 h-5 text-[#A0792E]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-base">Leilões</h2>
                            <p className="text-[11px] text-gray-500 dark:text-[#888]">{form.leiloes.descricao}</p>
                        </div>
                    </div>
                </header>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-[10px] text-gray-500 dark:text-[#888] bg-gray-50 dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#222] uppercase tracking-widest">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold">Assessor</th>
                                <th className="px-4 py-3 text-left font-bold">Empresa</th>
                                <th className="px-4 py-3 text-right font-bold">% sobre a venda</th>
                                <th className="px-4 py-3 text-right font-bold w-24">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.leiloes.assessores.map((a, i) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-[#1A1A1A] hover:bg-gray-50 dark:hover:bg-[#141414] transition-colors">
                                    <td className="px-4 py-3">
                                        <input
                                            value={a.nome}
                                            onChange={e => setAssessor(i, { nome: e.target.value })}
                                            className="w-full px-2 py-1.5 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-[#333] focus:border-[#A0792E] bg-transparent text-sm font-bold focus:outline-none"
                                            placeholder="Nome do assessor"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={a.empresa}
                                            onChange={e => setAssessor(i, { empresa: e.target.value })}
                                            className="w-full px-2 py-1.5 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-[#333] focus:border-[#A0792E] bg-transparent text-xs focus:outline-none"
                                        >
                                            <option value="Bula Assessoria">Bula Assessoria</option>
                                            <option value="Fórmula do Boi">Fórmula do Boi</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center gap-1">
                                            <input
                                                type="number" step="0.01" min={0}
                                                value={PCT(a.pct)}
                                                onChange={e => setAssessor(i, { pct: e.target.value === '' ? 0 : Number(e.target.value) / 100 })}
                                                className="w-20 px-2 py-1.5 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-[#333] focus:border-[#A0792E] bg-transparent text-sm font-mono font-bold text-right text-[#A0792E] focus:outline-none"
                                            />
                                            <span className="text-xs text-gray-400">%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => removeAssessor(i)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10" title="Remover">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {form.leiloes.assessores.length === 0 && (
                                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm">Nenhum assessor cadastrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 border-t border-gray-100 dark:border-[#1A1A1A] bg-gray-50/50 dark:bg-[#0A0A0A]/50">
                    <button onClick={addAssessor} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#A0792E]/10 text-[#A0792E] text-xs font-bold hover:bg-[#A0792E]/20 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Adicionar assessor
                    </button>
                </div>
            </section>

            {/* ─── Sêmen ──────────────────────────────────────────────── */}
            <section className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
                <header className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] bg-gradient-to-r from-sky-500/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/10 rounded-xl">
                            <Beaker className="w-5 h-5 text-sky-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-base">Vendas de Sêmen</h2>
                            <p className="text-[11px] text-gray-500 dark:text-[#888]">{form.semen.descricao}</p>
                        </div>
                    </div>
                </header>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="rounded-xl border border-gray-100 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#151515] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Comissão própria</p>
                        <div className="inline-flex items-center gap-1.5">
                            <input
                                type="number" step="0.1" min={0}
                                value={PCT(form.semen.pct_proprio)}
                                onChange={e => update({ semen: { ...form.semen, pct_proprio: e.target.value === '' ? 0 : Number(e.target.value) / 100 } })}
                                className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-2xl font-extrabold text-sky-500 text-right focus:outline-none focus:border-sky-500"
                            />
                            <span className="text-2xl font-bold text-gray-400">%</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">do que o próprio assessor vender de sêmen</p>
                    </div>
                    <div className="rounded-xl border border-gray-100 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#151515] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Residual por indicação</p>
                        <div className="inline-flex items-center gap-1.5">
                            <input
                                type="number" step="0.1" min={0}
                                value={PCT(form.semen.pct_residual_indicacao)}
                                onChange={e => update({ semen: { ...form.semen, pct_residual_indicacao: e.target.value === '' ? 0 : Number(e.target.value) / 100 } })}
                                className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-2xl font-extrabold text-sky-500 text-right focus:outline-none focus:border-sky-500"
                            />
                            <span className="text-2xl font-bold text-gray-400">%</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">para o indicador, sobre a venda da carteira do novo assessor indicado</p>
                    </div>
                </div>
                <div className="mx-6 mb-6 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 flex gap-2 items-start text-xs">
                    <Info className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Exemplo: se o Marcelo indica o João como novo assessor, e o João vende R$ 10.000 em sêmen, o João recebe {FMT_PCT(form.semen.pct_proprio)} (R$ {(10000 * form.semen.pct_proprio).toLocaleString('pt-BR')}) e o Marcelo recebe {FMT_PCT(form.semen.pct_residual_indicacao)} residual (R$ {(10000 * form.semen.pct_residual_indicacao).toLocaleString('pt-BR')}).
                    </p>
                </div>
            </section>

            {/* ─── Embriões ───────────────────────────────────────────── */}
            <section className="bg-white dark:bg-[#0F0F0F] border border-gray-200 dark:border-[#222] rounded-2xl shadow-xl overflow-hidden">
                <header className="p-5 border-b border-gray-100 dark:border-[#1E1E1E] bg-gradient-to-r from-emerald-500/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <Egg className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-base">Vendas de Embriões</h2>
                            <p className="text-[11px] text-gray-500 dark:text-[#888]">{form.embrioes.descricao}</p>
                        </div>
                    </div>
                </header>
                <div className="p-6">
                    <div className="rounded-xl border border-gray-100 dark:border-[#1E1E1E] bg-gray-50 dark:bg-[#151515] p-4 inline-block">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">Comissão própria</p>
                        <div className="inline-flex items-center gap-1.5">
                            <input
                                type="number" step="0.1" min={0}
                                value={PCT(form.embrioes.pct_proprio)}
                                onChange={e => update({ embrioes: { ...form.embrioes, pct_proprio: e.target.value === '' ? 0 : Number(e.target.value) / 100 } })}
                                className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-[#333] bg-white dark:bg-[#0A0A0A] text-2xl font-extrabold text-emerald-500 text-right focus:outline-none focus:border-emerald-500"
                            />
                            <span className="text-2xl font-bold text-gray-400">%</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">do que o assessor vender de embriões</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
