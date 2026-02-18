import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard';
import { getTasks, getProfiles } from '@/app/web-admin/actions/tactical-tasks';

export const dynamic = 'force-dynamic';

export default async function TacticalPlanPage() {
    const [tasks, profiles] = await Promise.all([
        getTasks(),
        getProfiles()
    ]);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Plano Tático
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Gerencie as tarefas e prioridades da equipe.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard
                    initialTasks={tasks || []}
                    profiles={profiles || []}
                />
            </div>
        </div>
    );
}
