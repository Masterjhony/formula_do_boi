import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { injectPosthogIntoHtml } from '@/lib/posthog-snippet';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    return createClient(url, serviceKey);
}

export async function GET(_request: NextRequest) {
    const htmlPath = path.join(process.cwd(), 'public', 'lp', 'obrigado.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    let waGroupLink = 'https://chat.whatsapp.com/JYxJPWfkoHHLZfosHlywN9?mode=gi_t';
    try {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'whatsapp_group_link')
            .single();
        if (data?.value) {
            waGroupLink = typeof data.value === 'string'
                ? data.value
                : (data.value as Record<string, string>).url || waGroupLink;
        }
    } catch {
        // fallback silently
    }

    html = html.replaceAll('__WHATSAPP_GROUP_LINK__', waGroupLink);
    html = injectPosthogIntoHtml(html);

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}
