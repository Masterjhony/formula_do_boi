'use client';

import { useState } from 'react';
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
import { TacticalTask, updateTask, createTask, moveTask, deleteTask } from '@/app/web-admin/actions/tactical-tasks';
import { createPortal } from 'react-dom';

interface KanbanBoardProps {
    initialTasks: TacticalTask[];
    profiles: any[];
}

export function KanbanBoard({ initialTasks, profiles }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<TacticalTask[]>(initialTasks);
    // Assuming initialTasks are sorted by position from server

    const [activeTask, setActiveTask] = useState<TacticalTask | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TacticalTask | undefined>(undefined);
    const [defaultStatus, setDefaultStatus] = useState('A fazer');

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

    const columns = ['A fazer', 'Em andamento', 'Completa'];

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
            const overId = over.id as string;

            const task = tasks.find(t => t.id === activeId);

            if (task) {
                // Calculate new position is complex in simple arrayMove
                // For now, we persist the new status. 
                // Persisting exact position requires calculating and sending index/position to server.
                // We will just update status for now if changed.

                // If status changed in DragOver, it's already in local state 'tasks', but we need to sync with DB.
                // We need to know the final status and index.

                // Finding the task in CURRENT state (modified by DragOver)
                const currentTask = tasks.find(t => t.id === activeId);
                if (currentTask) {
                    // We should recalculate positions for the whole column or just update this task's position based on neighbors
                    // For MVP, updating Status is priority.
                    // Position persistence:
                    // We can update the task with new status.

                    // Warning: if we only update status, reordering within column won't persist.
                    // To persist reorder: calculate new position float based on prev/next tasks.

                    // Simplification: We update the task's Status and Position.
                    // We find its index in the filtered column list.
                    const columnTasks = tasks.filter(t => t.status === currentTask.status);
                    const indexInColumn = columnTasks.findIndex(t => t.id === currentTask.id);
                    const prevTask = columnTasks[indexInColumn - 1];
                    const nextTask = columnTasks[indexInColumn + 1];

                    let newPosition = currentTask.position; // Default to existing if no change

                    if (!prevTask && !nextTask) {
                        // Only task
                        newPosition = 1000;
                    } else if (!prevTask) {
                        // First
                        newPosition = (nextTask?.position || 2000) / 2;
                    } else if (!nextTask) {
                        // Last
                        newPosition = (prevTask?.position || 0) + 1000;
                    } else {
                        // Middle
                        newPosition = (prevTask.position + nextTask.position) / 2;
                    }

                    await moveTask(currentTask.id, currentTask.status, newPosition);
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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-4 h-full snap-x">
                {columns.map((colId) => (
                    <TaskColumn
                        key={colId}
                        id={colId}
                        title={colId}
                        tasks={tasks.filter((t) => t.status === colId)}
                        onTaskClick={handleTaskClick}
                        onAddTask={handleAddTask}
                    />
                ))}
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

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={editingTask}
                defaultStatus={defaultStatus}
                onSave={handleSaveTask}
                profiles={profiles}
            />
        </DndContext>
    );
}
