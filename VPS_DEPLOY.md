# Deploy no VPS

## Pré-requisitos

1. VPS com Ubuntu/Debian
2. Docker e Docker Compose instalados
3. Domínio configurado (opcional)

## Passos para Deploy

### 1. Preparar o VPS

```bash
# Atualizar o sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
```

### 2. Clonar o Repositório

```bash
# Clonar o projeto
git clone https://github.com/seu-usuario/app-booking.git
cd app-booking

# Copiar arquivo de exemplo
cp env.example .env
```

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas configurações:

```bash
# Configurações do banco
POSTGRES_DB=app_booking
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/app_booking

# JWT
JWT_SECRET=your-jwt-secret-key

# Domínios
DOMAIN=espacovidanova.com.br
API_DOMAIN=api.espacovidanova.com.br
NEXT_PUBLIC_API_URL=https://api.espacovidanova.com.br
```

### 4. Configurar DNS

Configure os seguintes registros DNS no seu provedor:

```
A     espacovidanova.com.br     → IP_DO_SEU_VPS
A     www.espacovidanova.com.br → IP_DO_SEU_VPS
A     api.espacovidanova.com.br → IP_DO_SEU_VPS
```

### 5. Iniciar os Serviços

```bash
# Construir e iniciar os containers
docker-compose up -d --build

# Verificar status
docker-compose ps
```

### 6. Executar Migrações

```bash
# Executar migrações do Prisma
docker-compose exec api npx prisma migrate deploy

# Gerar cliente Prisma
docker-compose exec api npx prisma generate
```

### 7. Configurar SSL

```bash
# Configurar SSL com Let's Encrypt
sudo ./setup-ssl.sh
```

### 8. Verificar Deploy

```bash
# Verificar logs
docker-compose logs -f

# Testar API
curl https://api.espacovidanova.com.br/health

# Testar Frontend
curl https://espacovidanova.com.br
```

## Configuração Automática

O projeto já está configurado com:
- Nginx configurado para os domínios corretos
- SSL automático com Let's Encrypt
- Redirecionamento HTTP → HTTPS
- CORS configurado para a API

## Estrutura do Projeto

O projeto está configurado com:
- **Backend**: Express.js com TypeScript + Prisma
- **Frontend**: Next.js com TypeScript
- **Banco**: PostgreSQL
- **Proxy**: Nginx
- **Containerização**: Docker com multi-stage builds

## Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Reiniciar um serviço específico
docker-compose restart api

# Ver logs de um serviço
docker-compose logs -f api

# Executar comando no container
docker-compose exec api bash

# Backup do banco
docker-compose exec postgres pg_dump -U postgres app_booking > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres app_booking < backup.sql
```

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique se o PostgreSQL está rodando: `docker-compose ps`
   - Verifique logs: `docker-compose logs postgres`

2. **Erro de build**
   - Limpe cache: `docker-compose build --no-cache`
   - Verifique se todas as dependências estão corretas

3. **Erro de permissões**
   - Verifique se o usuário está no grupo docker
   - Execute: `sudo usermod -aG docker $USER` e faça logout/login

### Monitoramento

```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Logs em tempo real
docker-compose logs -f

# Health checks
curl http://localhost:3001/health
curl http://localhost:3000
```
