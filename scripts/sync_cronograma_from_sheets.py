"""
Sincroniza informações textuais (data, hora, leiloeira, criador, qtd, etc.)
da planilha "ESCALA LEILÕES 2026" para a tabela cronograma_leiloes no Supabase.

Fonte: https://docs.google.com/spreadsheets/d/1rzEUSB1Rt4DQ7xlj3Wej4Rn-NwnMSgGk

Comportamento:
  - Detecta cabeçalhos por nome (fuzzy match) — tolera variação de
    layout entre abas (ex: ABRIL2026 começa as informações na col E,
    MAIO2026 tem coluna CATÁLOGO no meio).
  - UPSERT em cronograma_leiloes por (data, nome normalizado).
  - Match → UPDATE só dos campos que a planilha preenche.
  - Sem match → INSERT.
  - Nunca apaga registros que não estão na planilha (preserva o que
    foi criado/editado manualmente no admin).

Uso:
    export SUPABASE_SERVICE_ROLE_KEY=...
    python scripts/sync_cronograma_from_sheets.py

Acompanha scripts/upload_leilao_images.py — ambos rodam pela mesma
GitHub Action (.github/workflows/sync-leiloes.yml).
"""

import datetime as _dt
import os
import re
import sys
import tempfile

import openpyxl
import requests

# Garante stdout em utf-8 (logs limpos no GitHub Actions e em terminais Windows)
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

GSHEETS_ID = "1rzEUSB1Rt4DQ7xlj3Wej4Rn-NwnMSgGk"
GSHEETS_EXPORT = (
    f"https://docs.google.com/spreadsheets/d/{GSHEETS_ID}/export?format=xlsx"
)

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://hghtikjaqixglmpujbwj.supabase.co"
)
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_KEY:
    raise SystemExit("Defina SUPABASE_SERVICE_ROLE_KEY no ambiente")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}


# ────────────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────────────

def norm(s):
    if s is None:
        return ""
    s = str(s).lower().strip()
    repl = {
        "ã": "a", "â": "a", "á": "a", "à": "a",
        "é": "e", "ê": "e", "í": "i",
        "ó": "o", "ô": "o", "õ": "o",
        "ú": "u", "ç": "c",
    }
    for k, v in repl.items():
        s = s.replace(k, v)
    s = re.sub(r"[^a-z0-9]", "", s)
    return s


def cell(v):
    """Strip + normaliza None/empty pra None."""
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def parse_date(v):
    """Retorna ISO YYYY-MM-DD ou None."""
    if v is None:
        return None
    if hasattr(v, "strftime"):
        return v.strftime("%Y-%m-%d")
    s = str(v).strip()
    # Excel serial
    try:
        f = float(s)
        if f > 30000:
            base = _dt.datetime(1899, 12, 30)
            return (base + _dt.timedelta(days=f)).date().isoformat()
    except (ValueError, TypeError):
        pass
    # YYYY-MM-DD prefix
    m = re.match(r"^(\d{4}-\d{2}-\d{2})", s)
    if m:
        try:
            _dt.date.fromisoformat(m.group(1))
            return m.group(1)
        except ValueError:
            pass
    return None


def parse_hora(v):
    """Normaliza hora pra HH:MM string. None se não der."""
    if v is None:
        return None
    if hasattr(v, "strftime"):  # datetime.time
        try:
            return v.strftime("%H:%M")
        except Exception:
            pass
    s = str(v).strip()
    if not s:
        return None
    # "09:00:00" → "09:00"
    m = re.match(r"^(\d{1,2}):(\d{2})", s)
    if m:
        return f"{int(m.group(1)):02d}:{m.group(2)}"
    # "9.5" (excel time as float fraction of day)
    try:
        f = float(s)
        if 0 <= f < 1:
            total_min = round(f * 24 * 60)
            return f"{total_min // 60:02d}:{total_min % 60:02d}"
        # "19.0" — tratado como hora cheia
        if 0 <= f <= 23:
            return f"{int(f):02d}:00"
    except (ValueError, TypeError):
        pass
    return s[:5] if len(s) >= 4 else None


