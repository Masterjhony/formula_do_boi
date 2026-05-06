import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  // Fechamentos
  let fq = supabase
    .from('bula_leilao_fechamento')
    .select('id, nome, data, local, lotes_ofertados, lotes_vendidos, animais_vendidos, vgv_total, ticket_medio, maior_lance, compradores_unicos, estados_alcancados, por_assessor, por_estado, compradores, lances, comissao_assessoria, receita_bula, sobra_bruta, observacoes')
    .order('data', { ascending: false })
  if (from) fq = fq.gte('data', from)
  if (to) fq = fq.lte('data', to)
  const { data: fechamentos, error: fErr } = await fq
  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 500 })

  // Cronograma
  let cq = supabase
    .from('cronograma_leiloes')
    .select('id, data, dia_semana, hora, nome, criador, presencial, leiloeira, raca, qtd_animais, sexo, comissao, contrato, faturamento_previsto, faturamento_realizado, venda_bula, comissao_receber, recebido')
    .order('data', { ascending: true })
  if (from) cq = cq.gte('data', from)
  if (to) cq = cq.lte('data', to)
  const { data: cronograma, error: cErr } = await cq
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 })

  // Leads (sem filtro de data — usa created_at quando aplicável)
  let lq = supabase
    .from('crm_leads')
    .select('id, nome, status, prioridade, interesse, source, medium, campaign, origem, stage, valor_estimado, probabilidade, created_at, data_estimada_fechamento, estado, cidade')
    .order('created_at', { ascending: false })
  if (from) lq = lq.gte('created_at', from)
  if (to) lq = lq.lte('created_at', to + 'T23:59:59')
  const { data: leads, error: lErr } = await lq
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 })

  return NextResponse.json({
    fechamentos: fechamentos ?? [],
    cronograma: cronograma ?? [],
    leads: leads ?? [],
    range: { from: from ?? null, to: to ?? null },
  })
}
