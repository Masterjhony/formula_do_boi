# docs/

Documentação técnica do projeto. O [CLAUDE.md](../CLAUDE.md) na raiz é mantido enxuto (núcleo essencial); detalhe vive aqui e é lido sob demanda.

## Índice

| Arquivo | Conteúdo |
|---|---|
| [database.md](./database.md) | Tabelas Supabase — products, crm_leads, whatsapp_*, email_*, tactical_*, erp_*, bula_*, agendamentos |
| [api-routes.md](./api-routes.md) | Inventário de rotas em `src/app/api/` |
| [env-vars.md](./env-vars.md) | Variáveis de ambiente + pitfalls |
| [lib-reference.md](./lib-reference.md) | Mapa de `src/lib/` |
| [vps-operations.md](./vps-operations.md) | VPS WhatsApp — SSH, docker, endpoints HTTP, comandos de grupo, legacy flow config |
| [whatsapp-central.md](./whatsapp-central.md) | Central WhatsApp end-to-end — VPS, fluxo, classificador, templates, campanhas, comandos de grupo |
| [whatsapp-flow-default.md](./whatsapp-flow-default.md) | Fluxo default atual (welcome v2 bate-papo), estado por tags, overrides de audiência, parâmetros do fluxo |
| [whatsapp-catalogos.md](./whatsapp-catalogos.md) | Segunda sessão Baileys — captura PDFs em grupos e auto-anexa ao cronograma |
| [email-marketing.md](./email-marketing.md) | Central de E-mail Marketing — SMTP Hostinger, templates, campanhas, unsubscribe |
| [agendamentos.md](./agendamentos.md) | Calendly Free × Google Calendar (ponte sem APIs pagas) |
| [posthog.md](./posthog.md) | PostHog (site público + LP), eventos custom, painel admin |
| [assets/brandbook/](./assets/brandbook/) | Brandbook em PDF (referência visual permanente) |
| [assets/catalogos/](./assets/catalogos/) | Catálogos digitais de leilões (PDFs grandes — pense antes de commitar mais; `git rm --cached <arquivo>` desliga o tracking sem apagar do disco) |
| [legacy/](./legacy/) | Versões antigas/protótipos preservados (HTMLs órfãos, mockups) |
