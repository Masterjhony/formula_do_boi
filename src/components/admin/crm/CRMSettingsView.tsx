'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, Save, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { saveCRMConfig } from '@/app/web-admin/actions/crm-config';
import type { CRMConfig, CRMStage, CRMCustomField } from '@/lib/crm-types';

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

function getStageBadge(color: string) {
    return STAGE_COLORS.find(c => c.id === color)?.badge ?? STAGE_COLORS[6].badge;
}

export function CRMSettingsView({ initialConfig, onConfigSaved }: CRMSettingsViewProps) {
    const [stages, setStages] = useState<CRMStage[]>(initialConfig.stages);
    const [customFields, setCustomFields] = useState<CRMCustomField[]>(initialConfig.custom_fields || []);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // New stage form state
    const [showNewStage, setShowNewStage] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [newStageColor, setNewStageColor] = useState('blue');

    // New field form state
    const [showNewField, setShowNewField] = useState(false);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldType, setNewFieldType] = useState<CRMCustomField['type']>('text');
    const [newFieldOptions, setNewFieldOptions] = useState('');
    const [newFieldRequired, setNewFieldRequired] = useState(false);

    const moveStage = (idx: number, dir: -1 | 1) => {
        const arr = [...stages];
        const target = idx + dir;
        if (target < 0 || target >= arr.length) return;
        [arr[idx], arr[target]] = [arr[target], arr[idx]];
        setStages(arr);
    };

    const deleteStage = (id: string) => {
        if (stages.length <= 1) return;
        setStages(stages.filter(s => s.id !== id));
    };

    const addStage = () => {
        const name = newStageName.trim();
        if (!name) return;
        setStages([...stages, { id: name, name, color: newStageColor }]);
        setNewStageName('');
        setNewStageColor('blue');
        setShowNewStage(false);
    };

    const deleteField = (id: string) => setCustomFields(customFields.filter(f => f.id !== id));

    const addField = () => {
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
        setCustomFields([...customFields, field]);
        setNewFieldLabel('');
        setNewFieldType('text');
        setNewFieldOptions('');
        setNewFieldRequired(false);
        setShowNewField(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const config: CRMConfig = { stages, custom_fields: customFields };
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

    return (
        <div className="flex flex-col gap-6 max-w-2xl pb-8">

            {/* ── Pipeline Stages ─────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#222] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#333] flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Etapas do Pipeline</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Configure as colunas do Kanban de vendas</p>
                    </div>
                    <button
                        onClick={() => setShowNewStage(v => !v)}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] rounded-lg text-gray-700 dark:text-gray-300 transition-colors font-medium"
                    >
                        <Plus size={14} /> Adicionar etapa
                    </button>
                </div>

                {showNewStage && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#333]">
                        <div className="flex gap-3 items-end flex-wrap">
                            <div className="flex-1 min-w-[160px]">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Nome da etapa</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Em análise"
                                    value={newStageName}
                                    onChange={e => setNewStageName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && addStage()}
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
                                            onClick={() => setNewStageColor(c.id)}
                                            title={c.label}
                                            className={`w-6 h-6 rounded-full ${c.dot} transition-transform ${newStageColor === c.id ? 'scale-125 ring-2 ring-offset-2 ring-[#B8860B]' : 'hover:scale-110'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={addStage}
                                    className="flex items-center gap-1 px-3 py-2 bg-[#B8860B] hover:bg-[#9A7209] text-black text-sm font-semibold rounded-lg transition-colors"
                                >
                                    <Check size={14} /> Adicionar
                                </button>
                                <button
                                    onClick={() => { setShowNewStage(false); setNewStageName(''); }}
                                    className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="divide-y divide-gray-100 dark:divide-[#222]">
                    {stages.map((stage, idx) => (
                        <div
                            key={stage.id}
                            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-[#222] group transition-colors"
                        >
                            <GripVertical size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStageBadge(stage.color)} min-w-[120px] text-center`}>
                                {stage.name}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">{idx + 1}ª posição</span>
                            <div className="flex gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => moveStage(idx, -1)}
                                    disabled={idx === 0}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] disabled:opacity-25 text-gray-500 transition-colors"
                                    title="Mover para cima"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    onClick={() => moveStage(idx, 1)}
                                    disabled={idx === stages.length - 1}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] disabled:opacity-25 text-gray-500 transition-colors"
                                    title="Mover para baixo"
                                >
                                    <ChevronDown size={14} />
                                </button>
                                <button
                                    onClick={() => deleteStage(stage.id)}
                                    disabled={stages.length <= 1}
                                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 disabled:opacity-25 transition-colors"
                                    title="Remover etapa"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Custom Fields ────────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#222] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[#333] flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Campos Personalizados</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Adicione campos extras no formulário de lead</p>
                    </div>
                    <button
                        onClick={() => setShowNewField(v => !v)}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-100 dark:bg-[#333] hover:bg-gray-200 dark:hover:bg-[#444] rounded-lg text-gray-700 dark:text-gray-300 transition-colors font-medium"
                    >
                        <Plus size={14} /> Adicionar campo
                    </button>
                </div>

                {showNewField && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#333]">
                        <div className="flex gap-3 items-end flex-wrap">
                            <div className="flex-1 min-w-[160px]">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Nome do campo</label>
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
                                <select
                                    value={newFieldType}
                                    onChange={e => setNewFieldType(e.target.value as CRMCustomField['type'])}
                                    className={inputCls}
                                >
                                    {FIELD_TYPES.map(t => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            {newFieldType === 'select' && (
                                <div className="flex-1 min-w-[180px]">
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Opções (separadas por vírgula)</label>
                                    <input
                                        type="text"
                                        placeholder="Opção A, Opção B, Opção C"
                                        value={newFieldOptions}
                                        onChange={e => setNewFieldOptions(e.target.value)}
                                        className={`${inputCls} w-full`}
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 pb-0.5">
                                <input
                                    id="required-check"
                                    type="checkbox"
                                    checked={newFieldRequired}
                                    onChange={e => setNewFieldRequired(e.target.checked)}
                                    className="w-4 h-4 accent-[#B8860B]"
                                />
                                <label htmlFor="required-check" className="text-xs text-gray-500 cursor-pointer">Obrigatório</label>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={addField}
                                    className="flex items-center gap-1 px-3 py-2 bg-[#B8860B] hover:bg-[#9A7209] text-black text-sm font-semibold rounded-lg transition-colors"
                                >
                                    <Check size={14} /> Adicionar
                                </button>
                                <button
                                    onClick={() => { setShowNewField(false); setNewFieldLabel(''); }}
                                    className="p-2 text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {customFields.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-[#222]">
                        {customFields.map(field => (
                            <div
                                key={field.id}
                                className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-[#222] group transition-colors"
                            >
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
                                                <span key={opt} className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#333] rounded text-xs text-gray-500">
                                                    {opt}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteField(field.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition-all"
                                    title="Remover campo"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-10 text-center text-gray-400 text-sm">
                        Nenhum campo personalizado. Clique em "Adicionar campo" para criar.
                    </div>
                )}
            </div>

            {/* ── Save ─────────────────────────────────────────────────── */}
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
