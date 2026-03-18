/**
 * Parser de genealogia para fichas técnicas de bovinos PO (ABCZ/ANCP).
 * Extrai ancestrais do padrão "NOME | RG: CODIGO" encontrado na seção GENEALOGIA do PDF.
 */

export interface GenealogyNode {
    nome: string;
    rg?: string;
}

export interface GenealogyData {
    // Geração 1 (pais)
    pai?: GenealogyNode;
    mae?: GenealogyNode;

    // Geração 2 (avós)
    avo_paterno?: GenealogyNode;   // Pai do Pai
    avo_paterna?: GenealogyNode;   // Mãe do Pai
    avo_materno?: GenealogyNode;   // Pai da Mãe
    avo_materna?: GenealogyNode;   // Mãe da Mãe

    // Geração 3 (bisavós - 8 nós)
    bisavo_ppp?: GenealogyNode;    // Pai do Avô Paterno
    bisavo_mpp?: GenealogyNode;    // Mãe do Avô Paterno
    bisavo_pmp?: GenealogyNode;    // Pai da Avó Paterna
    bisavo_mmp?: GenealogyNode;    // Mãe da Avó Paterna
    bisavo_ppm?: GenealogyNode;    // Pai do Avô Materno
    bisavo_mpm?: GenealogyNode;    // Mãe do Avô Materno
    bisavo_pmm?: GenealogyNode;    // Pai da Avó Materna
    bisavo_mmm?: GenealogyNode;    // Mãe da Avó Materna
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
 * Extrai a seção GENEALOGIA do texto completo do PDF.
 * Retorna o texto completo se não encontrar a seção.
 */
function extractSection(text: string): string {
    const upper = text.toUpperCase();
    const headers = ['GENEALOGIA', 'PEDIGREE', 'ÁRVORE GENEALÓGICA', 'ARVORE GENEALOGICA'];

    let start = -1;
    for (const h of headers) {
        const idx = upper.indexOf(h);
        if (idx !== -1) { start = idx; break; }
    }

    if (start === -1) return text;

    // Encontra o próximo cabeçalho de seção (linha em CAPS com ≥4 chars que NÃO é um ancestral)
    const ancestralWords = /PAI|M[AÃ]E|AV[OÔ]|AV[OÓ]|BISAV|REGISTRO|RGD|RG:/i;
    const nextSection = /\n([A-ZÁÉÍÓÚÂÊÔÃÕÇ]{4,}(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]+)*)\s*\n/g;
    nextSection.lastIndex = start + 10;

    let end = text.length;
    let m: RegExpExecArray | null;
    while ((m = nextSection.exec(text)) !== null) {
        if (!ancestralWords.test(m[1])) { end = m.index; break; }
    }

    return text.slice(start, end);
}

/**
 * Tenta extrair um nó GenealogyNode de um trecho de texto.
 * Suporta: "NOME | RG: CODE", "NOME | RGD: CODE", "NOME\nRGD: CODE".
 */
