// Parser leve do formato OFX (Open Financial Exchange) usado pelos extratos do Inter,
// Bradesco, Itaú etc. Aceita tanto a variante SGML (tags sem fechamento) quanto a XML.
// Lê apenas o que interessa para conciliação: STMTTRN + LEDGERBAL.

export interface OfxTransaction {
    fitid: string;
    type: 'income' | 'expense';
    amount: number;        // sempre positivo
    rawAmount: number;     // com sinal original do OFX
    date: string;          // YYYY-MM-DD
    name: string;          // contraparte
    memo: string;          // descrição completa
    trntype: string;       // PAYMENT / CREDIT / DEBIT / ...
}

export interface OfxStatement {
    bankId: string | null;
    accountId: string | null;
    currency: string | null;
    dateStart: string | null;
    dateEnd: string | null;
    ledgerBalance: number | null;
    ledgerDate: string | null;
    transactions: OfxTransaction[];
}

const stripBom = (s: string) => s.replace(/^\uFEFF|^\u00EF\u00BB\u00BF/, '');

// OFX SGML não fecha as tags; transformamos cada `<TAG>value` em `<TAG>value</TAG>`
// só nas tags de dados (que sempre vêm seguidas de texto não-tag). Tags estruturais
// (que abrem outro `<` na linha) são deixadas em paz.
function sgmlToXml(input: string): string {
    const headerEnd = input.indexOf('<OFX>');
    const body = headerEnd >= 0 ? input.slice(headerEnd) : input;
    // Normaliza quebras
    const lines = body.split(/\r?\n/);
    const out: string[] = [];
    for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        // Tags de dados SGML: `<TAG>value` sem outro `<` depois.
        // Se o banco já mandou XML (`<TAG>value</TAG>`), preserva a linha.
        const m = line.match(/^<([A-Z0-9.]+)>([^<]+)$/);
        if (m) {
            out.push(`<${m[1]}>${escapeXml(m[2])}</${m[1]}>`);
        } else {
            out.push(line);
        }
    }
    return out.join('\n');
}

function escapeXml(v: string): string {
    return v
        .replace(/&(?!(amp|lt|gt|quot|apos);)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Extrai todos os blocos <TAG>...</TAG> de um corpo XML usando regex (evita dep externa).
function extractAll(xml: string, tag: string): string[] {
    const rx = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const out: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = rx.exec(xml))) out.push(m[1]);
    return out;
}

function extractOne(xml: string, tag: string): string | null {
    const rx = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = xml.match(rx);
    return m ? m[1].trim() : null;
}

// OFX usa data no formato YYYYMMDD[HHMMSS[.XXX][+TZ:CC]] — pegamos só a parte da data.
function parseOfxDate(raw: string | null): string | null {
    if (!raw) return null;
    const m = raw.trim().match(/^(\d{4})(\d{2})(\d{2})/);
    if (!m) return null;
    return `${m[1]}-${m[2]}-${m[3]}`;
}

function decodeMemo(s: string): string {
    // O Inter coloca o memo entre aspas com prefixo `Cp :<docnumber>-`.
    // Devolvemos a string limpa de aspas externas; o texto continua interpretável.
    const trimmed = s.trim().replace(/^"+|"+$/g, '').trim();
    return trimmed.replace(/\s+/g, ' ');
}

