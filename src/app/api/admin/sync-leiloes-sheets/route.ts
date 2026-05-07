import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';

const GITHUB_OWNER = 'Masterjhony';
const GITHUB_REPO = 'formula_do_boi';
const WORKFLOW_FILE = 'sync-leiloes.yml';
const WORKFLOW_REF = 'main';

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          'GITHUB_DISPATCH_TOKEN não configurado. Crie um Personal Access Token (fine-grained) com permissão Actions:write no repo Masterjhony/formula_do_boi e adicione como env var na Vercel.',
      },
      { status: 503 }
    );
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: WORKFLOW_REF }),
  });

  if (res.status === 204) {
    return NextResponse.json({
      ok: true,
      message: 'Sincronização disparada — leva ~1 minuto pra concluir.',
      url: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`,
    });
  }

  const body = await res.text();
  return NextResponse.json(
    { error: `GitHub API ${res.status}: ${body}` },
    { status: 502 }
  );
}
