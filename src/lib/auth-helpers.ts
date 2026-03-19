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
