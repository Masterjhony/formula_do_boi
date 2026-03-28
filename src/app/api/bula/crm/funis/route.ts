import { getFunis } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

export async function GET() {
    const funis = await getFunis()
    return NextResponse.json(funis)
}
