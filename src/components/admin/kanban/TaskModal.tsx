'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Save } from 'lucide-react';
import { TacticalTask } from '@/app/web-admin/actions/tactical-tasks';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: TacticalTask;
    defaultStatus?: string;
    onSave: (taskData: any) => Promise<void>;
    profiles: any[];
}

export function TaskModal({ isOpen, onClose, task, defaultStatus, onSave, profiles }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('A fazer');
    const [priority, setPriority] = useState('Média');
    const [dueDate, setDueDate] = useState('');
    const [assignees, setAssignees] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status);
            setPriority(task.priority);
            setDueDate(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
            setAssignees(task.assignees || []);
        } else {
            setTitle('');
            setDescription('');
            setStatus(defaultStatus || 'A fazer');
            setPriority('Média');
            setDueDate('');
            setAssignees([]);
        }
    }, [task, defaultStatus, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave({
                title,
                description,
                status,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                assignees,
            });
            onClose();
        } catch (error) {
            console.error('Failed to save task', error);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAssignee = (name: string) => {
        if (assignees.includes(name)) {
            setAssignees(assignees.filter(a => a !== name));
        } else {
            setAssignees([...assignees, name]);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-[#222222] flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#222222]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Título
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="Ex: Atualizar contrato..."
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                            placeholder="Detalhes da tarefa..."
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none text-gray-900 dark:text-white"
                            >
                                <option value="A fazer">A fazer</option>
                                <option value="Em andamento">Em andamento</option>
                                <option value="Completa">Completa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Prioridade
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none text-gray-900 dark:text-white"
                            >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prazo
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Assignees */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Responsáveis
                        </label>
                        <div className="bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-3 max-h-32 overflow-y-auto space-y-2 custom-scrollbar">
                            {profiles.map((profile) => (
                                <label key={profile.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-lg cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={assignees.includes(profile.full_name || profile.email)}
                                        onChange={() => toggleAssignee(profile.full_name || profile.email)}
                                        className="w-4 h-4 text-[#B8860B] border-gray-300 rounded focus:ring-[#B8860B]"
                                    />
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-[10px] font-bold text-black">
                                            {(profile.full_name || profile.email).charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {profile.full_name || profile.email}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                </form>

                <div className="p-6 border-t border-gray-100 dark:border-[#222222] flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-[#222222] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black font-bold shadow-lg shadow-[#B8860B]/20 hover:shadow-[#B8860B]/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                Salvar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
