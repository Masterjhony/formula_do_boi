import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export function GET() {
    const html = readFileSync(
        join(process.cwd(), 'public', 'atacante-matinha', 'obrigado.html'),
        'utf-8'
    )
    return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
}
