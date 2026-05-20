#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: false });
dotenv.config({ path: '.env', override: false });

const DEFAULT_PROJECT_ID = '430113';
const DEFAULT_HOST = 'https://us.i.posthog.com';
const TZ = 'America/Sao_Paulo';

const args = parseArgs(process.argv.slice(2));
const days = positiveInt(args.days, 30);
const limit = positiveInt(args.limit, 40);
const detailLimit = positiveInt(args.detail, 12);
const outPath = args.out || join('tmp', `posthog-leak-report-${new Date().toISOString().slice(0, 10)}.md`);
const jsonPath = args.json || outPath.replace(/\.md$/i, '.json');

const projectId = process.env.POSTHOG_PROJECT_ID || DEFAULT_PROJECT_ID;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_HOST;
const apiKey = process.env.POSTHOG_PERSONAL_API_KEY || '';

if (!apiKey) {
    fail([
        'Missing POSTHOG_PERSONAL_API_KEY.',
        '',
        'Set it only in your local shell or .env.local, then run again. Do not paste it in chat.',
        'PowerShell example:',
        "  $env:POSTHOG_PERSONAL_API_KEY='phx_...'",
        `  node scripts/posthog-investigate-leaks.mjs --days ${days}`,
    ].join('\n'));
}

const apiHost = apiHostForQueries(host);
const projectUrl = `https://us.posthog.com/project/${projectId}`;

console.log(`PostHog project: ${projectId}`);
console.log(`Window: last ${days} days`);
console.log('Running HogQL queries...');

const topVisitors = await runHogQL(`
SELECT
    distinct_id,
    count() AS total_events,
    countIf(event = '$pageview') AS pageviews,
    count(DISTINCT properties.$session_id) AS sessions,
    countIf(event = 'lp_form_submit') AS lp_form_submits,
    countIf(event = 'lp_whatsapp_redirect') AS lp_whatsapp_redirects,
    countIf(event = 'whatsapp_cta_click') AS whatsapp_cta_clicks,
    countIf(event = 'lote_view') AS lote_views,
    countIf(event = 'lote_reserva_click') AS lote_reserva_clicks,
    min(timestamp) AS first_seen,
    max(timestamp) AS last_seen,
    any(properties.$browser) AS browser,
    any(properties.$os) AS os,
    any(properties.$device_type) AS device,
    any(properties.$geoip_city_name) AS city,
    any(properties.$geoip_subdivision_1_name) AS region,
    any(properties.$geoip_country_name) AS country
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND distinct_id IS NOT NULL
  AND event IN (
    '$pageview',
    'lp_form_submit',
    'lp_whatsapp_redirect',
    'whatsapp_cta_click',
    'lote_view',
    'lote_reserva_click'
  )
GROUP BY distinct_id
HAVING sessions >= 2
    OR pageviews >= 4
    OR lp_form_submits > 0
    OR lp_whatsapp_redirects > 0
    OR whatsapp_cta_clicks > 0
    OR lote_reserva_clicks > 0
ORDER BY
    sessions DESC,
    pageviews DESC,
    total_events DESC
LIMIT ${limit}
`);

const visitorRows = rows(topVisitors).map((r) => ({
    distinct_id: String(r[0] ?? ''),
    total_events: Number(r[1] ?? 0),
    pageviews: Number(r[2] ?? 0),
    sessions: Number(r[3] ?? 0),
    lp_form_submits: Number(r[4] ?? 0),
    lp_whatsapp_redirects: Number(r[5] ?? 0),
    whatsapp_cta_clicks: Number(r[6] ?? 0),
    lote_views: Number(r[7] ?? 0),
    lote_reserva_clicks: Number(r[8] ?? 0),
    first_seen: r[9],
    last_seen: r[10],
    browser: str(r[11]),
    os: str(r[12]),
    device: str(r[13]),
    city: str(r[14]),
    region: str(r[15]),
    country: str(r[16]),
}));

const topIds = visitorRows.slice(0, detailLimit).map((r) => r.distinct_id).filter(Boolean);

let pathRows = [];
let eventRows = [];
let sessionRows = [];

