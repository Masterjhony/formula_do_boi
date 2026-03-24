import { KanbanBoard } from '@/components/admin/kanban/KanbanBoard';
import { getTasks, getProfiles, getColumns } from '@/app/web-admin/actions/tactical-tasks';

export const dynamic = 'force-dynamic';

export default async function TacticalPlanPage() {
    const [tasks, profiles, columns] = await Promise.all([
        getTasks(),
        getProfiles(),
        getColumns(),
    ]);

    return (
        <div className="h-[calc(100vh-140px)] min-h-[500px] flex flex-col resize-y overflow-auto border-b border-gray-200/50 dark:border-[#333333]/50 pb-2">
            <div className="mb-6 flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        Projetos
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
                    initialColumns={columns || []}
                />
            </div>
        </div>
    );
}
