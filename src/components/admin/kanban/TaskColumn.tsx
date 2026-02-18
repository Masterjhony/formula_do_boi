'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { TacticalTask } from '@/app/web-admin/actions/tactical-tasks';
import { Plus } from 'lucide-react';

interface TaskColumnProps {
    id: string;
    title: string;
    tasks: TacticalTask[];
    onTaskClick: (task: TacticalTask) => void;
    onAddTask: (status: string) => void;
}

export function TaskColumn({ id, title, tasks, onTaskClick, onAddTask }: TaskColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: 'Column',
            status: id,
        },
    });

    const isOverlay = false; // logic to check if being dragged over

    const columnColors: Record<string, string> = {
        'A fazer': 'bg-red-500/10 text-red-500 border-red-500/20',
        'Em andamento': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        'Completa': 'bg-green-500/10 text-green-500 border-green-500/20',
        'default': 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };

    const headerColor = columnColors[title] || columnColors['default'];

    return (
        <div
            ref={setNodeRef}
            className="flex-1 min-w-[300px] flex flex-col gap-4 bg-gray-50 dark:bg-[#111111] p-4 rounded-2xl border border-gray-200 dark:border-[#222222]"
        >
            <div className="flex items-center justify-between pointer-events-none">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${headerColor}`}>
                    {title}
                    <span className="ml-2 opacity-50 text-[10px]">{tasks.length}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // Should not trigger drag
                        e.preventDefault();
                        onAddTask(id); // Use the prop
                    }}
                    className="pointer-events-auto w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#222222] text-gray-400 font-bold transition-all"
                >
                    <Plus size={14} />
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-3 min-h-[500px]">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={onTaskClick}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
