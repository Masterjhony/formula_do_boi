# Central WhatsApp

A **Central WhatsApp** é o módulo do `/web-admin/whatsapp` que atende toda a comunicação 1:1 com leads via WhatsApp: inbox conversacional, bot com fluxo visual editável, biblioteca de templates, campanhas segmentadas, métricas e comandos em grupos.

Este documento é o referencial canônico do como funciona — do bit que chega no Baileys até a linha que aparece no Kanban do CRM.

> Documentação operacional (env vars, comandos SSH/Vercel, lista de rotas) está em [CLAUDE.md](../CLAUDE.md). Aqui o foco é a **lógica interna**.

---

## Sumário

1. [Visão geral](#visão-geral)
2. [Componentes](#componentes)
3. [Tabelas do banco](#tabelas-do-banco)
4. [Fluxo inbound (bot)](#fluxo-inbound-bot)
5. [O grafo de fluxo (V2)](#o-grafo-de-fluxo-v2)
6. [Templates](#templates)
7. [Campanhas (lista de transmissão)](#campanhas-lista-de-transmissão)
8. [Inbox e ações no lead](#inbox-e-ações-no-lead)
9. [Welcome dinâmico (renderização no VPS)](#welcome-dinâmico-renderização-no-vps)
10. [Comandos em grupos](#comandos-em-grupos)
11. [Métricas](#métricas)
12. [Opt-out / compliance](#opt-out--compliance)
13. [Reconectando a sessão](#reconectando-a-sessão)
14. [Onde editar o quê (mapa rápido)](#onde-editar-o-quê-mapa-rápido)

---

## Visão geral

```
  WhatsApp Web
      │
      ▼ WebSocket Baileys
  VPS (165.232.142.37 :3001)
      │
      ├── inbound 1:1  ──► POST /api/whatsapp/inbound
      │                   • encontra/cria lead em crm_leads
      │                   • loga em whatsapp_messages (direction='inbound')
      │                   • carrega grafo (site_settings.whatsapp_flow_v2)
      │                   • executa runFlow() → reply ou silêncio
      │
      ├── /tarefa /decisao /risco /ia (mensagens de grupo)
      │       ──► /api/whatsapp/group-{task|decision|risk|ai}
      │
      ├── pedido de welcome ──► POST /api/whatsapp/render-welcome
      │                   • renderiza template 'welcome-default'
      │                   • respeita opt-out
      │
      └── callback por destinatário em campanha
              ──► POST /api/whatsapp/campaign-callback
                  (atualiza whatsapp_campaign_recipients + contadores)
```

A **fonte única de leads** é `crm_leads`. A Central WhatsApp **não cria contatos paralelos**: ao receber inbound de um número desconhecido, ela cria um lead novo com `origem='whatsapp-central'`. Todos os campos comerciais (interesse, opt-out, handoff, tags) ficam no próprio lead.

---

## Componentes

### UI (Admin)

[src/app/web-admin/(dashboard)/whatsapp/page.tsx](../src/app/web-admin/(dashboard)/whatsapp/page.tsx) — abas:

| Aba | Componente | O que faz |
|---|---|---|
| **Inbox** | [InboxTab.tsx](../src/components/admin/central-whatsapp/InboxTab.tsx) | Lista conversas (uma por número), filtros, abre a thread |
| **Fluxo** | [FluxoTab.tsx](../src/components/admin/central-whatsapp/FluxoTab.tsx) | Editor visual do grafo do bot (@xyflow/react) |
| **Templates** | [TemplatesTab.tsx](../src/components/admin/central-whatsapp/TemplatesTab.tsx) | CRUD da biblioteca de templates |
| **Campanhas** | [CampaignsTab.tsx](../src/components/admin/central-whatsapp/CampaignsTab.tsx) | Criação, preview, disparo e acompanhamento |
| **Métricas** | [MetricsTab.tsx](../src/components/admin/central-whatsapp/MetricsTab.tsx) | KPIs operacionais |
| **Conexão** | [ConexaoTab.tsx](../src/components/admin/central-whatsapp/ConexaoTab.tsx) | QR code do Baileys, status da sessão |

### Bibliotecas (`src/lib/`)

| Arquivo | Responsabilidade |
|---|---|
| [whatsapp.ts](../src/lib/whatsapp.ts) | Proxy HTTP fino para o VPS (`sendWelcomeMessage(phone, name)`) — usado por webhooks legados |
| [whatsapp-central.ts](../src/lib/whatsapp-central.ts) | `classifyMessage()`, `normalizePhone()`, `phoneVariants()`, `renderTemplate()`, lista canônica de `INTERESSES` |
| [whatsapp-flow-engine.ts](../src/lib/whatsapp-flow-engine.ts) | Tipos do grafo + `runFlow()` (interpretador) + `buildDefaultGraph()` (fallback hardcoded) + `validateGraph()` |
| [whatsapp-segment.ts](../src/lib/whatsapp-segment.ts) | `resolveSegment()` — traduz filtros JSON em query no `crm_leads` |

### Rotas (`src/app/api/whatsapp/`)

**Para o VPS** (autenticadas via `x-webhook-secret: WHATSAPP_GROUP_TASK_SECRET`):

| Rota | Quando o VPS chama |
|---|---|
| `POST /inbound` | Toda mensagem 1:1 recebida (`@s.whatsapp.net`) |
| `POST /render-welcome` | Antes de disparar welcome para um lead novo |
| `POST /campaign-callback` | Após tentar enviar cada destinatário de uma campanha |
| `POST /group-task` | Mensagem de grupo iniciada com `/tarefa` |
| `POST /group-decision` | `/decisao` |
| `POST /group-risk` | `/risco` |
| `POST /group-ai` | `/ia` |

**Para o admin** (auth via Supabase SSR + `requireAdmin()`):

| Rota | Propósito |
|---|---|
| `GET /central/inbox` | Lista conversações com filtros (`todos\|aguardando\|handoff\|optout\|interesse`) |
| `GET\|POST /central/thread/[phone]` | Histórico completo + envio manual (bloqueado em opt-out) |
| `POST /central/lead-action` | Ações rápidas (`handoff_on/off`, `optout_on/off`, `set_interesse`) |
| `GET\|POST /central/templates` + `[id]` | CRUD da biblioteca |
| `GET\|POST /central/campaigns` + `[id]` + `[id]/send` + `preview` | Campanhas |
| `GET /central/metrics` | KPIs |
| `GET\|PUT\|DELETE /central/flow` | Grafo do bot (PUT valida via `validateGraph()`; DELETE reseta para o default) |

**Legado** (mantido apenas para compatibilidade):

| Rota | Status |
|---|---|
| `GET\|PUT /flow` (key `whatsapp_flow`) | Deprecated — usar `/central/flow` |
| `GET /messages` | Mantido — últimas 50 + contagem do dia |

---

## Tabelas do banco

Migration canônica: [database/central_whatsapp_06_mai_2026.sql](../database/central_whatsapp_06_mai_2026.sql).

### `crm_leads` (colunas adicionadas pela Central)

| Coluna | Tipo | Default | Para que serve |
|---|---|---|---|
| `interesse_principal` | TEXT | NULL | Interesse identificado pelo bot (`touros`, `matrizes`, `embrioes`, `semen`, `leiloes`, `venda_genetica`, `consultor`, `outro`) |
| `tags_whatsapp` | JSONB | `[]` | Tags livres preenchidas pelo bot e pela equipe (ex: `whatsapp:menu_enviado`, `whatsapp:touros`) |
| `last_whatsapp_at` | TIMESTAMPTZ | NULL | Última mensagem (inbound ou outbound) trocada |
| `handoff_humano` | BOOLEAN | `false` | Quando true, o bot pausa o atendimento automatizado |
| `handoff_at` | TIMESTAMPTZ | NULL | Quando o handoff foi acionado |
| `handoff_responsavel` | TEXT | NULL | Quem ficou responsável |
| `optout_whatsapp` | BOOLEAN | `false` | Quando true, **nenhum** envio dispara (welcome/campanha/template) |
| `optout_at` | TIMESTAMPTZ | NULL | Quando o opt-out foi registrado |

### `whatsapp_messages` (log conversacional)

Já existia para outbound; foi estendida para virar log completo:

| Coluna | Para que serve |
|---|---|
| `direction` | `inbound` ou `outbound` (check constraint) |
| `body` | Corpo da mensagem (texto) |
| `origin` | `lp` · `webhook` · `manual` · `campaign` · `central-bot` · `central-inbound` |
| `campaign_id`, `template_id`, `bot_step`, `lead_id` | Atribuição |

### `whatsapp_templates`

Biblioteca de mensagens reutilizáveis.

| Coluna | Notas |
|---|---|
| `slug` | UNIQUE — chave estável (ex: `welcome-default`, `triagem-touros`) |
| `title`, `body`, `category`, `variables`, `archived`, `usage_count` | Padrão |
| `body` | Suporta `{nome}`, `{name}`, etc. via `renderTemplate()` |

`usage_count` é incrementado **fire-and-forget** sempre que um template é resolvido (não bloqueia o reply).

### `whatsapp_campaigns` + `whatsapp_campaign_recipients`

Campanha tem `segment` (JSONB) + `template_id` **ou** `body` livre. Estados:

```
rascunho ──┬──► enviando ──┬──► concluida
           │               ├──► cancelada
           │               └──► erro
           └──► (DELETE permitido só em rascunho)
```

Cada recipient começa `pendente` e é finalizado em `enviado` / `falhou` / `optout` pelo callback do VPS.

### `whatsapp_optouts`

Cache rápido **por número** — PK é `phone`. Espelhado em `crm_leads.optout_whatsapp` para integridade cruzada (e cobre o caso de alguém pedir "PARAR" antes de ter virado lead).

### `site_settings.whatsapp_flow_v2`

Chave única em `site_settings` que armazena o grafo do bot como JSON. Estrutura em [src/lib/whatsapp-flow-engine.ts](../src/lib/whatsapp-flow-engine.ts) (interface `FlowGraphV2`). Se a chave não existir ou estiver corrompida, `loadGraph()` chama `buildDefaultGraph()` e o bot opera com o comportamento legado em código.

---

## Fluxo inbound (bot)

Implementado em [src/app/api/whatsapp/inbound/route.ts](../src/app/api/whatsapp/inbound/route.ts).

```
1. VPS detecta mensagem 1:1 e POSTa { phone, name?, body, message_id? }
   header: x-webhook-secret

2. Next.js:
   a. valida secret
   b. normaliza phone (DDI 55, 12-13 dígitos)
   c. busca lead por phoneVariants() — cobre histórico com 8 e 9 dígitos
   d. se não achar, cria lead novo (origem='whatsapp-central', stage='novo',
      status='Lead', position = max+1000)
   e. registra inbound em whatsapp_messages (origin='central-inbound')
   f. atualiza crm_leads.last_whatsapp_at
   g. carrega o grafo (site_settings.whatsapp_flow_v2 ou default)
   h. roda runFlow() → resultado

3. Resposta para o VPS:
   { silent: true, reason: '...' }  OU  { reply: '...', bot_step: '...' }
```

`maxDuration = 30` (segundos). Se o flow não terminar ou der dead-end, devolve silêncio.

### O classificador determinístico

`classifyMessage()` em [whatsapp-central.ts](../src/lib/whatsapp-central.ts) — sem IA, ordem fixa:

1. **opt-out**: PARAR / SAIR / CANCELAR / REMOVER / PARE / DESCADASTRAR / UNSUBSCRIBE
2. **resubscribe**: VOLTAR / REATIVAR / REINSCREVER
3. **human**: consultor / humano / atendente / pessoa / falar com alguém
4. **menu numérico (1-7)**: só se a mensagem for *exatamente* o dígito
5. **palavras-chave de interesse**: `\btouros?\b` → touros, `\bmatriz` → matrizes, `\bembri` → embriões, `\bsemen|sêmen` → sêmen, `\bleil` → leilões, `\bvender?\b|venda de genetic` → venda_genetica
6. **unknown** (default — mensagem é registrada mas não respondida automaticamente para evitar spam quando a equipe já está conversando manualmente)

Lista canônica de interesses em `INTERESSES[]` — cada um tem um slug de template de triagem associado.

---

## O grafo de fluxo (V2)

Em vez de uma cascata `if/else` no código, o comportamento do bot é **um grafo** armazenado em `site_settings.whatsapp_flow_v2` e editado visualmente na aba **Fluxo**.

### Tipos de nó

```ts
type NodeType =
  | 'start'           // entrada (1 saída)
  | 'classify'        // executa classifyMessage(), 5 handles
  | 'condition'       // avalia expressão, saídas 'true'/'false'
  | 'action'          // efeito colateral no lead/optout
  | 'send_template'   // resolve slug, renderiza, prepara reply
  | 'silence'         // terminal — bot não responde
  | 'end'             // terminal — devolve reply pendente
```

### Saídas (handles)

| Nó | `sourceHandle` válidos |
|---|---|
| `classify` | `optout` · `resubscribe` · `human` · `interest` · `unknown` |
| `condition` | `true` · `false` |
| restantes | omitido (qualquer edge serve como saída única) |

### Expressões de condição

```ts
'lead.exists'             // existe lead vinculado ao número?
'lead.optout_whatsapp'    // lead está em opt-out?
'lead.handoff_humano'     // lead já está em handoff?
'lead.has_interesse'      // interesse_principal não é null?
'lead.has_menu_sent_tag'  // tem a tag 'whatsapp:menu_enviado'?
'lead.welcome_eligible'   // !has_interesse && !has_menu_sent_tag
```

### Ações (`action.data.kind`)

| Kind | Efeito |
|---|---|
| `apply_optout` | Upsert em `whatsapp_optouts` + marca `optout_whatsapp=true` + `handoff_humano=true` no lead |
| `apply_resubscribe` | Limpa opt-out (lead + tabela) |
| `apply_handoff` | `handoff_humano=true` + timestamp |
| `apply_interest` | Atualiza `interesse_principal`, adiciona tag `whatsapp:<interesse>`, eleva status `Lead → Qualificado` |
| `add_tag` | Adiciona uma tag arbitrária a `tags_whatsapp` (ex: `whatsapp:menu_enviado`) |

### `send_template`

```ts
data: {
  slug: string                              // chave do template
  dynamic?: 'triagem_by_interesse'          // resolve slug em runtime via classification
  bot_step?: string                         // valor gravado em whatsapp_messages.bot_step
  fallback?: string                         // corpo se o slug não existir no banco
  contact_note?: string                     // entrada extra em contact_history do lead
}
```

`dynamic='triagem_by_interesse'` pega `INTERESSES.find(i => i.id === classification.interesse).triagem_template_slug`.

Quando o template é resolvido e tem `lead`, o engine:

1. Renderiza com `{nome: firstName(lead.nome)}`
2. Loga em `whatsapp_messages` (origin `central-bot`)
3. Adiciona uma entrada em `contact_history` com `by='bot'` (se `contact_note` foi setado)
4. Marca a reply como pendente; quando o nó `end` é alcançado, devolve para o VPS

### Grafo default

Reproduzido em código por `buildDefaultGraph()` — fallback quando a chave não existe no banco. Estrutura:

```
start → classify
├─[optout]      → action(apply_optout)      → send(optout-confirmacao) → end
├─[resubscribe] → action(apply_resubscribe) → send(resubscribe-msg)    → end
├─[human]       → gate(optout?)──T─► silence
│                            ──F─► gate(handoff?)──T─► silence
│                                                  ──F─► action(apply_handoff)
│                                                      → send(consultor-handoff) → end
├─[interest]    → mesmos gates → action(apply_interest)
│                              → send(dynamic triagem) → end
└─[unknown]     → mesmos gates → gate(welcome_eligible)
                                  ──T─► action(add_tag menu_enviado)
                                       → send(welcome-default) → end
                                  ──F─► silence(unknown_intent)
```

A regra do `welcome_eligible` é o que evita o bot mandar o menu duas vezes para o mesmo lead.

### Validação

`validateGraph()` retorna `{ valid, errors, warnings }`:

- **erro** quando faltam refs, sobra/falta nó `start`, ou `send_template` sem slug nem dynamic
- **warning** quando um `classify` não cobre todos os 5 handles ou um `condition` não tem `true`/`false`

A rota `PUT /central/flow` rejeita grafos inválidos.

### Anti-loop

`runFlow()` tem limite `MAX_HOPS = 60`. Acima disso, devolve `{ silent: true, reason: 'flow_max_hops' }`.

---

## Templates

CRUD via abas **Templates** + endpoints `/central/templates`.

Categorias usadas hoje: `welcome` · `triagem` · `oportunidade` · `leilao` · `follow_up` · `encaminhamento` · `optout` · `geral`.

Variáveis suportadas em `body` (substituídas por `renderTemplate()`):

- `{nome}` → `firstName(lead.nome)` (primeiro nome — mais informal)
- `{name}` → nome completo
- qualquer outra `{chave}` → valor passado em `vars`; ausente vira string vazia

**Slugs especiais** que o engine espera encontrar:

| Slug | Nó que consome |
|---|---|
| `welcome-default` | Welcome do bot + `/api/whatsapp/render-welcome` |
| `triagem-touros` · `triagem-matrizes` · `triagem-embrioes` · `triagem-semen` · `triagem-leiloes` · `triagem-venda-genetica` | Resolvidos por `dynamic='triagem_by_interesse'` |
| `consultor-handoff` | Saída do `apply_handoff` no grafo default |
| `optout-confirmacao` | Resposta após `apply_optout` |
| `resubscribe-msg` | Resposta após `apply_resubscribe` |

Se um slug não existe (ou está arquivado), o engine cai no `fallback` do nó. Não dá erro — apenas usa o texto de emergência.

---

## Campanhas (lista de transmissão)

### Lifecycle

1. **Criar** (`POST /central/campaigns`) — estado `rascunho`. Pode editar `segment`, `template_id`/`body`.
2. **Preview** (`POST /central/campaigns/preview`) — resolve o segmento sem materializar, retorna `{ count, sample }`.
3. **Disparar** (`POST /central/campaigns/[id]/send`):
   - Rejeita se não for `rascunho` (HTTP 409)
   - Resolve segmento via `resolveSegment()`
   - Materializa N linhas em `whatsapp_campaign_recipients` (`status='pendente'`)
   - Renderiza mensagem **por destinatário** (substitui `{nome}`, `{name}`)
   - POSTa `{ campaign_id, recipients: [{recipient_id, phone, message}, …] }` para `WHATSAPP_SERVER_URL/campaign-send`
   - Marca campanha `enviando`
4. **Callbacks** do VPS chegam em `/campaign-callback` por destinatário:
   - Atualiza o recipient (`enviado`/`falhou`)
   - Loga em `whatsapp_messages` (`origin='campaign'`)
   - Recalcula `sent_count`/`failed_count` por COUNT exato
   - Quando `pending_count === 0`, marca campanha `concluida` + `finished_at`

### Segmentos

Filtros suportados (em `whatsapp-segment.ts`), sempre com `optout_whatsapp=false` + `telefone IS NOT NULL`:

```ts
{
  interesse_principal: string | string[]
  stage:               string | string[]
  status:              string | string[]
  tags_whatsapp_includes: string
  updated_after:       ISO date
  has_phone:           true (default)
}
```

Hard cap de 2000 leads por segmento — para evitar consultas longas e disparos massivos não intencionais. Dedup por telefone aplicado depois do filtro.

### Por que `recipient_id` é importante

O VPS recebe o `recipient_id` no payload e o ecoa de volta no callback. Isso permite que `/campaign-callback` atualize **exatamente** o destinatário certo mesmo se o mesmo número aparecer em duas campanhas concorrentes.

---

## Inbox e ações no lead

### `GET /central/inbox`

Retorna conversações deduplicadas por telefone, ordenadas pela última mensagem. Filtros suportados:

| `filter` | O que mostra |
|---|---|
| `todos` (default) | Todas |
| `aguardando` | Última mensagem é inbound (`direction='inbound'`) |
| `handoff` | Leads com `handoff_humano=true` |
| `optout` | Leads em opt-out |
| `interesse` | Leads com `interesse_principal` setado |

### `GET\|POST /central/thread/[phone]`

- `GET`: histórico completo da conversa + lead vinculado (com `interesse_principal`, `handoff_humano`, etc.)
- `POST`: envia mensagem manual (origin `manual`). **Bloqueado** se o lead estiver em opt-out (HTTP 403).

### `POST /central/lead-action`

Ações rápidas para a equipe assumir o controle sem editar campos no CRM:

| `action` | Efeito |
|---|---|
| `handoff_on` / `handoff_off` | Liga/desliga `handoff_humano` |
| `optout_on` / `optout_off` | Liga/desliga opt-out (espelha em `whatsapp_optouts`) |
| `set_interesse` | Atribui `interesse_principal` manualmente |

---

## Welcome dinâmico (renderização no VPS)

Antes da Central, o welcome era texto fixo no `site_settings.whatsapp_flow` (chave antiga). Agora:

1. O VPS recebe `{phone, name}` e quer mandar o welcome (ex: vindo da LP ou de webhook do Sheets).
2. Antes de enviar, chama `POST /api/whatsapp/render-welcome` (header `x-webhook-secret`).
3. A rota:
   - Verifica opt-out **por número** em `whatsapp_optouts` (cobre número sem lead)
   - Verifica `optout_whatsapp=true` em `crm_leads`
   - Se opt-out: devolve `{ silent: true, reason: 'optout' }` — o VPS **não envia**
   - Senão: busca template `welcome-default`, renderiza `{nome}` e devolve `{ body: '...' }`
4. O VPS dispara o `body` retornado.

Assim, **trocar o welcome é trocar o template** — sem deploy.

---

## Comandos em grupos

Quando uma mensagem em um grupo (`@g.us`, `fromMe=false`) começa com um dos prefixos, o VPS chama o endpoint correspondente (header `x-webhook-secret: WHATSAPP_GROUP_TASK_SECRET`) e responde **no próprio grupo** com sucesso/falha.

| Prefixo | Endpoint | O que cria |
|---|---|---|
| `/tarefa <descrição>` | `/api/whatsapp/group-task` | Card em `tactical_tasks` com `whatsapp_group_id/name`, `whatsapp_sender/name`. Badge verde no Kanban do ERP |
| `/decisao <texto>` | `/api/whatsapp/group-decision` | Linha em `tactical_decisions` (`decided_at=today`) |
| `/risco <título>` | `/api/whatsapp/group-risk` | Linha em `tactical_risks` (`probability=media`, `impact=medio`, `status=active`) |
| `/ia <pergunta>` | `/api/whatsapp/group-ai` | Envia "processando…", chama GLM-4.7 com tool-calling nas 8 tabelas, responde no grupo (≤ ~1000 chars). Timeout 30s. **Fire-and-forget no VPS** — não bloqueia outros comandos |

Os endpoints fazem `revalidatePath('/web-admin/projetos')` quando aplicável (tarefa/decisao/risco), de forma que o Kanban atualiza imediatamente para quem estiver vendo.

> **Pitfall conhecido**: ao adicionar `WHATSAPP_GROUP_TASK_SECRET` via `vercel env add`, conferir o tamanho (`echo $SECRET | wc -c`). A CLI pode anexar um `\n` deixando 65 em vez de 64, e todas as chamadas falham com 401.

---

## Métricas

`GET /central/metrics` retorna KPIs operacionais para a aba **Métricas**:

- Novos contatos nos últimos 7d
- Total de opt-outs
- Distribuição por `interesse_principal`
- Mensagens trocadas (in/out)

Sempre cálculo direto em SQL — não há cache. A página recarrega ao trocar de aba.

---

## Opt-out / compliance

Regra de ouro: **opt-out é absoluto**.

- Toda rota de envio (`/render-welcome`, `/campaign/send`, `/thread/[phone]` POST) checa opt-out antes de despachar.
- Quando o classificador detecta `optout`, o grafo default aplica `apply_optout` que:
  - Faz upsert em `whatsapp_optouts` (PK = phone) — permanente
  - Marca `optout_whatsapp=true` + `optout_at` + `handoff_humano=true` (para a equipe humana parar também)
  - Envia a `optout-confirmacao` e termina o flow
- Campanhas filtram via `resolveSegment()` que **sempre** aplica `optout_whatsapp=false` antes de qualquer outra coisa.
- A coluna `optout_skip_count` na campanha registra quantos foram pulados.

Para reativar (cliente pede): manda `voltar`/`reativar`/`reinscrever`. O classificador detecta `resubscribe` → `apply_resubscribe` limpa o opt-out no lead e deleta a linha em `whatsapp_optouts`.

---

## Reconectando a sessão

Sintoma: conexão cai (erro 440 / sessão expirada).

**1. Tem outro servidor com a mesma sessão rodando?** Apague-o primeiro — WhatsApp só permite uma sessão por número.

**2. Reconectar mantendo a sessão existente** (raro funcionar quando o problema foi 440):

```bash
ssh root@165.232.142.37
docker restart formula_boi_whatsapp
docker logs -f formula_boi_whatsapp
```

**3. Sessão precisa de novo QR** (caso comum):

```bash
ssh root@165.232.142.37
docker stop formula_boi_whatsapp
rm -rf /opt/whatsapp-auth/*
docker start formula_boi_whatsapp
docker logs -f formula_boi_whatsapp     # mostra o QR no terminal
```

Escaneie o QR em `http://admin.formuladoboi.com/whatsapp` → aba **Conexão** (ou no terminal do `docker logs`).

> A sessão é só nos arquivos do volume Docker. **Não existe `whatsapp_auth` no Supabase** — documentos antigos que mencionam essa tabela estão errados.

---

## Onde editar o quê (mapa rápido)

| Quero mudar… | Editar |
|---|---|
| O texto do welcome | Template `welcome-default` (aba **Templates** ou tabela `whatsapp_templates`) |
| O texto de uma triagem por interesse | Templates `triagem-<interesse>` |
| O comportamento do bot (qual nó leva onde) | Aba **Fluxo** ou direto no JSON via `PUT /central/flow` |
| Adicionar um interesse novo | `INTERESSES[]` em `whatsapp-central.ts` + criar template `triagem-<id>` + atualizar o classificador (regex/palavras-chave) |
| Mudar a regra de quem é "elegível para welcome" | Expressão `lead.welcome_eligible` em `whatsapp-flow-engine.ts` |
| Adicionar uma nova ação no grafo (efeito colateral) | Estender `ActionKind` + `applyXxx()` + `runFlow()` case `action` |
| Mudar filtros de segmento de campanha | `SegmentFilters` + `resolveSegment()` em `whatsapp-segment.ts` |
| Resetar o grafo para o default em código | `DELETE /central/flow` |
| Trocar a senha/secret entre Vercel e VPS | `WHATSAPP_GROUP_TASK_SECRET` em ambos os lados (cuidado com o `\n` extra) |
| Subir o número da Fórmula em outro WhatsApp | Apagar `/opt/whatsapp-auth/*` na VPS, reiniciar container, escanear QR no painel |
