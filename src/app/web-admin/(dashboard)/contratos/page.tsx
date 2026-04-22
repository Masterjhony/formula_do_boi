import { getContracts } from '@/app/web-admin/actions/contracts';
import { ContractsView } from '@/components/admin/kanban/ContractsView';

export const dynamic = 'force-dynamic';

export default async function ContratosPage() {
    const contracts = await getContracts();
    return <ContractsView initialContracts={contracts} />;
}
