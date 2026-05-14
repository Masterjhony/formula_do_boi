import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Global search across the operational entities of the admin.
// Returns categorized hits with id/title/subtitle/href/type for the spotlight UI.

export type SearchHit = {
    id: string;
    title: string;
    subtitle?: string;
    href: string;
    type: 'lead' | 'product' | 'leilao' | 'fechamento' | 'task' | 'breeder';
};

// Simple ilike pattern (Supabase escapes special chars internally).
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
        productsRes,
        leiloesRes,
        fechamentosRes,
        tasksRes,
        breedersRes,
    ] = await Promise.all([
        supabase
            .from('crm_leads')
            .select('id, nome, status, telefone, celular, instagram, cidade, estado, empresa')
            .or([
                `nome.ilike.${pattern}`,
                `telefone.ilike.${pattern}`,
                `celular.ilike.${pattern}`,
                `instagram.ilike.${pattern}`,
                `cidade.ilike.${pattern}`,
                `empresa.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),
        supabase
            .from('products')
            .select('id, name, registro, raca, category, classificacao')
            .or([
                `name.ilike.${pattern}`,
                `registro.ilike.${pattern}`,
                `raca.ilike.${pattern}`,
                `category.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),
        supabase
            .from('bula_leiloes')
            .select('id, nome, local, data, tipo')
            .or([
                `nome.ilike.${pattern}`,
                `local.ilike.${pattern}`,
                `tipo.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),
        supabase
            .from('bula_leilao_fechamento')
            .select('id, nome, data, local, vgv_total')
            .or([
                `nome.ilike.${pattern}`,
                `local.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),
        supabase
            .from('tactical_tasks')
            .select('id, title, status, priority, description')
            .or([
                `title.ilike.${pattern}`,
                `description.ilike.${pattern}`,
            ].join(','))
            .limit(PER_TYPE_LIMIT),
        supabase
            .from('breeders')
            .select('id, name, slug, is_partner')
            .or([
                `name.ilike.${pattern}`,
                `slug.ilike.${pattern}`,
            ].join(','))
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
            href: '/leads',
        });
    }

    type ProductRow = { id: string; name: string | null; registro: string | null; raca: string | null; category: string | null; classificacao: string | null };
    for (const p of (productsRes.data ?? []) as ProductRow[]) {
        const subtitleParts = [p.category, p.raca, p.registro].filter(Boolean);
        hits.push({
            id: `product-${p.id}`,
            type: 'product',
            title: p.name || '(sem nome)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: `/products/${p.id}`,
        });
    }

    type LeilaoRow = { id: string; nome: string | null; local: string | null; data: string | null; tipo: string | null };
    for (const a of (leiloesRes.data ?? []) as LeilaoRow[]) {
        const subtitleParts = [a.tipo, a.local, a.data].filter(Boolean);
        hits.push({
            id: `leilao-${a.id}`,
            type: 'leilao',
            title: a.nome || '(sem nome)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: '/leiloes',
        });
    }

    type FechamentoRow = { id: string; nome: string | null; data: string | null; local: string | null; vgv_total: number | null };
    for (const f of (fechamentosRes.data ?? []) as FechamentoRow[]) {
        const vgv = f.vgv_total
            ? f.vgv_total >= 1_000_000 ? `R$ ${(f.vgv_total / 1_000_000).toFixed(1)}M` : `R$ ${Math.round(f.vgv_total / 1_000)}k`
            : null;
        const subtitleParts = [f.data, f.local, vgv].filter(Boolean);
        hits.push({
            id: `fechamento-${f.id}`,
            type: 'fechamento',
            title: f.nome || '(sem nome)',
            subtitle: subtitleParts.join(' · ') || undefined,
            href: '/leiloes/fechamento',
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
            href: '/projetos',
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

    return NextResponse.json({ hits });
}
