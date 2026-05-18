"""
Deploy da SEGUNDA sessão Baileys (catálogos) no mesmo VPS, em container
totalmente separado da Central. Não toca em /opt/whatsapp-server nem no
container formula_boi_whatsapp existente.

Container alvo:    formula_boi_whatsapp_catalogs
Imagem:            formula_boi_whatsapp_catalogs_img
Porta host:        3002
Auth volume host:  /opt/whatsapp-catalogs-auth   (criado se não existir)
Diretório código:  /opt/whatsapp-catalogs-server (criado se não existir)

Variáveis de ambiente necessárias para rodar este script:
    VPS_PASSWORD                   senha SSH do root
    NEXT_JS_URL                    ex: https://admin.formuladoboi.com
    WHATSAPP_GROUP_TASK_SECRET     mesmo secret da Central
    R2_ACCOUNT_ID
    R2_BUCKET
    R2_ACCESS_KEY_ID
    R2_SECRET_ACCESS_KEY
    R2_ENDPOINT                    ex: https://<account>.r2.cloudflarestorage.com
    R2_PREFIX                      ex: libmedia/

Uso:
    VPS_PASSWORD='joAoedu104#i' \\
    NEXT_JS_URL='https://admin.formuladoboi.com' \\
    WHATSAPP_GROUP_TASK_SECRET='...' \\
    R2_ACCOUNT_ID='...' R2_BUCKET='...' R2_ACCESS_KEY_ID='...' \\
    R2_SECRET_ACCESS_KEY='...' R2_ENDPOINT='...' R2_PREFIX='libmedia/' \\
    python scripts/deploy-whatsapp-catalogs-server.py
"""
import os
import sys
import time
import datetime
import paramiko

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

HOST = "165.232.142.37"
USER = "root"
REMOTE_DIR = "/opt/whatsapp-catalogs-server"
AUTH_DIR = "/opt/whatsapp-catalogs-auth"
REMOTE_ENV_FILE = f"{REMOTE_DIR}/.env"
CONTAINER = "formula_boi_whatsapp_catalogs"
IMAGE = "formula_boi_whatsapp_catalogs_img"
PORT_HOST = "3002"
PORT_CONT = "3002"

LOCAL_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "whatsapp-catalogs-server"))
LOCAL_FILES = [
    "whatsapp-catalogs-server.js",
    "Dockerfile",
    "package.json",
]

REQUIRED_ENV = [
    "VPS_PASSWORD",
    "NEXT_JS_URL",
    "WHATSAPP_GROUP_TASK_SECRET",
    "R2_ACCOUNT_ID",
    "R2_BUCKET",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_ENDPOINT",
]

OPTIONAL_ENV = {
    "R2_PREFIX": "libmedia/",
    "POLL_GROUPS_EVERY_MS": "300000",
}

missing = [k for k in REQUIRED_ENV if not os.environ.get(k)]
if missing:
    print(f"ERROR: missing env vars: {', '.join(missing)}", file=sys.stderr)
    sys.exit(2)

for f in LOCAL_FILES:
    p = os.path.join(LOCAL_DIR, f)
    if not os.path.isfile(p):
        print(f"ERROR: local file not found: {p}", file=sys.stderr)
        sys.exit(2)

password = os.environ.pop("VPS_PASSWORD")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=password, timeout=30,
               look_for_keys=False, allow_agent=False)
del password


def run(cmd: str, timeout: int = 300) -> tuple[int, str, str]:
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    rc = stdout.channel.recv_exit_status()
    return rc, out, err


def step(msg: str):
    print(f"\n=== {msg} ===")


def must(cmd: str, timeout: int = 300):
    rc, out, err = run(cmd, timeout=timeout)
    if out:
        print(out.rstrip())
    if err:
        print("STDERR:", err.rstrip(), file=sys.stderr)
    if rc != 0:
        print(f"ERROR: command exited rc={rc}: {cmd[:160]}", file=sys.stderr)
        client.close()
        sys.exit(10)


# ────────────────────────────────────────────────────────────────────────────
# Sanidade: garante que o container da Central NÃO vai ser tocado.
# ────────────────────────────────────────────────────────────────────────────
step("Sanidade — Central WhatsApp segue intocada")
must("docker ps --filter name=formula_boi_whatsapp --format '{{.Names}}\\t{{.Status}}\\t{{.Ports}}'")

# ────────────────────────────────────────────────────────────────────────────
# 1. Garante diretórios remotos
# ────────────────────────────────────────────────────────────────────────────
step(f"Criando {REMOTE_DIR} e {AUTH_DIR} se não existirem")
must(f"mkdir -p {REMOTE_DIR} {AUTH_DIR} && ls -ld {REMOTE_DIR} {AUTH_DIR}")

# ────────────────────────────────────────────────────────────────────────────
# 2. Upload dos arquivos
# ────────────────────────────────────────────────────────────────────────────
step("Upload do código via SFTP")
sftp = client.open_sftp()
for f in LOCAL_FILES:
    local_p = os.path.join(LOCAL_DIR, f)
    remote_p = f"{REMOTE_DIR}/{f}"
    # backup do arquivo anterior (se existir)
    try:
        sftp.stat(remote_p)
        ts = datetime.datetime.now(datetime.UTC).strftime("%Y%m%dT%H%M%SZ")
        run(f"cp -p {remote_p} {remote_p}.{ts}.bak")
    except FileNotFoundError:
        pass
    sftp.put(local_p, remote_p)
    local_size = os.path.getsize(local_p)
    remote_size = sftp.stat(remote_p).st_size
    print(f"  {f}: local={local_size}B remote={remote_size}B")
    if local_size != remote_size:
        print(f"ERROR: size mismatch para {f}", file=sys.stderr)
        sftp.close()
        client.close()
        sys.exit(11)
