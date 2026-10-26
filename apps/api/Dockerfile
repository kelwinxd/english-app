# Dockerfile da API (apps/api). Build determinístico para a Railway, sem
# depender do auto-detect (Railpack/Nixpacks). Contexto de build = apps/api
# (Service → Settings → Root Directory = apps/api).
#
# apps/api/package.json é autocontido (não depende de outros pacotes do
# workspace), então instala/builda isolado nesta pasta.

FROM node:20-slim

WORKDIR /app

# openssl é exigido pelos engines do Prisma.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# 1) Dependências (inclui devDeps: prisma CLI + tsc são usados no build).
COPY package.json ./
RUN npm install --include=dev

# 2) Código + build (prisma generate && tsc).
COPY . .
RUN npm run build

# A Railway injeta PORT; a API faz bind em 0.0.0.0:$PORT.
ENV NODE_ENV=production
EXPOSE 3333

CMD ["node", "dist/index.js"]
