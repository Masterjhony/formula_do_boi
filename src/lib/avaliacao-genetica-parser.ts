/**
 * Parser de Avaliação Genética — fichas técnicas ABCZ/ANCP.
 *
 * Estrutura esperada no PDF:
 *   iABCZ: 16,29   DECA: 1   P%: -   F: 2,05%
 *
 *   Características que compõem o iABCZ
 *     Características de Crescimento
 *       Peso à desmama (PD-ED)   12,34   78   Top 5%
 *       ...
 *     Características Maternas
 *       ...
 *
 *   Características que não compõem o iABCZ
 *     Crescimento
 *       Peso ao nascimento (PN-ED)   ...
 *     ...
 *
 * NOTA: a normalização preserva espaços múltiplos (separadores de coluna).
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Caracteristica {
    nome: string;
    dep: number | null;
    ac: number | null;     // acurácia em %
    deca: string | null;   // ex: "Top 1%", "1", "Superior", "Médio"
}

export type CategoriaCaracteristica =
    | 'crescimento'
    | 'maternas'
    | 'reprodutivas'
    | 'acabamento'
    | 'carcaca'
    | 'morfologicas';

/**
 * Schema salvo em avaliacao_genetica_json.
 *
 * composem_iabcz    → categorias/características que integram o índice iABCZ
 * nao_composem_iabcz → categorias/características complementares
 *
 * A mesma chave de categoria pode aparecer nos dois blocos (ex: crescimento
 * tem P{D,A,S}-ED no bloco iABCZ e PN-ED no bloco complementar).
 */
export interface AvaliacaoGeneticaData {
    iabcz: number | null;
    deca: string | null;
    percentil: number | null;   // P% (null quando "-" no PDF)
    f: number | null;           // coeficiente de endogamia
    composem_iabcz: Partial<Record<CategoriaCaracteristica, Caracteristica[]>>;
    nao_composem_iabcz: Partial<Record<CategoriaCaracteristica, Caracteristica[]>>;
}

// ---------------------------------------------------------------------------
// Normalização leve — preserva múltiplos espaços (separadores de coluna)
// ---------------------------------------------------------------------------

function normalizeLines(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, '   ');   // tab → 3 espaços; mantém estrutura de coluna
}