def parse_int(v):
    if v is None:
        return None
    s = str(v).strip()
    if not s:
        return None
    try:
        return int(float(s))
    except (ValueError, TypeError):
        return None


# ────────────────────────────────────────────────────────────────────────────
# Header mapping
# ────────────────────────────────────────────────────────────────────────────

# canonical_field → list of normalized header aliases (em ordem de prioridade)
HEADER_ALIASES = {
    "data":           ["mes", "dia", "data"],          # col com a data ISO
    "dia_semana":     ["diadasemana"],
    "hora":           ["hora"],
    "nome":           ["leilao"],
    "criador":        ["criador"],
    "presencial":     ["presencial"],
    "leiloeira":      ["leiloeira"],
    "raca":           ["raca"],
    "qtd_animais":    ["qtdanimais", "qtd"],
    "sexo":           ["sexo"],
    "comissao":       ["negociacaodecomissao", "comissao"],
    "contrato":       ["contrato"],
}


def detect_columns(ws):
    """
    Lê linhas 1..3 procurando os cabeçalhos. Retorna dict canonical→col(1-based).
    Ignora colunas não mapeadas. Pula 'comissao' header da SEÇÃO (linha 1) que
    se sobrepõe ao alias do campo.
    """
    found = {}
    # Linha 2 é o cabeçalho de campo (MÊS, HORA, LEILÃO...); linha 1 é só o
    # rótulo da seção (INFORMAÇÕES DO LEILÃO, COMISSÃO...). Linha 2 vence.
    header_cells = {}
    for row in (2, 1):
        for col in range(1, ws.max_column + 1):
            v = ws.cell(row=row, column=col).value
            if v is None:
                continue
            n = norm(v)
            if n and col not in header_cells:
                header_cells[col] = n

    # match canonical → col
    for canonical, aliases in HEADER_ALIASES.items():
        for col, header_norm in header_cells.items():
            if col in found.values():
                continue
            for alias in aliases:
                if header_norm == alias:
                    found[canonical] = col
                    break
            if canonical in found:
                break
    return found


# ────────────────────────────────────────────────────────────────────────────
# Supabase client (REST)
# ────────────────────────────────────────────────────────────────────────────

def fetch_existing():
    """Lê tudo de cronograma_leiloes pra match local (evita N round-trips)."""
    out = []
    page = 0
    while True:
        r = requests.get(
            f"{SUPABASE_URL}/rest/v1/cronograma_leiloes",
            headers={**HEADERS, "Range-Unit": "items", "Range": f"{page * 1000}-{(page + 1) * 1000 - 1}"},
            params={"select": "id,data,nome,dia_semana,hora,criador,presencial,leiloeira,raca,qtd_animais,sexo,comissao,contrato"},
        )
        if r.status_code not in (200, 206):
            raise RuntimeError(f"Falha ao listar cronograma: {r.status_code} {r.text}")
        chunk = r.json()
        out.extend(chunk)
        if len(chunk) < 1000:
            break
        page += 1
    return out


def insert_row(payload):
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/cronograma_leiloes",
        headers={**HEADERS, "Prefer": "return=representation"},
        json=payload,
    )
    if r.status_code not in (200, 201):
        print(f"  ✗ INSERT falhou: {r.status_code} {r.text}", flush=True)
        return None
    d = r.json()
    return d[0] if isinstance(d, list) else d


def update_row(rec_id, payload):
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/cronograma_leiloes?id=eq.{rec_id}",
        headers={**HEADERS, "Prefer": "return=minimal"},
        json=payload,
    )
    return r.status_code in (200, 204)


# ────────────────────────────────────────────────────────────────────────────
# Pipeline
# ────────────────────────────────────────────────────────────────────────────

