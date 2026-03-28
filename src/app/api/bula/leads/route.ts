import { getLeads, createLead } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

export async function GET() {
    const leads = await getLeads()
    return NextResponse.json(leads)
}

export async function POST(request: Request) {
    const body = await request.json()
    const lead = await createLead(body)
    return NextResponse.json(lead, { status: 201 })
}
