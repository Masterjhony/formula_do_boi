import { updateLead, getFunis, createDeal } from '@/lib/bula/queries'
import { NextResponse } from 'next/server'

// PATCH /api/bula/leads/[id]  — atualiza campos (status, interesse, orcamento, etc.)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json()
    await updateLead(id, body)
    return NextResponse.json({ ok: true })
}

// POST /api/bula/leads/[id]  — qualifica lead e cria deal no CRM
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { nome, telefone, regiao, rebanho, interesse, orcamento, score } = await request.json()

    // Marca lead como qualificado
    await updateLead(id, { status: 'qualificado', interesse, orcamento })

    // Encontra funil "clientes"
    const funis = await getFunis()
    const funilClientes = funis.find((f) => f.slug === 'clientes')
    if (!funilClientes) return NextResponse.json({ error: 'Funil clientes nao encontrado' }, { status: 404 })

    // Temperatura baseada no score
    const temperatura = score >= 70 ? 'quente' : score >= 40 ? 'morno' : 'frio'

    const deal = await createDeal({
        funil_id: funilClientes.id,
        etapa_id: 'lead',
        nome,
        localizacao: regiao,
        telefone,
        email: '',
        valor: orcamento,
        temperatura,
        assessor_id: null,
        notas: `Interesse: ${interesse}. Rebanho: ${rebanho} cabecas.`,
        timeline: [{ type: 'Nota', date: new Date().toLocaleDateString('pt-BR'), text: 'Lead qualificado pelo SDR.' }],
        dias_no_estagio: 0,
    })

    return NextResponse.json({ ok: true, deal })
}
