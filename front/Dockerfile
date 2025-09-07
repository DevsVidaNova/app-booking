# ==========================
# STAGE 1: Build
# ==========================
FROM node:20-alpine AS build

WORKDIR /app

# Instala curl para healthcheck
RUN apk add --no-cache curl

# Copia os arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o restante do código
COPY . .

# Build da aplicação Next.js
RUN npm run build

# ==========================
# STAGE 2: Produção
# ==========================
FROM node:20-alpine AS production

WORKDIR /app

# Instala curl para healthcheck
RUN apk add --no-cache curl

# Cria usuário seguro
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copia apenas os arquivos necessários do build
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./
COPY --from=build /app/tsconfig.json ./

# Muda para usuário não-root
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expõe porta 3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Comando para produção
CMD ["npm", "start"]
