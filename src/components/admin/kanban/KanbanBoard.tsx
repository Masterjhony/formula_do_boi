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
import { WhiteboardView } from './WhiteboardView';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { MembersView } from './MembersView';
import {
    TacticalTask, TacticalColumn,
    updateTask, createTask, moveTask, deleteTask,
    createColumn, updateColumn, deleteColumn,
} from '@/app/web-admin/actions/tactical-tasks';
import {
    TacticalObjective, TacticalMember,
} from '@/app/web-admin/actions/tactical-strategic';
import { createPortal } from 'react-dom';
import {
    Plus, LayoutGrid, Calendar as CalendarIcon, Filter, Maximize2, Minimize2,
    Presentation, BarChart3, Eye, Users,
} from 'lucide-react';

type ViewMode = 'kanban' | 'gantt' | 'whiteboard' | 'dashboard' | 'members';

interface KanbanBoardProps {
    initialTasks: TacticalTask[];
    initialColumns: TacticalColumn[];
    initialObjectives: TacticalObjective[];
    initialMembers: TacticalMember[];
}

export function KanbanBoard({
    initialTasks,
    initialColumns,
    initialObjectives,
    initialMembers,
}: KanbanBoardProps) {
    const [tasks, setTasks] = useState<TacticalTask[]>(initialTasks);
    const [columns, setColumns] = useState<TacticalColumn[]>(initialColumns);
    const [objectives, setObjectives] = useState<TacticalObjective[]>(initialObjectives);
    const [members, setMembers] = useState<TacticalMember[]>(initialMembers);

    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [activeTask, setActiveTask] = useState<TacticalTask | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TacticalTask | undefined>(undefined);
    const [defaultStatus, setDefaultStatus] = useState('A fazer');

    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [focusMode, setFocusMode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const doneStatus = useMemo(() =>
        columns.find(c =>
            c.title.toLowerCase().includes('complet') || c.title.toLowerCase().includes('conclu')
        )?.title,
        [columns]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const filteredTasks = useMemo(() => {
        let result = tasks;
        if (filterAssignee !== 'all') result = result.filter(t => t.assignees?.includes(filterAssignee));
        if (filterPriority !== 'all') result = result.filter(t => t.priority === filterPriority);
        if (focusMode) result = result.filter(t => t.priority === 'Alta' || t.status !== doneStatus);
        return result;
    }, [tasks, filterAssignee, filterPriority, focusMode, doneStatus]);

    const assigneeOptions = useMemo(() => {
        const fromTasks = tasks.flatMap(t => t.assignees || []);
        return Array.from(new Set(fromTasks)).filter(Boolean);
    }, [tasks]);

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
        if (editingTask) {
            const updated = await updateTask(editingTask.id, taskData);
            setTasks(tasks.map(t => t.id === updated.id ? updated : t));
        } else {
            const newTask = await createTask(taskData);
            setTasks([...tasks, newTask]);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            await deleteTask(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
        } catch (e) { console.error('Failed to delete task', e); }
    };

    // Drag Handlers
    const onDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
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

        if (isActiveTask && isOverTask) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const overIndex = tasks.findIndex(t => t.id === overId);
                if (tasks[activeIndex].status !== tasks[overIndex].status) {
                    const updated = [...tasks];
                    updated[activeIndex].status = tasks[overIndex].status;
                    return arrayMove(updated, activeIndex, overIndex);
                }
                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverColumn = over.data.current?.type === 'Column';
        if (isActiveTask && isOverColumn) {
            setTasks(tasks => {
                const activeIndex = tasks.findIndex(t => t.id === activeId);
                const newStatus = overId as string;
                if (tasks[activeIndex].status !== newStatus) {
                    const updated = [...tasks];
                    updated[activeIndex].status = newStatus;
                    return arrayMove(updated, activeIndex, activeIndex);
                }
                return tasks;
            });
        }
    };

    const onDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over) {
            const activeId = active.id as string;
            const changedTask = tasks.find(t => t.id === activeId);
            if (changedTask) {
                const columnTasks = tasks.filter(t => t.status === changedTask.status);
                const indexInColumn = columnTasks.findIndex(t => t.id === changedTask.id);
                const prevTask = columnTasks[indexInColumn - 1];
                const nextTask = columnTasks[indexInColumn + 1];

                let newPosition = changedTask.position;
                if (!prevTask && !nextTask) newPosition = 1000;
                else if (!prevTask) newPosition = (nextTask?.position || 2000) / 2;
                else if (!nextTask) newPosition = (prevTask?.position || 0) + 1000;
                else newPosition = (prevTask.position + nextTask.position) / 2;

                try {
                    await moveTask(changedTask.id, changedTask.status, newPosition);
                } catch {
                    setTasks(initialTasks);
                }
            }
        }
        setActiveTask(null);
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
    };

    const viewTabs: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
        { key: 'kanban', label: 'Kanban', icon: <LayoutGrid size={15} /> },
        { key: 'gantt', label: 'Gantt', icon: <CalendarIcon size={15} /> },
        { key: 'whiteboard', label: 'Lousa', icon: <Presentation size={15} /> },
        { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={15} /> },
        { key: 'members', label: `Equipe${members.length > 0 ? ` (${members.length})` : ''}`, icon: <Users size={15} /> },
    ];

    const showKanbanFilters = viewMode === 'kanban' || viewMode === 'gantt';

    return (
        <div className={
            isFullscreen
                ? "fixed inset-0 z-[100] bg-[#f9fafb] dark:bg-[#0A0A0A] p-6 w-screen h-screen flex flex-col overflow-hidden"
                : "h-full flex flex-col pt-4"
        }>
            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-4 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* View Tabs */}
                    <div className="flex gap-1 bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-xl border border-gray-200 dark:border-[#222222] overflow-x-auto">
                        {viewTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setViewMode(tab.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${viewMode === tab.key
                                    ? 'bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Filters — shown for kanban/gantt */}
                        {showKanbanFilters && (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <Filter size={14} className="text-gray-400" />
                                    <select
                                        value={filterAssignee}
                                        onChange={e => setFilterAssignee(e.target.value)}
                                        className="text-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222222] rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#B8860B]"
                                    >
                                        <option value="all">Todos</option>
                                        {assigneeOptions.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                </div>
                                <select
                                    value={filterPriority}
                                    onChange={e => setFilterPriority(e.target.value)}
                                    className="text-sm bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222222] rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-[#B8860B]"
                                >
                                    <option value="all">Todas prioridades</option>
                                    <option value="Alta">Alta 🔥</option>
                                    <option value="Média">Média</option>
                                    <option value="Baixa">Baixa</option>
                                </select>
                                <button
                                    onClick={() => setFocusMode(!focusMode)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${focusMode
                                        ? 'bg-[#B8860B]/10 border-[#B8860B]/30 text-[#B8860B]'
                                        : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#222222] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    title="Modo Foco — apenas tarefas críticas"
                                >
                                    <Eye size={14} /> Foco
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#222222]"
                            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>

                        {(viewMode === 'kanban' || viewMode === 'gantt') && (
                            <button
                                onClick={() => { setEditingTask(undefined); setDefaultStatus('A fazer'); setIsModalOpen(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black rounded-lg font-bold hover:shadow-lg hover:shadow-[#B8860B]/20 transition-all hover:-translate-y-0.5 whitespace-nowrap text-sm"
                            >
                                <Plus size={16} /> Nova Tarefa
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* ── Views ── */}
            <div className="flex-1 min-h-[0px] overflow-hidden flex flex-col pb-2">

                {/* KANBAN */}
                {viewMode === 'kanban' && (
                    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
                        <div className="flex-1 flex gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 h-full snap-x pr-4">
                            {columns.map(col => (
                                <TaskColumn
                                    key={col.id}
                                    id={col.title}
                                    title={col.title}
                                    tasks={filteredTasks.filter(t => t.status === col.title)}
                                    onTaskClick={handleTaskClick}
                                    onAddTask={handleAddTask}
                                    allTasks={tasks}
                                    doneStatus={doneStatus}
                                    onUpdateColumn={async (id, newTitle) => {
                                        try {
                                            await updateColumn(col.id, newTitle);
                                            setColumns(columns.map(c => c.id === col.id ? { ...c, title: newTitle } : c));
                                            setTasks(tasks.map(t => t.status === id ? { ...t, status: newTitle } : t));
                                        } catch (e) { console.error(e); }
                                    }}
                                    onDeleteColumn={async () => {
                                        try {
                                            await deleteColumn(col.id);
                                            setColumns(columns.filter(c => c.id !== col.id));
                                        } catch (e) { console.error(e); }
                                    }}
                                />
                            ))}
                            {/* New Column */}
                            <div className="shrink-0 w-[320px] bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-200 dark:border-[#222222] h-fit">
                                {isCreatingColumn ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newColumnTitle}
                                        onChange={e => setNewColumnTitle(e.target.value)}
                                        onKeyDown={async e => {
                                            if (e.key === 'Enter' && newColumnTitle.trim()) {
                                                try {
                                                    const newCol = await createColumn(newColumnTitle.trim());
                                                    setColumns([...columns, newCol]);
                                                    setNewColumnTitle('');
                                                    setIsCreatingColumn(false);
                                                } catch (err) { console.error(err); }
                                            } else if (e.key === 'Escape') {
                                                setIsCreatingColumn(false);
                                                setNewColumnTitle('');
                                            }
                                        }}
                                        onBlur={() => { setIsCreatingColumn(false); setNewColumnTitle(''); }}
                                        className="w-full px-3 py-2 bg-white dark:bg-[#111111] border border-[#B8860B] rounded-lg focus:outline-none text-sm text-gray-900 dark:text-white"
                                        placeholder="Nome da coluna..."
                                    />
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
                                {activeTask && <TaskCard task={activeTask} onClick={() => {}} allTasks={tasks} doneStatus={doneStatus} />}
                            </DragOverlay>,
                            document.body
                        )}
                    </DndContext>
                )}

                {/* GANTT */}
                {viewMode === 'gantt' && (
                    <div className="flex-1 min-h-[0px] pb-2 pr-2">
                        <GanttView tasks={filteredTasks} onTaskClick={handleTaskClick} />
                    </div>
                )}

                {/* WHITEBOARD — always mounted to avoid state loss */}
                <div className="flex-1 min-h-[0px] pb-2 pr-2 h-full flex-col" style={{ display: viewMode === 'whiteboard' ? 'flex' : 'none' }}>
                    <WhiteboardView />
                </div>

                {/* DASHBOARD */}
                {viewMode === 'dashboard' && (
                    <ExecutiveDashboard tasks={tasks} columns={columns} objectives={objectives} />
                )}

                {/* MEMBERS */}
                {viewMode === 'members' && (
                    <MembersView
                        members={members}
                        onMembersChange={setMembers}
                        tasks={tasks}
                    />
                )}

            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={editingTask}
                defaultStatus={defaultStatus}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
                columns={columns}
                allTasks={tasks}
                members={members}
            />
        </div>
    );
}
