import { getMembros } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

export async function GET() {
    const membros = await getMembros()
    return NextResponse.json(membros)
}
