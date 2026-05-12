# WhatsApp Server

Servidor dedicado para automação de mensagens WhatsApp via [Baileys](https://github.com/WhiskeySockets/Baileys). Roda separado do Next.js em uma VPS DigitalOcean para manter a conexão WebSocket permanente.

## Arquitetura

```
┌──────────────────────┐       ┌──────────────────────────────┐
│   Vercel (Next.js)   │       │   VPS DigitalOcean           │
│                      │       │   165.232.142.37              │
│  /api/whatsapp/      │──────>│                              │
│    status            │ HTTP  │   Docker: formula_boi_       │
│    send              │       │           whatsapp           │
│    send-direct       │       │                              │
│    campaign-send     │       │   whatsapp-server.js :3001   │
│    add-to-group      │       │                              │
│                      │       │   Auth: /opt/whatsapp-auth/  │
│  /api/whatsapp/      │<──────│         (Docker volume)      │
│    inbound           │       │                              │
│    render-welcome    │<──────│   Baileys WebSocket ────────>│ WhatsApp
│    campaign-callback │<──────│                              │
│    group-task        │<──────│                              │
│    group-decision    │<──────│                              │
│    group-risk        │<──────│                              │
│    group-ai          │<──────│                              │
└──────────────────────┘       └──────────────────────────────┘
```

A comunicação é bidirecional: o Next.js empurra envios pelo VPS, e o VPS encaminha toda mensagem recebida (e callbacks de campanha) de volta para o Next.js.

> **Gate de pausa global** (`site_settings.whatsapp_central_paused`, controlado pelo botão "Pausar fluxo" da aba **Conexão** em `admin.formuladoboi.com/whatsapp`): quando ativo, o VPS continua conectado e logando inbound, mas o Next.js bloqueia tanto a renderização do welcome (`render-welcome` devolve `{silent, reason: 'paused'}`) quanto a execução do fluxo (`/inbound` devolve `{silent, reason: 'paused'}`). O operador segue conseguindo responder manualmente pelo Inbox.

### Fluxo de envio (welcome)

1. Lead entra por um dos 4 caminhos (LP, webhook Sheets, webhook CRM legado, criação manual no admin)
2. Next.js converge tudo em `src/lib/whatsapp.ts → dispatchWelcome()`, que:
   - normaliza o telefone
   - checa `whatsapp_optouts` + `crm_leads.optout_whatsapp` (skip se opt-out)
   - faz dedup 24h em `whatsapp_messages` (skip se já houve welcome recente)
   - chama `POST /send` no VPS (somente se passou nos gates acima)
3. VPS enfileira (4s entre envios) e, na vez do item, chama `POST /api/whatsapp/render-welcome` no Next.js
4. O endpoint `render-welcome` aplica:
   - **gate de pausa global** + **opt-out por número/lead** (boundary de sistema, fora do grafo)
   - **`resolveWelcomeDispatch(graph, lead)`** — caminha pelo subgrafo `trigger='new_lead'` aplicando condições (audiência, tags) e devolve o slug do `send_template` alcançado. Esse subgrafo é editável visualmente na aba **Fluxo** do admin
   - busca o template (`body, media, poll`) pelo slug resolvido, renderiza `{nome}` e devolve `{ body, media?, poll? }`
5. Se o Next.js responder `{ silent: true }` (opt-out, pausa, ou silence node no grafo), o VPS aborta. Se o `render-welcome` estiver INACESSÍVEL (timeout/5xx), o VPS cai no fallback `flowConfig.welcome_message` (texto puro, sem mídia)
6. Caso contrário, monta a bubble composta (mídia → texto → poll) e envia

### Gatilhos do grafo (multi-trigger)

O grafo persistido em `site_settings.whatsapp_flow_v2` pode ter **mais de um start node**, cada um vinculado a um gatilho distinto. Hoje existem 2 gatilhos:

| Trigger | Onde dispara | Função executada | O que o subgrafo decide |
|---------|--------------|------------------|-------------------------|
| `inbound` | `/api/whatsapp/inbound` (toda mensagem 1:1 recebida do VPS) | `runFlow(graph, { trigger: 'inbound', ... })` | Classifica intenção, aplica gates (opt-out/handoff), atualiza CRM e devolve resposta |
| `new_lead` | `/api/whatsapp/render-welcome` (VPS pede template do welcome) | `resolveWelcomeDispatch(graph, lead)` | Anda só por **condições** e devolve o **slug** do `send_template` alcançado (audiência → variante do welcome) |

Os dois subgrafos vivem no MESMO grafo e são editados juntos na aba **Fluxo**. O subgrafo `new_lead` é mais simples por design: só passos puros de decisão (condições) terminando em um `send_template` — actions/classify/send aqui são ignorados em runtime, porque efeitos colaterais (logging, tags, contact_history) acontecem no envio real, depois.

### Fluxo de inbound (Central WhatsApp)

Toda mensagem individual recebida em chat 1:1 é encaminhada para o Next.js. A lógica de classificação e resposta é o subgrafo `inbound` do grafo data-driven (`site_settings.whatsapp_flow_v2`), interpretado pelo engine em `src/lib/whatsapp-flow-engine.ts`. O grafo é editável em tempo real pela aba **Fluxo** da Central (`admin.formuladoboi.com/whatsapp?tab=fluxo`).

```
Lead manda mensagem  →  Baileys (VPS)  ──POST /api/whatsapp/inbound──►  Next.js
                                                                          │
                                                                          ├ Encontra/Cria lead em crm_leads
                                                                          ├ Loga em whatsapp_messages (direction=inbound)
                                                                          ├ Gate de pausa global → {silent, reason:'paused'}
                                                                          ├ Carrega site_settings.whatsapp_flow_v2
                                                                          │   (ou buildDefaultGraph() se não houver linha)
                                                                          └ Executa runFlow(trigger='inbound'):
                                                                              findStartId(graph,'inbound') → classify (5 saídas)
                                                                                ├ opt-out  → marca opt-out → optout-confirmacao
                                                                                ├ resub.   → reativa lead   → resubscribe-msg
                                                                                ├ humano   → gates → handoff → consultor-handoff
                                                                                ├ interesse→ gates → CRM    → triagem-{interesse}
                                                                                └ sem match→ gates → welcome-default (1ª mensagem)
                                                                                                       (só se elegível)
                                                                              Atualiza CRM (interesse, handoff, tags, contact_history)
                                                                              Loga outbound em whatsapp_messages
                                                                          → Devolve {reply, bot_step} ou {silent, reason}

                       Baileys envia a resposta ────────────────────────►  WhatsApp
```

O ramo **"sem match"** é o segundo ponto onde o welcome pode ser disparado (o primeiro é `dispatchWelcome` → `render-welcome` rodando `resolveWelcomeDispatch` no subgrafo `new_lead`). Só envia se o lead NÃO está em opt-out, NÃO está em handoff, NÃO tem `interesse_principal` e NÃO tem a tag `whatsapp:menu_enviado`. Após enviar, o engine grava essa tag para não repetir.

## Endpoints

| Método | Path             | Descrição                                                                 |
|--------|------------------|--------------------------------------------------------------------------|
| GET    | /status          | Retorna `{status, qr}` — status da conexão e QR data URL                 |
| POST   | /send            | Enfileira welcome. Body: `{phone, name}` — texto/mídia/poll vêm do Next.js |
| POST   | /send-direct     | Enfileira envio livre. Body: `{phone, message, meta?, media?, poll?}`    |
| POST   | /campaign-send   | Enfileira lote de uma campanha. Body: `{campaign_id, recipients[], media?, poll?}` |
| POST   | /add-to-group    | Adiciona número ao grupo da LP. Body: `{phone}`                          |
| GET    | /queue           | Tamanho da fila e flag `processing`                                       |
| GET    | /config          | Config de fluxo **legada** em memória (`site_settings.whatsapp_flow`). Hoje só é consultada como fallback de texto do welcome quando `/api/whatsapp/render-welcome` está inacessível. A lógica viva é o grafo `whatsapp_flow_v2` no Next.js |
| POST   | /reload-config   | Força recarga da config legada do Supabase (chamada pelo Next.js ao salvar `/api/whatsapp/flow`) |

### Mensagens compostas (mídia + texto + enquete)

Tanto `/send-direct` quanto `/campaign-send` aceitam `media` e `poll` em qualquer combinação:

```jsonc
{
  "phone": "11999999999",
  "message": "Olá Maria! 🎉",         // pode ser vazio se houver media/poll
  "media": {
    "url": "https://...presigned...",
    "type": "image",                   // image | video | audio | document
    "mime": "image/jpeg",              // opcional
    "filename": "banner.jpg",          // só usado por document
    "caption": "Promo da semana"       // opcional
  },
  "poll": {
    "question": "Qual seu interesse?",
    "options": ["Touros", "Matrizes", "Embriões"],
    "selectable_count": 1
  }
}
```

Ordem de envio quando há mais de um componente: **mídia → texto → enquete**, com pausa de 1.2s entre eles para o WhatsApp processar cada bubble na ordem certa.

**Regra de caption:** se o template tem `media` e `body`:
- `media.caption` explícito → usado como legenda, `body` vai como mensagem separada
- `media.caption` vazio e `body` ≤ 1024 chars → `body` vira legenda (1 bubble apenas)
- `body` excede 1024 chars → mídia sem caption, `body` separado

Em `/campaign-send`, cada `recipient` pode ter `caption` próprio (já renderizado pelo Next.js com `{nome}`) que sobrescreve `media.caption` do template.

### Status possíveis

- `disconnected` — Sem conexão
- `connecting` — Tentando conectar/reconectar
- `qr` — QR code gerado, aguardando scan
- `connected` — Conectado e pronto para enviar

## Auth State (Persistência)

A sessão do Baileys é persistida em **arquivos locais** via `useMultiFileAuthState`, montados como Docker volume:

```
Host:      /opt/whatsapp-auth/    (persiste entre restarts)
Container: /data/auth/
```

> **IMPORTANTE:** Nunca usar banco de dados (Supabase, etc.) para auth state do Baileys. A troca de chaves criptográficas precisa de microssegundos de latência. Qualquer latência de rede causa erro 440 (conflict:replaced) e desconexão sistemática.

## Deploy / Operação

### Primeiro deploy

```bash
# Na VPS
mkdir -p /opt/whatsapp-server /opt/whatsapp-auth

# Copiar arquivos (ou fazer git clone)
scp whatsapp-server.js Dockerfile package.json root@165.232.142.37:/opt/whatsapp-server/

# Build da imagem
cd /opt/whatsapp-server
docker build -t formula_boi_whatsapp_img .

# Criar e iniciar container
docker run -d \
  --name formula_boi_whatsapp \
  --restart unless-stopped \
  -p 3001:3001 \
  -v /opt/whatsapp-auth:/data/auth \
  --env-file /opt/whatsapp-server/.env \
  formula_boi_whatsapp_img

# Escanear QR em admin.formuladoboi.com/whatsapp
```

### Atualizar código

```bash
# Copiar novo whatsapp-server.js para a VPS
scp whatsapp-server.js root@165.232.142.37:/opt/whatsapp-server/

# Na VPS: rebuild e restart
cd /opt/whatsapp-server
docker build -t formula_boi_whatsapp_img .
docker stop formula_boi_whatsapp && docker rm formula_boi_whatsapp
docker run -d \
  --name formula_boi_whatsapp \
  --restart unless-stopped \
  -p 3001:3001 \
  -v /opt/whatsapp-auth:/data/auth \
  --env-file /opt/whatsapp-server/.env \
  formula_boi_whatsapp_img
```

> A sessão é preservada no volume — não precisa escanear QR novamente.

### Forçar novo QR (resetar sessão)

```bash
docker stop formula_boi_whatsapp
rm -rf /opt/whatsapp-auth/*
docker start formula_boi_whatsapp
# Escanear novo QR em admin.formuladoboi.com/whatsapp
```

### Logs e diagnóstico

```bash
docker logs formula_boi_whatsapp --tail 50     # últimos 50 logs
docker logs -f formula_boi_whatsapp             # logs em tempo real
curl http://165.232.142.37:3001/status          # status da conexão
curl http://165.232.142.37:3001/queue           # fila de envio
```

## Gestão de conexão

O servidor implementa reconexão automática com as seguintes garantias:

- **`destroySocket()`** — Antes de qualquer reconexão, o WebSocket antigo é completamente destruído (`ev.removeAllListeners()`, `ws.close()`, `end()`). Isso evita sockets órfãos que causam erro 440.
- **`socketGeneration`** — Contador que invalida event handlers de sockets antigos, impedindo que fantasmas disparem reconexões.
- **Backoff exponencial** — Delays de 5s, 10s, 20s, 40s, até 60s entre tentativas de reconexão.
- **`--restart unless-stopped`** — Docker reinicia o container automaticamente em caso de crash.

## Central WhatsApp (admin.formuladoboi.com/whatsapp)

A Central é dividida em 6 abas: **Inbox** (conversas), **Fluxo** (editor visual do grafo), **Templates** (CRUD de templates), **Campanhas** (broadcasts segmentados), **Métricas**, **Conexão** (QR + botão Pausar). Toda a lógica de roteamento vive no grafo v2 — alterar o comportamento NÃO requer alterar o código deste servidor; basta editar nós/arestas no editor visual e salvar (vale na próxima inbound).

### Comportamento por intenção (classificador determinístico)

A classificação acontece em `src/lib/whatsapp-central.ts → classifyMessage()` e devolve uma das 5 saídas que o nó `classify` do grafo despacha. Regras em ordem (a primeira que casa ganha):

| Saída | Mensagem do lead | Efeito do ramo no grafo default |
|-------|------------------|--------------------------------|
| `optout` | `PARAR`, `SAIR`, `CANCELAR`, `REMOVER`, `PARE`, `DESCADASTRAR`, `unsubscribe` | Marca `optout_whatsapp=true` + insere em `whatsapp_optouts` + liga handoff humano. Responde com `optout-confirmacao` |
| `resubscribe` | `VOLTAR`, `REATIVAR`, `REINSCREVER` | Limpa opt-out no CRM + tabela. Responde com `resubscribe-msg` |
| `human` | `consultor`, `humano`, `atendente`, `equipe`, `Matheus`, `falar com alguém` | Gates (opt-out? handoff?) → marca `handoff_humano=true`. Responde com `consultor-handoff` e silencia o bot dali em diante |
| `interest` | Opção numérica do menu (mapeamento depende da audiência — vide abaixo) ou palavra-chave do produto (`touro`, `matriz`, `embrião`, `sêmen`, `leilão`, `ofertar`, `oportunidades`...) | Gates → grava `interesse_principal`, promove `Lead→Qualificado`, aplica tag `whatsapp:<interesse>`. Responde com `triagem-{interesse}` (slug dinâmico) |
| `unknown` | Qualquer outra coisa | Gates → se `welcome_eligible` (sem interesse + sem tag `whatsapp:menu_enviado`), envia o welcome (`welcome-default`) e marca a tag. Caso contrário, silêncio (`reason: unknown_intent`) — evita o bot atropelar conversa que humano já está conduzindo. |

Gates aplicados nas saídas `human`, `interest` e `unknown`:
- **Lead em opt-out?** → silêncio (`lead_optout`)
- **Lead já em handoff humano?** → silêncio (`lead_handoff`) — o operador atende pelo Inbox

> O ramo `unknown → welcome_eligible → send(welcome-default)` é o **segundo gatilho** da primeira mensagem. O primeiro é `dispatchWelcome()` em `src/lib/whatsapp.ts`, disparado quando o lead é capturado (LP/Sheets/admin). Os dois respeitam pausa + opt-out, e o `dispatchWelcome` ainda faz dedup 24h.

### Mapeamento numérico por audiência

A partir de 2026-05-12, o menu default do welcome é o "voz do Matheus em 1ª pessoa" com 4 opções. Leads com tag de audiência específica usam mapeamentos distintos:

| Audiência | Trigger (tag em `crm_leads.tags_whatsapp`) | Welcome template | Menu numérico |
|-----------|--------------------------------------------|------------------|---------------|
| Default | (sem tag) | `welcome-default` | `1`=sêmen `2`=embriões `3`=compra/venda genética `4`=todos |
| Academia Nelore P.O | `grupo_academia_nelore_po` | `welcome-academia-nelore-po` | `1`=sêmen `2`=embriões `3`=leilões `4`=ofertar genética `5`=oportunidades `6`=falar com Matheus |
| Lista Matheus institucional | `lista_matheus_personalizada` | `welcome-matheus-institucional` | `1`=sêmen `2`=embriões `3`=central embriões `4`=leilões `5`=compra/venda genética `6`=todos |

**Para o welcome (gatilho `new_lead`)**, o slug é resolvido pelo grafo via `resolveWelcomeDispatch()`: o subgrafo de novo lead tem nós de condição (`lead.is_academia_audience`, `lead.is_matheus_audience`) que direcionam para o `send_template` correto. Editar pela aba **Fluxo** → conectar/desconectar essas condições.

**Para inbound (triagem, handoff, opt-out, resubscribe)**, os overrides continuam sendo aplicados em runtime pelo `ACADEMIA_SLUG_OVERRIDES` em `src/lib/whatsapp-flow-engine.ts`. Quando o engine vai buscar o body de um template via `send_template`, ele primeiro tenta a variante de audiência; se ela existe e não está arquivada no banco, usa essa; senão, cai no slug literal do nó.

### Templates

Todos vivem em `whatsapp_templates` (CRUD pela aba **Templates**). Slugs canônicos atuais:

- **Welcome**: `welcome-default` (voz Matheus 1ª pessoa, menu 1..4), `welcome-academia-nelore-po`, `welcome-matheus-institucional`
- **Triagem**: `triagem-semen`, `triagem-embrioes`, `triagem-compra-venda-genetica`, `triagem-interesse-amplo`, `triagem-touros`, `triagem-matrizes`, `triagem-leiloes`, `triagem-venda-genetica`, `triagem-central-embrioes`, `triagem-oferta-genetica`
- **Triagem (variantes Academia)**: `triagem-semen-academia`, `triagem-embrioes-academia`, `triagem-leiloes-academia`, `receber-oportunidades-academia`
- **Handoff**: `consultor-handoff`, `consultor-handoff-matheus` (override Academia)
- **Opt-out / Resubscribe**: `optout-confirmacao`, `optout-confirmacao-academia`, `resubscribe-msg`, `resubscribe-msg-academia`
- **Operacionais**: `follow-up-3d`, `aviso-leilao`

Cada template aceita corpo (`body`), mídia (R2: image/video/audio/document) e enquete nativa (`poll_question`, `poll_options`, `poll_selectable_count`). Variáveis suportadas no corpo: `{nome}` (primeiro nome).

### Votos em enquete (poll)

Quando o welcome ou um template envia uma enquete nativa, o voto do destinatário **não chega como mensagem de texto** — vem como `messages.update` com `pollUpdates` criptografado. O VPS:

1. Ao enviar a enquete, cacheia `{messageSecret, options}` em memória por 7 dias (até 5000 polls)
2. Quando o voto chega, usa `decryptPollVote` do Baileys com o `messageSecret` cacheado
3. Mapeia o hash SHA-256 retornado de volta para o texto da opção votada
4. POSTa em `/api/whatsapp/inbound` com `body=<opção votada>` e `poll_vote: true`

Assim o engine de classificação trata o voto como qualquer outra resposta de menu. Se o container reiniciar antes do voto chegar, o cache é perdido e o voto é ignorado — votos típicos chegam em segundos, mas é uma limitação a notar.

### Campanhas (broadcasts segmentados + sequência multi-step)

#### Arquitetura geral

A campanha tem 1 passo obrigatório (o **passo 0** = conteúdo gravado em `whatsapp_campaigns`) e 0+ passos adicionais (**passos 1+** = linhas em `whatsapp_campaign_steps`, cada um com delay relativo ao passo anterior).

```
Disparo da campanha (operador clica "Disparar")
  └─ /api/whatsapp/central/campaigns/[id]/send
       ├─ Resolve segmento → whatsapp_campaign_recipients (current_step=1, next_send_at)
       ├─ Renderiza passo 0 por destinatário → POST /campaign-send no VPS
       └─ Marca campanha como "enviando"

Cron a cada 5 min (Vercel Cron → /api/whatsapp/central/campaigns/cron)
  └─ Pega recipients com next_send_at <= now() AND stopped_at IS NULL
       ├─ Aplica regras de parada (replied / optout / handoff / interest)
       │  → se alguma dispara: stopped_at + stopped_reason; pula
       ├─ Resolve step do current_step → renderiza → POST /campaign-send
       ├─ Avança current_step++ e recalcula next_send_at do próximo step
       └─ Se foi o último step: stopped_reason='completed'

Inbound do lead chega (/api/whatsapp/inbound)
  └─ handleCampaignReply(lead) é chamado em fire-and-forget:
       ├─ Marca replied_at em todos os recipients ativos do lead
       ├─ Aplica reply_tag (se configurada) em crm_leads.tags_whatsapp
       └─ Marca handoff_humano=true se reply_handoff
     O cron, na próxima rodada, vê replied_at != null + stop_on_reply → para a sequência
```

#### Esquema das tabelas (migration `database/whatsapp_campaign_sequences.sql`)

| Coluna em `whatsapp_campaigns` | Tipo | Padrão | Função |
|--------------------------------|------|--------|--------|
| `stop_on_reply` | bool | true | Para a sequência ao receber QUALQUER inbound desse destinatário |
| `stop_on_optout` | bool | true | Para se o lead virar opt-out (PARAR, etc) — compliance |
| `stop_on_handoff` | bool | true | Para se operador colocar o lead em handoff humano |
| `stop_on_interest` | bool | false | Para se o engine gravar `interesse_principal` no lead |
| `reply_tag` | text | null | Tag aplicada em `crm_leads.tags_whatsapp` ao responder |
| `reply_handoff` | bool | false | Marca `handoff_humano=true` ao responder |

| Tabela / coluna | Função |
|-----------------|--------|
| `whatsapp_campaign_steps` | Steps 1+ (o 0 vive na própria campanha). Colunas: `step_order`, `delay_value`, `delay_unit` (`minutes`\|`hours`\|`days`), `template_id` / `body` / `media_*`, `is_active` |
| `whatsapp_campaign_recipients.current_step` | Próximo step a enviar pra esse destinatário (1 logo após o disparo inicial) |
| `whatsapp_campaign_recipients.next_send_at` | Quando o cron deve acordar pra esse destinatário; `null` = terminou ou parou |
| `whatsapp_campaign_recipients.replied_at` | Quando o lead respondeu durante a janela ativa (1ª resposta) |
| `whatsapp_campaign_recipients.stopped_at` / `stopped_reason` | `replied` \| `optout` \| `handoff` \| `interest` \| `completed` \| `cancelled` \| `error` |

#### Endpoints

| Método | Path | Quem chama | Função |
|--------|------|------------|--------|
| GET    | `/api/whatsapp/central/campaigns` | UI | Lista campanhas + contadores (`steps_count`, `replied_count`, `stopped_count`) |
| POST   | `/api/whatsapp/central/campaigns` | UI | Cria campanha em rascunho (com regras de parada e reply_*) |
| GET    | `/api/whatsapp/central/campaigns/[id]` | UI | Detalhes + recipients + steps |
| PUT    | `/api/whatsapp/central/campaigns/[id]` | UI | Edita rascunho |
| DELETE | `/api/whatsapp/central/campaigns/[id]` | UI | Deleta rascunho |
| GET/POST | `/api/whatsapp/central/campaigns/[id]/steps` | UI | Lista/cria passos da sequência |
| PUT/DELETE | `/api/whatsapp/central/campaigns/[id]/steps/[stepId]` | UI | Edita/remove passo |
| POST | `/api/whatsapp/central/campaigns/[id]/send` | UI | Dispara passo 0 + agenda steps |
| GET | `/api/whatsapp/central/campaigns/cron` | **Vercel Cron** (`*/5 * * * *`) | Processa recipients elegíveis. Auth via `Authorization: Bearer ${CRON_SECRET}` |

#### Pausa global vs. campanhas

A **pausa global** da Central (`site_settings.whatsapp_central_paused`, aba **Conexão**) **não** bloqueia o cron de campanhas — campanhas são iniciadas explicitamente pelo operador. Para impedir disparos:
- Antes de iniciar: cancele a campanha em rascunho
- Em sequência ativa: cancele a campanha (marca status `cancelada`; o cron então para todos os recipients ativos no próximo tick com `stopped_reason='cancelled'`)

#### Variáveis de ambiente novas

| Variável | Função |
|----------|--------|
| `CRON_SECRET` | Token usado pelo Vercel Cron no header `Authorization: Bearer <secret>`. Configurado em `vercel.json`. Sem isso, qualquer um poderia hitar o endpoint de cron — o endpoint também aceita `x-webhook-secret=${WHATSAPP_GROUP_TASK_SECRET}` pra disparo manual em dev |

## Trocando o número conectado (sócio)

Quando trocar o número que aparece como bot da Fórmula do Boi:

```bash
ssh root@165.232.142.37
docker stop formula_boi_whatsapp
rm -rf /opt/whatsapp-auth/*       # IMPORTANTE: zera a sessão antiga
docker start formula_boi_whatsapp
```

Em seguida, abra `https://admin.formuladoboi.com/whatsapp` → aba **Conexão** e escaneie o QR pelo celular do novo número. A sessão fica persistida no volume — não precisa repetir até que o número desconecte ou faça logout.

> **Nota:** o número antigo deve ser desvinculado pelo próprio aparelho dele (Aparelhos Conectados → remover) para evitar confusão de notificações.

## Comandos de grupo

Membros de grupos WhatsApp conectados ao bot (`@g.us`, `fromMe = false`) podem disparar 4 comandos. Cada comando inicia um **fluxo interativo multi-step** — o bot pergunta o que falta antes de criar o registro.

Mensagens do próprio número do bot (`fromMe = true`) são sempre ignoradas.

| Prefixo | Endpoint Next.js | Fluxo |
|---------|------------------|-------|
| `/tarefa <título>` | `/api/whatsapp/group-task` | Pergunta etapa (1=Idéias / 2=A fazer / 3=Em andamento) → responsável (texto ou *pular*) → prazo (`dd/mm` ou *sem prazo*) → cria card no Kanban tático |
| `/decisao <texto>` | `/api/whatsapp/group-decision` | Pergunta motivo (texto ou *pular*) → insere em `tactical_decisions` |
| `/risco <título>` | `/api/whatsapp/group-risk` | Pergunta probabilidade (1=Baixa / 2=Média / 3=Alta) → impacto (1=Baixo / 2=Médio / 3=Alto) → mitigação (texto ou *pular*) → insere em `tactical_risks` |
| `/ia <pergunta>` | `/api/whatsapp/group-ai` | Sem multi-step. Manda "🤖 Processando..." e responde com GLM-4.7 (tool-calling em 8 tabelas, 55s timeout) |

Cada chamada usa o header `x-webhook-secret: WHATSAPP_GROUP_TASK_SECRET`. O estado dos fluxos pendentes vive em memória (`pendingGroupTasks` Map) com TTL de **10 minutos** — se o usuário não responder em 10 min, o fluxo é descartado.

Palavras que pulam uma etapa opcional: `pular`, `nao`, `não`, `nenhum`, `-`, `sem`.

## Variáveis de ambiente

| Variável                    | Default                          | Descrição                                                |
|-----------------------------|----------------------------------|----------------------------------------------------------|
| WHATSAPP_SERVER_PORT        | 3001                             | Porta HTTP do servidor                                   |
| AUTH_DIR                    | /data/auth                       | Diretório dos arquivos de sessão                         |
| NEXT_PUBLIC_SUPABASE_URL    | —                                | URL do Supabase (para carregar flow config legado)        |
| SUPABASE_SERVICE_ROLE_KEY   | —                                | Chave service role do Supabase                           |
| NEXT_JS_URL                 | —                                | URL base do Next.js (ex: https://admin.formuladoboi.com) |
| WHATSAPP_GROUP_TASK_SECRET  | —                                | Segredo compartilhado com TODOS os endpoints `/api/whatsapp/*` (inbound, render-welcome, campaign-callback, group-task, group-decision, group-risk, group-ai). Deve ter **exatamente 64 caracteres** |
| LP_GROUP_INVITE_CODE        | `JYxJPWfkoHHLZfosHlywN9`         | Código do convite do grupo da LP (extraído de `chat.whatsapp.com/<código>`). Resolvido para `lpGroupJid` no `connection.open` |
| LP_GROUP_JID                | (resolvido do convite acima)     | Override manual do JID do grupo da LP                    |

## Vercel (Next.js)

O Next.js **não** roda Baileys — apenas faz proxy HTTP para a VPS:

- `WHATSAPP_SERVER_URL=http://165.232.142.37:3001` (env var na Vercel)
- `src/lib/whatsapp.ts` — Proxy HTTP puro, zero imports de Baileys
- `@whiskeysockets/baileys` **não** está no package.json do Next.js

### Vercel Cron — sequência de campanhas

O `vercel.json` na raiz define um cron `*/5 * * * *` apontando para `/api/whatsapp/central/campaigns/cron`. O Vercel chama esse endpoint com `Authorization: Bearer ${CRON_SECRET}` (Vercel injeta automaticamente quando o env var `CRON_SECRET` está configurado no projeto).

Para disparar manualmente em dev:
```bash
curl -H "x-webhook-secret: <WHATSAPP_GROUP_TASK_SECRET>" \
  https://admin.formuladoboi.com/api/whatsapp/central/campaigns/cron
```

## Problemas conhecidos e soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| Loop 440 (connect/disconnect) | Auth state via banco de dados (latência) | Usar `useMultiFileAuthState` local |
| Deploy Vercel falhando | Baileys no package.json do Next.js | Manter Baileys apenas no whatsapp-server |
| Sockets fantasma | `sock = null` sem fechar WebSocket | Sempre usar `destroySocket()` |
| QR não aparece | Sessão antiga corrompida | Limpar `/opt/whatsapp-auth/*` e reiniciar |
| Bot não responde nada (nem welcome nem inbound) | Pausa global ativa em `site_settings.whatsapp_central_paused` | Aba **Conexão** → "Retomar fluxo". O VPS continua conectado, só o Next.js silencia |
| Bot responde fora do esperado depois de editar o fluxo | Grafo persistido em `site_settings.whatsapp_flow_v2` está malformado | Aba **Fluxo** → "Resetar p/ padrão" (chama `DELETE /api/whatsapp/central/flow`). Ou edite e revalide pelo painel — o save chama `validateGraph()` antes |
| Welcome chega 2x rapidinho pro mesmo número | Dedup 24h do `dispatchWelcome` foi pulado (logs do Vercel mostrarão por quê) — geralmente race entre 2 webhooks Sheets simultâneos | Investigar `whatsapp_messages` filtrando por phone (existem variantes com/sem DDI/9º dígito — usar `phoneVariants`) |
| `/tarefa` retorna 401 | `WHATSAPP_GROUP_TASK_SECRET` não carregado | Garantir `--env-file` no `docker run`; verificar comprimento (deve ser 64 chars — CLI do Vercel pode adicionar `\n` virando 65) |
| Bot não responde a `/tarefa` | Mensagem enviada pelo próprio número do bot | `fromMe = true` é ignorado por design |
| Bot não responde a `/tarefa` | Container sem `NEXT_JS_URL` ou `WHATSAPP_GROUP_TASK_SECRET` | Checar `/opt/whatsapp-server/.env` e recriar container com `--env-file` |
| Voto em enquete sem efeito | `messageSecret` ausente no envio OU container reiniciou antes do voto | Logs mostram `[Poll] enviado sem cache` (problema no envio) ou `[Poll] vote em poll não cacheada` (cache perdido). Em geral, votos típicos chegam em segundos — só é problema se houver restart no meio |
| Welcome não envia mídia | `/api/whatsapp/render-welcome` inacessível (timeout/5xx) | Logs mostram `[Welcome] Falha ao renderizar` — cai no fallback `flowConfig.welcome_message` (texto puro, sem mídia). Checar conectividade VPS → Vercel. Se a resposta foi `{silent}`, isso é **opt-out ou pausa global**, não um problema |
| Lead diz que respondeu e o bot ficou mudo | Lead em `handoff_humano=true` ou já tem `tag whatsapp:menu_enviado` sem `interesse_principal` (não reenvia welcome) | Logs mostram `[Inbound] → silent (handoff/optout/ignore)`. Para reabrir, ajuste o lead no Inbox (remover handoff) ou apague a tag |
| Welcome novo não aparece pra leads históricos | Lead já tem a tag `whatsapp:menu_enviado` aplicada por um welcome anterior | Por design — para reapresentar, remover a tag no CRM e limpar `interesse_principal` |
| Lead não é adicionado ao grupo | `LP_GROUP_INVITE_CODE` inválido ou bot não é admin | Logs mostram `[LP] Não foi possível resolver JID do grupo`. Renovar o link de convite no WhatsApp e atualizar env var |
