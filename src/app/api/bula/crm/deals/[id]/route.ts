import { updateDeal, deleteDeal } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    await updateDeal(id, body)
    return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    await deleteDeal(id)
    return NextResponse.json({ ok: true })
}
