"""Sync CRM leads from Backup leads.xlsx.

Modes:
  python sync-leads-from-backup.py cleanup [--apply]
  python sync-leads-from-backup.py enrich  [--apply]
  python sync-leads-from-backup.py import  [--apply]
  python sync-leads-from-backup.py all     [--apply]   # runs cleanup -> enrich -> import

Without --apply each mode runs as a dry-run printing every change it would make.

Uso:
    export SUPABASE_SERVICE_ROLE_KEY=...
    python scripts/sync-leads-from-backup.py all
"""
import os, sys, re, json, urllib.request, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')
import pandas as pd
from datetime import datetime

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://hghtikjaqixglmpujbwj.supabase.co')
SERVICE_KEY  = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
BACKUP_FILE  = os.environ.get('BACKUP_LEADS_FILE', 'F:/Backup leads.xlsx')

if not SERVICE_KEY:
    raise SystemExit('Defina SUPABASE_SERVICE_ROLE_KEY no ambiente')

H = {'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}',
     'Content-Type': 'application/json', 'Prefer': 'return=representation'}

# ── helpers ──────────────────────────────────────────────────────────────────

def norm_phone(v):
    """Return digits-only phone w/ Brazilian country code (55DDDXXXXXXXX), or '' if invalid."""
    if v is None: return ''
    s = str(v)
    if s in ('nan', 'None', ''): return ''
    digits = re.sub(r'\D', '', s)
    if not digits: return ''
    if len(digits) >= 12 and digits.startswith('55'):
        digits = digits[2:]
    if len(digits) >= 11: digits = digits[-11:]
    elif len(digits) >= 10: digits = digits[-10:]
    else: return ''
    return '55' + digits

def phone_match_key(v):
    """Match key: just the DDD+number digits (no country code) for cross-format matching."""
    p = norm_phone(v)
    return p[2:] if p.startswith('55') else p

def s(v):
    if v is None: return ''
    if isinstance(v, float) and pd.isna(v): return ''
    return str(v).strip()

def title_case(v):
    if not v: return ''
    return ' '.join(w.capitalize() if len(w) > 2 else w.lower() for w in v.split()).strip()

def supa_get(path):
    req = urllib.request.Request(f'{SUPABASE_URL}{path}', headers=H)
    return json.loads(urllib.request.urlopen(req).read())

def supa_patch(table, pk_filter, body):
    url = f'{SUPABASE_URL}/rest/v1/{table}?{pk_filter}'
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='PATCH')
    return json.loads(urllib.request.urlopen(req).read())

def supa_delete(table, pk_filter):
    url = f'{SUPABASE_URL}/rest/v1/{table}?{pk_filter}'
    req = urllib.request.Request(url, headers=H, method='DELETE')
    urllib.request.urlopen(req).read()

def supa_post(table, body):
    url = f'{SUPABASE_URL}/rest/v1/{table}'
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=H, method='POST')
    return json.loads(urllib.request.urlopen(req).read())

# ── test detection ───────────────────────────────────────────────────────────

TEST_NAME_PATTERNS = [
    r'^teste\b', r'\bteste comprador\b', r'\bjohn doe\b', r'\btest\b',
    r'^(asdf|qwer|zzz|xxx|aaa|abc|teste\d*)\b', r'^lorem\b',
]
TEST_EMAIL_PATTERNS = [
    r'@example\.com$', r'@test\.com$', r'^testecomprador',
    r'^teste@', r'^test@',
]
TEST_PHONE_PATTERNS = [
    r'^5*9{8,}', r'^5*0+$', r'^5*1{8,}',
    r'^(\d)\1{7,}',
]

def is_test_lead(nome, email, phone):
    n = (nome or '').strip().lower()
    e = (email or '').strip().lower()
    p = re.sub(r'\D', '', phone or '')
    for pat in TEST_NAME_PATTERNS:
        if re.search(pat, n): return f'nome="{nome}"'
    for pat in TEST_EMAIL_PATTERNS:
        if re.search(pat, e): return f'email="{email}"'
    for pat in TEST_PHONE_PATTERNS:
        if p and re.search(pat, p): return f'telefone="{phone}"'
    if p and len(p) < 10: return f'telefone curto="{phone}"'
    return None

# ── load CRM and backup ──────────────────────────────────────────────────────

def load_crm():
    return supa_get('/rest/v1/crm_leads?select=*&limit=2000')