sftp.close()

# ────────────────────────────────────────────────────────────────────────────
# 3. Escreve .env no VPS (chmod 600). Valores ficam SÓ no VPS.
# ────────────────────────────────────────────────────────────────────────────
step(f"Escrevendo {REMOTE_ENV_FILE} (chmod 600)")
env_pairs = {k: os.environ[k] for k in REQUIRED_ENV if k != "VPS_PASSWORD"}
for k, default in OPTIONAL_ENV.items():
    env_pairs[k] = os.environ.get(k, default)
env_pairs["AUTH_DIR"] = "/data/auth"
env_pairs["WHATSAPP_CATALOGS_SERVER_PORT"] = PORT_CONT

# Constrói via STDIN para não escapar caracteres no comando shell.
env_blob = "\n".join(f"{k}={v}" for k, v in env_pairs.items()) + "\n"
stdin, stdout, stderr = client.exec_command(
    f"umask 077 && cat > {REMOTE_ENV_FILE} && chmod 600 {REMOTE_ENV_FILE} && wc -l {REMOTE_ENV_FILE}",
    timeout=30,
)
stdin.write(env_blob)
stdin.channel.shutdown_write()
out = stdout.read().decode("utf-8", errors="replace")
err = stderr.read().decode("utf-8", errors="replace")
rc = stdout.channel.recv_exit_status()
print(out.rstrip())
if err:
    print("STDERR:", err.rstrip(), file=sys.stderr)
if rc != 0:
    print("ERROR ao gravar .env", file=sys.stderr)
    client.close()
    sys.exit(13)
print(f"chaves: {', '.join(env_pairs.keys())}")

# ────────────────────────────────────────────────────────────────────────────
# 4. Tag rollback (se já existir imagem)
# ────────────────────────────────────────────────────────────────────────────
step("Tag imagem atual como :rollback (se existir)")
run(f"docker tag {IMAGE}:latest {IMAGE}:rollback")  # ignora erro se imagem inexistente

# ────────────────────────────────────────────────────────────────────────────
# 5. Build da nova imagem
# ────────────────────────────────────────────────────────────────────────────
step("docker build da imagem catalogs (~30-90s)")
must(f"cd {REMOTE_DIR} && docker build -t {IMAGE}:latest .", timeout=900)

# ────────────────────────────────────────────────────────────────────────────
# 6. Stop + remove container antigo (se existir) e roda o novo
# ────────────────────────────────────────────────────────────────────────────
step("Stop+rm container antigo (se houver)")
run(f"docker stop {CONTAINER}")
run(f"docker rm {CONTAINER}")

step("docker run novo container catalogs (porta 3002)")
docker_run = (
    f"docker run -d --name {CONTAINER} --restart unless-stopped "
    f"-p {PORT_HOST}:{PORT_CONT} "
    f"-v {AUTH_DIR}:/data/auth "
    f"--env-file {REMOTE_ENV_FILE} "
    f"{IMAGE}:latest"
)
must(docker_run)

# ────────────────────────────────────────────────────────────────────────────
# 7. Espera log de saúde
# ────────────────────────────────────────────────────────────────────────────
step("Aguardando '[WA-Catalogs] HTTP na porta 3002' (até 90s)")
deadline = time.time() + 90
ok = False
while time.time() < deadline:
    rc, out, _ = run(
        f"docker logs {CONTAINER} --tail 200 2>&1 "
        f"| grep -E '\\[WA-Catalogs\\] (HTTP na porta|Conectado|QR Code gerado)' | tail -5"
    )
    if "HTTP na porta" in out:
        print(out.strip())
        ok = True
        break
    if out:
        print(out.strip())
    time.sleep(3)
if not ok:
    print("\nWARN: ainda não vi 'HTTP na porta'. Últimos logs:")
    rc, out, _ = run(f"docker logs {CONTAINER} --tail 60 2>&1")
    print(out)

# ────────────────────────────────────────────────────────────────────────────
# 8. Sanidade final — Central WhatsApp continua viva
# ────────────────────────────────────────────────────────────────────────────
step("Sanidade final — Central WhatsApp segue rodando")
must("docker ps --filter name=formula_boi_whatsapp --format '{{.Names}}\\t{{.Status}}\\t{{.Ports}}'")

step("Done")
print(f"Catalogs container:  {CONTAINER}")
print(f"Catalogs auth dir:   {AUTH_DIR}")
print(f"Rollback:")
print(f"  docker stop {CONTAINER} && docker rm {CONTAINER} && \\")
print(f"  docker run -d --name {CONTAINER} --restart unless-stopped \\")
print(f"  -p {PORT_HOST}:{PORT_CONT} -v {AUTH_DIR}:/data/auth \\")
print(f"  --env-file {REMOTE_ENV_FILE} {IMAGE}:rollback")

client.close()
