'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import {
    ProductReservation,
    HistoryEvent,
    makeCode,
} from '@/lib/reservations';

function hydrate(row: any): ProductReservation {
    return {
        ...row,
        code: makeCode(row.seq),
        checklist:   Array.isArray(row.checklist)   ? row.checklist   : [],
        attachments: Array.isArray(row.attachments) ? row.attachments : [],
        history:     Array.isArray(row.history)     ? row.history     : [],
    } as ProductReservation;
}

export async function getReservations(): Promise<ProductReservation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('product_reservations')
        .select('*')
        .is('archived_at', null)
        .order('status', { ascending: true })
        .order('position', { ascending: true });

    if (error) {
        console.error('[reservations] list error', error);
        return [];
    }
    return (data ?? []).map(hydrate);
}

export async function getArchivedReservations(): Promise<ProductReservation[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('product_reservations')
        .select('*')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false })
        .limit(200);

    if (error) {
        console.error('[reservations] archived error', error);
        return [];
    }
    return (data ?? []).map(hydrate);
}

export async function getReservation(id: string): Promise<ProductReservation | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('product_reservations')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;
    return hydrate(data);
}

export async function moveReservation(id: string, newStatus: string, newPosition: number) {
    const supabase = await createClient();

    // Lê status atual pra registrar evento
    const { data: current } = await supabase
        .from('product_reservations')
        .select('status, history')
        .eq('id', id)
        .single();

    const history: HistoryEvent[] = Array.isArray(current?.history) ? current!.history : [];
    if (current?.status !== newStatus) {
        history.push({
            at: new Date().toISOString(),
            kind: 'status',
            from: current?.status ?? null,
            to: newStatus,
        });
    }

    const { error } = await supabase
        .from('product_reservations')
        .update({ status: newStatus, position: newPosition, history })
        .eq('id', id);

    if (error) {
        console.error('[reservations] move error', error);
        throw new Error('Falha ao mover reserva.');
    }
    revalidatePath('/web-admin/reservas');
}

export async function updateReservation(id: string, updates: Partial<ProductReservation>) {
    const supabase = await createClient();

    // Bloqueia campos auto-gerenciados
    const {
        id: _id, seq: _seq, code: _code, created_at: _ca,
        ...safe
    } = updates as any;

    const { data, error } = await supabase
        .from('product_reservations')
        .update(safe)
        .eq('id', id)
        .select('*')
        .single();

    if (error || !data) {
        console.error('[reservations] update error', error);
        throw new Error('Falha ao atualizar reserva.');
    }
    revalidatePath('/web-admin/reservas');
    return hydrate(data);
}

export async function appendHistory(id: string, event: Omit<HistoryEvent, 'at'> & { at?: string }) {
    const supabase = await createClient();
    const { data: current } = await supabase
        .from('product_reservations')
        .select('history')
        .eq('id', id)
        .single();

    const history: HistoryEvent[] = Array.isArray(current?.history) ? current!.history : [];
    history.push({ at: event.at ?? new Date().toISOString(), ...event } as HistoryEvent);

    const { error } = await supabase
        .from('product_reservations')
        .update({ history })
        .eq('id', id);

    if (error) {
        console.error('[reservations] history error', error);
        throw new Error('Falha ao registrar evento.');
    }
    revalidatePath('/web-admin/reservas');
}

export async function archiveReservation(id: string) {
    const supabase = await createClient();
    const { data: current } = await supabase
        .from('product_reservations')
        .select('history')
        .eq('id', id)
        .single();

    const history: HistoryEvent[] = Array.isArray(current?.history) ? current!.history : [];
    history.push({ at: new Date().toISOString(), kind: 'archive' });

    const { error } = await supabase
        .from('product_reservations')
        .update({ archived_at: new Date().toISOString(), history })
        .eq('id', id);

    if (error) {
        console.error('[reservations] archive error', error);
        throw new Error('Falha ao arquivar reserva.');
    }
    revalidatePath('/web-admin/reservas');
}

export async function unarchiveReservation(id: string) {
    const supabase = await createClient();
    const { data: current } = await supabase
        .from('product_reservations')
        .select('history')
        .eq('id', id)
        .single();

    const history: HistoryEvent[] = Array.isArray(current?.history) ? current!.history : [];
    history.push({ at: new Date().toISOString(), kind: 'unarchive' });

    const { error } = await supabase
        .from('product_reservations')
        .update({ archived_at: null, history })
        .eq('id', id);

    if (error) {
        console.error('[reservations] unarchive error', error);
        throw new Error('Falha ao desarquivar reserva.');
    }
    revalidatePath('/web-admin/reservas');
}

export async function deleteReservation(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('product_reservations')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('[reservations] delete error', error);
        throw new Error('Falha ao excluir reserva.');
    }
    revalidatePath('/web-admin/reservas');
}

export async function createManualReservation(
    input: Partial<ProductReservation> & {
        product_name: string;
        product_kind: 'semen' | 'embriao';
        customer_name: string;
        customer_phone: string;
        quantity: number;
    },
): Promise<ProductReservation> {
    const supabase = await createClient();

    const { data: minPos } = await supabase
        .from('product_reservations')
        .select('position')
        .eq('status', 'nova')
        .order('position', { ascending: true })
        .limit(1);

    const position = (minPos?.[0]?.position ?? 1000) - 1000;

    const initialHistory: HistoryEvent[] = [
        { at: new Date().toISOString(), kind: 'created', text: 'Reserva criada manualmente.' },
    ];

    const insertRow: any = {
        product_id: input.product_id ?? null,
        product_name: input.product_name,
        product_category: input.product_category ?? (input.product_kind === 'semen' ? 'Sêmen' : 'Embrião'),
        product_kind: input.product_kind,
        central: input.central ?? null,

        customer_name: input.customer_name,
        customer_phone: String(input.customer_phone).replace(/\D/g, ''),
        customer_email: input.customer_email ?? null,
        customer_doc: input.customer_doc ?? null,
        customer_fazenda: input.customer_fazenda ?? null,
        customer_city: input.customer_city ?? null,
        customer_uf: input.customer_uf ?? null,

        quantity: input.quantity,
        unit_price: input.unit_price ?? null,
        total_value: input.total_value ?? null,
        payment_method: input.payment_method ?? null,
        payment_status: 'pendente',

        status: 'nova',
        position,
        priority: input.priority ?? 'normal',
        origin: 'manual',

        notes: input.notes ?? null,
        history: initialHistory,
    };

    const { data, error } = await supabase
        .from('product_reservations')
        .insert(insertRow)
        .select('*')
        .single();

    if (error || !data) {
        console.error('[reservations] create error', error);
        throw new Error('Falha ao criar reserva.');
    }
    revalidatePath('/web-admin/reservas');
    return hydrate(data);
}