def load_backup():
    xl = pd.ExcelFile(BACKUP_FILE)
    rows = []

    df = pd.read_excel(xl, sheet_name='Leads-GP')
    df.columns = [str(c).strip() for c in df.columns]
    for _, r in df.iterrows():
        cel = norm_phone(r.get('Celular'))
        if not cel: continue
        rows.append({
            'sheet': 'Leads-GP', 'celular': cel,
            'nome': s(r.get('Nome Completo')),
            'instagram': s(r.get('Instagram')),
            'empresa': s(r.get('Nome da Fazenda')),
            'estado': s(r.get('Estado')).upper()[:2],
            'cidade': title_case(s(r.get('Cidade'))),
            'o_que_busca': s(r.get('O que você busca')),
            'quantidade_animais': s(r.get('Quantidade de animais')),
            'source_page': s(r.get('Page')),
            'source': s(r.get('Source')).lower(),
            'medium': s(r.get('Medium')),
            'campaign': s(r.get('Campaign')),
            'extra_momento': s(r.get('Momento Pecuária')),
            'data_entrada': s(r.get('Data')),
        })

    df = pd.read_excel(xl, sheet_name='hotmart')
    for _, r in df.iterrows():
        cel = norm_phone(r.get('Cel'))
        email = s(r.get('Email'))
        if not cel and not email: continue
        rows.append({'sheet':'hotmart','celular':cel,'nome':s(r.get('Nome')),
            'email':email,'estado':s(r.get('Estado'))[:2].upper() if s(r.get('Estado')) else '',
            'cidade':title_case(s(r.get('Cidade'))),'cpf':s(r.get('Documento Numero')),
            'status_default':'Fechado','origem_label':'Hotmart (e-book)'})

    df = pd.read_excel(xl, sheet_name='Compraram')
    for _, r in df.iterrows():
        cel = norm_phone(r.get('Cel'))
        email = s(r.get('Email'))
        if not cel and not email: continue
        rows.append({'sheet':'Compraram','celular':cel,'nome':s(r.get('Nome')),
            'email':email,'estado':s(r.get('Estado'))[:2].upper() if s(r.get('Estado')) else '',
            'cidade':title_case(s(r.get('Cidade'))),'cpf':s(r.get('CPF')),
            'status_default':'Fechado','origem_label':'Compra direta'})

    df = pd.read_excel(xl, sheet_name='Pag-zap')
    for _, r in df.iterrows():
        cel = norm_phone(r.get('WHATSAPP'))
        email = s(r.get('E-MAIL'))
        if not cel and not email: continue
        rows.append({'sheet':'Pag-zap','celular':cel,'nome':s(r.get('NOME COMPLETO')),
            'email':email,'quantidade_animais':s(r.get('QTDE ANIMAIS')),
            'extra_intencao':s(r.get('INTENÇÃO INVESTIMENTO')),
            'extra_perfil':s(r.get('PERFIL')),
            'interesse':s(r.get('INTERESSE ')) or s(r.get('INTERESSE')),
            'extra_assessoria':s(r.get('ASSESSORIA')),
            'estado':s(r.get('UF'))[:2].upper() if s(r.get('UF')) else '',
            'cidade':title_case(s(r.get('CIDADE')))})

    df = pd.read_excel(xl, sheet_name='Checkout-Semen')
    for _, r in df.iterrows():
        nome = s(r.get('NOME COMPLETO'))
        if not nome: continue
        cidade_uf = s(r.get('CIDADE/UF'))
        cidade, estado = '', ''
        if '/' in cidade_uf:
            parts = [x.strip() for x in cidade_uf.split('/')]
            if len(parts) == 2:
                cidade, estado = title_case(parts[0]), parts[1].upper()[:2]
        rows.append({'sheet':'Checkout-Semen','celular':'','nome':nome,
            'empresa':s(r.get('NOME DA FAZENDA')),'cpf':s(r.get('CPF')),
            'quantidade_animais':s(r.get('NÚMERO DE ANIMAIS')),
            'cidade':cidade,'estado':estado,
            'extra_doses':s(r.get('NÚMERO DE DOSES PARA RESERVA')),
            'extra_parcelamento':s(r.get('CONDIÇÃO DE PARCELAMENTO')),
            'status_default':'Negociação','origem_label':'Checkout sêmen'})

    df = pd.read_excel(xl, sheet_name='Abandono_carrinho')
    for _, r in df.iterrows():
        cel = norm_phone(r.get('Cel'))
        email = s(r.get('Email'))
        if not cel and not email: continue
        rows.append({'sheet':'Abandono_carrinho','celular':cel,'nome':s(r.get('Nome')),
            'email':email,'extra_produto':s(r.get('nome do produto')),
            'status_default':'Lead','origem_label':'Abandono carrinho'})

    return rows

