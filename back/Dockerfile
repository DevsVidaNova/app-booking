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

# Cria usuário seguro
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Railway usa a variável PORT
EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["npm", "start"]
