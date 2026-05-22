"""
Faxina única — remove registros VAZIOS (fantasmas) da tabela bula_leiloes.

Esses registros sobraram de uma importação automática antiga com bug
(o upload_leilao_images.py criava um bula_leilao quando não achava o
nome). Eles poluem o painel /web-admin/leiloes com cards duplicados.

Um registro só é apagado se for comprovadamente VAZIO — NENHUM dado real:
  - nenhuma subtarefa/checklist marcada como concluída;
  - expectativa + meta_bula + realizado_bula == 0;
  - nenhum assessor vinculado  (bula_leilao_assessores);
  - nenhum fechamento vinculado (bula_leilao_fechamento);
  - created_at < CUTOFF — só limpa o passivo ANTIGO; um leilão criado
    depois desta faxina nunca é tocado.

Seguro de re-rodar (idempotente): registros novos ficam fora do CUTOFF,
então uma segunda execução não apaga nada. Trava MAX_DELETE aborta se a
regra, por algum motivo, selecionar muito mais do que o esperado.

Uso:
    export SUPABASE_SERVICE_ROLE_KEY=...
    python scripts/cleanup_bula_ghosts.py
"""

import os
import sys

import requests

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://hghtikjaqixglmpujbwj.supabase.co"
)
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
if not SUPABASE_KEY:
    raise SystemExit("Defina SUPABASE_SERVICE_ROLE_KEY no ambiente")

# Só limpa o passivo criado ANTES desta faxina (21/05/2026). Qualquer
# leilão criado depois é intocável — protege o fluxo "Novo Leilão".
CUTOFF = "2026-05-22T00:00:00Z"
# A faxina esperada é de ~27 registros. Acima disto, a regra selecionou
# coisa demais — aborta sem apagar nada, pra revisão humana.
MAX_DELETE = 35

H = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}


def get(path, params=None):
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{path}", headers=H, params=params or {})
    r.raise_for_status()
    return r.json()


def has_progress(tasks):
    """True se qualquer item da checklist estiver marcado como concluído."""
    for g in (tasks or []):
        for t in (g.get("tasks") or []):
            subs = t.get("subs") or []
            if subs:
                if any(s.get("done") for s in subs):
                    return True
            elif t.get("done"):
                return True
    return False


def main():
    leiloes = get("bula_leiloes", {
        "select": "id,nome,data,created_at,tasks,expectativa,meta_bula,realizado_bula",
    })
    print(f"bula_leiloes: {len(leiloes)} registros", flush=True)

    # IDs com vínculo real — nunca podem ser apagados.
    with_assessor = {r["leilao_id"] for r in get("bula_leilao_assessores", {"select": "leilao_id"})}
    try:
        with_fechamento = {r["leilao_id"] for r in get("bula_leilao_fechamento", {"select": "leilao_id"})}
    except Exception as e:  # noqa: BLE001
        print(f"❌ Não consegui ler bula_leilao_fechamento ({e}). Abortando por segurança.", flush=True)
        return 1
    print(f"  com assessor: {len(with_assessor)} | com fechamento: {len(with_fechamento)}", flush=True)

    ghosts, kept = [], 0
    for l in leiloes:
        fin = (l.get("expectativa") or 0) + (l.get("meta_bula") or 0) + (l.get("realizado_bula") or 0)
        is_ghost = (
            not has_progress(l.get("tasks"))
            and fin == 0
            and l["id"] not in with_assessor
            and l["id"] not in with_fechamento
            and (l.get("created_at") or "") < CUTOFF
        )
        if is_ghost:
            ghosts.append(l)
        else:
            kept += 1

    print(f"\n🧹 {len(ghosts)} fantasmas a remover | {kept} registros reais preservados\n", flush=True)

    if not ghosts:
        print("✅ Nada a limpar — bula_leiloes já está sem fantasmas.", flush=True)
        return 0
    if len(ghosts) > MAX_DELETE:
        print(
            f"❌ ABORTANDO: {len(ghosts)} fantasmas selecionados (> limite {MAX_DELETE}). "
            "Revise antes de apagar.",
            flush=True,
        )
        return 1

    deleted = 0
    for g in sorted(ghosts, key=lambda x: x["data"]):
        r = requests.delete(
            f"{SUPABASE_URL}/rest/v1/bula_leiloes?id=eq.{g['id']}",
            headers={**H, "Prefer": "return=minimal"},
        )
        if r.status_code in (200, 204):
            deleted += 1
            print(f"  🗑  {g['data']} | {g['nome']}  [{g['id'][:8]}]", flush=True)
        else:
            print(f"  ✗ FALHOU {g['data']} | {g['nome']}: {r.status_code} {r.text}", flush=True)

    print(f"\n✅ Done — {deleted} de {len(ghosts)} fantasmas removidos.", flush=True)
    return 0 if deleted == len(ghosts) else 1


if __name__ == "__main__":
    sys.exit(main())