if (topIds.length) {
    const idList = topIds.map(sqlString).join(', ');

    const paths = await runHogQL(`
SELECT
    distinct_id,
    properties.$pathname AS pathname,
    properties.$current_url AS current_url,
    count() AS pageviews,
    count(DISTINCT properties.$session_id) AS sessions,
    min(timestamp) AS first_seen,
    max(timestamp) AS last_seen,
    any(properties.utm_source) AS utm_source,
    any(properties.utm_campaign) AS utm_campaign
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND event = '$pageview'
  AND distinct_id IN (${idList})
GROUP BY distinct_id, pathname, current_url
ORDER BY distinct_id ASC, pageviews DESC
LIMIT ${Math.max(200, detailLimit * 25)}
`);

    pathRows = rows(paths).map((r) => ({
        distinct_id: String(r[0] ?? ''),
        pathname: str(r[1]),
        current_url: str(r[2]),
        pageviews: Number(r[3] ?? 0),
        sessions: Number(r[4] ?? 0),
        first_seen: r[5],
        last_seen: r[6],
        utm_source: str(r[7]),
        utm_campaign: str(r[8]),
    }));

    const events = await runHogQL(`
SELECT
    distinct_id,
    timestamp,
    event,
    properties.$session_id AS session_id,
    properties.$pathname AS pathname,
    properties.$current_url AS current_url,
    properties.$referrer AS referrer,
    properties.utm_source AS utm_source,
    properties.utm_campaign AS utm_campaign,
    properties.product_name AS product_name,
    properties.kind AS kind,
    properties.mql AS mql,
    properties.uf AS uf,
    properties.quantidade_cabecas AS quantidade_cabecas
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND distinct_id IN (${idList})
  AND event IN (
    '$pageview',
    'lp_form_submit',
    'lp_whatsapp_redirect',
    'whatsapp_cta_click',
    'lote_view',
    'lote_reserva_click'
  )
ORDER BY distinct_id ASC, timestamp ASC
LIMIT ${Math.max(500, detailLimit * 100)}
`);

    eventRows = rows(events).map((r) => ({
        distinct_id: String(r[0] ?? ''),
        timestamp: r[1],
        event: str(r[2]),
        session_id: str(r[3]),
        pathname: str(r[4]),
        current_url: str(r[5]),
        referrer: str(r[6]),
        utm_source: str(r[7]),
        utm_campaign: str(r[8]),
        product_name: str(r[9]),
        kind: str(r[10]),
        mql: str(r[11]),
        uf: str(r[12]),
        quantidade_cabecas: str(r[13]),
    }));

    const sessions = await runHogQL(`
SELECT
    distinct_id,
    properties.$session_id AS session_id,
    count() AS events,
    countIf(event = '$pageview') AS pageviews,
    min(timestamp) AS started_at,
    max(timestamp) AS ended_at,
    any(properties.$browser) AS browser,
    any(properties.$os) AS os,
    any(properties.$device_type) AS device
FROM events
WHERE timestamp >= now() - INTERVAL ${days} DAY
  AND distinct_id IN (${idList})
  AND properties.$session_id IS NOT NULL
GROUP BY distinct_id, session_id
ORDER BY distinct_id ASC, started_at ASC
LIMIT ${Math.max(300, detailLimit * 50)}
`);

    sessionRows = rows(sessions).map((r) => ({
        distinct_id: String(r[0] ?? ''),
        session_id: str(r[1]),
        events: Number(r[2] ?? 0),
        pageviews: Number(r[3] ?? 0),
        started_at: r[4],
        ended_at: r[5],
        browser: str(r[6]),
        os: str(r[7]),
        device: str(r[8]),
    }));
}

const ranked = visitorRows.map((r) => ({
    ...r,
    suspicion_score:
        r.sessions * 5 +
        r.pageviews +
        r.lp_form_submits * 12 +
        r.lp_whatsapp_redirects * 10 +
        r.whatsapp_cta_clicks * 8 +
        r.lote_reserva_clicks * 8,
})).sort((a, b) => b.suspicion_score - a.suspicion_score);

const report = renderReport({
    days,
    limit,
    detailLimit,
    projectUrl,
    ranked,
    pathRows,
    eventRows,
    sessionRows,
});

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, report, 'utf8');
await writeFile(jsonPath, JSON.stringify({
    generated_at: new Date().toISOString(),
    project_id: projectId,
    days,
    top_visitors: ranked,
    paths: pathRows,
    events: eventRows,
    sessions: sessionRows,
}, null, 2), 'utf8');

console.log(`Report: ${outPath}`);
console.log(`Raw JSON: ${jsonPath}`);
console.log('');
console.log('Top signals:');
for (const row of ranked.slice(0, 10)) {
    console.log([
        `score=${row.suspicion_score}`,
        `distinct_id=${row.distinct_id}`,
        `sessions=${row.sessions}`,
        `pageviews=${row.pageviews}`,
        `lp_submit=${row.lp_form_submits}`,
        `wa=${row.lp_whatsapp_redirects + row.whatsapp_cta_clicks}`,
        `last=${fmt(row.last_seen)}`,
    ].join(' | '));
}

