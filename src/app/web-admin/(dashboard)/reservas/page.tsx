import { Suspense } from 'react';
import { getReservations, getReservaColumns } from '@/app/web-admin/actions/reservations';
import ReservasBoard from './ReservasBoard';

export const dynamic = 'force-dynamic';

export default async function ReservasPage() {
    const [initial, columns] = await Promise.all([
        getReservations(),
        getReservaColumns(),
    ]);

    return (
        <Suspense fallback={null}>
            <ReservasBoard initial={initial} initialColumns={columns} />
        </Suspense>
    );
}
