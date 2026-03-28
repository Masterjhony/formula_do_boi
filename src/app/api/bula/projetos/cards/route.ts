import { getCards, createCard } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

export async function GET() {
    const cards = await getCards()
    return NextResponse.json(cards)
}

export async function POST(request: Request) {
    const body = await request.json()
    const card = await createCard(body)
    return NextResponse.json(card, { status: 201 })
}