# ── modes ────────────────────────────────────────────────────────────────────

def mode_cleanup(apply_):
    print('=== CLEANUP — remove leads de teste do CRM ===')
    crm = load_crm()
    to_delete = []
    for c in crm:
        nome = c.get('nome') or ''
        email = c.get('email') or (c.get('extra_data') or {}).get('email') or ''
        phone = c.get('celular') or c.get('telefone') or ''
        reason = is_test_lead(nome, email, phone)
        if reason:
            to_delete.append((c, reason))
    print(f'Encontrados: {len(to_delete)} leads de teste')
    for c, reason in to_delete:
        print(f'  - [{c["id"][:8]}] {c["nome"][:40]:40s}  motivo: {reason}')
    if apply_ and to_delete:
        for c, _ in to_delete:
            supa_delete('crm_leads', f'id=eq.{c["id"]}')
        print(f'✓ {len(to_delete)} leads removidos')
    elif to_delete:
        print('(dry-run — passe --apply para deletar de fato)')
    return [c['id'] for c, _ in to_delete]

def mode_enrich(apply_, deleted_ids=None):
    print()
    print('=== ENRICH — preencher campos vazios em leads existentes ===')
    deleted_ids = set(deleted_ids or [])
    crm = [c for c in load_crm() if c['id'] not in deleted_ids]
    backup = load_backup()

    crm_by_phone = {}
    for c in crm:
        for ph in (c.get('celular'), c.get('telefone')):
            k = phone_match_key(ph)
            if k and len(k) >= 10:
                crm_by_phone.setdefault(k, c)

    SIMPLE_FIELDS = ['estado','cidade','empresa','o_que_busca','quantidade_animais',
                     'source','medium','campaign','source_page','instagram','email','interesse']
    updates = []
    for b in backup:
        # skip tests
        reason = is_test_lead(b.get('nome'), b.get('email'), b.get('celular'))
        if reason: continue
        key = phone_match_key(b.get('celular'))
        if not key or key not in crm_by_phone: continue
        c = crm_by_phone[key]
        patch = {}
        for f in SIMPLE_FIELDS:
            if b.get(f) and not (c.get(f) or '').strip():
                patch[f] = b[f]
        # celular normalized
        cel_norm = b.get('celular','')
        if cel_norm and norm_phone(c.get('celular')) != cel_norm:
            patch['celular'] = cel_norm
        # extra_data merging
        new_extra = dict(c.get('extra_data') or {})
        for k in ['extra_momento','extra_intencao','extra_perfil','extra_assessoria',
                  'extra_doses','extra_parcelamento','extra_produto','cpf']:
            if b.get(k):
                ekey = k.replace('extra_','')
                if not new_extra.get(ekey):
                    new_extra[ekey] = b[k]
        if new_extra != (c.get('extra_data') or {}):
            patch['extra_data'] = new_extra
        # data_entrada
        if b.get('data_entrada') and not c.get('data_entrada'):
            try:
                d = pd.to_datetime(b['data_entrada'], errors='coerce')
                if pd.notna(d):
                    patch['data_entrada'] = d.isoformat()
            except Exception:
                pass
        if patch:
            updates.append((c, patch))

    print(f'Leads com campos a preencher: {len(updates)}')
    sample = updates[:8]
    for c, p in sample:
        keys = list(p.keys())
        print(f'  + [{c["id"][:8]}] {c["nome"][:30]:30s} ← {keys}')
    if len(updates) > 8:
        print(f'  ... +{len(updates)-8} outros')

    field_count = {}
    for _, p in updates:
        for k in p:
            field_count[k] = field_count.get(k, 0) + 1
    print('Campos a preencher (total):')
    for k, n in sorted(field_count.items(), key=lambda x: -x[1]):
        print(f'  {k}: {n}')

    if apply_ and updates:
        for c, p in updates:
            supa_patch('crm_leads', f'id=eq.{c["id"]}', p)
        print(f'✓ {len(updates)} leads atualizados')
    elif updates:
        print('(dry-run — passe --apply para atualizar de fato)')