export function parseOfx(raw: string): OfxStatement {
    const input = stripBom(raw);
    const xml = sgmlToXml(input);

    const stmt = extractOne(xml, 'STMTRS') ?? xml;

    const bankId = extractOne(stmt, 'BANKID');
    const accountId = extractOne(stmt, 'ACCTID');
    const currency = extractOne(stmt, 'CURDEF');
    const dateStart = parseOfxDate(extractOne(stmt, 'DTSTART'));
    const dateEnd = parseOfxDate(extractOne(stmt, 'DTEND'));

    const ledgerBlock = extractOne(stmt, 'LEDGERBAL');
    const ledgerBalance = ledgerBlock ? parseFloat(extractOne(ledgerBlock, 'BALAMT') ?? '0') || 0 : null;
    const ledgerDate = ledgerBlock ? parseOfxDate(extractOne(ledgerBlock, 'DTASOF')) : null;

    const trnBlocks = extractAll(stmt, 'STMTTRN');
    const transactions: OfxTransaction[] = trnBlocks.map((b) => {
        const trntype = (extractOne(b, 'TRNTYPE') || '').toUpperCase();
        const fitid = (extractOne(b, 'FITID') || '').trim();
        const dt = parseOfxDate(extractOne(b, 'DTPOSTED')) || dateEnd || dateStart || '';
        const amtRaw = parseFloat(extractOne(b, 'TRNAMT') || '0') || 0;
        const name = decodeMemo(extractOne(b, 'NAME') || '');
        const memo = decodeMemo(extractOne(b, 'MEMO') || '');
        return {
            fitid,
            trntype,
            rawAmount: amtRaw,
            amount: Math.abs(amtRaw),
            type: (amtRaw >= 0 ? 'income' : 'expense') as 'income' | 'expense',
            date: dt,
            name,
            memo,
        };
    }).filter(t => t.fitid && t.amount > 0);

    return {
        bankId,
        accountId,
        currency,
        dateStart,
        dateEnd,
        ledgerBalance,
        ledgerDate,
        transactions,
    };
}

// ─── Matching contra transações pendentes do ERP ──────────────────────────────
//
// Heurística: mesma conta, mesmo tipo (income/expense), valor exato (tolerância
// de R$ 0,01) e diferença de até `dayWindow` dias entre as datas. Pontua-se cada
// candidato (proximidade de data, nome em comum) para ordenar as sugestões.

export interface MatchableTransaction {
    id: string;
    account_id: string;
    type: string;
    amount: number;
    description: string;
    transaction_date: string;
    status: string;
    observacao?: string | null;
    ofx_fitid?: string | null;
}

export interface MatchSuggestion {
    transaction: MatchableTransaction;
    score: number;        // 0..100
    dateDiffDays: number;
    nameOverlap: number;  // 0..1
}

const tokenize = (s: string) =>
    s.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9 ]/g, ' ')
        .split(/\s+/).filter(t => t.length >= 3);

const tokenOverlap = (a: string, b: string): number => {
    const ta = new Set(tokenize(a));
    const tb = new Set(tokenize(b));
    if (ta.size === 0 || tb.size === 0) return 0;
    let hits = 0;
    for (const t of ta) if (tb.has(t)) hits++;
    return hits / Math.min(ta.size, tb.size);
};

const diffDays = (a: string, b: string): number => {
    const da = new Date(a + 'T00:00:00Z').getTime();
    const db = new Date(b + 'T00:00:00Z').getTime();
    return Math.round(Math.abs(da - db) / 86400000);
};

export function findMatches(
    ofxTx: OfxTransaction,
    accountId: string,
    candidates: MatchableTransaction[],
    opts: { dayWindow?: number; amountTolerance?: number } = {}
): MatchSuggestion[] {
    const dayWindow = opts.dayWindow ?? 7;
    const tolerance = opts.amountTolerance ?? 0.01;
    const memoForMatch = `${ofxTx.name} ${ofxTx.memo}`;

    const matches: MatchSuggestion[] = [];
    for (const c of candidates) {
        if (c.account_id !== accountId) continue;
        if (c.type !== ofxTx.type) continue;
        if (Math.abs(Number(c.amount) - ofxTx.amount) > tolerance) continue;
        const dd = diffDays(c.transaction_date, ofxTx.date);
        if (dd > dayWindow) continue;
        const overlap = tokenOverlap(memoForMatch, c.description + ' ' + (c.observacao || ''));
        const dateScore = Math.max(0, 1 - dd / (dayWindow + 1));
        const statusBoost = c.status === 'pending' ? 1 : 0.5;
        const score = Math.round((0.55 * dateScore + 0.35 * overlap + 0.10 * statusBoost) * 100);
        matches.push({ transaction: c, score, dateDiffDays: dd, nameOverlap: overlap });
    }
    return matches.sort((a, b) => b.score - a.score);
}
