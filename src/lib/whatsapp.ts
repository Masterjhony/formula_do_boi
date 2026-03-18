/**
 * Thin HTTP client for the dedicated WhatsApp server running on the VPS.
 * This file must NOT import Baileys — that library is Node.js-native and
 * cannot be bundled by Vercel/Next.js serverless functions.
 * All WhatsApp logic lives exclusively in whatsapp-server/whatsapp-server.js.
 */

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL || 'http://localhost:3001'

export async function sendWelcomeMessage(phone: string, name: string): Promise<boolean> {
  const res = await fetch(`${WHATSAPP_SERVER_URL}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`WhatsApp server error ${res.status}: ${text}`)
  }
  const data = await res.json()
  return data.sent !== false
}
