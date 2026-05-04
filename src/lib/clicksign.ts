/**
 * Cliente HTTP do ClickSign (API v1).
 *
 * Doc: https://developers.clicksign.com/reference
 * Auth: query param `?access_token=<TOKEN>`. Token configurado em
 * CLICKSIGN_ACCESS_TOKEN. URL base configurável em CLICKSIGN_API_URL
 * (produção: https://app.clicksign.com/api/v1, sandbox: https://sandbox.clicksign.com/api/v1).
 *
 * Apenas servidor — nunca importar do cliente.
 */

const API_URL = (process.env.CLICKSIGN_API_URL || 'https://app.clicksign.com/api/v1').replace(/\/$/, '');
const TOKEN = process.env.CLICKSIGN_ACCESS_TOKEN || '';

export class ClickSignError extends Error {
    status: number;
    body: unknown;
    constructor(message: string, status: number, body: unknown) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

function ensureToken() {
    if (!TOKEN) {
        throw new ClickSignError('CLICKSIGN_ACCESS_TOKEN não configurado.', 500, null);
    }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    ensureToken();
    const sep = path.includes('?') ? '&' : '?';
    const url = `${API_URL}${path}${sep}access_token=${encodeURIComponent(TOKEN)}`;
    const res = await fetch(url, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(init.headers || {}),
        },
        cache: 'no-store',
    });
    const text = await res.text();
    let body: unknown = null;
    if (text) {
        try { body = JSON.parse(text); } catch { body = text; }
    }
    if (!res.ok) {
        const msg = (body && typeof body === 'object' && 'errors' in (body as any))
            ? JSON.stringify((body as any).errors)
            : (typeof body === 'string' ? body : `HTTP ${res.status}`);
        throw new ClickSignError(`ClickSign ${res.status}: ${msg}`, res.status, body);
    }
    return body as T;
}

// ──────────────────────────────────────────────────────────────
// Tipos (minimamente o suficiente para o uso atual)
// ──────────────────────────────────────────────────────────────

export type ClickSignAuthMethod = 'email' | 'sms' | 'whatsapp' | 'pix' | 'icp_brasil';

export type ClickSignSignerInput = {
    name: string;
    email: string;
    phone_number?: string | null; // E.164: "+5511..."
    documentation?: string | null; // CPF "000.000.000-00"
    birthday?: string | null;      // YYYY-MM-DD
    auths?: ClickSignAuthMethod[]; // padrão: ["email"]
    has_documentation?: boolean;
    sign_as?: string;              // Ex: "party", "contractor"
    message?: string | null;
    refusable?: boolean;
};

export type ClickSignDocument = {
    key: string;
    path: string;
    filename?: string;
    status: string; // "running" | "closed" | "cancelled" | etc
    deadline_at?: string | null;
    signed_file_url?: string | null;
    finished_at?: string | null;
    signers?: Array<{
        key: string;
        email?: string;
        name?: string;
        sign_as?: string;
        request_signature_key?: string;
        signed_at?: string | null;
    }>;
};

// ──────────────────────────────────────────────────────────────
// Operações
// ──────────────────────────────────────────────────────────────

/**
 * Cria um documento no ClickSign a partir de um arquivo (base64).
 * `contentBase64` deve incluir o prefixo data URI: "data:application/pdf;base64,...".
 */
