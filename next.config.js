/** @type {import('next').NextConfig} */
const nextConfig = {
  // AWS SDK v3 (usado em src/lib/r2.ts pra Cloudflare R2) precisa ficar fora
  // do bundle do Turbopack — uma das deps internas (@nodable/entities) é
  // ESM-only e o xml-builder tenta require() em CommonJS, quebrando em prod
  // serverless. Marcando como external, o Node carrega via require do
  // node_modules em runtime sem reempacotar.
  serverExternalPackages: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
};

module.exports = nextConfig;