def mode_import(apply_):
    print()
    print('=== IMPORT — inserir leads novos do backup ===')
    crm = load_crm()
    backup = load_backup()

    crm_by_phone = {}
    crm_by_email = {}
    for c in crm:
        for ph in (c.get('celular'), c.get('telefone')):
            k = phone_match_key(ph)
            if k and len(k) >= 10:
                crm_by_phone.setdefault(k, c)
        em = (c.get('email') or '').strip().lower()
        if em:
            crm_by_email[em] = c

    new_leads = []
    skipped_tests = 0
    for b in backup:
        reason = is_test_lead(b.get('nome'), b.get('email'), b.get('celular'))
        if reason:
            skipped_tests += 1
            continue
        if not b.get('nome') or len(b['nome']) < 3:
            continue
        # already in CRM? skip (those are handled by enrich)
        key = phone_match_key(b.get('celular'))
        if key and key in crm_by_phone: continue
        em = (b.get('email') or '').strip().lower()
        if em and em in crm_by_email: continue
        new_leads.append(b)

    # de-dup within new_leads (same phone or email)
    seen_phones, seen_emails, deduped = set(), set(), []
    for b in new_leads:
        k = phone_match_key(b.get('celular'))
        em = (b.get('email') or '').strip().lower()
        if k and k in seen_phones: continue
        if em and em in seen_emails: continue
        if k: seen_phones.add(k)
        if em: seen_emails.add(em)
        deduped.append(b)

    print(f'Novos leads (após filtro de testes e dedupe): {len(deduped)}')
    print(f'Testes ignorados: {skipped_tests}')
    by_sheet = {}
    for b in deduped:
        by_sheet[b['sheet']] = by_sheet.get(b['sheet'], 0) + 1
    for k, v in by_sheet.items():
        print(f'  {k}: {v}')
    print('Amostra:')
    for b in deduped[:8]:
        print(f"  + [{b['sheet']}] {b['nome'][:35]:35s}  cel={b.get('celular','')}  email={(b.get('email') or '')[:25]}")

    if apply_ and deduped:
        # find next position
        pos = max((c.get('position') or 0) for c in crm) + 100
        inserted = 0
        for b in deduped:
            row = {
                'nome': b['nome'][:200],
                'celular': b.get('celular') or None,
                'email': b.get('email') or None,
                'estado': b.get('estado') or None,
                'cidade': b.get('cidade') or None,
                'empresa': b.get('empresa') or None,
                'o_que_busca': b.get('o_que_busca') or None,
                'quantidade_animais': b.get('quantidade_animais') or None,
                'source': b.get('source') or None,
                'medium': b.get('medium') or None,
                'campaign': b.get('campaign') or None,
                'source_page': b.get('source_page') or None,
                'instagram': b.get('instagram') or None,
                'interesse': b.get('interesse') or None,
                'status': b.get('status_default', 'Lead'),
                'funnel_id': 'default',
                'position': pos,
                'extra_data': {k.replace('extra_',''): b[k] for k in
                    ['extra_momento','extra_intencao','extra_perfil','extra_assessoria',
                     'extra_doses','extra_parcelamento','extra_produto','cpf','origem_label']
                    if b.get(k) or b.get(k.replace('extra_',''))},
            }
            if b.get('origem_label'):
                row['extra_data']['origem_label'] = b['origem_label']
            row = {k: v for k, v in row.items() if v is not None}
            try:
                supa_post('crm_leads', row)
                inserted += 1
                pos += 1
            except Exception as e:
                print(f'  ! falhou {b["nome"]}: {e}')
        print(f'✓ {inserted} leads inseridos')
    elif deduped:
        print('(dry-run — passe --apply para inserir de fato)')

# ── entry ────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    mode = sys.argv[1]
    apply_ = '--apply' in sys.argv
    if mode == 'cleanup':
        mode_cleanup(apply_)
    elif mode == 'enrich':
        mode_enrich(apply_)
    elif mode == 'import':
        mode_import(apply_)
    elif mode == 'all':
        deleted = mode_cleanup(apply_)
        mode_enrich(apply_, deleted)
        mode_import(apply_)
    else:
        print(f'Unknown mode: {mode}'); sys.exit(1)

if __name__ == '__main__':
    main()
