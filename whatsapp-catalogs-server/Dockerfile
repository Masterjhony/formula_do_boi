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

COPY whatsapp-catalogs-server.js ./

EXPOSE 3002

CMD ["node", "whatsapp-catalogs-server.js"]
