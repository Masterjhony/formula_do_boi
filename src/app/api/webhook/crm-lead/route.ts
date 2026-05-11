import { NextResponse } from 'next/server'
import { dispatchWelcome } from '@/lib/whatsapp'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log('[Webhook] Received CRM Lead:', body)

    const record = body.record || body
    const phone = record.telefone || record.phone
    const name = record.nome || record.name || 'Amigo(a)'

    if (!phone) {
       console.log('[Webhook] No phone number provided in CRM Lead')
       return NextResponse.json({ error: 'No phone number provided' }, { status: 400 })
    }

    const result = await dispatchWelcome(phone, name, 'webhook-crm', { lead_id: record.id ?? null })
    return NextResponse.json({ success: result.sent || !!result.queued, ...result })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[Webhook] Route Error:', msg)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
