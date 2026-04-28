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
