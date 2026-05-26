# VPS WhatsApp — operação

Existe porque Vercel serverless não mantém WebSocket persistente. Roda em DigitalOcean VPS `165.232.142.37`. Dois containers Baileys independentes — **Central** (porta 3001, número comercial) e **Catálogos** (porta 3002, número operacional). Ver [whatsapp-catalogos.md](./whatsapp-catalogos.md) pra detalhes da segunda sessão.

## Comandos básicos

```bash
# SSH
ssh root@165.232.142.37

# Logs
docker logs formula_boi_whatsapp --tail 50 -f
docker logs formula_boi_whatsapp_catalogs --tail 50 -f

# Restart
docker restart formula_boi_whatsapp

# Rebuild após mudança de código
cd /opt/whatsapp-server && docker-compose up -d --build
```

Sessão persistida no volume `/opt/whatsapp-auth/` (Central) e `/opt/whatsapp-catalogs-auth/` (Catálogos). Se o QR code precisar ser re-escaneado, deletar arquivos de auth e reiniciar.

## Endpoints HTTP do servidor Central

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/status` | GET | Connection status + QR code data URL |
| `/send` | POST | Enfileira mensagem `{phone, name}` — devolve `{sent, queued, position}` |
| `/queue` | GET | Tamanho da fila e status de processamento |
| `/config` | GET | Config de fluxo in-memory + count de pending reply |
| `/reload-config` | POST | Força reload da config de fluxo do Supabase |

## Comandos em grupos (Central)

Quando membro de grupo conectado (`@g.us`, `fromMe = false`) envia um prefixo, o VPS POSTa pro Next.js com `x-webhook-secret: WHATSAPP_GROUP_TASK_SECRET` e responde no grupo.

| Prefix | Endpoint | Efeito | Resposta success/falha |
|--------|----------|--------|------------------------|
| `/tarefa <descrição>` | `/api/whatsapp/group-task` | Cria card em `tactical_tasks` com WhatsApp origin fields. Badge verde "WhatsApp" no Kanban ERP. | `✅ Tarefa criada por *Name*: "..."` / `❌ Não foi possível criar a tarefa.` |
| `/decisao <texto>` | `/api/whatsapp/group-decision` | Insere `tactical_decisions` (`decided_at = today`). | success/failure |
| `/risco <título>` | `/api/whatsapp/group-risk` | Insere `tactical_risks` (defaults `probability=media`, `impact=medio`, `status=active`). | success/failure |
| `/ia <pergunta>` | `/api/whatsapp/group-ai` | "Processando…" → GLM-4.7 com tool-calling contra 8-table allow-list → resposta (max ~1000 chars). 30s timeout. Fire-and-forget no VPS. | resposta / `❌ Não foi possível processar a pergunta.` |

VPS env obrigatórias: `NEXT_JS_URL=https://admin.formuladoboi.com`, `WHATSAPP_GROUP_TASK_SECRET=<secret>` (mesmo valor da Vercel Production).

## WhatsApp Flow Config (legacy `site_settings.whatsapp_flow`)

```json
{
  "welcome_message": "Olá {nome}! ...",
  "options": [
    { "key": "1", "label": "Ver catálogo", "response": "Acesse: https://..." },
    { "key": "2", "label": "Falar com consultor", "response": "Em breve..." }
  ],
  "flow_timeout_minutes": 60
}
```

- `{nome}` em `welcome_message` é substituído pelo nome do lead.
- Após o welcome, o servidor trackeia o contato como "awaiting reply" por `flow_timeout_minutes`.
- Se o contato responder com `key` matching, a `response` é enviada automaticamente.
- Zero opções configuradas = só envia welcome (sem tracking de reply).

Aplicar mudanças: salvar via admin panel ou `PUT /api/whatsapp/flow` — isso dispara `POST /reload-config` no VPS automaticamente.

> Esse é o flow config **legado**. A Central WhatsApp moderna usa `whatsapp_flows` (grafo) + `whatsapp_templates` (slug `welcome-default`). Ver [whatsapp-flow-default.md](./whatsapp-flow-default.md).

## Pitfalls

- Conflito 440 (sessão duplicada): aparece quando dois containers tentam logar com o mesmo número. Confirmar qual auth folder está ativo antes de subir.
- `vercel env add` pode appendar newline no segredo, causando 401 em todas as chamadas — colar com cuidado.