export async function createDocument(params: {
    path: string;                 // "/Contratos/contrato.pdf"
    contentBase64: string;        // data URI completo
    deadlineAt?: string;          // ISO 8601
    autoClose?: boolean;
    locale?: string;              // padrão "pt-BR"
    sequenceEnabled?: boolean;
}): Promise<ClickSignDocument> {
    const payload = {
        document: {
            path: params.path,
            content_base64: params.contentBase64,
            deadline_at: params.deadlineAt,
            auto_close: params.autoClose ?? true,
            locale: params.locale ?? 'pt-BR',
            sequence_enabled: params.sequenceEnabled ?? false,
        },
    };
    const res = await request<{ document: ClickSignDocument }>('/documents', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.document;
}

/** Busca o documento (status atual, signatários, signed_file_url, etc). */
export async function getDocument(key: string): Promise<ClickSignDocument> {
    const res = await request<{ document: ClickSignDocument }>(`/documents/${encodeURIComponent(key)}`);
    return res.document;
}

/** Cancela um documento em andamento. */
export async function cancelDocument(key: string): Promise<ClickSignDocument> {
    const res = await request<{ document: ClickSignDocument }>(`/documents/${encodeURIComponent(key)}/cancel`, {
        method: 'POST',
    });
    return res.document;
}

/** Cria um signatário avulso. Retorna o key. */
export async function createSigner(input: ClickSignSignerInput): Promise<{ key: string; email: string; name: string }> {
    const payload = {
        signer: {
            name: input.name,
            email: input.email,
            phone_number: input.phone_number || undefined,
            documentation: input.documentation || undefined,
            birthday: input.birthday || undefined,
            has_documentation: input.has_documentation ?? !!input.documentation,
            auths: input.auths && input.auths.length ? input.auths : ['email'],
        },
    };
    const res = await request<{ signer: { key: string; email: string; name: string } }>('/signers', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.signer;
}

/**
 * Vincula signatário ao documento. Retorna a `request_signature_key`,
 * usada para enviar a notificação por email.
 */
export async function addSignerToDocument(params: {
    documentKey: string;
    signerKey: string;
    signAs?: string;          // padrão "party"
    message?: string | null;
    group?: number;           // ordem (sequence_enabled)
    refusable?: boolean;
}): Promise<{ request_signature_key: string }> {
    const payload = {
        list: {
            document_key: params.documentKey,
            signer_key: params.signerKey,
            sign_as: params.signAs || 'party',
            message: params.message || undefined,
            group: params.group ?? 1,
            refusable: params.refusable ?? true,
        },
    };
    const res = await request<{ list: { request_signature_key: string } }>('/lists', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return res.list;
}

/** Dispara o email de solicitação de assinatura. */
export async function notifySigner(requestSignatureKey: string, message?: string): Promise<void> {
    await request<unknown>('/notifications', {
        method: 'POST',
        body: JSON.stringify({
            request_signature_key: requestSignatureKey,
            message: message || undefined,
        }),
    });
}

/**
 * Helper: faz tudo de uma vez — cria documento, cria cada signatário,
 * vincula e dispara notificações. Retorna o documento e os keys gerados.
 */
export async function sendDocumentForSignature(params: {
    path: string;
    contentBase64: string;
    signers: ClickSignSignerInput[];
    deadlineAt?: string;
    message?: string;
    sequenceEnabled?: boolean;
}): Promise<{
    document: ClickSignDocument;
    signers: Array<{ key: string; email: string; name: string; request_signature_key: string }>;
}> {
    if (!params.signers.length) {
        throw new ClickSignError('Pelo menos um signatário é obrigatório.', 400, null);
    }

    const document = await createDocument({
        path: params.path,
        contentBase64: params.contentBase64,
        deadlineAt: params.deadlineAt,
        autoClose: true,
        sequenceEnabled: params.sequenceEnabled ?? false,
    });

    const enriched: Array<{ key: string; email: string; name: string; request_signature_key: string }> = [];
    for (let i = 0; i < params.signers.length; i++) {
        const s = params.signers[i];
        const signer = await createSigner(s);
        const list = await addSignerToDocument({
            documentKey: document.key,
            signerKey: signer.key,
            signAs: s.sign_as || 'party',
            message: s.message ?? params.message ?? null,
            group: params.sequenceEnabled ? i + 1 : 1,
            refusable: s.refusable ?? true,
        });
        await notifySigner(list.request_signature_key, s.message ?? params.message);
        enriched.push({ ...signer, request_signature_key: list.request_signature_key });
    }

    return { document, signers: enriched };
}

/**
 * Baixa um arquivo (URL pública do Supabase Storage por exemplo) e
 * retorna o data URI base64 esperado pelo ClickSign.
 */
export async function fileUrlToBase64DataUri(fileUrl: string): Promise<string> {
    const res = await fetch(fileUrl, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Falha ao baixar arquivo (${res.status})`);
    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    const mime = res.headers.get('content-type') || guessMime(fileUrl);
    return `data:${mime};base64,${buf.toString('base64')}`;
}

function guessMime(name: string): string {
    const lower = name.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (lower.endsWith('.doc')) return 'application/msword';
    return 'application/octet-stream';
}

/**
 * Valida o HMAC do webhook (se configurado).
 * ClickSign envia o cabeçalho `Content-Hmac` com `sha256=<hex>`.
 */
export async function verifyWebhookHmac(rawBody: string, hmacHeader: string | null): Promise<boolean> {
    const secret = process.env.CLICKSIGN_HMAC_SECRET;
    if (!secret) return true; // se não configurado, aceita (configurar em produção!)
    if (!hmacHeader) return false;
    const expectedHex = hmacHeader.replace(/^sha256=/i, '').trim();
    const { createHmac } = await import('crypto');
    const computed = createHmac('sha256', secret).update(rawBody).digest('hex');
    if (computed.length !== expectedHex.length) return false;
    let mismatch = 0;
    for (let i = 0; i < computed.length; i++) {
        mismatch |= computed.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    return mismatch === 0;
}
