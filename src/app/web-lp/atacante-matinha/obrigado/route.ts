import { readFileSync } from 'fs'
import { join } from 'path'
import { injectPosthogIntoHtml } from '@/lib/posthog-snippet'

export const dynamic = 'force-dynamic'

export function GET() {
    const raw = readFileSync(
        join(process.cwd(), 'public', 'atacante-matinha', 'obrigado.html'),
        'utf-8'
    )
    return new Response(injectPosthogIntoHtml(raw), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
}
