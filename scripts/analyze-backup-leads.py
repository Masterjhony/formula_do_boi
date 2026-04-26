"""Cross-reference Backup leads.xlsx with the CRM to identify enrichable fields.

Uso:
    export SUPABASE_SERVICE_ROLE_KEY=...
    python scripts/analyze-backup-leads.py
"""
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
import pandas as pd, urllib.request, json, re
from collections import Counter

SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://hghtikjaqixglmpujbwj.supabase.co')
SERVICE_KEY  = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

if not SERVICE_KEY:
    raise SystemExit('Defina SUPABASE_SERVICE_ROLE_KEY no ambiente')

def norm_phone(v):
    if v is None: return ''
    s = str(v)
    if s in ('nan','None',''): return ''
    digits = re.sub(r'\D', '', s)
    if not digits: return ''
    if len(digits) >= 12 and digits.startswith('55'):
        digits = digits[2:]
    if len(digits) >= 11: digits = digits[-11:]
    elif len(digits) >= 10: digits = digits[-10:]
    return digits

def s(v):
    if v is None: return ''
    if isinstance(v,float) and pd.isna(v): return ''
    return str(v).strip()

# CRM
url = f'{SUPABASE_URL}/rest/v1/crm_leads?select=*&limit=2000'
headers = {'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'}
crm = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=headers)).read())
print(f'CRM leads: {len(crm)}')

crm_by_phone = {}
for r in crm:
    for ph in (r.get('celular'), r.get('telefone')):
        n = norm_phone(ph)
        if n and len(n) >= 10:
            crm_by_phone.setdefault(n, []).append(r)
print(f'CRM phone keys: {len(crm_by_phone)}')

xl = pd.ExcelFile('F:/Backup leads.xlsx')
all_backup = []

df = pd.read_excel(xl, sheet_name='Leads-GP')
df.columns = [str(c).strip() for c in df.columns]
for _, row in df.iterrows():
    cel = norm_phone(row.get('Celular'))
    if not cel: continue
    all_backup.append({
        'sheet': 'Leads-GP', 'cel': cel,
        'nome': s(row.get('Nome Completo')),
        'instagram': s(row.get('Instagram')),
        'fazenda': s(row.get('Nome da Fazenda')),
        'estado': s(row.get('Estado')),
        'cidade': s(row.get('Cidade')),
        'momento': s(row.get('Momento Pecuária')),
        'o_que_busca': s(row.get('O que você busca')),
        'qtd_animais': s(row.get('Quantidade de animais')),
        'page': s(row.get('Page')),
        'source': s(row.get('Source')),
        'medium': s(row.get('Medium')),
        'campaign': s(row.get('Campaign')),
        'data': s(row.get('Data')),
    })

df = pd.read_excel(xl, sheet_name='hotmart')
for _, row in df.iterrows():
    cel = norm_phone(row.get('Cel'))
    email = s(row.get('Email'))
    if not cel and not email: continue
    all_backup.append({'sheet':'hotmart','cel':cel,'nome':s(row.get('Nome')),'email':email,
        'estado':s(row.get('Estado')),'cidade':s(row.get('Cidade')),'cpf':s(row.get('Documento Numero'))})

df = pd.read_excel(xl, sheet_name='Compraram')
for _, row in df.iterrows():
    cel = norm_phone(row.get('Cel'))
    email = s(row.get('Email'))
    if not cel and not email: continue
    all_backup.append({'sheet':'Compraram','cel':cel,'nome':s(row.get('Nome')),'email':email,
        'estado':s(row.get('Estado')),'cidade':s(row.get('Cidade')),'cpf':s(row.get('CPF'))})

