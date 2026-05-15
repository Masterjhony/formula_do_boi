import { createClient } from '@/utils/supabase/server';

export async function getIsAuthenticated(): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        return !!user;
    } catch {
        return false;
    }
}

export type AdminCheckResult =
    | { ok: true; userId: string }
    | { ok: false; status: 401 | 403; error: string };

export async function requireAdmin(): Promise<AdminCheckResult> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { ok: false, status: 401, error: 'Não autenticado.' };

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return { ok: false, status: 403, error: 'Acesso restrito a administradores.' };
        }

        return { ok: true, userId: user.id };
    } catch {
        return { ok: false, status: 401, error: 'Falha ao validar sessão.' };
    }
}

// ─── Política de Dados Financeiros ────────────────────────────────────────
// Hoje todos os assessores estão com profiles.role='admin' para conseguir
// usar o painel admin, então requireAdmin() não diferencia chefia × equipe.
//
// Esta whitelist define quem vê dados financeiros sensíveis (Faturamento Bula,
// Lucro Bruto, comissões pagas a outros assessores, acordos com criadores).
// Decisão do chefe em 2026-05-15: "Não quero que os assessores vejam o
// faturamento da Bula Assessoria — deixa só no ERP". O painel admin segue
// mostrando o operacional (cobertura, VGV vendido por assessor), mas oculta
// o financeiro que só interessa à diretoria.
const FINANCE_ADMIN_EMAILS = new Set([
    'formuladoboi@gmail.com',
]);

/**
 * Retorna true quando o usuário logado tem permissão para ver dados
 * financeiros sensíveis no painel admin. Use em server components/actions
 * para condicionar a renderização ou filtrar payloads antes de mandar
 * pro client.
 */
export async function getIsFinanceAdmin(): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return false;
        return FINANCE_ADMIN_EMAILS.has(user.email.toLowerCase());
    } catch {
        return false;
    }
}
