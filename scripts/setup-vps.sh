#!/bin/bash
# Setup script para o WhatsApp Server no Droplet DigitalOcean
# Execute como root: bash setup-vps.sh

set -e

echo "=== [1/6] Atualizando sistema ==="
apt-get update -y && apt-get upgrade -y

echo "=== [2/6] Instalando Docker ==="
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "=== [3/6] Criando estrutura de pastas ==="
mkdir -p /opt/whatsapp-server

echo "=== [4/6] Criando arquivos do servidor ==="

cat > /opt/whatsapp-server/package.json << 'PKGJSON'
{
  "name": "formula-boi-whatsapp-server",
  "version": "1.0.0",
  "description": "Servidor dedicado para envio de mensagens WhatsApp via Baileys",
  "main": "whatsapp-server.js",
  "scripts": {
    "start": "node whatsapp-server.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.99.1",
    "@whiskeysockets/baileys": "^7.0.0-rc.9",
    "pino": "^10.3.1",
    "qrcode": "^1.5.4"
  },
  "engines": {
    "node": ">=20"
  }
}
PKGJSON

cat > /opt/whatsapp-server/Dockerfile << 'DOCKERFILE'
FROM node:20-slim

RUN apt-get update && apt-get install -y \
    openssl \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY whatsapp-server.js ./

EXPOSE 3001

CMD ["node", "whatsapp-server.js"]
DOCKERFILE

echo "=== [5/6] Criando .env do servidor ==="
# EDITE ESTAS VARIÁVEIS ANTES DE RODAR O SCRIPT
cat > /opt/whatsapp-server/.env << 'ENVFILE'
NEXT_PUBLIC_SUPABASE_URL=https://hghtikjaqixglmpujbwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=COLE_AQUI_A_SERVICE_ROLE_KEY
WHATSAPP_SERVER_PORT=3001
ENVFILE

echo ""
echo "⚠️  ATENÇÃO: Edite o arquivo /opt/whatsapp-server/.env e coloque a SUPABASE_SERVICE_ROLE_KEY correta!"
echo "    nano /opt/whatsapp-server/.env"
echo ""

echo "=== [6/6] Liberando porta 3001 no firewall ==="
ufw allow 3001/tcp || true

echo ""
echo "✅ Setup base concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Cole o whatsapp-server.js em /opt/whatsapp-server/"
echo "  2. Edite o .env com a SERVICE_ROLE_KEY"
echo "  3. cd /opt/whatsapp-server && docker build -t whatsapp-server ."
echo "  4. docker run -d --name formula_boi_whatsapp --restart unless-stopped --env-file .env -p 3001:3001 whatsapp-server"
echo "  5. docker logs -f formula_boi_whatsapp  (para ver o QR code)"
