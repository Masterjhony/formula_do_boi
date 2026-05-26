# Central WhatsApp — Fluxo default (welcome v2: convite ao bate-papo)

> Detalhes do **fluxo padrão atual** (welcome v2 + estado por tags). A documentação geral da Central WhatsApp (engine, classifier, inbox, campanhas) está em [whatsapp-central.md](./whatsapp-central.md). Para infra/VPS, ver [vps-operations.md](./vps-operations.md).

A partir de 2026-05-19, o welcome padrão passou a ser um convite direto pra um **bate-papo com o Matheus** (chamada agendada via Calendly) — o menu de interesses passou a ser **opcional**, mostrado só quando o lead recusa a conversa. Mudança aplicada via [database/seed_welcome_bate_papo_v1.sql](../database/seed_welcome_bate_papo_v1.sql).

Os templates seguem em primeira pessoa do Matheus (decisão de 2026-05-12, [database/seed_welcome_default_matheus_1p.sql](../database/seed_welcome_default_matheus_1p.sql)).

## Welcome `welcome-default`

Apresentação do Matheus + 3 frentes da empresa (Aceleradora de Touros, Central de Embriões, Assessoria em Leilões) + convite pra um bate-papo de 15-20 min por chamada, com 2 opções:

```
1 — Sim, quero agendar uma conversa com você
2 — Por enquanto prefiro só receber informações por aqui
```

## Estado da máquina via tags

A Central é stateless por design, então o estado da conversa vive em `crm_leads.tags_whatsapp` lido pelo classifier.

| Tag                                  | Quando é setada                                                         | O que muda no classifier                                                  |
|--------------------------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------|
| `whatsapp:menu_enviado`              | Welcome v2 enviado pela lane "sem match" da inbound                     | Gate `welcome_eligible` para de disparar (não re-welcome)                 |
| `whatsapp:bate_papo_pendente`        | Welcome v2 enviado (via inbound OU via render-welcome do dispatchWelcome) | `BATE_PAPO_PENDENTE_NUMERIC_MAP` ativa: 1=human (sim agendar), 2=interest:interesse_amplo (só info) |
| `whatsapp:bate_papo_aceito`          | Lead respondeu "1" e recebeu o link Calendly                            | Documental — classifier não consulta                                       |
| `whatsapp:menu_interesses_v2`        | Lead respondeu "2" e recebeu o menu de interesses                       | Documental — depois de a tag `bate_papo_pendente` ser removida, dígitos 1-4 voltam ao `DEFAULT_NUMERIC_MAP` normal |

## Mapeamento numérico em estado "bate-papo pendente"

`BATE_PAPO_PENDENTE_NUMERIC_MAP`:

| Tecla | `Classification`                                | Lane do grafo (fork)                                                                       |
|-------|-------------------------------------------------|--------------------------------------------------------------------------------------------|
| `1`   | `human`                                         | Após `apply_handoff`, gate `lead.is_bate_papo_pendente=true` → `bate-papo-aceito` (link Calendly) |
| `2`   | `interest` → `interesse_amplo`                  | Após `apply_interest`, gate `lead.is_bate_papo_pendente=true` → `bate-papo-recusado` (menu interesses) |

## Mapeamento numérico default

`DEFAULT_NUMERIC_MAP` — usado depois que a tag `bate_papo_pendente` foi removida pelo grafo, ou direto pra leads de audiência sem essa tag:

| Tecla | `Classification`                                         | Template de triagem               |
|-------|----------------------------------------------------------|-----------------------------------|
| `1`   | `interest` → `semen`                                     | `triagem-semen`                   |
| `2`   | `interest` → `embrioes`                                  | `triagem-embrioes`                |
| `3`   | `interest` → `compra_venda_genetica`                     | `triagem-compra-venda-genetica`   |
| `4`   | `interest` → `interesse_amplo`                           | `triagem-interesse-amplo`         |

## Integração com `/web-admin/agendamentos`

O template `bate-papo-aceito` e o template manual `agendamento-link` mandam o **link curto público** `https://formuladoboi.com/agendar` (rota em [src/app/web-site/agendar/route.ts](../src/app/web-site/agendar/route.ts)), e não o slug interno do Calendly. A rota faz 302 pra URL real configurada em `site_settings.agendamentos_calendar.calendly_event_url`, escondendo do cliente que a conta gratuita do Calendly está sob um usuário pessoal (`joaoeduardo-lp1`).

