import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

/**
 * POST /api/admin/normalize-checklist-assignees
 *
 * Manutenção one-shot: vasculha todos os checklists de `tactical_tasks` e,
 * quando um item tem um prefixo `[Nome]` no título mas o campo `assignee`
 * está vazio, move o nome para `assignee` (validando contra a tabela
 * `tactical_members`) e remove o prefixo do título. Idempotente.
 *
 * Body opcional: `{ dryRun?: boolean }` — quando true, calcula mas não escreve.
 *
 * Resposta: { tasksScanned, tasksUpdated, itemsUpdated, changes }
 */

type ChecklistItem = {
    id: string;
    title: string;
    completed: boolean;
    assignee?: string | null;
    due_date?: string | null;
};

type TaskRow = {
    id: string;
    title: string;
    checklists: ChecklistItem[] | null;
};

type Change = {
    taskId: string;
    taskTitle: string;
    item: { id: string; from: string; to: string; assignee: string };
};

const BRACKET_RE = /^\s*\[([^\]]+)\]\s*[-–—:]?\s*/;

function normalize(s: string): string {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    let dryRun = false;
    try {
        const body = await request.json().catch(() => ({}));
        dryRun = Boolean(body?.dryRun);
    } catch { /* no body, ok */ }

    const supabase = await createClient();

    // 1. Members → dicionário { normalized → canonical name }
    const { data: members, error: mErr } = await supabase
        .from('tactical_members')
        .select('name');
    if (mErr) {
        return NextResponse.json({ error: 'Falha ao carregar membros: ' + mErr.message }, { status: 500 });
    }
    const memberDict = new Map<string, string>();
    for (const m of (members ?? [])) {
        if (m?.name) memberDict.set(normalize(m.name), m.name);
    }
    if (memberDict.size === 0) {
        return NextResponse.json({
            tasksScanned: 0, tasksUpdated: 0, itemsUpdated: 0, changes: [],
            warning: 'Nenhum membro cadastrado em tactical_members — nada a fazer.',
        });
    }

    // 2. Tasks com checklists
    const { data: tasks, error: tErr } = await supabase
        .from('tactical_tasks')
        .select('id, title, checklists')
        .not('checklists', 'is', null);
    if (tErr) {
        return NextResponse.json({ error: 'Falha ao carregar tarefas: ' + tErr.message }, { status: 500 });
    }

    const changes: Change[] = [];
    let tasksUpdated = 0;
    let itemsUpdated = 0;

    for (const task of (tasks ?? []) as TaskRow[]) {
        const list = Array.isArray(task.checklists) ? task.checklists : [];
        if (list.length === 0) continue;

        let dirty = false;
        const next = list.map((item) => {
            // Só normaliza se o campo assignee estiver vazio
            const hasAssignee = item.assignee && String(item.assignee).trim().length > 0;
            if (hasAssignee) return item;

            const m = BRACKET_RE.exec(item.title || '');
            if (!m) return item;

            const captured = m[1].trim();
            const canonical = memberDict.get(normalize(captured));
            if (!canonical) return item; // nome não bate com nenhum membro — não toca

            const newTitle = (item.title || '').replace(BRACKET_RE, '').trim();
            changes.push({
                taskId: task.id,
                taskTitle: task.title,
                item: { id: item.id, from: item.title, to: newTitle, assignee: canonical },
            });
            dirty = true;
            itemsUpdated++;
            return { ...item, title: newTitle, assignee: canonical };
        });

        if (dirty) {
            tasksUpdated++;
            if (!dryRun) {
                const { error: upErr } = await supabase
                    .from('tactical_tasks')
                    .update({ checklists: next })
                    .eq('id', task.id);
                if (upErr) {
                    return NextResponse.json({
                        error: `Falha ao atualizar task ${task.id}: ${upErr.message}`,
                        tasksScanned: (tasks ?? []).length, tasksUpdated, itemsUpdated, changes,
                    }, { status: 500 });
                }
            }
        }
    }

    if (!dryRun && tasksUpdated > 0) {
        revalidatePath('/web-admin/tactical-plan');
        revalidatePath('/web-admin/tactical-plan/relatorios');
    }

    return NextResponse.json({
        dryRun,
        tasksScanned: (tasks ?? []).length,
        tasksUpdated,
        itemsUpdated,
        changes: changes.slice(0, 50), // amostra
        truncated: changes.length > 50,
        totalChanges: changes.length,
    });
}