df = pd.read_excel(xl, sheet_name='Pag-zap')
for _, row in df.iterrows():
    cel = norm_phone(row.get('WHATSAPP'))
    email = s(row.get('E-MAIL'))
    if not cel and not email: continue
    all_backup.append({'sheet':'Pag-zap','cel':cel,'nome':s(row.get('NOME COMPLETO')),
        'email':email,'qtd_animais':s(row.get('QTDE ANIMAIS')),
        'intencao':s(row.get('INTENÇÃO INVESTIMENTO')),'perfil':s(row.get('PERFIL')),
        'interesse':s(row.get('INTERESSE ')),'assessoria':s(row.get('ASSESSORIA')),
        'estado':s(row.get('UF')),'cidade':s(row.get('CIDADE'))})

df = pd.read_excel(xl, sheet_name='Checkout-Semen')
for _, row in df.iterrows():
    nome = s(row.get('NOME COMPLETO'))
    if not nome: continue
    all_backup.append({'sheet':'Checkout-Semen','cel':'','nome':nome,
        'fazenda':s(row.get('NOME DA FAZENDA')),'cpf':s(row.get('CPF')),
        'qtd_animais':s(row.get('NÚMERO DE ANIMAIS')),'cidade_uf':s(row.get('CIDADE/UF')),
        'doses':s(row.get('NÚMERO DE DOSES PARA RESERVA')),
        'parcelamento':s(row.get('CONDIÇÃO DE PARCELAMENTO'))})

df = pd.read_excel(xl, sheet_name='Abandono_carrinho')
for _, row in df.iterrows():
    cel = norm_phone(row.get('Cel'))
    email = s(row.get('Email'))
    if not cel and not email: continue
    all_backup.append({'sheet':'Abandono_carrinho','cel':cel,'nome':s(row.get('Nome')),
        'email':email,'status':s(row.get('status')),'produto':s(row.get('nome do produto'))})

print(f'Backup rows (com telefone ou email): {len(all_backup)}')

matched, unmatched = [], []
for b in all_backup:
    cel = b.get('cel','')
    if cel and cel in crm_by_phone:
        matched.append((b, crm_by_phone[cel][0]))
    else:
        unmatched.append(b)
print(f'Matched ao CRM (telefone): {len(matched)}')
print(f'NÃO em CRM: {len(unmatched)}')
print()

fillable = {k:0 for k in ['estado','cidade','instagram','empresa','o_que_busca',
    'quantidade_animais','source','medium','campaign','email','celular','source_page','interesse']}
for b, c in matched:
    if b.get('estado') and not c.get('estado'): fillable['estado'] += 1
    if b.get('cidade') and not c.get('cidade'): fillable['cidade'] += 1
    if b.get('instagram') and not c.get('instagram'): fillable['instagram'] += 1
    if b.get('fazenda') and not c.get('empresa'): fillable['empresa'] += 1
    if b.get('o_que_busca') and not c.get('o_que_busca'): fillable['o_que_busca'] += 1
    if b.get('qtd_animais') and not c.get('quantidade_animais'): fillable['quantidade_animais'] += 1
    if b.get('source') and not c.get('source'): fillable['source'] += 1
    if b.get('medium') and not c.get('medium'): fillable['medium'] += 1
    if b.get('campaign') and not c.get('campaign'): fillable['campaign'] += 1
    if b.get('email') and not c.get('email'): fillable['email'] += 1
    if b.get('cel') and not norm_phone(c.get('celular')): fillable['celular'] += 1
    if b.get('page') and not c.get('source_page'): fillable['source_page'] += 1
    if b.get('interesse') and not c.get('interesse'): fillable['interesse'] += 1

print('Campos VAZIOS no CRM que dá pra preencher (matches):')
for k, v in fillable.items():
    print(f'  {k}: +{v} leads')
print()

sheet_stats = Counter(b['sheet'] for b in all_backup)
sheet_matched = Counter(b['sheet'] for b, _ in matched)
print('Por planilha (matched / total):')
for s_ in sheet_stats:
    print(f'  {s_}: {sheet_matched[s_]}/{sheet_stats[s_]}')

print()
print('Sample unmatched (first 5):')
for u in unmatched[:5]:
    print(f"  [{u['sheet']}] {u.get('nome','?')} cel={u.get('cel','')[:11]} email={u.get('email','')}")
