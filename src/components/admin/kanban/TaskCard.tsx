'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
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
        'Alta': 'bg-red-500/10 text-red-500 border-red-500/20',
        'Média': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'Baixa': 'bg-green-500/10 text-green-500 border-green-500/20',
    }[task.priority] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-50 bg-[#1A1A1A] p-4 rounded-xl border-2 border-dashed border-[#B8860B]/50 h-[120px]"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
            className="group bg-white dark:bg-[#1A1A1A] p-4 rounded-xl border border-gray-200 dark:border-[#222222] hover:border-[#B8860B]/50 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-3"
        >
            <div className="flex justify-between items-start gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityColor}`}>
                    {task.priority}
                </span>
                {task.due_date && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Calendar size={12} />
                        <span>{new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                    </div>
                )}
            </div>

            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                {task.title}
            </h3>

            {(task.assignees && task.assignees.length > 0) && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#222222]">
                    <div className="flex -space-x-2">
                        {task.assignees.map((assignee, index) => (
                            <div
                                key={index}
                                className="w-6 h-6 rounded-full bg-gradient-to-br from-[#B8860B] to-[#9A7209] flex items-center justify-center text-[8px] font-bold text-black border border-[#1A1A1A]"
                                title={assignee}
                            >
                                {assignee.charAt(0).toUpperCase()}
                            </div>
                        ))}
                        {task.assignees.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-[#222222] flex items-center justify-center text-[8px] text-gray-400 border border-[#1A1A1A]">
                                +{task.assignees.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
