import { getCards, createCard } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

export async function GET() {
    const cards = await getCards()
    return NextResponse.json(cards)
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const card = await createCard(body)
        return NextResponse.json(card, { status: 201 })
    } catch (e) {
        console.error('POST /api/bula/projetos/cards error:', e)
        return NextResponse.json({ error: 'Falha ao criar card' }, { status: 500 })
    }
}
