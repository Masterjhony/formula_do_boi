# PostHog — instrumentação

PostHog (US Cloud, projeto **430113**, host `us.i.posthog.com`) instrumenta o **site público** (`/web-site`) e a **LP grupo VIP** (`/web-lp`). Por privacidade do operador interno, **não** roda em `admin.*`, `erp.*` nem `adminbula.*`.

## Topologia client-side

| Surface                                      | Como o PostHog é carregado |
|---------------------------------------------|----------------------------|
| `/web-site/**` (marketplace React)          | [`PostHogProvider`](../src/providers/PostHogProvider.tsx) montado em [src/app/web-site/layout.tsx](../src/app/web-site/layout.tsx). Inicializa o SDK no `useEffect`, captura `$pageview` manual em cada mudança de pathname/searchParams. |
| `/web-lp/page.tsx` (Grupo VIP React)        | Mesmo `PostHogProvider`, montado em [src/app/web-lp/layout.tsx](../src/app/web-lp/layout.tsx). |
| HTMLs estáticos da LP (route handlers)      | Snippet inline injetado em runtime via [`injectPosthogIntoHtml()`](../src/lib/posthog-snippet.ts). Aplicado em: `/grupo-vip/obrigado`, `/grupo-vip/obrigado-mql`, `/grupo-vip/atacante-matinha` e os dois "obrigado" do atacante-matinha. |
| `admin.*`, `erp.*`, `adminbula.*`           | **Nada.** Nenhum dos layouts carrega o `PostHogProvider`. |

## Configuração padrão do SDK

Em `PostHogProvider.tsx`:

- `person_profiles: 'identified_only'` — só cria perfil de pessoa quando chamamos `identify()`. Anônimos não geram registros faturáveis.
- `capture_pageview: false` + tracker manual — controlamos o evento `$pageview` pra que ele dispare em cada navegação client-side do App Router (o auto do PostHog perde transições).
- `autocapture: true` — clicks, form submits, page leaves.
- `session_recording: { maskAllInputs: true, maskTextSelector: '[data-ph-mask]' }` — todos os inputs mascarados; pra mascarar texto também, basta colocar `data-ph-mask` no elemento.

## Eventos custom já cabeados

Declarados em [`EventName`](../src/lib/posthog-client.ts) — adicionar uma chave nova lá antes de chamar `trackEvent()`.

| Evento                       | Onde dispara                                          | Props relevantes |
|-----------------------------|--------------------------------------------------------|------------------|
| `lp_form_submit`            | [GrupoVipQuiz](../src/components/lp/GrupoVipQuiz.tsx) — submit final do quiz. Também chama `identifyLead(tel, {...})` antes. | `mql`, `quantidade_cabecas`, `uf`, `momento_pecuaria`, UTMs |
| `whatsapp_cta_click`        | [WhatsappSection](../src/components/WhatsappSection.tsx) — CTA "Solicitar acesso pelo WhatsApp" da home. | `location`, `destination` |
| `lote_view`                 | [LoteViewTracker](../src/components/site/LoteViewTracker.tsx), incluído em [/web-site/lote/[id]/page.tsx](../src/app/web-site/lote/[id]/page.tsx). | `product_id`, `product_name`, `kind`, `category`, `central`, `unit_price` |
| `lote_reserva_click`        | [ReservaButton](../src/components/site/ReservaButton.tsx) — botão "Reservar doses/embriões". | mesmas props do `lote_view` |
| (reservados, ainda não emitidos) | `checkout_semen_submit`, `checkout_embriao_submit`, `login_attempt`, `login_success`, `signup_attempt`, `signup_success` | Já tipados; cabear nos formulários quando necessário. |

`identifyLead(distinctId, traits)`: usa o telefone como `distinctId` (mesma chave do CRM), permitindo casar replay com lead no Supabase manualmente.

## Painel admin `/web-admin/analytics`

[page.tsx](../src/app/web-admin/(dashboard)/analytics/page.tsx):

- Mostra duas seções em paralelo — **GA4** (server actions em [src/actions/analytics.ts](../src/actions/analytics.ts)) e **PostHog** ([src/actions/posthog.ts](../src/actions/posthog.ts)).
- Server actions PostHog consultam a **HogQL Query API** (`POST /api/projects/{id}/query/`) com `POSTHOG_PERSONAL_API_KEY`.
- Host de queries é resolvido a partir de `NEXT_PUBLIC_POSTHOG_HOST` (troca `*.i.posthog.com` → `*.posthog.com` em `apiHostForQueries()` — a Query API vive no host "app", não no host de ingestion).
- `POSTHOG_PROJECT_ID` tem default hardcoded **`430113`** — não precisa estar nas envs da Vercel.
- Se `POSTHOG_PERSONAL_API_KEY` estiver ausente ou inválida, `isPosthogConfigured()` devolve `false` e o painel renderiza um placeholder com link direto pro projeto PostHog. O SDK no site segue funcionando normalmente — só o painel admin que fica em "modo somente-captura".
- Janela fixa: últimos 30 dias.

## Variáveis de ambiente

- `NEXT_PUBLIC_POSTHOG_KEY` — project token público. Sem ele, o SDK no browser não inicializa.
- `NEXT_PUBLIC_POSTHOG_HOST` — default `https://us.i.posthog.com`.
- `POSTHOG_PROJECT_ID` — default `430113` no código; não precisa setar.
- `POSTHOG_PERSONAL_API_KEY` — só em **Production** na Vercel (marcada Sensitive). Escopo no PostHog: *Performing analytics queries* + acesso ao "Default project". **Mudança de env var na Vercel exige redeploy**.

## Pitfall conhecido

Quando a `POSTHOG_PERSONAL_API_KEY` foi adicionada à Vercel, o painel continuou em modo placeholder até disparar um redeploy. A Vercel não re-injeta envs no deploy ativo. Empty commit em main funciona, mas push direto pra `main` está protegido — usar dashboard → Deployments → ⋯ → Redeploy é mais limpo.

## Adicionar um evento novo

1. Adicione a chave no type `EventName` em [src/lib/posthog-client.ts](../src/lib/posthog-client.ts).
2. Chame `trackEvent('nome_do_evento', { ...props })` no componente cliente.
3. (Opcional) Faça `identifyLead(distinctId, traits)` antes se quiser que o replay/funil associe ao lead.
4. Eventos aparecem no painel admin em até ~1 min (cache da HogQL).
