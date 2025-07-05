# ==========================
# STAGE 1: Build
# ==========================
FROM node:20-alpine AS build

WORKDIR /app

# Instala curl (para usar no healthcheck futuramente)
RUN apk add --no-cache curl

# Copiar pacotes e instalar TUDO (incluindo devDependencies)
COPY package*.json ./
RUN npm ci

# Copiar todo o código e compilar
COPY . .
RUN npm run build

# ==========================
# STAGE 2: Produção
# ==========================
FROM node:20-alpine AS production

WORKDIR /app

# Instala curl para o healthcheck
RUN apk add --no-cache curl

# Copia apenas os arquivos necessários do build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/.env.prod .env.prod

# Cria usuário seguro
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["npm", "start"]
