/**
 * Parser de Avaliação Genética para fichas técnicas de bovinos PO (ABCZ/ANCP).
 * Extrai iABCZ, DECA, P%, F e tabela de DEPs por característica/categoria.
 *
 * IMPORTANTE: a normalização preserva espaços múltiplos (separadores de coluna)
 * e só colapsa espaços DENTRO das células, não entre colunas.
 */

export interface Caracteristica {
    nome: string;
    dep: number | null;
    ac: number | null;     // acurácia em %
    deca: string | null;   // ex: "Top 1%", "Superior", "Médio"
}

export type CategoriaCaracteristica =
    | 'crescimento'
    | 'maternas'
    | 'reprodutivas'
    | 'acabamento'
    | 'carcaca'
    | 'morfologicas';

/**
 * Schema do JSON salvo na coluna avaliacao_genetica_json.
 * - composem_iabcz: categorias que integram o índice iABCZ (ex: crescimento, maternas, reprodutivas)
 * - nao_composem_iabcz: categorias complementares (ex: acabamento, carcaca, morfologicas)
 * As categorias que tiverem dados mas não estiverem em composem_iabcz ficam em nao_composem_iabcz.
 */
export interface AvaliacaoGeneticaData {
    iabcz: number | null;
    deca: string | null;
    percentil: number | null;   // P%
    f: number | null;           // coeficiente de endogamia
    caracteristicas: Partial<Record<CategoriaCaracteristica, Caracteristica[]>>;
    composem_iabcz: CategoriaCaracteristica[];   // categorias que compõem o iABCZ
}

// ---------------------------------------------------------------------------
// Normalização (leve) — preserva espaços múltiplos que delimitam colunas
// ---------------------------------------------------------------------------

/** Normaliza apenas quebras de linha e tabs; preserva múltiplos espaços. */
function normalizeLines(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, '  ');   // tab → 2 espaços (mantém estrutura de coluna)
}

/** Normalização agressiva para comparações de seção (uppercase, sem acento). */
function upper(s: string): string {
    return s.toUpperCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');  // remove diacríticos
}

// ---------------------------------------------------------------------------
// Extração de seção
// ---------------------------------------------------------------------------

function extractAvaliacaoSection(text: string): string {
    const up = upper(text);

    const sectionHeaders = [
        'AVALIACAO GENETICA',
        'AVALIACAO GENOMICA',
        'AVALIACAO GENERICA',
        'SUMARIO DE TOUROS',
        'AVALIACAO ',        // fallback largo
    ];

    let start = -1;
    for (const h of sectionHeaders) {
        const idx = up.indexOf(h);
        if (idx !== -1) { start = idx; break; }
    }

    // Segundo fallback: primeira ocorrência de "DEP" seguido de número/coluna
    if (start === -1) {
        const depIdx = up.indexOf('\nDEP ');
        if (depIdx !== -1) start = depIdx;
    }

    if (start === -1) return text;

    // Para de extração na próxima seção "maior" não relacionada
    const stopPatterns = [
        'GENEALOGIA', 'PEDIGREE', 'ARVORE GENEALOGICA',
        'MORFOLOGIA EXTERNA', 'CERTIFICADO',
        'OBSERVACOES', 'INFORMACOES GERAIS',
    ];

    let end = text.length;
    for (const sw of stopPatterns) {
        const idx = up.indexOf(sw, start + 40);
        if (idx !== -1 && idx < end) end = idx;
    }

    return text.slice(start, end);
}

// ---------------------------------------------------------------------------
// Parsing das métricas do cabeçalho (iABCZ, DECA, P%, F)
// ---------------------------------------------------------------------------

/**
 * Tenta várias estratégias para extrair os 4 índices do topo da seção.
 * Os PDFs ABCZ variam entre formato "CAMPO: valor" inline e formato tabular
 * com cabeçalhos numa linha e valores na linha seguinte.
 */
