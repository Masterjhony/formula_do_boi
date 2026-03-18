/**
 * Parser de Avaliação Genética para fichas técnicas de bovinos PO (ABCZ/ANCP).
 * Extrai iABCZ, DECA, P%, F e tabela de DEPs por característica/categoria.
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

export interface AvaliacaoGeneticaData {
    iabcz: number | null;
    deca: string | null;
    percentil: number | null;   // P%
    f: number | null;           // coeficiente de endogamia
    caracteristicas: Partial<Record<CategoriaCaracteristica, Caracteristica[]>>;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function normalize(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/ {2,}/g, ' ')
        .trim();
}

/**
 * Extrai a seção de Avaliação Genética do texto completo do PDF.
 * Retorna o texto completo se não encontrar a seção.
 */
function extractAvaliacaoSection(text: string): string {
    const upper = text.toUpperCase();
    const sectionHeaders = [
        'AVALIAÇÃO GENÉTICA',
        'AVALIACAO GENETICA',
        'AVALIAÇÃO GENÔMICA',
        'AVALIACAO GENOMICA',
        'AVALIAÇÃO GENÉRICA',
        'AVALIACAO GENERICA',
        'SUMÁRIO DE TOUROS',
        'SUMARIO DE TOUROS',
        'DEP ',  // fallback: inicia logo após a primeira menção de "DEP"
    ];

    let start = -1;
    for (const h of sectionHeaders) {
        const idx = upper.indexOf(h);
        if (idx !== -1) { start = idx; break; }
    }

    if (start === -1) return text;

    // Próxima seção maior (genealogia, morfologia externa, etc.)
    const stopWords = ['GENEALOGIA', 'PEDIGREE', 'ÁRVORE GENEALÓGICA', 'ARVORE GENEALOGICA',
        'MORFOLOGIA EXTERNA', 'CERTIFICADO', 'OBSERVAÇÕES', 'OBSERVACOES',
        'INFORMAÇÕES GERAIS', 'INFORMACOES GERAIS'];

    let end = text.length;
    for (const sw of stopWords) {
        const idx = upper.indexOf(sw, start + 30);
        if (idx !== -1 && idx < end) end = idx;
    }

    return text.slice(start, end);
}

/** Extrai as métricas do cabeçalho da seção (iABCZ, DECA, P%, F). */
function parseTopMetrics(section: string): Pick<AvaliacaoGeneticaData, 'iabcz' | 'deca' | 'percentil' | 'f'> {
    const iabczMatch = section.match(/iABCZ\s*:?\s*([-+]?\d+[.,]\d+|[-+]?\d+)/i);
    // DECA: captura tudo até o próximo campo ou fim da linha
    const decaMatch = section.match(/\bDECA\s*:?\s*([^\n|/\\]{1,30}?)(?=\s{2,}|\s*[|]\s*|\s*P%|\s*F\s*:|\n|$)/i);
    const percentilMatch = section.match(/P%\s*:?\s*(\d+(?:[.,]\d+)?)/i);
    // F: evita capturar palavras como "FEMININO" — requer que seja seguido de número
    const fMatch = section.match(/\bF\s*:?\s*(\d+(?:[.,]\d+)?)\s*%?/i);

    return {
        iabcz: iabczMatch ? parseFloat(iabczMatch[1].replace(',', '.')) : null,
        deca: decaMatch ? decaMatch[1].trim().replace(/[:.]+$/, '') : null,
        percentil: percentilMatch ? parseFloat(percentilMatch[1].replace(',', '.')) : null,
        f: fMatch ? parseFloat(fMatch[1].replace(',', '.')) : null,
    };
}

const CATEGORY_PATTERNS: { re: RegExp; key: CategoriaCaracteristica }[] = [
    { re: /^CRESCIMENTO\b/i, key: 'crescimento' },
    { re: /^MATER[NI]/i, key: 'maternas' },
    { re: /^REPRODUT/i, key: 'reprodutivas' },
    { re: /^ACABAMENTO\b/i, key: 'acabamento' },
    { re: /^CAR[CÇ][AÃ]/i, key: 'carcaca' },
    { re: /^MORF/i, key: 'morfologicas' },
];

// Palavras que indicam header de coluna (não são linhas de dados)
const COLUMN_HEADER_RE = /^(CARACTERÍSTICA|CARACTERISTICA|CARACT\b|DEP|AC%|DECA|TOUROS?|ÍNDICE|INDICE|IABCZ|SUMÁRIO|SUMARIO)/i;

/**
 * Tenta parsear uma linha como uma característica com DEP.
 * Formato esperado: NOME   DEP   AC%   [DECA]
 */
function parseTraitRow(line: string): Caracteristica | null {
    const clean = line.trim();
    if (!clean || clean.length < 4) return null;
    if (COLUMN_HEADER_RE.test(clean)) return null;

    // Padrão: NOME (letras/números/espaços) seguido de DEP numérico, AC% numérico, e DECA opcional
    const m = clean.match(
        /^([A-Za-záéíóúâêôãõÁÉÍÓÚÂÊÔÃÕÇç][A-Za-záéíóúâêôãõÁÉÍÓÚÂÊÔÃÕÇç0-9\s./\-_]{0,30}?)\s{1,6}([-+]?\d{1,5}[.,]\d{0,4}|[-+]?\d{1,5})\s{1,6}(\d{1,3}(?:[.,]\d{1,2})?)\s*(.*)?$/
    );

    if (!m) return null;

    const nome = m[1].trim();
    if (nome.length < 2) return null;

    // Descarta nomes que são cabeçalhos de seção
    if (CATEGORY_PATTERNS.some(({ re }) => re.test(nome))) return null;

    const dep = parseFloat(m[2].replace(',', '.'));
    const ac = parseFloat(m[3].replace(',', '.'));
    const deca = m[4]?.trim().replace(/[:.]+$/, '') || null;

    // AC% deve estar em range plausível
    if (isNaN(dep) || isNaN(ac) || ac < 0 || ac > 100) return null;

    return {
        nome,
        dep,
        ac,
        deca: deca || null,
    };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extrai texto de um PDF via URL e faz o parse da Avaliação Genética.
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

    const normalized = normalize(rawText);
    const section = extractAvaliacaoSection(normalized);
    const data = parseAvaliacaoGeneticaSection(section);

    return { data, rawText, section };
}

/**
 * Faz o parse de um trecho de texto com a seção de Avaliação Genética.
 */
export function parseAvaliacaoGeneticaSection(text: string): AvaliacaoGeneticaData {
    const metrics = parseTopMetrics(text);
    const result: AvaliacaoGeneticaData = {
        ...metrics,
        caracteristicas: {},
    };

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let currentCategory: CategoriaCaracteristica | null = null;

    for (const line of lines) {
        // Verifica se é cabeçalho de categoria
        let isHeader = false;
        for (const { re, key } of CATEGORY_PATTERNS) {
            if (re.test(line)) {
                currentCategory = key;
                if (!result.caracteristicas[key]) {
                    result.caracteristicas[key] = [];
                }
                isHeader = true;
                break;
            }
        }
        if (isHeader) continue;

        if (currentCategory) {
            const trait = parseTraitRow(line);
            if (trait) {
                result.caracteristicas[currentCategory]!.push(trait);
            }
        }
    }

    return result;
}
