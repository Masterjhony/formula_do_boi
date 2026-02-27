'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { CRMLead, deleteLead } from '@/app/web-admin/actions/crm-leads';
import { CRM_COLUMNS } from './CRMKanbanBoard';

interface CRMModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead?: CRMLead;
    defaultStatus: string;
    onSave: (data: any) => Promise<void>;
    onDelete?: () => void;
}

export function CRMModal({ isOpen, onClose, lead, defaultStatus, onSave, onDelete }: CRMModalProps) {
    const [formData, setFormData] = useState<Partial<CRMLead>>({
        nome: '',
        status: defaultStatus,
        prioridade: '',
        interesse: '',
        empresa: '',
        telefone: '',
        celular: '',
        responsavel: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData(lead);
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
            });
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
            // Optional: A more robust way is to trigger a re-fetch or state update in parent context if delete not via onSave
            window.location.reload();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Erro ao deletar lead.');
        } finally {
            setIsDeleting(false);
        }
    };

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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Lead / Contato *</label>
                            <input
                                type="text"
                                required
                                value={formData.nome || ''}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all"
                                placeholder="Ex: [Local] Nome do Cliente"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select
                                    value={formData.status || 'Lead'}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all appearance-none"
                                >
                                    {CRM_COLUMNS.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridade</label>
                                <select
                                    value={formData.prioridade || ''}
                                    onChange={e => setFormData({ ...formData, prioridade: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all appearance-none"
                                >
                                    <option value="">Nenhuma</option>
                                    <option value="Alta">Alta</option>
                                    <option value="Baixa">Baixa</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interesse</label>
                            <textarea
                                value={formData.interesse || ''}
                                onChange={e => setFormData({ ...formData, interesse: e.target.value })}
                                rows={2}
                                className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all"
                                placeholder="O que o cliente deseja comprar?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Celular</label>
                                <input
                                    type="text"
                                    value={formData.celular || ''}
                                    onChange={e => setFormData({ ...formData, celular: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone Fixo</label>
                                <input
                                    type="text"
                                    value={formData.telefone || ''}
                                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa / Fazenda</label>
                                <input
                                    type="text"
                                    value={formData.empresa || ''}
                                    onChange={e => setFormData({ ...formData, empresa: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsável pela Conta</label>
                                <input
                                    type="text"
                                    value={formData.responsavel || ''}
                                    onChange={e => setFormData({ ...formData, responsavel: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#333333] rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all"
                                    placeholder="Ex: Matheus Amormino"
                                />
                            </div>
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
