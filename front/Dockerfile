# Etapa base com dependências essenciais
FROM node:20-alpine AS base

# Instalar dependências nativas
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Etapa de dependências
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Etapa de build da aplicação
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Etapa final de produção
FROM base AS runner
WORKDIR /app

# Variáveis de ambiente
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Criar usuário seguro
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copiar arquivos da build standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Definir usuário não-root
USER nextjs

# Expor porta do frontend
EXPOSE 3000

# Health check opcional
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Iniciar aplicação Next.js
CMD ["node", "server.js"]
