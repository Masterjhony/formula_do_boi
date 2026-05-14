import { Suspense } from 'react';
import { getReservations } from '@/app/web-admin/actions/reservations';
import ReservasBoard from './ReservasBoard';

export const dynamic = 'force-dynamic';

export default async function ReservasPage() {
    const initial = await getReservations();

    return (
        <Suspense fallback={null}>
            <ReservasBoard initial={initial} />
        </Suspense>
    );
}