function parseTopMetrics(section: string): Pick<AvaliacaoGeneticaData, 'iabcz' | 'deca' | 'percentil' | 'f'> {
    // --- iABCZ ---
    // Formato inline: "iABCZ: 123.45" ou "iABCZ 123,45"
    // Formato tabular: "iABCZ" numa linha, número na linha seguinte (capturado abaixo)
    let iabcz: number | null = null;
    const iabczInline = section.match(/iABCZ\s*[=:]?\s*([-+]?\d+[.,]\d+|[-+]?\d+)/i);
    if (iabczInline) {
        iabcz = parseFloat(iabczInline[1].replace(',', '.'));
    } else {
        // Formato tabular: "iABCZ\n…\n123.45" — captura o número que aparece
        // na mesma linha de uma sequência de números após a linha "iABCZ"
        const tabular = section.match(/iABCZ[^\n]*\n[^\n]*([-+]?\d+[.,]\d+)\s/i);
        if (tabular) iabcz = parseFloat(tabular[1].replace(',', '.'));
    }

    // --- DECA ---
    // Aceita: "DECA: Top 1%", "DECA Top 1%", "DECA  TOP 1 %", etc.
    let deca: string | null = null;
    const decaInline = section.match(/\bDECA\s*[=:]?\s*([^\n\t]{1,30}?)(?=\s{3,}|\s*P\s*%|\s*F\s*[=:\d]|\n|$)/i);
    if (decaInline) {
        deca = decaInline[1].trim().replace(/[:.]+$/, '') || null;
    }
    // Fallback: pega qualquer "Top N%" ou palavras DECA conhecidas
    if (!deca) {
        const topMatch = section.match(/\b(Top\s+\d+\s*%|Superior|Acima da M[eé]dia|M[eé]dio|Abaixo da M[eé]dia|Inferior)\b/i);
        if (topMatch) deca = topMatch[1].trim();
    }

    // --- P% ---
    let percentil: number | null = null;
    // "P%: 5", "P %: 5", "P% 5", "Percentil: 5"
    const pctMatch = section.match(/P\s*%\s*[=:]?\s*(\d+(?:[.,]\d+)?)/i)
        ?? section.match(/Percentil\s*[=:]?\s*(\d+(?:[.,]\d+)?)/i);
    if (pctMatch) percentil = parseFloat(pctMatch[1].replace(',', '.'));

    // --- F ---
    // "F: 2,50", "F 2.50", "F: 2.50%"
    // Evita match em "FEMININO", "FORMAÇÃO", "PDF", etc.
    let f: number | null = null;
    // Deve ser: \bF seguido de espaços/: e depois número
    const fMatch = section.match(/(?<![A-Za-z])F\s*[=:]?\s*(\d+[.,]\d+|\d+)\s*%?(?![A-Za-z])/);
    if (fMatch) f = parseFloat(fMatch[1].replace(',', '.'));

    return { iabcz, deca, percentil, f };
}

// ---------------------------------------------------------------------------
// Parsing de categorias e características
// ---------------------------------------------------------------------------

const CATEGORY_PATTERNS: { re: RegExp; key: CategoriaCaracteristica }[] = [
    { re: /^CRESCIMENTO\b/i, key: 'crescimento' },
    { re: /^MATER[NI]/i,     key: 'maternas' },
    { re: /^REPRODUT/i,      key: 'reprodutivas' },
    { re: /^ACABAMENTO\b/i,  key: 'acabamento' },
    { re: /^CAR[CÇ][AÃ]/i,  key: 'carcaca' },
    { re: /^MORF/i,          key: 'morfologicas' },
];

// Convenção padrão ABCZ: quais categorias compõem o iABCZ
const DEFAULT_COMPOSEM_IABCZ: CategoriaCaracteristica[] = ['crescimento', 'maternas', 'reprodutivas'];

// Linhas que são cabeçalhos de coluna, não dados
const COLUMN_HEADER_RE = /^(CARACTER[IÍ]ST|CARACT\b|DEP\b|AC\s*%|DECA\b|TOUROS?|[IÍ]NDICE|INDICE|IABCZ\b|SUM[AÁ]RIO|REBANHO)/i;

// Identificação de blocos
const BLOCK_COMPOSE_RE = /COMP[OÕ]EM\s+O?\s*i?ABCZ|QUE\s+COMP[OÕ]EM|COMP[OÕE]{2,}/i;
const BLOCK_NOT_COMPOSE_RE = /N[AÃ]O\s+COMP[OÕ]EM|NAO\s+COMP[OÕ]EM/i;

/**
 * Parseia uma linha de característica usando abordagem por tokens.
 *
 * PDF-parse preserva espaços múltiplos como separadores de coluna.
 * A linha (sem normalização agressiva) tem o formato:
 *   NOME_CARACT   DEP_VALOR   AC%   [DECA_TEXTO]
 * onde as colunas são separadas por 2+ espaços.
 *
 * Fallback: quando não há 2+ espaços (normalização já foi aplicada),
 * encontra o primeiro token numérico como DEP.
 */
