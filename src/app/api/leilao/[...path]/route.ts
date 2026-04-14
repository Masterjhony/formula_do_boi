import { NextRequest, NextResponse } from 'next/server'

const LEILAO_SERVER_URL = process.env.LEILAO_SERVER_URL || 'http://localhost:8000'

async function proxyRequest(request: NextRequest, path: string[]) {
  const endpoint = path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${LEILAO_SERVER_URL}/api/${endpoint}${searchParams ? `?${searchParams}` : ''}`

  try {
    const res = await fetch(url, {
      method: request.method,
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
      ...(request.method !== 'GET' && {
        headers: { 'Content-Type': 'application/json' },
        body: await request.text(),
      }),
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error(`API /leilao/${endpoint} error:`, error)
    return NextResponse.json(
      { error: 'Servidor de leilão indisponível', detail: error.message },
      { status: 503 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(request, path)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyRequest(request, path)
}