Vantagens: (1) o cliente vê o domínio da Fórmula do Boi, (2) trocar Calendly por outra ferramenta no futuro é uma alteração de setting (não precisa reescrever template/mensagem), (3) UTMs/`?lead=` na URL de entrada são preservadas e repassadas pro Calendly. Quando o lead reserva, o evento aparece no Google Calendar configurado e o cron `/api/agendamentos/sync` (a cada ~5 min) materializa em `agendamentos` com auto-vínculo ao `crm_leads` por e-mail/telefone — não há criação manual de registro no momento do envio do link. Ver [agendamentos.md](./agendamentos.md).

## Diretiva operacional (2026-05-19)

O bot **só** executa três fluxos:

1. Welcome no novo lead.
2. Agendamento ao aceitar bate-papo.
3. Registro de interesse via menu.

Qualquer outra inbound (estranho mandando mensagem espontânea, lead pedindo "consultor" fora da janela do welcome, etc) vai pro Inbox em **silêncio** pra que o Matheus trate manualmente. Demais automações (follow-up, lembrete, broadcast) ficam pra campanhas.

## Como o grafo lida com o estado

Em [src/lib/whatsapp-flow-engine.ts](../src/lib/whatsapp-flow-engine.ts) `buildDefaultGraph()`:

1. **Lane `unknown`** (inbound espontâneo, mensagem não classificada): **silêncio direto**. NÃO dispara welcome automático. O welcome só sai quando o lead é cadastrado no CRM via LP/admin/Sheets e o `dispatchWelcome` chama `/api/whatsapp/render-welcome`.
2. **Lane `human`** (lead disse "consultor"/"Matheus"/etc OU respondeu "1" ao welcome v2): condition `lead.is_bate_papo_pendente` bifurca: true → `apply_handoff` + `add_tag bate_papo_aceito` + `remove_tag bate_papo_pendente` + envia `bate-papo-aceito` (link de agendamento). false → silêncio (Matheus trata pelo Inbox — não há mais mensagem genérica `consultor-handoff`).
3. **Lane `interest`** (lead respondeu "2" ao welcome, OU clicou 1-4 no menu de recusa, OU mandou palavra-chave de interesse): após `apply_interest`, condition `lead.is_bate_papo_pendente` bifurca: true → `add_tag menu_interesses_v2` + `remove_tag bate_papo_pendente` + envia `bate-papo-recusado` (menu de 4). false → envia triagem dinâmica (`triagem-{interesse}` — fluxo de registro de interesse normal).
4. `/api/whatsapp/render-welcome` aplica a tag `bate_papo_pendente` direto no lead quando o slug resolvido é `welcome-default` — cobre o caso de lead capturado em LP/admin/Sheets que recebe o welcome via `dispatchWelcome` no VPS (não passa pela engine).

## Para mudar o conteúdo das mensagens

Edite os bodies em [database/seed_welcome_bate_papo_v1.sql](../database/seed_welcome_bate_papo_v1.sql) (idempotente — `ON CONFLICT (slug) DO UPDATE`). Se quiser voltar pro welcome v1 (4 opções direto), reaplique [database/seed_welcome_default_matheus_1p.sql](../database/seed_welcome_default_matheus_1p.sql) e atualize o grafo ativo via UI pra remover os forks de `bate_papo_pendente`.

> Leads históricos que receberam o welcome antigo (menu 1..4 de interesses direto, ou welcome ainda mais antigo com 1..7) e respondem `3/4/5/6/7` caem em `unknown` no classifier — o bot fica em silêncio. Não é problema na prática porque o gate `welcome_eligible` impede re-welcome, e o operador atende manualmente pelo Inbox.

**Cobertura por palavra-chave** continua ativa para os interesses fora do menu enxuto (touros, matrizes, central de embriões, leilões, oferta de genética, oportunidades). Todos têm template de triagem em 1ª pessoa Matheus no seed.

## Tom canônico do fluxo default

- Sempre 1ª pessoa singular ("vou anotar", "eu te chamo", "me responde").
- Sem emojis no welcome e nas triagens default.
- Encerramentos prometem ação direta do Matheus ("eu te chamo aqui mesmo", "agendamos uma conversa direta"), não "vou te encaminhar para um consultor".
- Opt-out e re-subscribe seguem o mesmo tom — `optout-confirmacao` e `resubscribe-msg` foram reescritos no mesmo seed.

## Overrides de audiência

Continuam funcionando, intocados:

