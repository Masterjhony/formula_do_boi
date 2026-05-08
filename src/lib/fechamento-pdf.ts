// ============================================================
// Gerador de PDF de Fechamento de Leilão — Brandbook Fórmula do Boi V1.0
//
// Cores (PMS / RGB):
//   Bronze       #A0792E (160, 121,  46)   — primária
//   Bronze 700   #6B4F1E (107,  79,  30)
//   Bronze 300   #D4A85C (212, 168,  92)
//   Bronze 100   #E8CB85 (232, 203, 133)
//   Preto Nelore #000000
//   Tech Green   #7FD4A0 (positivo / receita)
//
// Tipografia: helvetica (Space Grotesk proxy) + courier (JetBrains Mono proxy)
//
// Estrutura: capa preta · síntese · por assessor · por estado · compradores
//            · lances · footer paginado em todas as páginas internas.
// ============================================================

type Assessor = {
  posicao?: number; nome?: string; empresa?: string
  transacoes?: number; animais?: number; vgv?: number
  ticket_medio?: number; pct_total?: number
}
type Estado = {
  uf?: string; estado?: string; lotes?: number; animais?: number
  vgv?: number; pct_total?: number
}
type Comprador = {
  rank?: number; fazenda?: string; comprador?: string; cidade?: string
  uf?: string; lotes?: number; animais?: number; vgv?: number
}
type Lance = {
  lote?: string; fazenda?: string; comprador?: string; uf?: string
  assessor?: string; empresa?: string; animais?: number
  parcela?: number; vgv?: number
}

export type FechamentoForPDF = {
  id: string; nome: string; data: string; local?: string
  lotes_ofertados?: number; lotes_vendidos?: number; animais_vendidos?: number
  vgv_total?: number; ticket_medio?: number; maior_lance?: number
  compradores_unicos?: number; estados_alcancados?: number
  por_assessor?: Assessor[]; por_estado?: Estado[]
  compradores?: Comprador[]; lances?: Lance[]
  comissao_assessoria?: number; receita_bula?: number; sobra_bruta?: number
  observacoes?: string
}

