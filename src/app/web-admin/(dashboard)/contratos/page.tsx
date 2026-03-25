import { getContracts } from '@/app/web-admin/actions/contracts';
import { ContractsView } from '@/components/admin/kanban/ContractsView';

export const dynamic = 'force-dynamic';

export default async function ContratosPage() {
    const contracts = await getContracts();

    return (
        <div className="h-[calc(100vh-140px)] min-h-[500px] flex flex-col">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    Contratos
                </h1>
                <p className="text-gray-500 mt-2">
                    Arquivo de contratos dos clientes.
                </p>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <ContractsView initialContracts={contracts} />
            </div>
        </div>
    );
}
