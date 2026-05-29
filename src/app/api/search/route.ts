import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Busca global do painel admin.
//
// Regra: só devolve registros ATIVOS / OPERACIONAIS / VISÍVEIS.
// Nunca devolve arquivados, perdidos, cancelados ou registros do catálogo
// legado (touros/matrizes do antigo shopping de Nelore que não aparecem
// mais no fluxo operacional atual).
//
// Lotes (Touros Doadores / Doadoras) seguem exatamente o mesmo filtro de
// categoria das páginas /web-admin/lotes-touros e /web-admin/lotes-doadoras
// — qualquer outro produto da tabela `products` (matriz à venda, touro do
// catálogo antigo etc.) NÃO entra na busca.
//
// Ordem reflete o modelo atual:
//   1. Cliente (CRM)
//   2. Reserva (sêmen / embrião)
//   3. Agenda
//   4. Tarefa / projeto
//   5. Contrato
//   6. Criador
//   7. Touro doador (lote de sêmen)
//   8. Doadora (lote de embrião)

export type HitType =
    | 'lead'
    | 'reservation'
    | 'agenda'
    | 'task'
    | 'contract'
    | 'breeder'
    | 'lote_touro'
    | 'lote_doadora';

export type SearchHit = {
    id: string;
    title: string;
    subtitle?: string;
    href: string;
    type: HitType;
};

const PER_TYPE_LIMIT = 5;

