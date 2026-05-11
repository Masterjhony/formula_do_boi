"""
Deploy whatsapp-server.js to the VPS and recreate the container.

The VPS uses plain `docker run` (no compose). This script:
  1. Backs up the remote whatsapp-server.js (timestamped).
  2. Uploads the new whatsapp-server.js via SFTP.
  3. Verifies the opt-out fix is present in the uploaded file.
  4. Saves runtime env vars that are set on the container but absent from .env
     into a temp file on the VPS (chmod 600) so we can preserve them.
  5. Tags current image as :rollback (so we can revert with one command).
  6. Builds a new image from the existing Dockerfile.
  7. Stops + removes the old container; runs a new one with the same mounts,
     ports, restart policy and env files.
  8. Waits until "[WA] Conectado" appears in logs (up to 90s).
  9. Removes the temp env file.

The SSH password is read from VPS_PASSWORD env var only. It is wiped from
memory after connecting. Values of env vars are NEVER printed locally —
they live in /tmp on the VPS for the duration of the deploy and are deleted.

Usage (bash):
    VPS_PASSWORD='<senha>' python scripts/deploy-whatsapp-server.py
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
REMOTE_DIR = "/opt/whatsapp-server"
REMOTE_FILE = f"{REMOTE_DIR}/whatsapp-server.js"
REMOTE_ENV_FILE = f"{REMOTE_DIR}/.env"
EXTRA_ENV = "/tmp/whatsapp-deploy-extra.env"
LOCAL_FILE = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "whatsapp-server", "whatsapp-server.js"))
CONTAINER = "formula_boi_whatsapp"
IMAGE = "formula_boi_whatsapp_img"
PORT_HOST = "3001"
PORT_CONT = "3001"
AUTH_BIND = "/opt/whatsapp-auth:/data/auth"

password = os.environ.get("VPS_PASSWORD")
if not password:
    print("ERROR: VPS_PASSWORD env var not set.", file=sys.stderr); sys.exit(2)
if not os.path.isfile(LOCAL_FILE):
    print(f"ERROR: local file not found: {LOCAL_FILE}", file=sys.stderr); sys.exit(2)

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=password, timeout=30,
               look_for_keys=False, allow_agent=False)
del password
os.environ.pop("VPS_PASSWORD", None)


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
    if out: print(out.rstrip())
    if err: print("STDERR:", err.rstrip(), file=sys.stderr)
    if rc != 0:
        print(f"ERROR: command exited rc={rc}: {cmd[:120]}", file=sys.stderr)
        client.close()
        sys.exit(10)


# 1. Backup
ts = datetime.datetime.now(datetime.UTC).strftime("%Y%m%dT%H%M%SZ")
backup_path = f"{REMOTE_FILE}.{ts}.bak"
step(f"Backup remote file -> {backup_path}")
must(f"cp -p {REMOTE_FILE} {backup_path} && ls -lh {REMOTE_FILE} {backup_path}")

# 2. Upload (only if not already done by a previous run — but always overwrite to be safe)
step("Uploading whatsapp-server.js via SFTP")
sftp = client.open_sftp()
sftp.put(LOCAL_FILE, REMOTE_FILE)
local_size = os.path.getsize(LOCAL_FILE)
remote_stat = sftp.stat(REMOTE_FILE)
sftp.close()
print(f"local={local_size}B remote={remote_stat.st_size}B")
if local_size != remote_stat.st_size:
    print("ERROR: size mismatch after upload", file=sys.stderr); client.close(); sys.exit(11)

# 3. Verify fix
step("Verify opt-out fix string is in the uploaded file")
rc, out, _ = run(f"grep -c 'em opt-out' {REMOTE_FILE}")
print("matches:", out.strip())
if out.strip() == "0":
    print("ERROR: fix not present", file=sys.stderr); client.close(); sys.exit(12)

# 4. Build the new env-extra file on the VPS (vars set in container but absent in .env)
step("Compute env vars to preserve (set in container, absent in .env)")
must(
    f"docker inspect {CONTAINER} --format '{{{{range .Config.Env}}}}{{{{println .}}}}{{{{end}}}}' "
    f"| grep -vE '^(PATH|NODE_VERSION|YARN_VERSION)=' "
    f"| awk -F= 'NR==FNR{{e[$1]=1; next}} !($1 in e)' {REMOTE_ENV_FILE} - "
    f"> {EXTRA_ENV} && chmod 600 {EXTRA_ENV} && wc -l {EXTRA_ENV}"
)
rc, out, _ = run(f"awk -F= '{{print $1}}' {EXTRA_ENV}")
print("preserved keys:", " ".join(out.split()))

# 5. Tag current image as rollback
step("Tag current image as :rollback for easy revert")
must(f"docker tag {IMAGE}:latest {IMAGE}:rollback || true")

# 6. Build new image
step("docker build (this can take ~30-60s)")
must(f"cd {REMOTE_DIR} && docker build -t {IMAGE}:latest .", timeout=600)

# 7. Stop + remove old container, run new one
step("Stop + remove old container")
must(f"docker stop {CONTAINER} && docker rm {CONTAINER}")

step("docker run new container")
docker_run = (
    f"docker run -d --name {CONTAINER} --restart unless-stopped "
    f"-p {PORT_HOST}:{PORT_CONT} "
    f"-v {AUTH_BIND} "
    f"--env-file {REMOTE_ENV_FILE} "
    f"--env-file {EXTRA_ENV} "
    f"{IMAGE}:latest"
)
must(docker_run)

# 8. Wait for "Conectado"
step("Waiting for [WA] Conectado in logs (up to 90s)")
deadline = time.time() + 90
seen = False
while time.time() < deadline:
    rc, out, _ = run(
        f"docker logs {CONTAINER} --tail 200 2>&1 "
        f"| grep -E '\\[WA\\] (Conectado|Conexao fechada|QR Code gerado)' | tail -5"
    )
    if "Conectado" in out:
        print(out.strip()); seen = True; break
    if out:
        print(out.strip())
    time.sleep(3)
if not seen:
    print("\nWARN: did not see Conectado yet. Tail of last logs:")
    rc, out, _ = run(f"docker logs {CONTAINER} --tail 40 2>&1")
    print(out)

# 9. Cleanup extra env tempfile
step("Remove temp env file")
must(f"rm -f {EXTRA_ENV} && echo removed")

step("Final container status")
rc, out, _ = run(f"docker ps --filter name={CONTAINER} --format 'table {{{{.Names}}}}\\t{{{{.Status}}}}\\t{{{{.Ports}}}}'")
print(out)

step("Done")
print(f"Backup: {backup_path}")
print(f"Rollback: docker stop {CONTAINER} && docker rm {CONTAINER} && \\")
print(f"  docker run -d --name {CONTAINER} --restart unless-stopped -p {PORT_HOST}:{PORT_CONT} \\")
print(f"  -v {AUTH_BIND} --env-file {REMOTE_ENV_FILE} {IMAGE}:rollback")

client.close()
