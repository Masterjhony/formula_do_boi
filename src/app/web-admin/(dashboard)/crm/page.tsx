import { CRMDashboardClient } from '@/components/admin/crm/CRMDashboardClient';
import { getLeads } from '@/app/web-admin/actions/crm-leads';

export const dynamic = 'force-dynamic';

export default async function CRMPage() {
    // Busca os leads no banco de dados
    const leads = await getLeads();

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
                <CRMDashboardClient initialLeads={leads || []} />
            </div>
        </div>
    );
}