function extractNode(text: string): GenealogyNode | null {
    // Padrão principal: NOME | RG[D]: CODIGO
    const pipeRg = text.match(
        /([A-ZÁÉÍÓÚÂÊÔÃÕÇÜÑ][A-Za-záéíóúâêôãõÁÉÍÓÚÂÊÔÃÕÇÜÑç\s.\-'0-9]+?)\s*\|\s*RGD?N?:?\s*([A-Z0-9][A-Z0-9\s\-./]{0,30})/i
    );
    if (pipeRg) {
        return {
            nome: pipeRg[1].trim(),
            rg: pipeRg[2].trim().replace(/\s+$/, ''),
        };
    }

    // Padrão sem pipe: nome seguido de RGD/RG na mesma linha ou próxima
    const noRg = text.match(
        /([A-ZÁÉÍÓÚÂÊÔÃÕÇÜÑ][A-Za-záéíóúâêôãõÁÉÍÓÚÂÊÔÃÕÇÜÑç\s.\-']{4,}?)(?:\s*\n?\s*RGD?:?\s*([A-Z0-9][A-Z0-9\s\-./]{0,20}))?/i
    );
    if (noRg && noRg[1].trim().length >= 4) {
        const nome = noRg[1].trim();
        // Evita capturar palavras-chave como nome
        if (/^(PAI|M[AÃ]E|AV[OÔ]|AV[OÓ]|BISAV|RG|RGD|GENEALOGIA)$/i.test(nome)) return null;
        return { nome, rg: noRg[2]?.trim() };
    }

    return null;
}

// Mapa de rótulos de label → chave em GenealogyData
type GenealogyKey = keyof GenealogyData;

const INLINE_LABELS: { re: RegExp; key: GenealogyKey }[] = [
    // Bisavós (verificar antes dos avós para evitar match parcial)
    { re: /^BISAV[ÔO]\s*(?:P[.]?P[.]?|PAI\s+DO\s+PAI)\s*:?\s*/i,           key: 'bisavo_ppp' },
    { re: /^BISAV[ÓO]\s*(?:M[.]?P[.]?|M[AÃ]E\s+DO\s+PAI)\s*:?\s*/i,        key: 'bisavo_mpp' },
    { re: /^BISAV[ÔO]\s*(?:P[.]?M[.]?|PAI\s+DA\s+M[AÃ]E)\s*:?\s*/i,        key: 'bisavo_pmp' },
    { re: /^BISAV[ÓO]\s*(?:M[.]?M[.]?|M[AÃ]E\s+DA\s+M[AÃ]E)\s*:?\s*/i,    key: 'bisavo_mmp' },
    { re: /^(?:PAI\s+DO\s+PAI\s+DO\s+PAI|BISAV[ÔO]\s+PP?P?)\s*:?\s*/i,     key: 'bisavo_ppp' },
    { re: /^(?:M[AÃ]E\s+DO\s+PAI\s+DO\s+PAI|BISAV[ÓO]\s+MP?P?)\s*:?\s*/i, key: 'bisavo_mpp' },
    { re: /^(?:PAI\s+DA?\s+AV[ÓO]\s+PAT|BISAV[ÔO]\s+PMP?)\s*:?\s*/i,       key: 'bisavo_pmp' },
    { re: /^(?:M[AÃ]E\s+DA?\s+AV[ÓO]\s+PAT|BISAV[ÓO]\s+MMP?)\s*:?\s*/i,   key: 'bisavo_mmp' },
    { re: /^(?:PAI\s+DO\s+AV[ÔO]\s+MAT|BISAV[ÔO]\s+PPM?)\s*:?\s*/i,        key: 'bisavo_ppm' },
    { re: /^(?:M[AÃ]E\s+DO\s+AV[ÔO]\s+MAT|BISAV[ÓO]\s+MPM?)\s*:?\s*/i,    key: 'bisavo_mpm' },
    { re: /^(?:PAI\s+DA?\s+AV[ÓO]\s+MAT|BISAV[ÔO]\s+PMM?)\s*:?\s*/i,       key: 'bisavo_pmm' },
    { re: /^(?:M[AÃ]E\s+DA?\s+AV[ÓO]\s+MAT|BISAV[ÓO]\s+MMM?)\s*:?\s*/i,   key: 'bisavo_mmm' },

    // Avós
    { re: /^(?:AV[ÔO]\s+PATERNO|AV[ÔO]\s+PAT\.?|PAI\s+DO\s+PAI)\s*:?\s*/i,          key: 'avo_paterno' },
    { re: /^(?:AV[ÓO]\s+PATERNA|AV[ÓO]\s+PAT\.?|M[AÃ]E\s+DO\s+PAI)\s*:?\s*/i,      key: 'avo_paterna' },
    { re: /^(?:AV[ÔO]\s+MATERNO|AV[ÔO]\s+MAT\.?|PAI\s+DA\s+M[AÃ]E)\s*:?\s*/i,      key: 'avo_materno' },
    { re: /^(?:AV[ÓO]\s+MATERNA|AV[ÓO]\s+MAT\.?|M[AÃ]E\s+DA\s+M[AÃ]E)\s*:?\s*/i,  key: 'avo_materna' },

    // Pais (depois dos avós para evitar match de "PAI DO PAI" como "PAI")
    { re: /^(?:TOURO|PAI\s+DO\s+ANIMAL|PAI)\s*:?\s*/i,        key: 'pai' },
    { re: /^(?:VACA|M[AÃ]E\s+DO\s+ANIMAL|M[AÃ]E)\s*:?\s*/i,  key: 'mae' },
];

// Ordem posicional esperada na maioria dos PDFs ABCZ/ANCP
const POSITIONAL_ORDER: GenealogyKey[] = [
    'pai', 'mae',
    'avo_paterno', 'avo_paterna',
    'avo_materno', 'avo_materna',
    'bisavo_ppp', 'bisavo_mpp',
    'bisavo_pmp', 'bisavo_mmp',
    'bisavo_ppm', 'bisavo_mpm',
    'bisavo_pmm', 'bisavo_mmm',
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extrai texto de um PDF público via URL e faz o parse da genealogia.
 * Retorna também o texto bruto para debug.
 */
export async function extractGenealogyFromPdfUrl(pdfUrl: string): Promise<{
    data: GenealogyData;
    rawText: string;
    section: string;
}> {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
        throw new Error(`Falha ao buscar PDF: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // pdf-parse@1.1.1: apontar para o módulo interno evita que ele tente ler
    // arquivos de teste ao ser carregado no contexto do Next.js.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse: (buf: Buffer, opts?: object) => Promise<{ text: string }> =
        require('pdf-parse/lib/pdf-parse.js');
    const parsed = await pdfParse(buffer);
    const rawText = parsed.text;

    const normalized = normalize(rawText);
    const section = extractSection(normalized);
    const data = parseGenealogySection(section);

    return { data, rawText, section };
}

/**
 * Faz o parse de um trecho de texto contendo a seção de genealogia.
 * Estratégia 1: labels explícitos (PAI:, AVÔ PAT.:, etc.)
 * Estratégia 2: posicional — extrai todos os padrões "NOME | RG: CODE" em ordem
 */
export function parseGenealogySection(text: string): GenealogyData {
    const result: GenealogyData = {};
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // ---- Estratégia 1: varredura linha a linha com labels ----
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        for (const { re, key } of INLINE_LABELS) {
            if (result[key]) continue;
            if (!re.test(line)) continue;

            // O nome/RG pode estar no restante da linha ou nas próximas
            const remainder = line.replace(re, '').trim();
            const searchText = [remainder, lines[i + 1] ?? '', lines[i + 2] ?? ''].join('\n');
            const node = extractNode(searchText);
            if (node && node.nome.length >= 4) {
                result[key] = node;
            }
            break;
        }
    }

    // ---- Estratégia 2: posicional (fallback quando labels não encontrados) ----
    if (!result.pai && !result.mae) {
        const globalRe = /([A-ZÁÉÍÓÚÂÊÔÃÕÇÜÑ][A-Za-záéíóúâêôãõÁÉÍÓÚÂÊÔÃÕÇÜÑç\s.\-']+?)\s*\|\s*RGD?N?:?\s*([A-Z0-9][A-Z0-9\s\-./]{0,25})/gi;
        const entries: GenealogyNode[] = [];
        let m: RegExpExecArray | null;

        while ((m = globalRe.exec(text)) !== null) {
            const nome = m[1].trim();
            // Filtra palavras-chave capturas como nome
            if (nome.length < 4) continue;
            if (/^(PAI|M[AÃ]E|AV[OÔ]|AV[OÓ]|BISAV|GENEALOGIA|PEDIGREE|RG|RGD)$/i.test(nome)) continue;
            entries.push({ nome, rg: m[2].trim() });
        }

        entries.forEach((entry, i) => {
            const key = POSITIONAL_ORDER[i];
            if (key && !result[key]) result[key] = entry;
        });
    }

    return result;
}
