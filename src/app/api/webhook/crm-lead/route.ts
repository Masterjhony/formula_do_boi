import { NextResponse } from 'next/server'
import { sendWelcomeMessage } from '@/lib/whatsapp'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    console.log('[Webhook] Received CRM Lead:', body)

    // Expected Supabase Realtime/Webhook payload structure
    const record = body.record || body // In case it's sent directly or via webhook

    const phone = record.telefone || record.phone
    const name = record.nome || record.name || 'Amigo(a)'

    if (!phone) {
       console.log('[Webhook] No phone number provided in CRM Lead')
       return NextResponse.json({ error: 'No phone number provided' }, { status: 400 })
    }

    try {
      await sendWelcomeMessage(phone, name)
      return NextResponse.json({ success: true, message: 'Welcome message sent' })
    } catch (whatsappError: any) {
      console.error('[Webhook] WhatsApp Error:', whatsappError)
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: whatsappError.message },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('[Webhook] Route Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
