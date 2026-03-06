'use client';

import { useState, useMemo } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { TaskColumn } from './TaskColumn';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';

import { GanttView } from './GanttView';
import { TacticalTask, TacticalColumn, updateTask, createTask, moveTask, deleteTask, createColumn, updateColumn, deleteColumn } from '@/app/web-admin/actions/tactical-tasks';
import { createPortal } from 'react-dom';
import { Plus, LayoutGrid, Calendar as CalendarIcon, Filter } from 'lucide-react';

interface KanbanBoardProps {
    initialTasks: TacticalTask[];
    profiles: any[];
    initialColumns: TacticalColumn[];
}

export function KanbanBoard({ initialTasks, profiles, initialColumns }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<TacticalTask[]>(initialTasks);
    const [columns, setColumns] = useState<TacticalColumn[]>(initialColumns);
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    // Assuming initialTasks are sorted by position from server

    const [activeTask, setActiveTask] = useState<TacticalTask | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TacticalTask | undefined>(undefined);
    const [defaultStatus, setDefaultStatus] = useState('A fazer');

    // New Feature States
    const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('kanban');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Avoid accidental drags on clicks
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const filteredTasks = useMemo(() => {
        if (filterAssignee === 'all') return tasks;
        return tasks.filter(t => t.assignees?.includes(filterAssignee));
    }, [tasks, filterAssignee]);

    const handleTaskClick = (task: TacticalTask) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleAddTask = (status: string) => {
        setEditingTask(undefined);
        setDefaultStatus(status);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData: any) => {
        // Optimistic update could be done here, but for simplicity we await server
        if (editingTask) {
            // Update
            const updated = await updateTask(editingTask.id, taskData);
            setTasks(tasks.map(t => t.id === updated.id ? updated : t));
        } else {
            // Create
            const newTask = await createTask({ ...taskData, status: defaultStatus });
            setTasks([...tasks, newTask]);
        }
    };

    // Drag Handlers
    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';

        if (!isActiveTask) return;

        // Dropping over a Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].status !== tasks[overIndex].status) {
                    // Moving to different column
                    const updatedTasks = [...tasks];
                    updatedTasks[activeIndex].status = tasks[overIndex].status;
                    return arrayMove(updatedTasks, activeIndex, overIndex);
                }

                // Sorting in same column
                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverColumn = over.data.current?.type === 'Column';

        // Dropping over a Column (empty area)
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const newStatus = overId as string;

                if (tasks[activeIndex].status !== newStatus) {
                    const updatedTasks = [...tasks];
                    updatedTasks[activeIndex].status = newStatus;
                    return arrayMove(updatedTasks, activeIndex, activeIndex); // No reorder needed just status update
                }
                return tasks;
            });
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        // Only trigger server update if changed
        if (over) {
            const activeId = active.id as string;
            // overId might be a column ID or a task ID, we already set the status locally in DragOver.
            // So we find its newly assigned status from local state.
            const changedTask = tasks.find(t => t.id === activeId);

            if (changedTask) {
                // Determine new positioning relative to others in the column
                const columnTasks = tasks.filter(t => t.status === changedTask.status);
                const indexInColumn = columnTasks.findIndex(t => t.id === changedTask.id);
                const prevTask = columnTasks[indexInColumn - 1];
                const nextTask = columnTasks[indexInColumn + 1];

                let newPosition = changedTask.position; // Default to existing if no change

                if (!prevTask && !nextTask) {
                    newPosition = 1000;
                } else if (!prevTask) {
                    newPosition = (nextTask?.position || 2000) / 2;
                } else if (!nextTask) {
                    newPosition = (prevTask?.position || 0) + 1000;
                } else {
                    newPosition = (prevTask.position + nextTask.position) / 2;
                }

                try {
                    await moveTask(changedTask.id, changedTask.status, newPosition);
                } catch {
                    setTasks(initialTasks); // fallback
                }
            }
        }

        setActiveTask(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <div className="h-full flex flex-col pt-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 shrink-0 gap-4">
                <div className="flex gap-2 bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-lg border border-gray-200 dark:border-[#222222]">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'kanban'
                            ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <LayoutGrid size={16} /> Kanban
                    </button>
                    <button
                        onClick={() => setViewMode('gantt')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'gantt'
                            ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <CalendarIcon size={16} /> Gantt
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {/* Assignee Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            value={filterAssignee}
                            onChange={(e) => setFilterAssignee(e.target.value)}
                            className="text-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222222] rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#B8860B]"
                        >
                            <option value="all">Todos os Responsáveis</option>
                            {profiles.map(p => (
                                <option key={p.id} value={p.full_name || p.email}>
                                    {p.full_name || p.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => {
                            setEditingTask(undefined);
                            setDefaultStatus('A fazer');
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-lg font-bold hover:shadow-lg hover:shadow-[#B8860B]/20 transition-all hover:-translate-y-0.5 whitespace-nowrap"
                    >
                        <Plus size={20} />
                        Nova Tarefa
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[0px] overflow-hidden flex flex-col pb-2">
                {viewMode === 'kanban' ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDragEnd={onDragEnd}
                    >
                        <div className="flex-1 flex gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 h-full snap-x pr-4">
                            {columns.map((col) => (
                                <TaskColumn
                                    key={col.id}
                                    id={col.title}
                                    title={col.title}
                                    tasks={filteredTasks.filter((t) => t.status === col.title)}
                                    onTaskClick={handleTaskClick}
                                    onAddTask={handleAddTask}
                                    onUpdateColumn={async (id, newTitle) => {
                                        try {
                                            const colId = col.id;
                                            await updateColumn(colId, newTitle);
                                            setColumns(columns.map(c => c.id === colId ? { ...c, title: newTitle } : c));
                                            // Optional: if task status is the title, update tasks locally
                                            setTasks(tasks.map(t => t.status === id ? { ...t, status: newTitle } : t));
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                    onDeleteColumn={async (id) => {
                                        try {
                                            const colId = col.id;
                                            await deleteColumn(colId);
                                            setColumns(columns.filter(c => c.id !== colId));
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                />
                            ))}
                            {/* New Column Button/Input */}
                            <div className="shrink-0 w-[320px] bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-200 dark:border-[#222222] h-fit flex flex-col items-start justify-center">
                                {isCreatingColumn ? (
                                    <div className="w-full flex items-center gap-2">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newColumnTitle}
                                            onChange={(e) => setNewColumnTitle(e.target.value)}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && newColumnTitle.trim()) {
                                                    try {
                                                        const newCol = await createColumn(newColumnTitle.trim());
                                                        setColumns([...columns, newCol]);
                                                        setNewColumnTitle('');
                                                        setIsCreatingColumn(false);
                                                    } catch (err) {
                                                        console.error(err);
                                                    }
                                                } else if (e.key === 'Escape') {
                                                    setIsCreatingColumn(false);
                                                    setNewColumnTitle('');
                                                }
                                            }}
                                            onBlur={() => {
                                                setIsCreatingColumn(false);
                                                setNewColumnTitle('');
                                            }}
                                            className="w-full px-3 py-2 bg-white dark:bg-[#111111] border border-[#B8860B] rounded-lg focus:outline-none text-sm text-gray-900 dark:text-white"
                                            placeholder="Nome da coluna..."
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsCreatingColumn(true)}
                                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors w-full p-2"
                                    >
                                        <Plus size={18} />
                                        <span className="font-medium text-sm">Adicionar Coluna</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {createPortal(
                            <DragOverlay dropAnimation={dropAnimation}>
                                {activeTask && (
                                    <TaskCard
                                        task={activeTask}
                                        onClick={() => { }}
                                    />
                                )}
                            </DragOverlay>,
                            document.body
                        )}
                    </DndContext>
                ) : (
                    <div className="flex-1 min-h-[0px] pb-2 pr-2">
                        <GanttView
                            tasks={filteredTasks}
                            onTaskClick={handleTaskClick}
                        />
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={editingTask}
                defaultStatus={defaultStatus}
                onSave={handleSaveTask}
                profiles={profiles}
            />
        </div>
    );
}