export async function GET(req: NextRequest) {
    const q = (req.nextUrl.searchParams.get('q') ?? '').trim();
    if (q.length < 2) {
        return NextResponse.json({ hits: [] as SearchHit[] });
    }

    const pattern = `%${q}%`;
    const supabase = await createClient();

    const [
        leadsRes,
        reservationsRes,
        agendaRes,
        tasksRes,
        contractsRes,
        breedersRes,
        lotesTourosRes,
        lotesDoadorasRes,
    ] = await Promise.all([
        // Clientes (CRM) — só leads operacionais. Exclui "Perdido" (descartados).
        supabase
            .from('crm_leads')
            .select('id, nome, status, telefone, celular, instagram, cidade, estado, empresa')
            .neq('status', 'Perdido')
            .or([
                `nome.ilike.${pattern}`,
                `telefone.ilike.${pattern}`,
                `celular.ilike.${pattern}`,
                `instagram.ilike.${pattern}`,
                `cidade.ilike.${pattern}`,
                `empresa.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),

        // Reservas de sêmen/embrião — só não-arquivadas.
        supabase
            .from('product_reservations')
            .select('id, seq, product_name, product_kind, customer_name, customer_phone, customer_city, customer_uf, status')
            .is('archived_at', null)
            .or([
                `product_name.ilike.${pattern}`,
                `customer_name.ilike.${pattern}`,
                `customer_phone.ilike.${pattern}`,
                `customer_email.ilike.${pattern}`,
                `customer_fazenda.ilike.${pattern}`,
                `customer_city.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),

        // Agenda — exclui eventos cancelados.
        supabase
            .from('agenda_events')
            .select('id, title, event_type, status, start_at, location')
            .neq('status', 'cancelado')
            .or([
                `title.ilike.${pattern}`,
                `description.ilike.${pattern}`,
                `location.ilike.${pattern}`,
            ].join(','))
            .order('start_at', { ascending: false })
            .limit(PER_TYPE_LIMIT),

        // Tarefas — só não-arquivadas.
        supabase
            .from('tactical_tasks')
            .select('id, title, status, priority, description')
            .is('archived_at', null)
            .or([
                `title.ilike.${pattern}`,
                `description.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),

        // Contratos — exclui Cancelado.
        supabase
            .from('tactical_contracts')
            .select('id, title, client_name, status, value')
            .neq('status', 'Cancelado')
            .or([
                `title.ilike.${pattern}`,
                `client_name.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),

        // Criadores — registry sem flag de arquivamento; mantém todos.
        supabase
            .from('breeders')
            .select('id, name, slug, is_partner')
            .or([
                `name.ilike.${pattern}`,
                `slug.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),

        // Lotes Touros (sêmen) — mesmo filtro de
        // [src/app/web-admin/(dashboard)/lotes-touros/page.tsx:11].
        supabase
            .from('products')
            .select('id, name, registro, raca, category')
            .ilike('category', '%Sêmen%')
            .or([
                `name.ilike.${pattern}`,
                `registro.ilike.${pattern}`,
                `raca.ilike.${pattern}`,
            ].join(','))
            .order('display_order', { ascending: false })
            .limit(PER_TYPE_LIMIT),

        // Lotes Doadoras (embrião) — mesmo filtro de
        // [src/app/web-admin/(dashboard)/lotes-doadoras/page.tsx:11].
        supabase
            .from('products')
            .select('id, name, registro, raca, category')
            .or('category.ilike.%Embrião%,category.ilike.%Embriao%,category.ilike.%DOADORA%,category.ilike.%Doadora%')
            .or([
                `name.ilike.${pattern}`,
                `registro.ilike.${pattern}`,
                `raca.ilike.${pattern}`,
            ].join(','))
            .order('display_order', { ascending: false })
            .limit(PER_TYPE_LIMIT),
    ]);

    const hits: SearchHit[] = [];

    type LeadRow = { id: string; nome: string | null; status: string | null; telefone: string | null; celular: string | null; instagram: string | null; cidade: string | null; estado: string | null; empresa: string | null };
    for (const l of (leadsRes.data ?? []) as LeadRow[]) {
        const subtitleParts = [l.status, l.cidade, l.estado, l.empresa].filter(Boolean);
        hits.push({
            id: `lead-${l.id}`,
            type: 'lead',
            title: l.nome || '(sem nome)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: `/crm?lead=${l.id}`,
        });
    }

    type ReservationRow = { id: string; seq: number; product_name: string; product_kind: string; customer_name: string; customer_phone: string; customer_city: string | null; customer_uf: string | null; status: string };
    for (const r of (reservationsRes.data ?? []) as ReservationRow[]) {
        const code = `RSV-${String(r.seq).padStart(4, '0')}`;
        const kindLabel = r.product_kind === 'embriao' ? 'Embrião' : 'Sêmen';
        const place = [r.customer_city, r.customer_uf].filter(Boolean).join('/');
        const subtitleParts = [code, kindLabel, r.customer_name, place].filter(Boolean);
        hits.push({
            id: `reservation-${r.id}`,
            type: 'reservation',
            title: r.product_name || '(sem produto)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: `/reservas?id=${r.id}`,
        });
    }

    type AgendaRow = { id: string; title: string; event_type: string | null; status: string | null; start_at: string | null; location: string | null };
    for (const a of (agendaRes.data ?? []) as AgendaRow[]) {
        const date = a.start_at ? new Date(a.start_at).toLocaleDateString('pt-BR') : null;
        const subtitleParts = [a.event_type, date, a.location, a.status].filter(Boolean);
        hits.push({
            id: `agenda-${a.id}`,
            type: 'agenda',
            title: a.title || '(sem título)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: `/agenda?event=${a.id}`,
        });
    }

    type TaskRow = { id: string; title: string | null; status: string | null; priority: string | null; description: string | null };
    for (const t of (tasksRes.data ?? []) as TaskRow[]) {
        const subtitleParts = [t.status, t.priority].filter(Boolean);
        hits.push({
            id: `task-${t.id}`,
            type: 'task',
            title: t.title || '(sem título)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: `/projetos?task=${t.id}`,
        });
    }

    type ContractRow = { id: string; title: string; client_name: string; status: string | null; value: number | null };
    for (const c of (contractsRes.data ?? []) as ContractRow[]) {
        const valor = c.value
            ? c.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : null;
        const subtitleParts = [c.client_name, c.status, valor].filter(Boolean);
        hits.push({
            id: `contract-${c.id}`,
            type: 'contract',
            title: c.title || '(sem título)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: '/contratos',
        });
    }

    type BreederRow = { id: string; name: string | null; slug: string | null; is_partner: boolean | null };
    for (const b of (breedersRes.data ?? []) as BreederRow[]) {
        hits.push({
            id: `breeder-${b.id}`,
            type: 'breeder',
            title: b.name || '(sem nome)',
            subtitle: b.is_partner ? 'Parceiro · ' + (b.slug ?? '') : (b.slug ?? undefined),
            href: '/breeders',
        });
    }

    type LoteRow = { id: number | string; name: string | null; registro: string | null; raca: string | null; category: string | null };
    for (const t of (lotesTourosRes.data ?? []) as LoteRow[]) {
        const subtitleParts = ['Touro doador', t.raca, t.registro].filter(Boolean);
        hits.push({
            id: `lote-touro-${t.id}`,
            type: 'lote_touro',
            title: t.name || '(sem nome)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: `/products/${t.id}`,
        });
    }

    for (const d of (lotesDoadorasRes.data ?? []) as LoteRow[]) {
        const subtitleParts = ['Doadora', d.raca, d.registro].filter(Boolean);
        hits.push({
            id: `lote-doadora-${d.id}`,
            type: 'lote_doadora',
            title: d.name || '(sem nome)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: `/products/${d.id}`,
        });
    }

    return NextResponse.json({ hits });
}
