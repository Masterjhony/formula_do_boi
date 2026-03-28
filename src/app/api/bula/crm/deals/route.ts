import { createDeal } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()
    const deal = await createDeal(body)
    return NextResponse.json(deal, { status: 201 })
}
