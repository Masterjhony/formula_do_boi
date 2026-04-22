'use client';

import { useState } from 'react';
import {
    Plus, Trash2, GripVertical, Save, Check, X,
    ChevronUp, ChevronDown, ChevronRight, GitBranch, Users,
} from 'lucide-react';
import { saveCRMConfig } from '@/app/web-admin/actions/crm-config';
import type { CRMConfig, CRMStage, CRMCustomField, CRMFunnel, CRMResponsavel } from '@/lib/crm-types';
import { DEFAULT_STAGES } from '@/lib/crm-types';

interface CRMSettingsViewProps {
    initialConfig: CRMConfig;
    onConfigSaved: (config: CRMConfig) => void;
}

const STAGE_COLORS = [
    { id: 'pink', label: 'Rosa', dot: 'bg-pink-500', badge: 'bg-pink-500/10 text-pink-600 border-pink-500/30 dark:bg-pink-500/20 dark:text-pink-300' },
    { id: 'orange', label: 'Laranja', dot: 'bg-orange-500', badge: 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-300' },
    { id: 'blue', label: 'Azul', dot: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300' },
    { id: 'purple', label: 'Roxo', dot: 'bg-purple-500', badge: 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-300' },
    { id: 'green', label: 'Verde', dot: 'bg-green-500', badge: 'bg-green-500/10 text-green-600 border-green-500/30 dark:bg-green-500/20 dark:text-green-300' },
    { id: 'red', label: 'Vermelho', dot: 'bg-red-500', badge: 'bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/20 dark:text-red-300' },
    { id: 'gray', label: 'Cinza', dot: 'bg-gray-500', badge: 'bg-gray-500/10 text-gray-600 border-gray-500/30 dark:bg-gray-500/20 dark:text-gray-300' },
    { id: 'yellow', label: 'Amarelo', dot: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:bg-yellow-500/20 dark:text-yellow-300' },
    { id: 'teal', label: 'Teal', dot: 'bg-teal-500', badge: 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-300' },
    { id: 'indigo', label: 'Índigo', dot: 'bg-indigo-500', badge: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300' },
];

const FIELD_TYPES = [
    { id: 'text', label: 'Texto' },
    { id: 'textarea', label: 'Texto longo' },
    { id: 'number', label: 'Número' },
    { id: 'date', label: 'Data' },
    { id: 'select', label: 'Seleção (lista)' },
];

function getColorDot(color?: string) {
    return STAGE_COLORS.find(c => c.id === color)?.dot ?? 'bg-gray-400';
}

function getStageBadge(color: string) {
    return STAGE_COLORS.find(c => c.id === color)?.badge ?? STAGE_COLORS[6].badge;
}

function initFunnels(config: CRMConfig): CRMFunnel[] {
    if (config.funnels?.length) return config.funnels;
    return [{
        id: 'default',
        name: 'Pipeline Principal',
        color: 'yellow',
        stages: config.stages?.length ? config.stages : DEFAULT_STAGES,
        custom_fields: config.custom_fields || [],
    }];
}

export function CRMSettingsView({ initialConfig, onConfigSaved }: CRMSettingsViewProps) {
    const [activeTab, setActiveTab] = useState<'funis' | 'responsaveis'>('funis');
    const [funnels, setFunnels] = useState<CRMFunnel[]>(initFunnels(initialConfig));
    const [responsaveis, setResponsaveis] = useState<CRMResponsavel[]>(initialConfig.responsaveis || []);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Expanded funnel
    const [expandedId, setExpandedId] = useState<string | null>(funnels[0]?.id ?? null);

    // New funnel form
    const [showNewFunnel, setShowNewFunnel] = useState(false);
    const [newFunnelName, setNewFunnelName] = useState('');
    const [newFunnelColor, setNewFunnelColor] = useState('blue');

    // New stage form (for the expanded funnel)
    const [showNewStage, setShowNewStage] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState('blue');

    // New field form (for the expanded funnel)
    const [showNewField, setShowNewField] = useState(false);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<CRMCustomField['type']>('text');
    const [newFieldOptions, setNewFieldOptions] = useState('');
    const [newFieldRequired, setNewFieldRequired] = useState(false);

    // New responsável form
    const [showNewResp, setShowNewResp] = useState(false);
    const [newRespName, setNewRespName] = useState('');
    const [newRespEmail, setNewRespEmail] = useState('');
    const [newRespColor, setNewRespColor] = useState('blue');

    // ── Funnel helpers ────────────────────────────────────────
    const toggleExpand = (id: string) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            setShowNewStage(false);
            setShowNewField(false);
            setNewStageName('');
            setNewStageColor('blue');
            setNewFieldLabel('');
            setNewFieldType('text');
            setNewFieldOptions('');
            setNewFieldRequired(false);
        }
    };

    const addFunnel = () => {
        const name = newFunnelName.trim();
        if (!name) return;
        const id = `funnel_${Date.now()}`;
        const funnel: CRMFunnel = {
            id,
            name,
            color: newFunnelColor,
            stages: [
                { id: 'Lead', name: 'Lead', color: 'pink' },
                { id: 'Em andamento', name: 'Em andamento', color: 'blue' },
                { id: 'Fechado', name: 'Fechado', color: 'green' },
                { id: 'Perdido', name: 'Perdido', color: 'red' },
            ],
            custom_fields: [],
        };
        setFunnels(prev => [...prev, funnel]);
        setNewFunnelName('');
        setNewFunnelColor('blue');
        setShowNewFunnel(false);
        setExpandedId(id);
    };

    const deleteFunnel = (id: string) => {
        if (funnels.length <= 1) return;
        setFunnels(prev => prev.filter(f => f.id !== id));
        if (expandedId === id) setExpandedId(funnels.find(f => f.id !== id)?.id ?? null);
    };

    const updateFunnel = (id: string, patch: Partial<CRMFunnel>) => {
        setFunnels(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
    };

    // ── Stage helpers (per funnel) ────────────────────────────
    const moveStage = (funnelId: string, idx: number, dir: -1 | 1) => {
        setFunnels(prev => prev.map(f => {
            if (f.id !== funnelId) return f;
            const arr = [...f.stages];
            const target = idx + dir;
            if (target < 0 || target >= arr.length) return f;
            [arr[idx], arr[target]] = [arr[target], arr[idx]];
            return { ...f, stages: arr };
        }));
    };

    const deleteStage = (funnelId: string, stageId: string) => {
        setFunnels(prev => prev.map(f => {
            if (f.id !== funnelId || f.stages.length <= 1) return f;
            return { ...f, stages: f.stages.filter(s => s.id !== stageId) };
        }));
    };

    const addStage = (funnelId: string) => {
        const name = newStageName.trim();
        if (!name) return;
        setFunnels(prev => prev.map(f =>
            f.id === funnelId
                ? { ...f, stages: [...f.stages, { id: `${name}_${Date.now()}`, name, color: newStageColor }] }
                : f
        ));
        setNewStageName('');
        setNewStageColor('blue');
        setShowNewStage(false);
    };

    // ── Field helpers (per funnel) ────────────────────────────
    const deleteField = (funnelId: string, fieldId: string) => {
        setFunnels(prev => prev.map(f =>
            f.id === funnelId ? { ...f, custom_fields: f.custom_fields.filter(cf => cf.id !== fieldId) } : f
        ));
    };

    const addField = (funnelId: string) => {
        const label = newFieldLabel.trim();
        if (!label) return;
        const field: CRMCustomField = {
            id: `cf_${Date.now()}`,
            label,
            type: newFieldType,
            required: newFieldRequired,
            options: newFieldType === 'select'
                ? newFieldOptions.split(',').map(s => s.trim()).filter(Boolean)
                : undefined,
        };
        setFunnels(prev => prev.map(f =>
            f.id === funnelId ? { ...f, custom_fields: [...f.custom_fields, field] } : f
        ));
        setNewFieldLabel('');
        setNewFieldType('text');
        setNewFieldOptions('');
        setNewFieldRequired(false);
        setShowNewField(false);
    };

    // ── Responsável helpers ───────────────────────────────────
    const addResponsavel = () => {
        const name = newRespName.trim();
        if (!name) return;
        const r: CRMResponsavel = {
            id: `resp_${Date.now()}`,
            name,
            email: newRespEmail.trim() || undefined,
            color: newRespColor,
        };
        setResponsaveis(prev => [...prev, r]);
        setNewRespName('');
        setNewRespEmail('');
        setNewRespColor('blue');
        setShowNewResp(false);
    };

    const deleteResponsavel = (id: string) => {
        setResponsaveis(prev => prev.filter(r => r.id !== id));
    };

    // ── Save ──────────────────────────────────────────────────
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Keep stages/custom_fields in sync with first funnel for Kanban backward compat
            const first = funnels[0];
            const config: CRMConfig = {
                stages: first?.stages ?? DEFAULT_STAGES,
                custom_fields: first?.custom_fields ?? [],
                funnels,
                responsaveis,
            };
            await saveCRMConfig(config);
            onConfigSaved(config);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch {
            alert('Erro ao salvar configurações. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const inputCls = 'px-3 py-2 text-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] rounded-lg outline-none focus:ring-2 focus:ring-[#B8860B] dark:text-white';
    const btnSecondary = 'flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] rounded-lg text-gray-700 dark:text-gray-300 transition-colors font-medium';
    const btnGold = 'flex items-center gap-1 px-3 py-2 bg-[#B8860B] hover:bg-[#9A7209] text-black text-sm font-semibold rounded-lg transition-colors';
    const btnCancel = 'p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg transition-colors';

    return (
        <div className="flex flex-col gap-6 max-w-2xl pb-8">

            {/* ── Internal tab bar ────────────────────────────────── */}
            <div className="flex gap-1 border-b border-gray-200 dark:border-[#333]">
                <button
                    onClick={() => setActiveTab('funis')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        activeTab === 'funis'
                            ? 'border-[#B8860B] text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <GitBranch size={14} /> Funis de Venda
                </button>
                <button
                    onClick={() => setActiveTab('responsaveis')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        activeTab === 'responsaveis'
                            ? 'border-[#B8860B] text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <Users size={14} /> Responsáveis
                    {responsaveis.length > 0 && (
                        <span className="text-xs bg-gray-200 dark:bg-[#333] text-gray-600 dark:text-gray-400 rounded-full px-1.5 py-0.5 font-semibold">
                            {responsaveis.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ════════════════ FUNIS TAB ════════════════ */}
            {activeTab === 'funis' && (
                <>
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#222] overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-[#333] flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Funis de Venda</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Crie e configure seus pipelines de vendas</p>
                            </div>
                            <button onClick={() => setShowNewFunnel(v => !v)} className={btnSecondary}>
                                <Plus size={14} /> Novo funil
                            </button>
                        </div>

                        {/* New funnel form */}
                        {showNewFunnel && (
                            <div className="px-6 py-4 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#333]">
                                <div className="flex gap-3 items-end flex-wrap">
                                    <div className="flex-1 min-w-[160px]">
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Nome do funil</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Pós-venda, Parceiros..."
                                            value={newFunnelName}
                                            onChange={e => setNewFunnelName(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addFunnel()}
                                            className={`${inputCls} w-full`}
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Cor</label>
                                        <div className="flex gap-1.5 flex-wrap">
                                            {STAGE_COLORS.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => setNewFunnelColor(c.id)}
                                                    title={c.label}
                                                    className={`w-6 h-6 rounded-full ${c.dot} transition-transform ${newFunnelColor === c.id ? 'scale-125 ring-2 ring-offset-2 ring-[#B8860B]' : 'hover:scale-110'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={addFunnel} className={btnGold}>
                                            <Check size={14} /> Criar funil
                                        </button>
                                        <button onClick={() => { setShowNewFunnel(false); setNewFunnelName(''); }} className={btnCancel}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Funnel list */}
                        <div className="divide-y divide-gray-100 dark:divide-[#222]">
                            {funnels.map((funnel, fi) => {
                                const isExpanded = expandedId === funnel.id;
                                return (
                                    <div key={funnel.id}>
                                        {/* Funnel row */}
                                        <div
                                            className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#222] group transition-colors cursor-pointer"
                                            onClick={() => toggleExpand(funnel.id)}
                                        >
                                            <span className={`w-3 h-3 rounded-full shrink-0 ${getColorDot(funnel.color)}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{funnel.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {funnel.stages.length} etapa{funnel.stages.length !== 1 ? 's' : ''}
                                                    {funnel.custom_fields.length > 0 && ` · ${funnel.custom_fields.length} campo${funnel.custom_fields.length !== 1 ? 's' : ''} extra${funnel.custom_fields.length !== 1 ? 's' : ''}`}
                                                    {fi === 0 && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#B8860B]/10 text-[#B8860B] font-semibold">principal</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => deleteFunnel(funnel.id)}
                                                    disabled={funnels.length <= 1}
                                                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 disabled:opacity-25 transition-colors"
                                                    title="Excluir funil"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                            <ChevronRight
                                                size={16}
                                                className={`text-gray-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                            />
                                        </div>

                                        {/* Expanded funnel editor */}
                                        {isExpanded && (
                                            <div className="bg-gray-50 dark:bg-[#111] border-t border-gray-100 dark:border-[#222]">

                                                {/* Stages section */}
                                                <div className="px-6 pt-4 pb-2">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Etapas</p>
                                                        <button
                                                            onClick={() => setShowNewStage(v => !v)}
                                                            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] hover:border-[#B8860B] rounded-lg text-gray-600 dark:text-gray-300 transition-colors font-medium"
                                                        >
                                                            <Plus size={11} /> Adicionar etapa
                                                        </button>
                                                    </div>

                                                    {showNewStage && (
                                                        <div className="mb-3 p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
                                                            <div className="flex gap-3 items-end flex-wrap">
                                                                <div className="flex-1 min-w-[140px]">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Nome da etapa"
                                                                        value={newStageName}
                                                                        onChange={e => setNewStageName(e.target.value)}
                                                                        onKeyDown={e => e.key === 'Enter' && addStage(funnel.id)}
                                                                        className={`${inputCls} w-full`}
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                                <div className="flex gap-1.5 flex-wrap">
                                                                    {STAGE_COLORS.map(c => (
                                                                        <button
                                                                            key={c.id}
                                                                            type="button"
                                                                            onClick={() => setNewStageColor(c.id)}
                                                                            title={c.label}
                                                                            className={`w-5 h-5 rounded-full ${c.dot} transition-transform ${newStageColor === c.id ? 'scale-125 ring-2 ring-offset-1 ring-[#B8860B]' : 'hover:scale-110'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    <button onClick={() => addStage(funnel.id)} className={btnGold}>
                                                                        <Check size={13} /> Adicionar
                                                                    </button>
                                                                    <button onClick={() => { setShowNewStage(false); setNewStageName(''); }} className={btnCancel}>
                                                                        <X size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333] divide-y divide-gray-100 dark:divide-[#222] overflow-hidden">
                                                        {funnel.stages.map((stage, idx) => (
                                                            <div
                                                                key={stage.id}
                                                                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#222] group/row transition-colors"
                                                            >
                                                                <GripVertical size={14} className="text-gray-300 dark:text-gray-600 shrink-0" />
                                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStageBadge(stage.color)} min-w-[100px] text-center`}>
                                                                    {stage.name}
                                                                </span>
                                                                <span className="text-xs text-gray-400">{idx + 1}ª</span>
                                                                <div className="flex gap-0.5 ml-auto opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                                    <button onClick={() => moveStage(funnel.id, idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] disabled:opacity-25 text-gray-500 transition-colors" title="Subir">
                                                                        <ChevronUp size={13} />
                                                                    </button>
                                                                    <button onClick={() => moveStage(funnel.id, idx, 1)} disabled={idx === funnel.stages.length - 1} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] disabled:opacity-25 text-gray-500 transition-colors" title="Descer">
                                                                        <ChevronDown size={13} />
                                                                    </button>
                                                                    <button onClick={() => deleteStage(funnel.id, stage.id)} disabled={funnel.stages.length <= 1} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 disabled:opacity-25 transition-colors" title="Remover">
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Custom fields section */}
                                                <div className="px-6 pt-3 pb-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Campos do formulário</p>
                                                        <button
                                                            onClick={() => setShowNewField(v => !v)}
                                                            className="flex items-center gap-1 text-xs px-2.5 py-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333] hover:border-[#B8860B] rounded-lg text-gray-600 dark:text-gray-300 transition-colors font-medium"
                                                        >
                                                            <Plus size={11} /> Adicionar campo
                                                        </button>
                                                    </div>

                                                    {showNewField && (
                                                        <div className="mb-3 p-3 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
                                                            <div className="flex gap-3 items-end flex-wrap">
                                                                <div className="flex-1 min-w-[140px]">
                                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Nome</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ex: Quantidade de hectares"
                                                                        value={newFieldLabel}
                                                                        onChange={e => setNewFieldLabel(e.target.value)}
                                                                        className={`${inputCls} w-full`}
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Tipo</label>
                                                                    <select value={newFieldType} onChange={e => setNewFieldType(e.target.value as CRMCustomField['type'])} className={inputCls}>
                                                                        {FIELD_TYPES.map(t => (
                                                                            <option key={t.id} value={t.id}>{t.label}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                {newFieldType === 'select' && (
                                                                    <div className="flex-1 min-w-[160px]">
                                                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Opções (por vírgula)</label>
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Opção A, Opção B"
                                                                            value={newFieldOptions}
                                                                            onChange={e => setNewFieldOptions(e.target.value)}
                                                                            className={`${inputCls} w-full`}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1.5 pb-0.5">
                                                                    <input
                                                                        id={`req-${funnel.id}`}
                                                                        type="checkbox"
                                                                        checked={newFieldRequired}
                                                                        onChange={e => setNewFieldRequired(e.target.checked)}
                                                                        className="w-4 h-4 accent-[#B8860B]"
                                                                    />
                                                                    <label htmlFor={`req-${funnel.id}`} className="text-xs text-gray-500 cursor-pointer">Obrigatório</label>
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    <button onClick={() => addField(funnel.id)} className={btnGold}>
                                                                        <Check size={13} /> Adicionar
                                                                    </button>
                                                                    <button onClick={() => { setShowNewField(false); setNewFieldLabel(''); }} className={btnCancel}>
                                                                        <X size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {funnel.custom_fields.length > 0 ? (
                                                        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333] divide-y divide-gray-100 dark:divide-[#222] overflow-hidden">
                                                            {funnel.custom_fields.map(field => (
                                                                <div key={field.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#222] group/row transition-colors">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{field.label}</span>
                                                                            {field.required && (
                                                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 font-semibold">obrigatório</span>
                                                                            )}
                                                                            <span className="text-xs text-gray-400">
                                                                                ({FIELD_TYPES.find(t => t.id === field.type)?.label || field.type})
                                                                            </span>
                                                                        </div>
                                                                        {field.options && field.options.length > 0 && (
                                                                            <div className="flex gap-1 mt-1 flex-wrap">
                                                                                {field.options.map(opt => (
                                                                                    <span key={opt} className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#333] rounded text-xs text-gray-500">{opt}</span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <button onClick={() => deleteField(funnel.id, field.id)} className="opacity-0 group-hover/row:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition-all" title="Remover">
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 text-center py-4 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#333]">
                                                            Nenhum campo extra. Clique em &quot;Adicionar campo&quot; para criar.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* ════════════════ RESPONSÁVEIS TAB ════════════════ */}
            {activeTab === 'responsaveis' && (
                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#222] overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-[#333] flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Responsáveis</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Gerencie quem pode ser atribuído aos leads</p>
                        </div>
                        <button onClick={() => setShowNewResp(v => !v)} className={btnSecondary}>
                            <Plus size={14} /> Adicionar
                        </button>
                    </div>

                    {showNewResp && (
                        <div className="px-6 py-4 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#333]">
                            <div className="flex gap-3 items-end flex-wrap">
                                <div className="flex-1 min-w-[140px]">
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Nome</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: João Silva"
                                        value={newRespName}
                                        onChange={e => setNewRespName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addResponsavel()}
                                        className={`${inputCls} w-full`}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex-1 min-w-[160px]">
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">E-mail (opcional)</label>
                                    <input
                                        type="email"
                                        placeholder="joao@empresa.com"
                                        value={newRespEmail}
                                        onChange={e => setNewRespEmail(e.target.value)}
                                        className={`${inputCls} w-full`}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Cor</label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {STAGE_COLORS.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setNewRespColor(c.id)}
                                                title={c.label}
                                                className={`w-6 h-6 rounded-full ${c.dot} transition-transform ${newRespColor === c.id ? 'scale-125 ring-2 ring-offset-2 ring-[#B8860B]' : 'hover:scale-110'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={addResponsavel} className={btnGold}>
                                        <Check size={14} /> Adicionar
                                    </button>
                                    <button onClick={() => { setShowNewResp(false); setNewRespName(''); setNewRespEmail(''); }} className={btnCancel}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {responsaveis.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-[#222]">
                            {responsaveis.map(r => (
                                <div key={r.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-[#222] group transition-colors">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getColorDot(r.color)}`}>
                                        {r.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name}</p>
                                        {r.email && <p className="text-xs text-gray-400 truncate">{r.email}</p>}
                                    </div>
                                    <button
                                        onClick={() => deleteResponsavel(r.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition-all"
                                        title="Remover responsável"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center text-gray-400 text-sm">
                            Nenhum responsável cadastrado. Clique em &quot;Adicionar&quot; para criar.
                        </div>
                    )}
                </div>
            )}

            {/* ── Save ─────────────────────────────────────────────── */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg disabled:opacity-50 ${
                        saved
                            ? 'bg-green-500 text-white shadow-green-500/20'
                            : 'bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:from-[#9A7209] hover:to-[#B8860B] text-black shadow-[#B8860B]/20'
                    }`}
                >
                    {saved ? (
                        <><Check size={16} /> Configurações salvas!</>
                    ) : isSaving ? (
                        'Salvando...'
                    ) : (
                        <><Save size={16} /> Salvar configurações</>
                    )}
                </button>
            </div>
        </div>
    );
}
