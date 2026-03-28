import { getMarketingConfig, updateMarketingConfig } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

export async function GET() {
    const config = await getMarketingConfig()
    return NextResponse.json(config ?? { investimento: 0 })
}

export async function PUT(request: Request) {
    const { investimento } = await request.json()
    await updateMarketingConfig(Number(investimento))
    return NextResponse.json({ ok: true })
}