const fmtBRL = (v: number | undefined) => {
  const n = Number(v) || 0
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const fmtPct = (v: number | undefined) => ((Number(v) || 0) * 100).toFixed(1).replace('.', ',') + '%'
const fmtDateExt = (s: string) => {
  const meses = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']
  const [y, m, d] = String(s || '').slice(0, 10).split('-')
  if (!y || !m || !d) return s || ''
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`
}

export async function generateFechamentoPDF(fech: FechamentoForPDF): Promise<void> {
  const [{ default: jsPDF }, autoTable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable').then(m => m.default),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const PW = doc.internal.pageSize.getWidth()
  const PH = doc.internal.pageSize.getHeight()
  const M = 16

  // Brandbook palette
  const BRONZE: [number, number, number] = [160, 121, 46]
  const BRONZE_700: [number, number, number] = [107, 79, 30]
  const BRONZE_300: [number, number, number] = [212, 168, 92]
  const BRONZE_100: [number, number, number] = [232, 203, 133]
  const PRETO: [number, number, number] = [0, 0, 0]
  const INK: [number, number, number] = [10, 10, 10]
  const INK2: [number, number, number] = [20, 20, 20]
  const GRAY_600: [number, number, number] = [74, 74, 74]
  const GRAY_200: [number, number, number] = [200, 200, 200]
  const TECH_GREEN: [number, number, number] = [127, 212, 160]
  const TECH_RED: [number, number, number] = [192, 80, 77]
  const BRANCO: [number, number, number] = [255, 255, 255]
  const PAPER: [number, number, number] = [252, 251, 248]
  const ROW_ALT: [number, number, number] = [252, 248, 240]
  const TABLE_LINE: [number, number, number] = [232, 203, 133]

  // ════════════ CAPA ════════════
  doc.setFillColor(...PRETO)
  doc.rect(0, 0, PW, PH, 'F')

  // Topografia decorativa — linhas finas bronze
  doc.setDrawColor(...BRONZE_700)
  doc.setLineWidth(0.1)
  for (let i = 0; i < 12; i++) {
    const y = 60 + i * 14
    doc.line(M, y, PW - M, y)
  }

  // Marca top + rule
  doc.setFillColor(...BRONZE)
  doc.rect(M, M, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...BRONZE)
  doc.text('FÓRMULA DO BOI · BULA ASSESSORIA', M + 7, M + 3)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY_200)
  doc.text('§ FECHAMENTO DE LEILÃO', PW - M, M + 3, { align: 'right' })
  doc.setDrawColor(...BRONZE)
  doc.setLineWidth(0.3)
  doc.line(M, M + 6, PW - M, M + 6)

  // Categoria + título
  doc.setFontSize(9)
  doc.setTextColor(...BRONZE_300)
  doc.setFont('helvetica', 'bold')
  doc.text('— RELATÓRIO OFICIAL', M, 70)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...BRANCO)
  const tituloLinhas = doc.splitTextToSize(fech.nome || 'Fechamento', PW - M * 2) as string[]
  doc.text(tituloLinhas, M, 88)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.setTextColor(...BRONZE_300)
  const subY = 88 + tituloLinhas.length * 11
  doc.text(`${fmtDateExt(fech.data)}${fech.local ? '  ·  ' + fech.local : ''}`, M, subY)

  // Statement card bronze (VGV destaque)
  doc.setFillColor(...BRONZE_700)
  doc.setDrawColor(...BRONZE)
  doc.setLineWidth(0.3)
  doc.roundedRect(M, subY + 18, PW - M * 2, 38, 2, 2, 'FD')
  doc.setFontSize(10)
  doc.setTextColor(...BRANCO)
  doc.setFont('helvetica', 'bold')
  doc.text('VGV TOTAL', M + 6, subY + 28)
  doc.setFontSize(22)
  doc.setTextColor(...BRONZE_100)
  doc.text(fmtBRL(fech.vgv_total), M + 6, subY + 41)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY_200)
  doc.text(
    `${fech.lotes_vendidos || 0} de ${fech.lotes_ofertados || 0} lotes  ·  ${fech.animais_vendidos || 0} animais  ·  ${fech.compradores_unicos || 0} compradores  ·  ${fech.estados_alcancados || 0} estados`,
    M + 6, subY + 50
  )

  // KPIs grid (2×2)
  const kpiY = subY + 66
  const kpiW = (PW - M * 2 - 6) / 2
  const kpiH = 24
  const capaKpis: { label: string; value: string }[] = [
    { label: 'TICKET MÉDIO', value: fmtBRL(fech.ticket_medio) },
    { label: 'MAIOR LANCE / PARCELA', value: fmtBRL(fech.maior_lance) },
    { label: 'RECEITA BULA', value: fmtBRL(fech.receita_bula) },
    { label: 'SOBRA BRUTA', value: fmtBRL(fech.sobra_bruta) },
  ]
  capaKpis.forEach((k, i) => {
    const x = M + (i % 2) * (kpiW + 6)
    const y = kpiY + Math.floor(i / 2) * (kpiH + 6)
    doc.setFillColor(...INK2)
    doc.setDrawColor(...BRONZE_700)
    doc.setLineWidth(0.2)
    doc.roundedRect(x, y, kpiW, kpiH, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...BRONZE_300)
    doc.text(k.label, x + 4, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...BRANCO)
    doc.text(k.value, x + 4, y + 17)
  })

  // Footer da capa
  doc.setDrawColor(...BRONZE_700)
  doc.setLineWidth(0.2)
  doc.line(M, PH - 18, PW - M, PH - 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY_600)
  doc.text('● FÓRMULA DO BOI BRAND GUIDELINES V1.0  ·  CONFIDENCIAL · USO INTERNO', M, PH - 12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRONZE)
  doc.text('§ CAPA  ·  01', PW - M, PH - 12, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...GRAY_600)
  doc.text(`gerado em ${new Date().toLocaleString('pt-BR')}`, M, PH - 7)

  // Helpers páginas internas
  let secao = ''
  let pageNum = 1
  const desenhaFooter = () => {
    doc.setDrawColor(...BRONZE_700)
    doc.setLineWidth(0.2)
    doc.line(M, PH - 14, PW - M, PH - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...GRAY_600)
    doc.text(`● ${(fech.nome || '').toUpperCase()}  ·  ${fmtDateExt(fech.data)}`, M, PH - 9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BRONZE)
    doc.text(`§ ${secao.toUpperCase()}`, PW / 2, PH - 9, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY_600)
    doc.text(`${String(pageNum).padStart(2, '0')} / —`, PW - M, PH - 9, { align: 'right' })
  }
  const novaPagina = (nomeSecao: string) => {
    doc.addPage()
    pageNum++
    secao = nomeSecao
    doc.setFillColor(...PAPER)
    doc.rect(0, 0, PW, PH, 'F')
    // Header preto
    doc.setFillColor(...PRETO)
    doc.rect(0, 0, PW, 12, 'F')
    doc.setFillColor(...BRONZE)
    doc.rect(M, 4.5, 3, 3, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...BRONZE)
    doc.text('FÓRMULA DO BOI · BULA', M + 5, 7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY_200)
    doc.text(`§ ${nomeSecao.toUpperCase()}`, PW - M, 7.5, { align: 'right' })
    // Faixa bronze
    doc.setFillColor(...BRONZE)
    doc.rect(0, 12, PW, 0.6, 'F')
    desenhaFooter()
    return 22
  }
  const tituloSecao = (y: number, num: string, titulo: string, sub?: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...BRONZE)
    doc.text(`— ${num}`, M, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...INK)
    doc.text(titulo, M, y + 9)
    if (sub) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...GRAY_600)
      doc.text(sub, M, y + 15)
    }
    return y + 22
  }

  // ════════════ PÁGINA: SÍNTESE ════════════
  let y = novaPagina('Síntese')
  y = tituloSecao(y, '01 SÍNTESE', 'Visão consolidada', 'Indicadores macro do leilão e da nossa cobertura')

  // Card grande: VGV
  doc.setFillColor(...PRETO)
  doc.roundedRect(M, y, PW - M * 2, 32, 2, 2, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...BRONZE_300)
  doc.text('VGV TOTAL DA COBERTURA', M + 6, y + 9)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(...BRONZE_100)
  doc.text(fmtBRL(fech.vgv_total), M + 6, y + 22)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...GRAY_200)
  doc.text(
    `Ticket médio  ${fmtBRL(fech.ticket_medio)}    ·    Maior lance  ${fmtBRL(fech.maior_lance)}`,
    M + 6, y + 28
  )
  y += 38

  // 4 KPIs
  const k4: { l: string; v: string; sub: string }[] = [
    { l: 'LOTES VENDIDOS', v: `${fech.lotes_vendidos || 0}`, sub: `de ${fech.lotes_ofertados || 0} ofertados` },
    { l: 'ANIMAIS', v: `${fech.animais_vendidos || 0}`, sub: 'comercializados' },
    { l: 'COMPRADORES', v: `${fech.compradores_unicos || 0}`, sub: 'únicos' },
    { l: 'ESTADOS', v: `${fech.estados_alcancados || 0}`, sub: 'alcançados' },
  ]
  const kw = (PW - M * 2 - 9) / 4
  k4.forEach((k, i) => {
    const x = M + i * (kw + 3)
    doc.setFillColor(...BRANCO)
    doc.setDrawColor(...BRONZE_300)
    doc.setLineWidth(0.2)
    doc.roundedRect(x, y, kw, 26, 1.5, 1.5, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...BRONZE_700)
    doc.text(k.l, x + 4, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(...INK)
    doc.text(k.v, x + 4, y + 17)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GRAY_600)
    doc.text(k.sub, x + 4, y + 22)
  })
  y += 32

  // Bloco financeiro
  const fin: { label: string; value: string; color: [number, number, number] }[] = [
    { label: 'Receita Bula', value: fmtBRL(fech.receita_bula), color: TECH_GREEN },
    { label: 'Comissão assessoria', value: '− ' + fmtBRL(fech.comissao_assessoria), color: TECH_RED },
    { label: 'Sobra bruta', value: fmtBRL(fech.sobra_bruta), color: BRONZE },
  ]
  doc.setFillColor(...PRETO)
  doc.roundedRect(M, y, PW - M * 2, 32, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...BRONZE)
  doc.text('— RESULTADO FINANCEIRO', M + 6, y + 8)
  const finW = (PW - M * 2 - 12) / 3
  fin.forEach((f, i) => {
    const fx = M + 6 + i * finW
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...GRAY_200)
    doc.text(f.label.toUpperCase(), fx, y + 16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...f.color)
    doc.text(f.value, fx, y + 26)
  })
  y += 38

  // Observações (sem estourar a página)
  if (fech.observacoes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...BRONZE)
    doc.text('— OBSERVAÇÕES', M, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...INK2)
    const obsLinhas = doc.splitTextToSize(fech.observacoes, PW - M * 2) as string[]
    const espacoDisp = PH - 22 - y
    const linhasMax = Math.max(0, Math.floor(espacoDisp / 4) - 1)
    doc.text(obsLinhas.slice(0, linhasMax), M, y)
  }

  // ════════════ POR ASSESSOR ════════════
  const porAssessor = Array.isArray(fech.por_assessor) ? fech.por_assessor : []
  if (porAssessor.length) {
    y = novaPagina('Por Assessor')
    y = tituloSecao(y, '02 POR ASSESSOR', 'Cobertura individual', `${porAssessor.length} assessor(es) atuaram nesta cobertura`)
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 22 },
      head: [['#', 'Assessor', 'Casa', 'Lances', 'Animais', 'Ticket méd.', 'VGV', '% Cobertura']],
      body: porAssessor.map((a, i) => [
        a.posicao ?? (i + 1),
        a.nome ?? '',
        a.empresa ?? '',
        a.transacoes ?? 0,
        a.animais ?? 0,
        fmtBRL(a.ticket_medio),
        fmtBRL(a.vgv),
        fmtPct(a.pct_total),
      ]),
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: TABLE_LINE, lineWidth: 0.1, textColor: INK2 },
      headStyles: { fillColor: PRETO, textColor: BRONZE_100, fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: ROW_ALT },
      columnStyles: {
        0: { halign: 'center', cellWidth: 9, fontStyle: 'bold', textColor: BRONZE },
        1: { fontStyle: 'bold' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right', font: 'courier', fontSize: 8.5 },
        6: { halign: 'right', font: 'courier', fontStyle: 'bold', textColor: BRONZE_700 },
        7: { halign: 'right', font: 'courier', textColor: BRONZE },
      },
      didDrawPage: () => desenhaFooter(),
    })
  }

  // ════════════ POR ESTADO ════════════
  const porEstado = Array.isArray(fech.por_estado) ? fech.por_estado : []
  if (porEstado.length) {
    y = novaPagina('Por Estado')
    y = tituloSecao(y, '03 POR ESTADO', 'Distribuição geográfica', `${porEstado.length} UF(s) na cobertura`)
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 22 },
      head: [['UF', 'Estado', 'Lotes', 'Animais', 'VGV', '% Cobertura']],
      body: porEstado.map(e => [
        e.uf || '—',
        e.estado || '',
        e.lotes ?? 0,
        e.animais ?? 0,
        fmtBRL(e.vgv),
        fmtPct(e.pct_total),
      ]),
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 3, lineColor: TABLE_LINE, lineWidth: 0.1, textColor: INK2 },
      headStyles: { fillColor: PRETO, textColor: BRONZE_100, fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: ROW_ALT },
      columnStyles: {
        0: { halign: 'center', cellWidth: 14, fontStyle: 'bold', font: 'courier', textColor: BRONZE },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', font: 'courier', fontStyle: 'bold', textColor: BRONZE_700 },
        5: { halign: 'right', font: 'courier', textColor: BRONZE },
      },
      didDrawPage: () => desenhaFooter(),
    })
  }

  // ════════════ COMPRADORES ════════════
  const compradores = Array.isArray(fech.compradores) ? fech.compradores : []
  if (compradores.length) {
    y = novaPagina('Compradores')
    y = tituloSecao(y, '04 COMPRADORES', 'Clientes trazidos', `${compradores.length} comprador(es) único(s) na cobertura`)
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 22 },
      head: [['#', 'Comprador', 'Fazenda', 'Cidade / UF', 'Lotes', 'Animais', 'VGV']],
      body: compradores.map((c, i) => [
        c.rank ?? (i + 1),
        c.comprador ?? '',
        c.fazenda ?? '',
        [c.cidade, c.uf].filter(Boolean).join('/') || '—',
        c.lotes ?? 0,
        c.animais ?? 0,
        fmtBRL(c.vgv),
      ]),
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.5, lineColor: TABLE_LINE, lineWidth: 0.1, textColor: INK2 },
      headStyles: { fillColor: PRETO, textColor: BRONZE_100, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: ROW_ALT },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8, fontStyle: 'bold', textColor: BRONZE },
        1: { fontStyle: 'bold' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right', font: 'courier', fontStyle: 'bold', textColor: BRONZE_700 },
      },
      didDrawPage: () => desenhaFooter(),
    })
  }

  // ════════════ LANCES ════════════
  const lances = Array.isArray(fech.lances) ? fech.lances : []
  if (lances.length) {
    y = novaPagina('Lances')
    y = tituloSecao(y, '05 LANCES', 'Detalhamento martelo a martelo', `${lances.length} lance(s) registrado(s)`)
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M, bottom: 22 },
      head: [['Lote', 'Comprador', 'UF', 'Assessor', 'Casa', 'Anim.', 'Parcela', 'VGV']],
      body: lances.map(l => [
        l.lote || '—',
        l.comprador ?? '',
        l.uf || '—',
        l.assessor ?? '',
        l.empresa ?? '',
        l.animais ?? 0,
        fmtBRL(l.parcela),
        fmtBRL(l.vgv),
      ]),
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 2.2, lineColor: TABLE_LINE, lineWidth: 0.1, textColor: INK2 },
      headStyles: { fillColor: PRETO, textColor: BRONZE_100, fontStyle: 'bold', fontSize: 7.5 },
      alternateRowStyles: { fillColor: ROW_ALT },
      columnStyles: {
        0: { halign: 'center', font: 'courier', fontStyle: 'bold', textColor: BRONZE, cellWidth: 22 },
        2: { halign: 'center', font: 'courier', cellWidth: 10 },
        5: { halign: 'right', cellWidth: 10 },
        6: { halign: 'right', font: 'courier' },
        7: { halign: 'right', font: 'courier', fontStyle: 'bold', textColor: BRONZE_700 },
      },
      didDrawPage: () => desenhaFooter(),
    })
  }

  // ════════════ Atualiza paginação total ════════════
  const totalPaginas = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let p = 2; p <= totalPaginas; p++) {
    doc.setPage(p)
    doc.setFillColor(...PAPER)
    doc.rect(PW - M - 22, PH - 12, 22, 6, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...GRAY_600)
    doc.text(`${String(p).padStart(2, '0')} / ${String(totalPaginas).padStart(2, '0')}`, PW - M, PH - 9, { align: 'right' })
  }

  // Save
  const safeName = (fech.nome || 'fechamento')
    .replace(/[^\wÀ-ÿ\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
  const safeDate = String(fech.data || '').slice(0, 10).replace(/-/g, '')
  doc.save(`Fechamento_${safeName}_${safeDate}.pdf`)
}