| Tag no lead                       | Welcome usado                      | Menu      | Slugs preferenciais          |
|-----------------------------------|------------------------------------|-----------|------------------------------|
| _(sem tag)_ — default             | `welcome-default`                  | 1..4      | `triagem-*` padrão (Matheus) |
| `grupo_academia_nelore_po`        | `welcome-academia-nelore-po`       | 1..6      | `triagem-*-academia`         |
| `lista_matheus_personalizada`     | `welcome-matheus-institucional`    | 1..6      | (mesmos `triagem-*` default) |

O override Academia é aplicado em [src/lib/whatsapp-flow-engine.ts](../src/lib/whatsapp-flow-engine.ts) via `ACADEMIA_SLUG_OVERRIDES`; o classifier resolve a audiência (Lista Matheus > Academia > default) em [src/lib/whatsapp-central.ts:206](../src/lib/whatsapp-central.ts#L206).

## Pausa global

A aba **Conexão** tem o botão "Pausar fluxo" — quando ativo, o número segue conectado e o Inbox segue logando inbound, mas welcome e fluxo são bloqueados (`{ silent: true, reason: 'paused' }`). Estado em `site_settings.whatsapp_central_paused`, helper em [src/lib/whatsapp-pause.ts](../src/lib/whatsapp-pause.ts).

## Janela horária de automação

Parâmetro por fluxo (aba **Fluxo** → Configurações → Parâmetros → "Restringir automação a um horário"). Quando ligado, `/api/whatsapp/inbound` e `/api/whatsapp/render-welcome` devolvem `{ silent: true, reason: 'outside_allowed_hours' }` se a hora local no fuso configurado (default `America/Sao_Paulo`) estiver fora de `[allowed_hours_start, allowed_hours_end]`. A janela suporta cruzar meia-noite (ex.: `22:00` → `06:00`). Inbox segue logando inbound — operador responde manualmente. Útil pra evitar disparo madrugada/domingo (anti-bloqueio Baileys). Helper em [src/lib/whatsapp-flow-settings.ts](../src/lib/whatsapp-flow-settings.ts).

## Múltiplos fluxos nomeados (`whatsapp_flows`)

A aba **Fluxo** tem seletor no canto superior direito (mostra "Fluxo: Padrão ATIVO") e botão **Configurações** abrindo modal com 3 abas:

- **Geral** — renomear, descrição, status, metadados, ações ativar/duplicar/criar/deletar.
- **Gatilhos** — lista os 5 tipos de trigger e quantos start nodes do grafo cobrem cada um.
- **Parâmetros** — settings JSONB editável com badge ativo/pendente por chave.

Apenas UM fluxo é `is_active=true` por vez (constraint UNIQUE parcial). Operador pode editar variantes em paralelo (rascunhos) e trocar o ativo em 1 clique — o bot pega a mudança na próxima inbound. Migrations: [database/whatsapp_flows.sql](../database/whatsapp_flows.sql) + [database/whatsapp_flows_settings.sql](../database/whatsapp_flows_settings.sql).

## Parâmetros do fluxo (`whatsapp_flows.settings`)

JSONB por fluxo com configurações que afetam o engine *antes* de entrar no grafo (rate limit, compliance, horário). Lidos por `loadActiveFlowWithSettings()` em [src/lib/whatsapp-flows.ts](../src/lib/whatsapp-flows.ts), tipos e defaults em [src/lib/whatsapp-flow-settings.ts](../src/lib/whatsapp-flow-settings.ts).

Editor na aba "Fluxo" → botão **Configurações** (3 abas internas: Geral / Gatilhos / Parâmetros). Cada parâmetro carrega badge **ativo** ou **pendente** indicando se o engine já consome.

**Ativos hoje**: `welcome_dedup_hours`, `send_welcome_on_unknown`, `menu_sent_tag`, `fallback_template`, `optout_blocks_automation`, `handoff_blocks_automation`, e o trio `allowed_hours_*` + `timezone`.

**Pendentes** (UI persiste mas engine ignora): `max_auto_replies_per_lead_per_day`, `min_interval_minutes_between_replies`, `resend_menu_after_days`, `send_menu_if_interest_already_set`, `handoff_auto_expire_hours`.

Adicionar um setting novo: declare no `FlowSettings`, ponha default em `FLOW_SETTINGS_DEFAULTS`, leia onde fizer sentido, e atualize o badge na UI ([ParamRow](../src/components/admin/central-whatsapp/FluxoTab.tsx)) pra "ativo".
