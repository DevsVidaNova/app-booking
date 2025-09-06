# Variáveis de Ambiente para VPS

## Configurações Obrigatórias

### 1. Banco de Dados PostgreSQL
```bash
POSTGRES_DB=app_booking
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/app_booking
```

### 2. JWT
```bash
JWT_SECRET=your-jwt-secret-key
```

### 3. Domínios
```bash
# Domínio principal (frontend)
DOMAIN=espacovidanova.com.br
# Subdomínio da API
API_DOMAIN=api.espacovidanova.com.br
# URL da API para o frontend
NEXT_PUBLIC_API_URL=https://api.espacovidanova.com.br
```

## Configurações Opcionais

### Email (se usar funcionalidade de email)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### SSL/HTTPS (configuração automática com Let's Encrypt)
```bash
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

## Configuração de DNS

Configure os seguintes registros DNS no seu provedor:

```
A     espacovidanova.com.br     → IP_DO_SEU_VPS
A     www.espacovidanova.com.br → IP_DO_SEU_VPS
A     api.espacovidanova.com.br → IP_DO_SEU_VPS
```

## Como Configurar no VPS

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione as variáveis com seus valores
3. Configure os registros DNS
4. Execute `docker-compose up -d` para iniciar os serviços
5. Execute as migrações do Prisma: `docker-compose exec api npx prisma migrate deploy`
6. Configure SSL com Let's Encrypt (veja VPS_DEPLOY.md)
