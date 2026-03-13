import { NextResponse } from 'next/server'
import { getWhatsAppService } from '@/lib/whatsapp'
import QRCode from 'qrcode'

export async function GET() {
  try {
    const { status, qr } = await getWhatsAppService()

    let qrImageStr = ''
    if (qr) {
      qrImageStr = await QRCode.toDataURL(qr)
    }

    return NextResponse.json({
      status,
      qr: qrImageStr,
    })
  } catch (error: any) {
    console.error('API /whatsapp/status error:', error)
    return NextResponse.json(
      { error: error.message || 'Error occurred retrieving WhatsApp status' },
      { status: 500 }
    )
  }
}
