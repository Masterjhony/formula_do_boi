"""
Verificação rápida do VPS antes/depois de mexer com containers WhatsApp.
Confere:
  - Container da Central (formula_boi_whatsapp) — DEVE estar UP
  - Container de Catálogos (formula_boi_whatsapp_catalogs) — pode não existir ainda
  - Porta 3001 (Central) e 3002 (Catálogos) ocupadas/livres
  - Diretórios /opt/whatsapp-server, /opt/whatsapp-auth e os de Catálogos
  - Disk space e RAM
  - Logs recentes da Central (últimas 20 linhas)

Não modifica nada. Só lê.

Uso:
    VPS_PASSWORD='joAoedu104#i' python scripts/check-vps-status.py
"""
import os, sys, paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

password = os.environ.pop("VPS_PASSWORD", None)
if not password:
    print("ERROR: VPS_PASSWORD não setada", file=sys.stderr)
    sys.exit(2)

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect("165.232.142.37", username="root", password=password,
          timeout=30, look_for_keys=False, allow_agent=False)
del password


def run(cmd, timeout=60):
    _, so, se = c.exec_command(cmd, timeout=timeout)
    out = so.read().decode("utf-8", errors="replace")
    err = se.read().decode("utf-8", errors="replace")
    rc = so.channel.recv_exit_status()
    return rc, out, err


def section(title):
    print(f"\n===== {title} =====")


section("Uptime / load")
_, out, _ = run("uptime")
print(out.rstrip())

section("Disk space (/)")
_, out, _ = run("df -h / /opt 2>/dev/null | head -5")
print(out.rstrip())

section("RAM")
_, out, _ = run("free -h | head -3")
print(out.rstrip())

section("Containers Docker (todos)")
_, out, _ = run("docker ps -a --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}' 2>&1")
print(out.rstrip())

section("Portas em uso (3001, 3002)")
_, out, _ = run("ss -tlnp 2>/dev/null | grep -E ':300[12]' || echo '(nenhuma)'")
print(out.rstrip())

section("Diretórios em /opt")
_, out, _ = run("ls -ld /opt/whatsapp-server /opt/whatsapp-auth /opt/whatsapp-catalogs-server /opt/whatsapp-catalogs-auth 2>&1")
print(out.rstrip())

section("Tamanho de /opt/whatsapp-auth (sessão Central)")
_, out, _ = run("du -sh /opt/whatsapp-auth 2>/dev/null | head -1")
print(out.rstrip() or "(vazio ou inexistente)")

section("Status /status da Central (porta 3001)")
_, out, _ = run("curl -sS -m 5 http://localhost:3001/status 2>&1 | head -c 500")
print(out.rstrip() or "(sem resposta)")

section("Logs recentes da Central — últimas 20 linhas")
_, out, _ = run("docker logs formula_boi_whatsapp --tail 20 2>&1 | tail -25")
print(out.rstrip())

section("Status do container Catálogos (se existe)")
_, out, _ = run("docker ps -a --filter name=formula_boi_whatsapp_catalogs --format '{{.Names}}\\t{{.Status}}\\t{{.Ports}}' 2>&1")
out = out.strip()
print(out if out else "(container ainda não existe — esperado se o deploy ainda não rodou)")

section("Versão Docker")
_, out, _ = run("docker --version")
print(out.rstrip())

c.close()
print("\n=== Fim ===")
