'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Save, Plus, Trash2, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { TacticalTask, TacticalComment, getComments, addComment } from '@/app/web-admin/actions/tactical-tasks';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task?: TacticalTask;
    defaultStatus?: string;
    onSave: (taskData: any) => Promise<void>;
    profiles: any[];
    columns: { title: string }[];
}

export function TaskModal({ isOpen, onClose, task, defaultStatus, onSave, profiles, columns }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('A fazer');
    const [priority, setPriority] = useState('Média');
    const [dueDate, setDueDate] = useState('');
    const [assignees, setAssignees] = useState<string[]>([]);
    const [checklists, setChecklists] = useState<{ id: string, title: string, completed: boolean }[]>([]);
    const [newChecklistTitle, setNewChecklistTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Comments State
    const [comments, setComments] = useState<TacticalComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isSendingComment, setIsSendingComment] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status);
            setPriority(task.priority);
            setDueDate(task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '');
            setAssignees(task.assignees || []);
            setChecklists(task.checklists || []);

            // Load Comments
            const loadComments = async () => {
                setIsLoadingComments(true);
                try {
                    const data = await getComments(task.id);
                    setComments(data);
                } catch (error) {
                    console.error('Failed to load comments:', error);
                } finally {
                    setIsLoadingComments(false);
                }
            };
            loadComments();
        } else {
            setTitle('');
            setDescription('');
            setStatus(defaultStatus || 'A fazer');
            setPriority('Média');
            setDueDate('');
            setAssignees([]);
            setChecklists([]);
            setComments([]);
            setNewComment('');
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
                checklists,
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

    const handleSendComment = async () => {
        if (!newComment.trim() || !task) return;

        setIsSendingComment(true);
        try {
            const added = await addComment(task.id, newComment.trim());
            setComments([...comments, added]);
            setNewComment('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSendingComment(false);
        }
    };

    const addChecklistItem = () => {
        if (!newChecklistTitle.trim()) return;
        setChecklists([
            ...checklists,
            { id: Date.now().toString(), title: newChecklistTitle, completed: false }
        ]);
        setNewChecklistTitle('');
    };

    const removeChecklistItem = (id: string) => {
        setChecklists(checklists.filter(c => c.id !== id));
    };

    const toggleChecklistItem = (id: string) => {
        setChecklists(checklists.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#222222] flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#222222]">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {task ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form id="task-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Description */}
                        <div className="md:col-span-2">
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl focus:ring-2 focus:ring-[#B8860B] focus:border-transparent outline-none text-gray-900 dark:text-white"
                            >
                                {columns.map((col) => (
                                    <option key={col.title} value={col.title}>{col.title}</option>
                                ))}
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
                                <option value="Alta">Alta 🔥</option>
                            </select>
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
                                {['Marcelo', 'João Eduardo', 'Matheus', 'Joao Gabriel', 'Hugo (saiu)', 'Fabrício'].map((name) => (
                                    <label key={name} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-[#222222] rounded-lg cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={assignees.includes(name)}
                                            onChange={() => toggleAssignee(name)}
                                            className="w-4 h-4 text-[#B8860B] border-gray-300 rounded focus:ring-[#B8860B]"
                                        />
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-[10px] font-bold text-black border border-[#1A1A1A]">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                {name}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Checklists */}
                    <div className="pt-4 border-t border-gray-100 dark:border-[#222222]">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-4">
                            <CheckCircle2 size={18} className="text-[#B8860B]" />
                            Checklist
                        </label>

                        {/* Add Item */}
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="text"
                                value={newChecklistTitle}
                                onChange={(e) => setNewChecklistTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addChecklistItem();
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500 text-sm"
                                placeholder="Adicionar item..."
                            />
                            <button
                                type="button"
                                onClick={addChecklistItem}
                                disabled={!newChecklistTitle.trim()}
                                className="p-2.5 bg-gray-100 dark:bg-[#222222] text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333333] transition-colors disabled:opacity-50"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Checklist Items */}
                        <div className="space-y-2">
                            {checklists.map((check) => (
                                <div key={check.id} className="flex items-start gap-3 group">
                                    <button
                                        type="button"
                                        className="mt-1 flex-shrink-0"
                                        onClick={() => toggleChecklistItem(check.id)}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${check.completed
                                            ? 'bg-[#B8860B] border-[#B8860B] text-black'
                                            : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {check.completed && <CheckCircle2 size={14} />}
                                        </div>
                                    </button>
                                    <span className={`flex-1 text-sm pt-1 transition-all ${check.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {check.title}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeChecklistItem(check.id)}
                                        className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all mt-0.5"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    {task && (
                        <div className="pt-4 border-t border-gray-100 dark:border-[#222222]">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-4">
                                <MessageSquare size={18} className="text-[#B8860B]" />
                                Comentários
                            </label>

                            <div className="space-y-4 mb-4">
                                {isLoadingComments ? (
                                    <div className="text-sm text-gray-500">Carregando...</div>
                                ) : comments.length === 0 ? (
                                    <div className="text-sm text-gray-500">Nenhum comentário ainda.</div>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="bg-gray-50 dark:bg-[#111111] p-3 rounded-lg border border-gray-100 dark:border-[#222222]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-[9px] font-bold text-black min-w-[20px]">
                                                    {(comment.profiles?.full_name || comment.profiles?.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {comment.profiles?.full_name || comment.profiles?.email || 'Usuário'}
                                                </span>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    {new Date(comment.created_at).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-7">
                                                {comment.content}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex items-end gap-2">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-500 text-sm resize-none custom-scrollbar"
                                    placeholder="Escreva um comentário..."
                                    rows={2}
                                />
                                <button
                                    type="button"
                                    onClick={handleSendComment}
                                    disabled={!newComment.trim() || isSendingComment}
                                    className="p-2.5 bg-[#B8860B] text-black rounded-lg hover:bg-[#D4AF37] transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 mb-0.5"
                                >
                                    {isSendingComment ? (
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <Send size={16} />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                </form>

                <div className="p-6 flex justify-between gap-3 shrink-0 bg-gray-50 dark:bg-[#1A1A1A] rounded-b-2xl border-t border-gray-200 dark:border-[#222222]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-200 dark:hover:bg-[#222222] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="task-form"
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
