'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, CheckSquare, MessageSquare } from 'lucide-react';
import { TacticalTask } from '@/app/web-admin/actions/tactical-tasks';

interface TaskCardProps {
    task: TacticalTask;
    onClick: (task: TacticalTask) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priorityColor = {
        'Alta': 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
        'Média': 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        'Baixa': 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    }[task.priority] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20';

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 bg-[#1A1A1A] p-4 rounded-xl border-2 border-dashed border-[#B8860B]/50 h-[120px]"
            />
        );
    }

    const totalChecklists = task.checklists?.length || 0;
    const completedChecklists = task.checklists?.filter(c => c.completed).length || 0;
    const isChecklistComplete = totalChecklists > 0 && completedChecklists === totalChecklists;

    // Fallback safely if tactical_task_comments is undefined
    const commentCount = task.tactical_task_comments?.[0]?.count || 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
            className="group relative bg-white dark:bg-[#1A1A1A] p-5 rounded-xl border border-gray-200/80 dark:border-[#333333]/80 hover:border-[#B8860B]/60 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing flex flex-col gap-3"
        >
            <div className="flex justify-between items-start gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${priorityColor}`}>
                    {task.priority === 'Alta' ? 'Alta 🔥' : task.priority}
                </span>
                {task.due_date && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#222222] px-2 py-1 rounded-md border border-gray-100 dark:border-[#333333]">
                        <Calendar size={12} />
                        <span>{new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                )}
            </div>

            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                {task.title}
            </h3>

            {(totalChecklists > 0 || commentCount > 0 || (task.assignees && task.assignees.length > 0)) && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#222222]">

                    {/* Indicators */}
                    <div className="flex items-center gap-1.5">
                        {totalChecklists > 0 && (
                            <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-md flex-shrink-0 transition-colors
                                ${isChecklistComplete ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200/50 dark:bg-[#222222] dark:text-gray-400 dark:ring-[#333333]'}`}
                            >
                                <CheckSquare size={10} />
                                {completedChecklists}/{totalChecklists}
                            </div>
                        )}

                        {commentCount > 0 && (
                            <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md flex-shrink-0 bg-gray-50 text-gray-500 ring-1 ring-gray-200/50 dark:bg-[#222222] dark:text-gray-400 dark:ring-[#333333]">
                                <MessageSquare size={10} />
                                {commentCount}
                            </div>
                        )}
                    </div>

                    {/* Assignees */}
                    {task.assignees && task.assignees.length > 0 && (
                        <div className="flex pl-2 -space-x-2">
                            {task.assignees.map((assignee, index) => (
                                <div
                                    key={index}
                                    className="w-6 h-6 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-[8px] font-bold text-black border border-[#1A1A1A] shrink-0 transform transition-transform hover:scale-110 hover:z-10"
                                    title={assignee}
                                >
                                    {assignee.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {task.assignees.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-[#222222] flex items-center justify-center text-[8px] text-gray-400 border border-[#1A1A1A] shrink-0 z-0">
                                    +{task.assignees.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

