/**
 * Parser de Avaliação Genética — fichas técnicas ABCZ/ANCP.
 *
 * Formato real produzido pelo pdf-parse (colunas concatenadas sem separador):
 *
 *   Cabeçalho de métricas — duas linhas:
 *     iABCZDECAP%F
 *     14,961-1,95%
 *   Onde: iABCZ=14,96 · DECA=1 · P%=- · F=1,95%
 *
 *   Bloco:
 *     CARACTERÍSTICAS QUE COMPÕEM O iABCZ
 *     CARACTERÍSTICAS QUE NÃO COMPÕEM O iABCZ
 *
 *   Cabeçalho de categoria (concatenado com labels de coluna):
 *     CARACTERÍSTICAS DE CRESCIMENTODEPAC %DECA
 *
 *   Linha de característica (nome+DEP+AC%+DECA concatenados):
 *     Peso à desmama - efeito direto (PD-ED) - kg9,01291
 *     -                                              ← P% (sempre "-", ignorar)
 *
 *   Sufixo numérico: [-+]?\d+,\d{2,4}? · \d{1,2} · [\d-]
 *                     DEP (virgula BR)    AC%        DECA
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Caracteristica {
    nome: string;
    dep: number | null;
    ac: number | null;     // acurácia em %
    deca: string | null;   // ex: "1", "2", "-"
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
    percentil: number | null;   // P% (null quando "-" no PDF)
    f: number | null;           // coeficiente de endogamia
    composem_iabcz: Partial<Record<CategoriaCaracteristica, Caracteristica[]>>;
    nao_composem_iabcz: Partial<Record<CategoriaCaracteristica, Caracteristica[]>>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeLines(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\t/g, '   ');
}

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
        'IABCZ',
    ];

    let start = -1;
    for (const h of starts) {
        const idx = up.indexOf(h);
        if (idx !== -1) {
            start = (h === 'IABCZ')
                ? Math.max(0, text.lastIndexOf('\n', idx))
                : idx;
            break;
        }
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

/**
 * Encontra a linha com "iABCZ" (ou "IABCZ") e parseia a linha de valores
 * imediatamente seguinte, que está no formato concatenado:
 *   14,961-1,95%
 *   iABCZ=14,96 · DECA=1 · P%=- (ignorado) · F=1,95
 */
function parseTopMetrics(
    lines: string[],
): Pick<AvaliacaoGeneticaData, 'iabcz' | 'deca' | 'percentil' | 'f'> {
    let iabcz: number | null = null;
    let deca: string | null = null;
    let percentil: number | null = null;
    let f: number | null = null;

    for (let i = 0; i < lines.length; i++) {
        const up = u(lines[i]);
        if (!up.includes('IABCZ')) continue;
        if (!/DECA|P\s*%/.test(up)) continue;   // linha de header, não de valor

        // Linha de valores é a próxima não-vazia
        const valLine = lines.slice(i + 1).find(l => l.trim() !== '');
        if (!valLine) continue;

        const v = valLine.trim();

        // Formato: 14,961-1,95%
        //   iABCZ: [-+]?\d+,\d+   (decimal BR)
        //   DECA:  \d{1,2}
        //   P%:    \d+|- (ignoramos)
        //   F:     [-+]?\d+[.,]\d+  %?
        const m = v.match(
            /^([-+]?\d+[.,]\d+)(\d{1,2})(\d+|-)([+-]?\d+[.,]\d+)%?/
        );
        if (m) {
            iabcz = parseFloat(m[1].replace(',', '.'));
            deca  = m[2];
            // m[3] = P% (ignorado — sempre "-" nestes PDFs, percentil = null)
            f     = parseFloat(m[4].replace(',', '.'));
        }

        // Fallback individual — para variações de formato
        if (iabcz === null) {
            const im = v.match(/^([-+]?\d+[.,]\d+)/);
            if (im) iabcz = parseFloat(im[1].replace(',', '.'));
        }

        break;
    }

    // Fallback: tenta encontrar iABCZ em qualquer linha da seção
    if (iabcz === null) {
        for (const line of lines) {
            const m = line.match(/iABCZ\s*[=:]?\s*([-+]?\d+[.,]\d+)/i);
            if (m) { iabcz = parseFloat(m[1].replace(',', '.')); break; }
        }
    }

    return { iabcz, deca, percentil, f };
}

// ---------------------------------------------------------------------------
// Patterns de bloco e categoria
// ---------------------------------------------------------------------------

