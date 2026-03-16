FROM node:20-slim

# Dependências nativas que o Baileys precisa
RUN apt-get update && apt-get install -y \
    openssl \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia package.json e instala dependências
COPY package.json ./
RUN npm install --omit=dev

# Copia o código do servidor
COPY whatsapp-server.js ./

EXPOSE 3001

CMD ["node", "whatsapp-server.js"]
