/**
 * Aplica os templates do welcome v2 (bate-papo) direto no Supabase via SDK.
 *
 * Equivale a rodar database/seed_welcome_bate_papo_v1.sql + atualizar o
 * template agendamento-link com o novo link curto público — mas sem
 * depender de psql/Supabase CLI.
 *
 * Uso:
 *   node --env-file=.env.local scripts/apply-welcome-bate-papo.mjs
 *
 * Lê NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY do .env.local.
 * Faz upsert por slug — idempotente. Pode ser re-executado sem efeito
 * colateral.
 */

import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
    console.error('❌ Faltam NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY no .env.local')
    process.exit(1)
}

const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
})

const templates = [
    {
        slug: 'welcome-default',
        title: 'Boas-vindas (padrão · Matheus · bate-papo v1)',
        category: 'welcome',
        body: [
            'Olá, {nome}, tudo bem?',
            '',
            'Aqui é o Matheus, da Fórmula do Boi.',
            '',
            'Quero te dar as boas-vindas e deixar este canal aberto para que você receba apenas conteúdos e oportunidades alinhados ao seu interesse dentro da genética Nelore P.O.',
            '',
            'Hoje a Fórmula do Boi atua como um canal direto de comercialização de genética, conectando criadores ao que existe de mais avançado na raça Nelore P.O através de três frentes estratégicas:',
            '',
            '* Aceleradora de Touros — seleção de reprodutores com excelência zootécnica e avaliações nos principais programas da ABCZ;',
            '',
            '* Central de Embriões — oferta de embriões de doadoras importantes, com acasalamentos direcionados e foco em produtividade e evolução genética;',
            '',
            '* Assessoria em Leilões — atuação estratégica nos principais leilões da raça, aproximando compradores das melhores oportunidades do mercado.',
            '',
            'Antes de mais nada, queria te convidar para um bate-papo direto comigo por chamada — uns 15 a 20 minutos. Assim eu entendo seu momento na pecuária e te direciono com mais precisão dentro de cada uma dessas frentes.',
            '',
            'Topa? Me responde com o número da opção:',
            '',
            '1 — Sim, quero agendar uma conversa com você',
            '2 — Por enquanto prefiro só receber informações por aqui',
            '',
            'Fico à disposição.',
            '',
            'Caso não queira mais receber nossas mensagens, basta responder PARAR.',
        ].join('\n'),
        variables: ['nome'],
    },
    {
        slug: 'bate-papo-aceito',
        title: 'Bate-papo · aceito (link agendamento)',
        category: 'agendamento',
        body: [
            'Que ótimo, {nome}.',
            '',
            'Vou te mandar o link da minha agenda — escolhe o horário que te atende melhor (dias úteis, das 14h às 16h30, horário de Brasília):',
            '',
            'https://formuladoboi.com/agendar',
            '',
            'Assim que você confirmar, recebo aqui e te ligo no horário marcado. Se precisar de outro horário, é só me avisar por aqui mesmo.',
        ].join('\n'),
        variables: ['nome'],
    },
    {
        slug: 'bate-papo-recusado',
        title: 'Bate-papo · recusado (menu de interesses)',
        category: 'triagem',
        body: [
            'Combinado, {nome}.',
            '',
            'Vou manter este canal aberto e te enviar apenas oportunidades alinhadas ao seu interesse. Sempre que quiser conversar comigo diretamente, é só me chamar por aqui — agendamos uma chamada na hora.',
            '',
            'Pra eu direcionar o conteúdo certo pra você, me responde com o número da opção que mais faz sentido pro seu momento:',
            '',
            '1 — Sêmen',
            '2 — Embriões',
            '3 — Compra e venda de genética Nelore P.O',
            '4 — Todos',
            '',
            'Caso prefira sair da lista, basta responder PARAR.',
        ].join('\n'),
        variables: ['nome'],
    },
    // Também atualiza o agendamento-link já existente pra usar a URL curta
    // (consistência com bate-papo-aceito — operador que mandar manual pelo
    // Inbox vê o mesmo link).
    {
        slug: 'agendamento-link',
        title: 'Agendamento · link agenda',
        category: 'agendamento',
        body: [
            'Perfeito, {nome}. Vou te mandar o link da minha agenda — escolhe o horário que te atende melhor (dias úteis, das 14h às 16h30, horário de Brasília):',
            '',
            'https://formuladoboi.com/agendar',
            '',
            'Assim que você confirmar, recebo aqui e te ligo no horário marcado.',
        ].join('\n'),
        variables: ['nome'],
    },
]

console.log(`📤 Aplicando ${templates.length} templates no Supabase (${url})…\n`)

let okCount = 0
let failCount = 0

for (const tpl of templates) {
    const payload = {
        slug: tpl.slug,
        title: tpl.title,
        category: tpl.category,
        body: tpl.body,
        variables: tpl.variables,
        archived: false,
        updated_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
        .from('whatsapp_templates')
        .upsert(payload, { onConflict: 'slug' })
        .select('id, slug, title, updated_at')
        .single()

    if (error) {
        console.error(`❌ ${tpl.slug}: ${error.message}`)
        failCount++
        continue
    }
    console.log(`✅ ${tpl.slug}  →  id=${data.id}  (${tpl.body.length} chars)`)
    okCount++
}

console.log(`\nResumo: ${okCount} OK · ${failCount} falha(s)`)
process.exit(failCount > 0 ? 1 : 0)
