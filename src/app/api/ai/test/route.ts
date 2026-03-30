import { NextResponse } from 'next/server';

const GLM_API_KEY = process.env.GLM_API_KEY ?? 'cc315be9de774348a411618c653faad0.ITLRcDX7Memszozq';
const CANDIDATE_MODELS = [
    'glm-4-flash',
    'glm-4',
    'glm-4-plus',
    'glm-4-air',
    'glm-4-airx',
    'glm-4-long',
    'chatglm_turbo',
    'glm-3-turbo',
];

export async function GET() {
    const results: Record<string, string> = {};

    for (const model of CANDIDATE_MODELS) {
        try {
            const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${GLM_API_KEY}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: 'oi' }],
                    max_tokens: 5,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                results[model] = '✅ OK';
            } else {
                results[model] = `❌ ${data?.error?.code ?? res.status}: ${data?.error?.message ?? 'erro'}`;
            }
        } catch (e) {
            results[model] = `💥 ${e instanceof Error ? e.message : 'falha'}`;
        }
    }

    return NextResponse.json({ key_prefix: GLM_API_KEY.slice(0, 8) + '...', results });
}
