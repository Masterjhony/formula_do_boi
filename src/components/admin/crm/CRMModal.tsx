'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { CRMLead, deleteLead } from '@/app/web-admin/actions/crm-leads';
import { CRM_COLUMNS } from './CRMKanbanBoard';
import type { CRMCustomField, CRMResponsavel } from '@/lib/crm-types';

interface CRMModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead?: CRMLead;
    defaultStatus: string;
    stages?: string[];
    customFields?: CRMCustomField[];
    responsaveis?: CRMResponsavel[];
    onSave: (data: any) => Promise<void>;
    onDelete?: () => void;
}

export function CRMModal({ isOpen, onClose, lead, defaultStatus, stages, customFields = [], responsaveis = [], onSave, onDelete }: CRMModalProps) {
    const activeStages = stages && stages.length > 0 ? stages : CRM_COLUMNS;
    const [formData, setFormData] = useState<Partial<CRMLead>>({
        nome: '',
        status: defaultStatus,
        prioridade: '',
        interesse: '',
        empresa: '',
        telefone: '',
        celular: '',
        responsavel: '',
        instagram: '',
        estado: '',
        cidade: '',
        o_que_busca: '',
        quantidade_animais: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showOrigemSection, setShowOrigemSection] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData(lead);
            // Auto-expand origem section if lead has source data
            if (lead.source || lead.medium || lead.campaign) {
                setShowOrigemSection(true);
            }
        } else {
            setFormData({
                nome: '',
                status: defaultStatus,
                prioridade: '',
                interesse: '',
                empresa: '',
                telefone: '',
                celular: '',
                responsavel: '',
                instagram: '',
                estado: '',
                cidade: '',
                o_que_busca: '',
                quantidade_animais: '',
            });
            setShowOrigemSection(false);
        }
    }, [lead, defaultStatus, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Failed to save lead:', error);
            alert('Erro ao salvar o lead.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!lead || !window.confirm('Tem certeza que deseja apagar este lead?')) return;
        setIsDeleting(true);
        try {
            await deleteLead(lead.id);
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Erro ao deletar lead.');
        } finally {
            setIsDeleting(false);
        }
    };

    const inputClass = "w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#111111] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 dark:border-[#222222] shadow-2xl">
                <div className="sticky top-0 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md p-6 border-b border-gray-200 dark:border-[#222222] flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold dark:text-white">
                        {lead ? 'Editar Lead' : 'Novo Lead'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Data de entrada (exibido apenas se existir) */}
                        {lead?.data_entrada && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg px-3 py-2 border border-gray-200 dark:border-[#333]">
                                <span>📅 Entrada:</span>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {new Date(lead.data_entrada).toLocaleDateString('pt-BR')} às {new Date(lead.data_entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Nome do Lead / Contato *</label>
                            <input
                                type="text"
                                required
                                value={formData.nome || ''}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                className={inputClass}
                                placeholder="Ex: [Local] Nome do Cliente"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Status</label>
                                <select
                                    value={formData.status || 'Lead'}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className={`${inputClass} appearance-none`}
                                >
                                    {activeStages.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Prioridade</label>
                                <select
                                    value={formData.prioridade || ''}
                                    onChange={e => setFormData({ ...formData, prioridade: e.target.value })}
                                    className={`${inputClass} appearance-none`}
                                >
                                    <option value="">Nenhuma</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Baixa">Baixa</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Interesse / Momento Pecuária</label>
                            <textarea
                                value={formData.interesse || ''}
                                onChange={e => setFormData({ ...formData, interesse: e.target.value })}
                                rows={2}
                                className={inputClass}
                                placeholder="O que o cliente deseja comprar?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Celular / WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.celular || ''}
                                    onChange={e => setFormData({ ...formData, celular: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Telefone Fixo</label>
                                <input
                                    type="text"
                                    value={formData.telefone || ''}
                                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Instagram</label>
                                <input
                                    type="text"
                                    value={formData.instagram || ''}
                                    onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                    className={inputClass}
                                    placeholder="@usuario"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Empresa / Fazenda</label>
                                <input
                                    type="text"
                                    value={formData.empresa || ''}
                                    onChange={e => setFormData({ ...formData, empresa: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Cidade</label>
                                <input
                                    type="text"
                                    value={formData.cidade || ''}
                                    onChange={e => setFormData({ ...formData, cidade: e.target.value })}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Estado (UF)</label>
                                <input
                                    type="text"
                                    value={formData.estado || ''}
                                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                    className={inputClass}
                                    placeholder="MG, SP, etc."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>O que busca</label>
                                <input
                                    type="text"
                                    value={formData.o_que_busca || ''}
                                    onChange={e => setFormData({ ...formData, o_que_busca: e.target.value })}
                                    className={inputClass}
                                    placeholder="Touro, Matrizes, etc."
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Qtd. Animais</label>
                                <input
                                    type="text"
                                    value={formData.quantidade_animais || ''}
                                    onChange={e => setFormData({ ...formData, quantidade_animais: e.target.value })}
                                    className={inputClass}
                                    placeholder="0 a 100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Responsável pela Conta</label>
                            {responsaveis.length > 0 ? (
                                <select
                                    value={formData.responsavel || ''}
                                    onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                                    className={inputClass}
                                >
                                    <option value="">Selecionar responsável...</option>
                                    {responsaveis.map(r => (
                                        <option key={r.id} value={r.name}>{r.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={formData.responsavel || ''}
                                    onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                                    className={inputClass}
                                    placeholder="Ex: Matheus Amormino"
                                />
                            )}
                        </div>

                        {/* Campos personalizados */}
                        {customFields.length > 0 && (
                            <div className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-[#333]">
                                    🔧 Campos personalizados
                                </div>
                                <div className="p-4 space-y-3">
                                    {customFields.map(field => (
                                        <div key={field.id}>
                                            <label className={labelClass}>
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.type === 'textarea' ? (
                                                <textarea
                                                    required={field.required}
                                                    rows={2}
                                                    value={formData.extra_data?.[field.id] ?? ''}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        extra_data: { ...formData.extra_data, [field.id]: e.target.value }
                                                    })}
                                                    className={inputClass}
                                                />
                                            ) : field.type === 'select' ? (
                                                <select
                                                    required={field.required}
                                                    value={formData.extra_data?.[field.id] ?? ''}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        extra_data: { ...formData.extra_data, [field.id]: e.target.value }
                                                    })}
                                                    className={`${inputClass} appearance-none`}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {(field.options || []).map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                                    required={field.required}
                                                    value={formData.extra_data?.[field.id] ?? ''}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        extra_data: { ...formData.extra_data, [field.id]: e.target.value }
                                                    })}
                                                    className={inputClass}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Seção Origem (colapsável) */}
                        <div className="border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setShowOrigemSection(!showOrigemSection)}
                                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#1A1A1A] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                <span>📊 Origem / Campanha</span>
                                {showOrigemSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {showOrigemSection && (
                                <div className="p-4 space-y-3 border-t border-gray-200 dark:border-[#333]">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Source</label>
                                            <input
                                                type="text"
                                                value={formData.source || ''}
                                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                                                className={inputClass}
                                                placeholder="facebook, google..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Medium</label>
                                            <input
                                                type="text"
                                                value={formData.medium || ''}
                                                onChange={e => setFormData({ ...formData, medium: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Campaign</label>
                                        <input
                                            type="text"
                                            value={formData.campaign || ''}
                                            onChange={e => setFormData({ ...formData, campaign: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Page</label>
                                        <input
                                            type="text"
                                            value={formData.source_page || ''}
                                            onChange={e => setFormData({ ...formData, source_page: e.target.value })}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-[#222222]">
                        {lead ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium text-sm"
                            >
                                <Trash2 size={18} />
                                {isDeleting ? 'Apagando...' : 'Apagar'}
                            </button>
                        ) : (
                            <div />
                        )}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-xl font-medium transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] hover:from-[#9A7209] hover:to-[#B8860B] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#B8860B]/20 disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isSaving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
