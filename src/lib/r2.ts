/**
 * Cloudflare R2 — cliente S3-compatible para biblioteca de mídia (backups,
 * arquivos grandes). USO EXCLUSIVAMENTE NO SERVIDOR. Nunca importar este arquivo
 * em código que vai pro browser — as credenciais R2_* não são públicas.
 *
 * Convenções:
 * - Todo objeto vive sob R2_PREFIX (default "libmedia/"). As funções aceitam
 *   tanto o "key" completo (ex.: "libmedia/foo.zip") quanto o nome relativo
 *   ao prefixo (ex.: "foo.zip"); internamente é sempre normalizado para o
 *   formato completo antes de falar com o R2.
 * - URLs públicas não existem (bucket privado). Para baixar/compartilhar,
 *   gere uma signed URL via `getR2DownloadUrl`. Para upload direto do browser,
 *   use `getR2UploadUrl` (presigned PUT).
 */

import 'server-only';
import {
    S3Client,
    ListObjectsV2Command,
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createClient } from '@/utils/supabase/server';

// ── Config & client ────────────────────────────────────────────────────────────

function getEnv(name: string, fallback?: string): string {
    const v = process.env[name] ?? fallback;
    if (!v) throw new Error(`Variável de ambiente ${name} não configurada.`);
    return v;
}

export const R2_BUCKET = getEnv('R2_BUCKET');
export const R2_PREFIX = (process.env.R2_PREFIX ?? '').replace(/^\/+/, '');

let _client: S3Client | null = null;
function getClient(): S3Client {
    if (_client) return _client;
    _client = new S3Client({
        region: 'auto',
        endpoint: getEnv('R2_ENDPOINT'),
        credentials: {
            accessKeyId: getEnv('R2_ACCESS_KEY_ID'),
            secretAccessKey: getEnv('R2_SECRET_ACCESS_KEY'),
        },
    });
    return _client;
}

// ── Auth ───────────────────────────────────────────────────────────────────────

/** Garante que a request vem de um admin autenticado, ou lança. */
export async function assertR2Admin(): Promise<void> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Não autenticado.');
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    if (profile?.role !== 'admin') throw new Error('Acesso negado.');
}

// ── Key helpers ────────────────────────────────────────────────────────────────

/** Garante que o key está sob o prefixo permitido. Aceita "foo.zip" ou
 *  "libmedia/foo.zip"; retorna sempre a forma completa. Lança se o caller
 *  tentar escapar do prefixo (ex.: "../outra-pasta/x.zip"). */
export function resolveR2Key(rawKey: string): string {
    if (!rawKey || typeof rawKey !== 'string') {
        throw new Error('Key inválido.');
    }
    if (rawKey.includes('..') || rawKey.startsWith('/')) {
        throw new Error('Key inválido.');
    }
    const full = rawKey.startsWith(R2_PREFIX) ? rawKey : `${R2_PREFIX}${rawKey}`;
    if (!full.startsWith(R2_PREFIX)) {
        throw new Error('Key fora do prefixo permitido.');
    }
    return full;
}

/** Remove o prefixo da key para exibição relativa na UI. */
export function stripR2Prefix(key: string): string {
    return key.startsWith(R2_PREFIX) ? key.slice(R2_PREFIX.length) : key;
}

/** Sanitiza um nome de arquivo cliente para usar como key. Mantém ext. */
export function sanitizeR2Filename(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9._\-]/g, '_');
    return `${Date.now()}_${cleaned}`;
}

// ── Operations ─────────────────────────────────────────────────────────────────

export type R2Object = {
    /** Key completo (com prefixo). */
    key: string;
    /** Nome relativo ao prefixo, para exibir na UI. */
    name: string;
    size: number;
    lastModified: string | null;
    etag: string | null;
};

export type R2ListResult = {
    objects: R2Object[];
    nextToken: string | null;
    truncated: boolean;
};

/** Lista objetos do bucket sob R2_PREFIX. Suporta paginação. */
export async function listR2Objects(opts?: {
    continuationToken?: string;
    maxKeys?: number;
}): Promise<R2ListResult> {
    const client = getClient();
    const out = await client.send(
        new ListObjectsV2Command({
            Bucket: R2_BUCKET,
            Prefix: R2_PREFIX || undefined,
            MaxKeys: opts?.maxKeys ?? 1000,
            ContinuationToken: opts?.continuationToken || undefined,
        })
    );
    const objects: R2Object[] = (out.Contents ?? [])
        // Filtra "diretórios" vazios (key terminando em /).
        .filter(o => o.Key && !o.Key.endsWith('/'))
        .map(o => ({
            key: o.Key!,
            name: stripR2Prefix(o.Key!),
            size: o.Size ?? 0,
            lastModified: o.LastModified ? o.LastModified.toISOString() : null,
            etag: o.ETag ?? null,
        }));
    return {
        objects,
        nextToken: out.NextContinuationToken ?? null,
        truncated: !!out.IsTruncated,
    };
}

/** Gera URL assinada para DOWNLOAD privado. Default 1h, máx 7 dias (limite S3). */
export async function getR2DownloadUrl(
    rawKey: string,
    opts?: { expiresInSeconds?: number; downloadAs?: string }
): Promise<string> {
    const Key = resolveR2Key(rawKey);
    const expiresIn = Math.min(Math.max(opts?.expiresInSeconds ?? 3600, 60), 7 * 24 * 3600);
    const cmd = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key,
        // Sugere ao browser baixar com nome amigável em vez de tentar abrir.
        ResponseContentDisposition: opts?.downloadAs
            ? `attachment; filename="${opts.downloadAs.replace(/"/g, '')}"`
            : undefined,
    });
    return getSignedUrl(getClient(), cmd, { expiresIn });
}

/** Gera URL assinada para UPLOAD direto (PUT) do browser pro R2. Limite 5GB
 *  por requisição (single-part). Pra arquivos maiores, evoluir pra multipart. */
export async function getR2UploadUrl(
    rawKey: string,
    opts?: { contentType?: string; expiresInSeconds?: number }
): Promise<{ url: string; key: string }> {
    const Key = resolveR2Key(rawKey);
    const expiresIn = Math.min(Math.max(opts?.expiresInSeconds ?? 3600, 60), 24 * 3600);
    const cmd = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key,
        ContentType: opts?.contentType,
    });
    const url = await getSignedUrl(getClient(), cmd, { expiresIn });
    return { url, key: Key };
}

export async function deleteR2Object(rawKey: string): Promise<void> {
    const Key = resolveR2Key(rawKey);
    await getClient().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key }));
}

export async function headR2Object(rawKey: string) {
    const Key = resolveR2Key(rawKey);
    return getClient().send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key }));
}
