import { CRMDashboardClient } from '@/components/admin/crm/CRMDashboardClient';
import { getLeads } from '@/app/web-admin/actions/crm-leads';
import { getCRMConfig } from '@/app/web-admin/actions/crm-config';

export const dynamic = 'force-dynamic';

export default async function CRMPage() {
    const [leads, crmConfig] = await Promise.all([
        getLeads(),
        getCRMConfig(),
    ]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
                <CRMDashboardClient initialLeads={leads || []} crmConfig={crmConfig} />
            </div>
        </div>
    );
}