function renderReport(data) {
    const lines = [];
    lines.push('# PostHog leak investigation');
    lines.push('');
    lines.push(`Generated at: ${new Date().toLocaleString('pt-BR', { timeZone: TZ })}`);
    lines.push(`Window: last ${data.days} days`);
    lines.push(`Project: ${data.projectUrl}`);
    lines.push('');
    lines.push('Important: this report identifies repeated browsers/devices and identified PostHog users. It is a lead for investigation, not proof of a civil identity.');
    lines.push('');

    lines.push('## Ranked visitors');
    lines.push('');
    lines.push(mdTable(
        ['score', 'distinct_id', 'sessions', 'pageviews', 'lead_submit', 'whatsapp', 'lote_views', 'reserva', 'first_seen', 'last_seen', 'device', 'place'],
        data.ranked.slice(0, data.limit).map((r) => [
            r.suspicion_score,
            r.distinct_id,
            r.sessions,
            r.pageviews,
            r.lp_form_submits,
            r.lp_whatsapp_redirects + r.whatsapp_cta_clicks,
            r.lote_views,
            r.lote_reserva_clicks,
            fmt(r.first_seen),
            fmt(r.last_seen),
            compact([r.browser, r.os, r.device]),
            compact([r.city, r.region, r.country]),
        ])
    ));
    lines.push('');

    lines.push('## Paths for top visitors');
    lines.push('');
    lines.push(mdTable(
        ['distinct_id', 'pageviews', 'sessions', 'path', 'utm_source', 'utm_campaign', 'first_seen', 'last_seen'],
        data.pathRows.slice(0, 160).map((r) => [
            r.distinct_id,
            r.pageviews,
            r.sessions,
            r.pathname || r.current_url,
            r.utm_source,
            r.utm_campaign,
            fmt(r.first_seen),
            fmt(r.last_seen),
        ])
    ));
    lines.push('');

    lines.push('## Sessions for top visitors');
    lines.push('');
    lines.push(mdTable(
        ['distinct_id', 'session_id', 'events', 'pageviews', 'started_at', 'ended_at', 'device'],
        data.sessionRows.slice(0, 180).map((r) => [
            r.distinct_id,
            r.session_id,
            r.events,
            r.pageviews,
            fmt(r.started_at),
            fmt(r.ended_at),
            compact([r.browser, r.os, r.device]),
        ])
    ));
    lines.push('');

    lines.push('## Event timeline for top visitors');
    lines.push('');
    lines.push(mdTable(
        ['distinct_id', 'timestamp', 'event', 'session_id', 'path', 'utm', 'product', 'lead_signal'],
        data.eventRows.slice(0, 260).map((r) => [
            r.distinct_id,
            fmt(r.timestamp),
            r.event,
            r.session_id,
            r.pathname || r.current_url,
            compact([r.utm_source, r.utm_campaign]),
            compact([r.product_name, r.kind]),
            compact([r.mql ? `mql=${r.mql}` : '', r.uf, r.quantidade_cabecas]),
        ])
    ));
    lines.push('');

    lines.push('## How to read');
    lines.push('');
    lines.push('- Same distinct_id with many sessions means the same browser/device came back often.');
    lines.push('- Same distinct_id hitting group/LP, WhatsApp CTA, and many product/lote pages is stronger than pageviews alone.');
    lines.push('- If distinct_id looks like a phone number, PostHog was identified after LP form submit and can be crossed with the CRM lead.');
    lines.push('- Use session_id in PostHog Session Replay to watch behavior when recordings exist.');
    lines.push('- Cross the timestamps with WhatsApp/group messages and any external prospecting attempts.');
    lines.push('');

    return lines.join('\n');
}

async function runHogQL(query) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
        const res = await fetch(`${apiHost}/api/projects/${projectId}/query/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                query: { kind: 'HogQLQuery', query },
            }),
            signal: controller.signal,
        });
        const text = await res.text();
        if (!res.ok) {
            throw new Error(`PostHog query failed (${res.status}): ${text}`);
        }
        return JSON.parse(text);
    } finally {
        clearTimeout(timer);
    }
}

function rows(result) {
    return Array.isArray(result?.results) ? result.results : [];
}

function apiHostForQueries(value) {
    try {
        const url = new URL(value);
        url.host = url.host.replace(/^([a-z]+)\.i\.posthog\.com$/, '$1.posthog.com');
        return `${url.protocol}//${url.host}`;
    } catch {
        return 'https://us.posthog.com';
    }
}

function parseArgs(argv) {
    const parsed = {};
    for (let i = 0; i < argv.length; i += 1) {
        const item = argv[i];
        if (!item.startsWith('--')) continue;
        const [rawKey, inlineValue] = item.slice(2).split('=', 2);
        const value = inlineValue ?? argv[i + 1];
        if (inlineValue === undefined) i += 1;
        parsed[rawKey] = value;
    }
    return parsed;
}

function positiveInt(value, fallback) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : fallback;
}

function sqlString(value) {
    return `'${String(value).replace(/'/g, "\\'")}'`;
}

function str(value) {
    if (value === null || value === undefined) return '';
    return String(value);
}

function compact(values) {
    return values.filter((v) => String(v ?? '').trim()).join(' / ');
}

function fmt(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.valueOf())) return String(value);
    return d.toLocaleString('pt-BR', { timeZone: TZ });
}

function mdTable(headers, rowsToRender) {
    if (!rowsToRender.length) return '_No rows._';
    const clean = (v) => String(v ?? '').replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
    const lines = [];
    lines.push(`| ${headers.map(clean).join(' |')} |`);
    lines.push(`| ${headers.map(() => '---').join(' |')} |`);
    for (const row of rowsToRender) {
        lines.push(`| ${row.map(clean).join(' |')} |`);
    }
    return lines.join('\n');
}

function fail(message) {
    console.error(message);
    process.exit(1);
}
