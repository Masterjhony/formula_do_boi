/**
 * Link curto público de agendamento — `formuladoboi.com/agendar`
 *
 * Existe pra que mensagens institucionais (WhatsApp, e-mail, redes) entreguem
 * um link com o domínio da Fórmula do Boi em vez do slug interno do Calendly
 * (`calendly.com/joaoeduardo-lp1/...`), que é o usuário pessoal que conectou
 * a conta gratuita do Calendly. Trocar o destino agora é uma alteração de
 * setting (`site_settings.agendamentos_calendar.calendly_event_url`), sem
 * precisar reescrever template ou mensagem.
 *
 * Implementação:
 *   - GET /agendar       → 302 pro Calendly
 *   - Query string (?lead=<id>, ?utm_*=...) é preservada como `utm_*` no
 *     Calendly. O Calendly Free não recebe parâmetros customizados além de
 *     `utm_*`, então o que sobrar é descartado pelo destino.
 *   - Cache desligado (`no-store`): a setting pode mudar e queremos efeito
 *     imediato.
 *   - Fallback: se o setting estiver vazio (ambiente recém-clonado), cai pra
 *     URL canônica usada hoje (`calendly.com/joaoeduardo-lp1/contato-cliente`)
 *     em vez de devolver 404, pra link público nunca quebrar.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FALLBACK_URL = 'https://calendly.com/joaoeduardo-lp1/contato-cliente'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    let target = FALLBACK_URL
    try {
        const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'agendamentos_calendar')
            .maybeSingle()
        const url = (data?.value as { calendly_event_url?: string } | null)?.calendly_event_url
        if (url && /^https?:\/\//i.test(url)) target = url
    } catch (err) {
        console.warn('[agendar] settings lookup falhou, usando fallback:', err instanceof Error ? err.message : err)
    }

    // Forward UTM params (e quaisquer outros) pro Calendly — preserva tracking
    // se a URL veio com ?utm_source=... do canal de origem.
    const incoming = req.nextUrl.searchParams
    if ([...incoming.keys()].length > 0) {
        const dest = new URL(target)
        for (const [k, v] of incoming) {
            if (!dest.searchParams.has(k)) dest.searchParams.set(k, v)
        }
        target = dest.toString()
    }

    return NextResponse.redirect(target, {
        status: 302,
        headers: { 'Cache-Control': 'no-store' },
    })
}
