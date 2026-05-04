import { getContracts, syncAllContractsFromClickSign } from '@/app/web-admin/actions/contracts';
import { ContractsView } from '@/components/admin/kanban/ContractsView';

export const dynamic = 'force-dynamic';

export default async function ContratosPage() {
    // Auto-sync com ClickSign antes de carregar a lista local — assim os
    // documentos da plataforma aparecem sem precisar importar manualmente.
    // Se o ClickSign falhar (token, rede, etc.), seguimos com o que tiver
    // no banco local; o erro fica no log e a UI continua funcional.
    await syncAllContractsFromClickSign();
    const contracts = await getContracts();
    return <ContractsView initialContracts={contracts} />;
}