function parseTraitRow(line: string): Caracteristica | null {
    const clean = line.trim();
    if (!clean || clean.length < 3) return null;
    if (COLUMN_HEADER_RE.test(clean)) return null;
    if (CATEGORY_PATTERNS.some(({ re }) => re.test(clean))) return null;
    // Descarta linhas de bloco
    if (BLOCK_COMPOSE_RE.test(clean) || BLOCK_NOT_COMPOSE_RE.test(clean)) return null;

    let nome: string | undefined;
    let depStr: string | undefined;
    let acStr: string | undefined;
    let decaStr: string | undefined;

    // ── Estratégia 1: split por 2+ espaços (preservação de colunas) ──
    const cols = clean.split(/\s{2,}/);
    if (cols.length >= 3) {
        nome   = cols[0].trim();
        depStr = cols[1].trim();
        acStr  = cols[2].trim().replace(/%$/, '');
        decaStr = cols.slice(3).join(' ').trim() || undefined;
    }

    // ── Estratégia 2: tokens por espaço simples; DEP é o 1º token numérico ──
    if (!nome || !depStr) {
        const tokens = clean.split(/\s+/);
        // Encontra índice do 1º token que parece um valor numérico de DEP
        let depIdx = -1;
        for (let i = 1; i < tokens.length; i++) {
            if (/^[-+]?\d+([.,]\d+)?$/.test(tokens[i])) {
                depIdx = i;
                break;
            }
        }
        if (depIdx < 1) return null;
        nome    = tokens.slice(0, depIdx).join(' ');
        depStr  = tokens[depIdx];
        acStr   = tokens[depIdx + 1]?.replace(/%$/, '') ?? '';
        decaStr = tokens.slice(depIdx + 2).join(' ').trim() || undefined;
    }

    if (!nome || nome.length < 2) return null;

    // Rejeita nomes que são claramente cabeçalhos ou palavras-chave
    if (COLUMN_HEADER_RE.test(nome)) return null;
    if (CATEGORY_PATTERNS.some(({ re }) => re.test(nome))) return null;
    // Rejeita se o nome começa com dígito (provavelmente um número de coluna)
    if (/^\d/.test(nome)) return null;

    const dep = depStr ? parseFloat(depStr.replace(',', '.')) : NaN;
    const ac  = acStr  ? parseFloat(acStr.replace(',', '.'))  : NaN;

    if (isNaN(dep)) return null;
    // AC deve estar em range 0-100 (acurácia em %)
    const acVal = isNaN(ac) ? null : (ac >= 0 && ac <= 100 ? ac : null);

    return {
        nome,
        dep,
        ac: acVal,
        deca: decaStr?.trim() || null,
    };
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Extrai texto de um PDF via URL e faz o parse da Avaliação Genética.
 * Normalização leve preserva múltiplos espaços (separadores de coluna).
 */
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

    // Normalização LEVE: apenas quebras de linha; preserva múltiplos espaços
    const lineNorm = normalizeLines(rawText);
    const section = extractAvaliacaoSection(lineNorm);
    const data = parseAvaliacaoGeneticaSection(section);

    return { data, rawText, section };
}

/**
 * Faz o parse de um trecho de texto com a seção de Avaliação Genética.
 * Pode receber texto com espaços múltiplos (preservados do PDF).
 */
export function parseAvaliacaoGeneticaSection(text: string): AvaliacaoGeneticaData {
    const metrics = parseTopMetrics(text);
    const result: AvaliacaoGeneticaData = {
        ...metrics,
        caracteristicas: {},
        composem_iabcz: [],
    };

    const lines = text.split('\n').filter(l => l.trim());
    let currentCategory: CategoriaCaracteristica | null = null;
    let currentBlock: 'composem' | 'nao_composem' | null = null;
    const composemSet = new Set<CategoriaCaracteristica>();
    let foundBlockMarkers = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // ── Detecta marcadores de bloco ──
        if (BLOCK_NOT_COMPOSE_RE.test(trimmed)) {
            currentBlock = 'nao_composem';
            foundBlockMarkers = true;
            continue;
        }
        if (BLOCK_COMPOSE_RE.test(trimmed)) {
            currentBlock = 'composem';
            foundBlockMarkers = true;
            continue;
        }

        // ── Detecta cabeçalho de categoria ──
        let isHeader = false;
        for (const { re, key } of CATEGORY_PATTERNS) {
            if (re.test(trimmed)) {
                currentCategory = key;
                if (!result.caracteristicas[key]) {
                    result.caracteristicas[key] = [];
                }
                if (currentBlock === 'composem') composemSet.add(key);
                isHeader = true;
                break;
            }
        }
        if (isHeader) continue;

        // ── Parseia linha de dado ──
        if (currentCategory) {
            const trait = parseTraitRow(line);   // passa linha original (com espaços múltiplos)
            if (trait) {
                result.caracteristicas[currentCategory]!.push(trait);
            }
        }
    }

    // Define composem_iabcz: usa o que o PDF indicou, ou a convenção ABCZ padrão
    if (foundBlockMarkers && composemSet.size > 0) {
        result.composem_iabcz = Array.from(composemSet);
    } else {
        // Convenção padrão: crescimento, maternas e reprodutivas compõem o iABCZ
        result.composem_iabcz = DEFAULT_COMPOSEM_IABCZ.filter(
            k => (result.caracteristicas[k]?.length ?? 0) > 0
        );
    }

    return result;
}
