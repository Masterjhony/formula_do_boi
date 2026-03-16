import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  AuthenticationState,
  initAuthCreds,
  BufferJSON,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: We need a service role key to bypass RLS since this runs on the server
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // ensure this is added to .env.local

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Global state to prevent hot-reloads in dev from creating multiple connections
let socketInstance: ReturnType<typeof makeWASocket> | null = null
let currentQr: string | null = null
let currentStatus: 'disconnected' | 'connecting' | 'connected' | 'qr' = 'disconnected'

/**
 * Custom Auth State Adapter for Supabase
 */
async function useSupabaseAuthState(): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  // Helper to read data from Supabase
  const readData = async (type: string, id: string) => {
    const key = `${type}-${id}`
    const { data } = await supabase
      .from('whatsapp_auth')
      .select('data')
      .eq('id', key)
      .single()

    if (data && data.data) {
      return JSON.parse(JSON.stringify(data.data), BufferJSON.reviver)
    }
    return null
  }

  // Helper to write data to Supabase
  const writeData = async (data: any, type: string, id: string) => {
    const key = `${type}-${id}`
    await supabase.from('whatsapp_auth').upsert({
      id: key,
      data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)),
    })
  }

  // Helper to delete data from Supabase
  const removeData = async (type: string, id: string) => {
    const key = `${type}-${id}`
    await supabase.from('whatsapp_auth').delete().eq('id', key)
  }

  // Fetch initial creds or create new ones
  let creds = await readData('creds', 'base')
  if (!creds) {
    creds = initAuthCreds()
    await writeData(creds, 'creds', 'base')
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data: { [key: string]: any } = {}
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(type, id)
              if (type === 'app-state-sync-key' && value) {
                value = typeof value === 'string' ? Buffer.from(value, 'base64') : Buffer.from(value)
              }
              data[id] = value
            })
          )
          return data
        },
        set: async (data) => {
          const tasks: Promise<void>[] = []
          for (const category in data) {
            for (const id in data[category as keyof typeof data]) {
              const value = data[category as keyof typeof data]![id]
              const type = category
              if (value) {
                tasks.push(writeData(value, type, id))
              } else {
                tasks.push(removeData(type, id))
              }
            }
          }
          await Promise.all(tasks)
        },
      },
    },
    saveCreds: () => writeData(creds, 'creds', 'base'),
  }
}

export async function getWhatsAppService() {
  if (socketInstance) {
    return { socket: socketInstance, qr: currentQr, status: currentStatus }
  }

  try {
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`[WhatsApp] using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const { state, saveCreds } = await useSupabaseAuthState()

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }) as any,
      printQRInTerminal: false,
      auth: state,
    })

    socketInstance = sock

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        currentQr = qr
        currentStatus = 'qr'
        console.log('[WhatsApp] QR code generated, waiting for scan...')
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut

        if (shouldReconnect) {
          console.log('[WhatsApp] Connection closed due to error, reconnecting...')
          socketInstance = null
          currentStatus = 'connecting'
          // We don't auto reconnect here in serverless, the next API call will do it
        } else {
          console.log('[WhatsApp] Logged out from WhatsApp.')
          socketInstance = null
          currentQr = null
          currentStatus = 'disconnected'
          // Optionally, clean up Supabase keys here if logged out
        }
      } else if (connection === 'open') {
        console.log('[WhatsApp] Opened connection successfully!')
        currentQr = null
        currentStatus = 'connected'
      }
    })

    return { socket: sock, qr: currentQr, status: currentStatus }
  } catch (error) {
    console.error('[WhatsApp] Error starting socket:', error)
    return { socket: null, qr: null, status: 'disconnected', error }
  }
}

/**
 * Helper to wait for the connection to be established
 */
export async function waitForConnection(timeoutMs = 15000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const { status } = await getWhatsAppService()
    if (status === 'connected') return true
    if (status === 'qr') return false // Needs scanning, cannot connect automatically
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return false
}

/**
 * Format a Brazilian phone number to standard format
 */
function formatBRNumber(phone: string) {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('55')) {
    cleaned = cleaned.substring(2)
  }

  // Basic validation, length should be 10 (fixed line) or 11 (mobile)
  if (cleaned.length < 10 || cleaned.length > 11) return null

  // Ensure it's a mobile number (starts with 9 after DDD)
  if (cleaned.length === 11 && cleaned[2] !== '9') return null

  // Baileys requires @s.whatsapp.net suffix
  return `55${cleaned}@s.whatsapp.net`
}

export async function sendWelcomeMessage(phone: string, name: string) {
  const formattedPhone = formatBRNumber(phone)
  if (!formattedPhone) {
    throw new Error(`Invalid phone number: ${phone}`)
  }

  const { socket, status } = await getWhatsAppService()

  if (status !== 'connected' || !socket) {
    console.log('[WhatsApp] Service not connected, waiting for connection...')
    const connected = await waitForConnection()
    if (!connected) {
      throw new Error('WhatsApp service not connected after waiting')
    }
  }

  // Get socket again after potentially waiting
  const svc = await getWhatsAppService()
  const activeSocket = svc.socket

  if (!activeSocket) {
      throw new Error('WhatsApp service not connected')
  }

  const messageText = `Olá ${name}! Seja bem vindo(a)! 🎉\n\nGostaríamos de te apresentar a **Fórmula do Boi**!\n\nAcesse nosso Marketplace e confira nossas ofertas exclusivas clicando no link abaixo:\n👉 https://app.formuladoboi.com`

  try {
    const result = await activeSocket.onWhatsApp(formattedPhone)

    if (result && result.length > 0 && result[0].exists) {
      await activeSocket.sendMessage(formattedPhone, { text: messageText })
      console.log(`[WhatsApp] Welcome message sent to ${formattedPhone}`)
      return true
    } else {
      console.log(`[WhatsApp] Number ${formattedPhone} is not registered on WhatsApp.`)
      return false
    }
  } catch (error) {
    console.error(`[WhatsApp] Failed to send message to ${formattedPhone}`, error)
    throw error
  }
}