const BLOCK_COMPOSE_RE    = /COMP[ÕO]EM\s+[OoA]?\s*i?ABCZ|QUE\s+COMP[ÕO]EM/i;
const BLOCK_NOT_COMPOSE_RE = /N[ÃA]O\s+COMP[ÕO]EM|NAO\s+COMP[ÕO]EM/i;

const CATEGORY_PATTERNS: { re: RegExp; key: CategoriaCaracteristica }[] = [
    { re: /CRESCIMENTO/i,  key: 'crescimento' },
    { re: /MATER[NI]/i,    key: 'maternas' },
    { re: /REPRODUT/i,     key: 'reprodutivas' },
    { re: /ACABAMENTO/i,   key: 'acabamento' },
    { re: /CAR[CÇ][AÃ]/i, key: 'carcaca' },
    { re: /MORF/i,         key: 'morfologicas' },
];

// ---------------------------------------------------------------------------
// Parsing de linha de característica
// ---------------------------------------------------------------------------

/**
 * Parseia uma linha no formato concatenado do pdf-parse:
 *   "Peso à desmama - efeito direto (PD-ED) - kg9,01291"
 *                                               ↑DEP ↑AC%↑DECA
 *
 * Regex: ^(nome)(DEP)(AC%)(DECA)$
 *   nome = qualquer texto que NÃO termine com dígito ou sinal
 *   DEP  = [-+]?\d+,\d{2,4}?   (vírgula BR, não-greedy para forçar split correto)
 *   AC%  = \d{1,2}
 *   DECA = [\d-]
 */
const TRAIT_RE = /^(.*[^0-9+\-])([-+]?\d+,\d{2,4}?)(\d{1,2})([\d-])$/;

function parseTraitRow(line: string): Caracteristica | null {
    const clean = line.trim();
    if (!clean || clean.length < 6) return null;

    // Descarta linhas que são puramente P% (standalone "-" ou número)
    if (/^-$/.test(clean)) return null;
    if (/^\d{1,3}$/.test(clean)) return null;

    const m = clean.match(TRAIT_RE);
    if (!m) return null;

    const nome = m[1].trim()
        .replace(/\s*-\s*$/, '')   // remove " - " final (separador de unidade)
        .replace(/\s+/g, ' ')
        .trim();

    if (nome.length < 2) return null;

    // Nome não deve começar com dígito ou ser só label de coluna
    if (/^\d/.test(nome)) return null;
    if (/^(DEP|AC\s*%|DECA|CARACT)/i.test(nome)) return null;

    const dep = parseFloat(m[2].replace(',', '.'));
    if (isNaN(dep)) return null;

    const ac = parseInt(m[3], 10);
    const decaRaw = m[4];

    return {
        nome,
        dep,
        ac:   (ac >= 0 && ac <= 100) ? ac : null,
        deca: decaRaw === '-' ? null : decaRaw,
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

    const lineNorm = normalizeLines(rawText);
    const section  = extractAvaliacaoSection(lineNorm);
    const data     = parseAvaliacaoGeneticaSection(section);

    return { data, rawText, section };
}

/**
 * Parseia o texto da seção de Avaliação Genética.
 */
export function parseAvaliacaoGeneticaSection(text: string): AvaliacaoGeneticaData {
    const lines = text.split('\n').filter(l => l.trim());

    const metrics = parseTopMetrics(lines);
    const result: AvaliacaoGeneticaData = {
        ...metrics,
        composem_iabcz: {},
        nao_composem_iabcz: {},
    };

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

        // ── 2. Tenta parsear como linha de característica (se já há categoria ativa) ──
        if (currentCategory) {
            const trait = parseTraitRow(line);
            if (trait) {
                const target = currentBlock === 'composem'
                    ? result.composem_iabcz
                    : result.nao_composem_iabcz;
                if (!target[currentCategory]) target[currentCategory] = [];
                target[currentCategory]!.push(trait);
                continue;
            }
        }

        // ── 3. Detecta cabeçalho de categoria ──
        //    Inclui linhas concatenadas como "CARACTERÍSTICAS DE CRESCIMENTODEPAC %DECA"
        const upTrimmed = u(trimmed);
        for (const { re, key } of CATEGORY_PATTERNS) {
            if (re.test(upTrimmed)) {
                currentCategory = key;
                break;
            }
        }
    }

    return result;
}