def extract_rows_from_sheet(ws):
    """Yields dicts com os campos mapeados. Pula linhas sem (data + nome)."""
    cols = detect_columns(ws)
    if "data" not in cols or "nome" not in cols:
        return
    for r_idx in range(1, ws.max_row + 1):
        data_iso = parse_date(ws.cell(row=r_idx, column=cols["data"]).value)
        if not data_iso:
            continue
        nome = cell(ws.cell(row=r_idx, column=cols["nome"]).value)
        if not nome:
            continue  # linha de calendário sem leilão
        row = {"data": data_iso, "nome": nome}
        for canonical, col in cols.items():
            if canonical in ("data", "nome"):
                continue
            v = ws.cell(row=r_idx, column=col).value
            if canonical == "hora":
                row[canonical] = parse_hora(v)
            elif canonical == "qtd_animais":
                row[canonical] = parse_int(v)
            elif canonical == "dia_semana":
                # Padroniza Capitalização: "domingo" → "Domingo"
                s = cell(v)
                row[canonical] = s.capitalize() if s else None
            else:
                row[canonical] = cell(v)
        yield row


def main():
    print(f"📥 Baixando planilha {GSHEETS_ID}...", flush=True)
    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
        xlsx_path = tmp.name
    try:
        # Retry: o export do Google Sheets ocasionalmente devolve resposta
        # incompleta (chunked encoding). Tentamos até 3x antes de falhar.
        last_err = None
        for attempt in range(3):
            try:
                r = requests.get(GSHEETS_EXPORT, allow_redirects=True, timeout=60)
                r.raise_for_status()
                open(xlsx_path, "wb").write(r.content)
                last_err = None
                break
            except (requests.exceptions.ChunkedEncodingError,
                    requests.exceptions.ConnectionError,
                    requests.exceptions.Timeout) as e:
                last_err = e
                print(f"  ⚠ tentativa {attempt + 1} falhou: {e}", flush=True)
        if last_err:
            raise last_err

        wb = openpyxl.load_workbook(xlsx_path, data_only=True)
        all_rows = []
        for sn in wb.sheetnames:
            ws = wb[sn]
            count_before = len(all_rows)
            for row in extract_rows_from_sheet(ws):
                all_rows.append(row)
            print(f"  • {sn}: {len(all_rows) - count_before} leilões", flush=True)

        print(f"\n📊 Total extraído: {len(all_rows)} leilões", flush=True)

        existing = fetch_existing()
        # index: (data, nome_norm) → record
        index = {}
        for rec in existing:
            key = (rec["data"][:10], norm(rec["nome"]))
            index[key] = rec

        inserted = updated = unchanged = 0
        for row in all_rows:
            key = (row["data"], norm(row["nome"]))
            existing_rec = index.get(key)

            # Filtra payload — só envia campos que a planilha preencheu
            payload = {k: v for k, v in row.items() if v not in (None, "")}

            if existing_rec is None:
                rec = insert_row(payload)
                if rec:
                    inserted += 1
                    index[key] = rec
                    print(f"  ➕ {row['data']} | {row['nome']}", flush=True)
            else:
                # Detecta diff — só PATCH se mudou algo
                diff = {}
                for k, v in payload.items():
                    if k == "nome":
                        continue  # nome é a chave; só atualiza outros campos
                    cur = existing_rec.get(k)
                    if cur != v and not (cur in (None, "") and v in (None, "")):
                        diff[k] = v
                if diff:
                    if update_row(existing_rec["id"], diff):
                        updated += 1
                        print(f"  🔄 {row['data']} | {row['nome']}  ({', '.join(diff.keys())})", flush=True)
                else:
                    unchanged += 1

        print(
            f"\n✅ Done — {inserted} inseridos, {updated} atualizados, "
            f"{unchanged} sem mudança ({len(all_rows)} total)",
            flush=True,
        )
    finally:
        try:
            os.unlink(xlsx_path)
        except OSError:
            pass


if __name__ == "__main__":
    sys.exit(main() or 0)