// Uppercase sem diacríticos para comparações de seção
function u(s: string): string {
    return s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ---------------------------------------------------------------------------
// Extração de seção
// ---------------------------------------------------------------------------

function extractAvaliacaoSection(text: string): string {
    const up = u(text);

    const starts = [
        'AVALIACAO GENETICA',
        'AVALIACAO GENOMICA',
        'AVALIACAO GENERICA',
        'SUMARIO DE TOUROS',
    ];

    let start = -1;
    for (const h of starts) {
        const idx = up.indexOf(h);
        if (idx !== -1) { start = idx; break; }
    }

    // Fallback: primeira linha que contenha "iABCZ"
    if (start === -1) {
        const idx = up.indexOf('IABCZ');
        if (idx !== -1) start = Math.max(0, text.lastIndexOf('\n', idx));
    }

    if (start === -1) return text;

    const stops = [
        'GENEALOGIA', 'PEDIGREE', 'ARVORE GENEALOGICA',
        'MORFOLOGIA EXTERNA', 'CERTIFICADO',
        'OBSERVACOES', 'INFORMACOES GERAIS',
    ];

    let end = text.length;
    for (const sw of stops) {
        const idx = up.indexOf(sw, start + 40);
        if (idx !== -1 && idx < end) end = idx;
    }

    return text.slice(start, end);
}

// ---------------------------------------------------------------------------
// Parsing das métricas de cabeçalho
// ---------------------------------------------------------------------------

function parseTopMetrics(section: string): Pick<AvaliacaoGeneticaData, 'iabcz' | 'deca' | 'percentil' | 'f'> {
    // iABCZ: aceita "iABCZ: 16,29", "iABCZ 16.29", "Índice iABCZ 16,29"
    let iabcz: number | null = null;
    const iabczM = section.match(/iABCZ\s*[=:]?\s*([-+]?\d+[.,]\d+|[-+]?\d+)/i);
    if (iabczM) iabcz = parseFloat(iabczM[1].replace(',', '.'));

    // DECA: número (1–10) ou texto ("Top 1%")
    // Para com P%, F: ou nova linha
    let deca: string | null = null;
    const decaM = section.match(/\bDECA\s*[=:]?\s*([^\n\t]{1,25}?)(?=\s{3,}|\s*P\s*%|\s*F\s*[=:\d(]|\n|$)/i);
    if (decaM) {
        deca = decaM[1].trim().replace(/[:.]+$/, '') || null;
    }
    // Fallback: captura "Top N%", decil numérico solto, ou palavra-categoria
    if (!deca) {
        const topM = section.match(/\b(Top\s*\d+\s*%|Superior|Acima da M[eé]dia|M[eé]dio|Abaixo da M[eé]dia|Inferior|\b[1-9]\b(?![\d.,]))/i);
        if (topM) deca = topM[1].trim();
    }

    // P%: pode ser "-" (sem valor) → percentil = null
    let percentil: number | null = null;
    const pctM = section.match(/P\s*%\s*[=:]?\s*(\d+(?:[.,]\d+)?)/i)
        ?? section.match(/Percentil\s*[=:]?\s*(\d+(?:[.,]\d+)?)/i);
    if (pctM) percentil = parseFloat(pctM[1].replace(',', '.'));

    // F: "F: 2,05%", "F 2.05", evita "FEMININO", "PDF", etc.
    let f: number | null = null;
    const fM = section.match(/(?<![A-Za-z])F\s*[=:]?\s*(\d+[.,]\d+|\d+)\s*%?(?![A-Za-z])/);
    if (fM) f = parseFloat(fM[1].replace(',', '.'));

    return { iabcz, deca, percentil, f };
}

// ---------------------------------------------------------------------------
// Patterns de categoria e bloco
// ---------------------------------------------------------------------------

/**
 * Mapeamento de texto → chave de categoria.
 * Usa busca ANYWHERE na linha (não ancorada) para capturar:
 *   "Crescimento", "Características de Crescimento", "Características Maternas", etc.
 */
const CATEGORY_PATTERNS: { re: RegExp; key: CategoriaCaracteristica }[] = [
    { re: /CRESCIMENTO/i, key: 'crescimento' },
    { re: /MATER[NI]/i,   key: 'maternas' },
    { re: /REPRODUT/i,    key: 'reprodutivas' },
    { re: /ACABAMENTO/i,  key: 'acabamento' },
    { re: /CAR[CÇ][AÃ]/i,key: 'carcaca' },
    { re: /MORF/i,        key: 'morfologicas' },
];

// Bloco "compõem iABCZ"  — captura "Características que compõem o iABCZ" etc.
const BLOCK_COMPOSE_RE = /COMP[ÕO]EM\s+[OoA]?\s*i?ABCZ|QUE\s+COMP[ÕO]EM/i;
// Bloco "não compõem iABCZ"
const BLOCK_NOT_COMPOSE_RE = /N[ÃA]O\s+COMP[ÕO]EM|NAO\s+COMP[ÕO]EM/i;

// Linhas que são cabeçalhos de coluna
const COL_HDR_RE = /^(CARACTER[IÍ]ST|CARACT\b|DEP\b|AC\s*%\s*$|DECA\b|TOUROS?|[IÍ]NDICE|SUMARI)/i;

// ---------------------------------------------------------------------------
// Parsing de linha de característica
// ---------------------------------------------------------------------------

/**
 * Parseia uma linha de dado usando duas estratégias:
 *  1. Divisão por 2+ espaços (preservação de colunas do PDF)
 *  2. Tokenização por espaço simples: 1º token numérico = DEP
 *
 * Formato das linhas ABCZ:
 *   "Peso à desmama (PD-ED)   12,34   78   Top 5%"
 *   "Stayability (STAY)   -3,45   70   1"
 *   "Estrutura Corporal (E)   1,23   55   Médio"
 */
function parseTraitRow(line: string): Caracteristica | null {
    const clean = line.trim();
    if (!clean || clean.length < 4) return null;
    if (COL_HDR_RE.test(clean)) return null;
    // Linha de bloco ou categoria — descartamos
    if (BLOCK_COMPOSE_RE.test(clean) || BLOCK_NOT_COMPOSE_RE.test(clean)) return null;
    if (CATEGORY_PATTERNS.some(({ re }) => re.test(clean) && !/\d/.test(clean))) return null;

    let nome: string | undefined;
    let depRaw: string | undefined;
    let acRaw: string | undefined;
    let decaRaw: string | undefined;

    // ── Estratégia 1: split por 2+ espaços ──
    const cols = clean.split(/\s{2,}/);
    if (cols.length >= 3) {
        nome    = cols[0].trim();
        depRaw  = cols[1].trim();
        acRaw   = cols[2].trim().replace(/%$/, '');
        decaRaw = cols.slice(3).join(' ').trim() || undefined;
    }

    // ── Estratégia 2: tokenização por espaço simples ──
    if (!nome || !depRaw) {
        const tokens = clean.split(/\s+/);
        let depIdx = -1;
        for (let i = 1; i < tokens.length; i++) {
            // Um token de DEP é todo numérico: dígitos, sinal opcional, vírgula/ponto como decimal
            if (/^[-+]?\d+([.,]\d+)?$/.test(tokens[i])) {
                depIdx = i;
                break;
            }
        }
        if (depIdx < 1) return null;
        nome    = tokens.slice(0, depIdx).join(' ');
        depRaw  = tokens[depIdx];
        acRaw   = tokens[depIdx + 1]?.replace(/%$/, '') ?? '';
        decaRaw = tokens.slice(depIdx + 2).join(' ').trim() || undefined;
    }

    if (!nome || nome.length < 2) return null;
    if (COL_HDR_RE.test(nome)) return null;
    if (/^\d/.test(nome)) return null;   // nome não começa com dígito

    const dep = parseFloat((depRaw ?? '').replace(',', '.'));
    const ac  = acRaw ? parseFloat(acRaw.replace(',', '.')) : NaN;

    if (isNaN(dep)) return null;

    return {
        nome,
        dep,
        ac:   (!isNaN(ac) && ac >= 0 && ac <= 100) ? ac : null,
        deca: decaRaw?.trim() || null,
    };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

export async function extractAvaliacaoFromPdfUrl(pdfUrl: string): Promise<{
    data: AvaliacaoGeneticaData;
    rawText: string;
    section: string;
}> {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
        throw new Error(`Falha ao buscar PDF: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse: (buf: Buffer, opts?: object) => Promise<{ text: string }> =
        require('pdf-parse/lib/pdf-parse.js');
    const parsed = await pdfParse(buffer);
    const rawText = parsed.text;

    // Normalização LEVE — preserva espaços múltiplos (separadores de coluna)
    const lineNorm = normalizeLines(rawText);
    const section  = extractAvaliacaoSection(lineNorm);
    const data     = parseAvaliacaoGeneticaSection(section);

    return { data, rawText, section };
}

/**
 * Parseia o texto da seção de Avaliação Genética.
 * Pode receber texto com espaços múltiplos (preservados do PDF).
 */
export function parseAvaliacaoGeneticaSection(text: string): AvaliacaoGeneticaData {
    const metrics = parseTopMetrics(text);
    const result: AvaliacaoGeneticaData = {
        ...metrics,
        composem_iabcz: {},
        nao_composem_iabcz: {},
    };

    const lines = text.split('\n').filter(l => l.trim());

    // Bloco ativo; default 'composem' para PDFs sem marcador explícito
    type Block = 'composem' | 'nao_composem';
    let currentBlock: Block = 'composem';
    let currentCategory: CategoriaCaracteristica | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // ── 1. Detecta marcador de bloco ──
        if (BLOCK_NOT_COMPOSE_RE.test(trimmed)) {
            currentBlock    = 'nao_composem';
            currentCategory = null;
            continue;
        }
        if (BLOCK_COMPOSE_RE.test(trimmed)) {
            currentBlock    = 'composem';
            currentCategory = null;
            continue;
        }

        // ── 2. Tenta parsear como linha de dado ANTES de checar cabeçalho ──
        //    (evita que "Acabamento de carcaça (ACAB)  0,45  55  Médio" seja
        //     confundido com cabeçalho de categoria, pois tem números)
        if (currentCategory) {
            const trait = parseTraitRow(line);   // usa linha original (espaços múltiplos)
            if (trait) {
                const target = currentBlock === 'composem'
                    ? result.composem_iabcz
                    : result.nao_composem_iabcz;
                if (!target[currentCategory]) target[currentCategory] = [];
                target[currentCategory]!.push(trait);
                continue;
            }
        }

        // ── 3. Detecta cabeçalho de categoria (apenas em linhas sem números) ──
        //    "Características de Crescimento" → crescimento
        //    "Crescimento" → crescimento
        if (!/\d/.test(trimmed)) {
            for (const { re, key } of CATEGORY_PATTERNS) {
                if (re.test(trimmed)) {
                    currentCategory = key;
                    break;
                }
            }
        }
    }

    return result;
}
