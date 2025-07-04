# 🚀 Guia de Deploy - CBVN

Este guia explica como configurar e usar os workflows de CI/CD do projeto CBVN.

## 📋 Estrutura do Projeto

O projeto possui uma arquitetura monorepo:
- **Frontend**: Next.js (React) em `/front`
- **Backend**: Node.js/Express em `/back`
- **Database**: Supabase

## 🔧 Configuração Inicial

### 1. Variáveis de Ambiente no GitHub

Configure as seguintes secrets no GitHub (Settings → Secrets and variables → Actions):

#### Desenvolvimento
```
DEV_SUPABASE_URL=sua_url_supabase_dev
DEV_SUPABASE_ANON_KEY=sua_chave_anonima_dev
DEV_SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_dev
DEV_JWT_SECRET=seu_jwt_secret_dev
DEV_NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Produção
```
PROD_SUPABASE_URL=sua_url_supabase_prod
PROD_SUPABASE_ANON_KEY=sua_chave_anonima_prod
PROD_SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_prod
PROD_JWT_SECRET=seu_jwt_secret_prod
PROD_NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

#### Deploy VPS (se usando)
```
VPS_HOST=ip_do_seu_servidor
VPS_USER=usuario_ssh
VPS_SSH_KEY=chave_privada_ssh
```

#### Testes
```
TEST_SUPABASE_URL=sua_url_supabase_test
TEST_SUPABASE_ANON_KEY=sua_chave_anonima_test
```

### 2. Arquivo .env.prod

Crie um arquivo `.env.prod` na raiz do projeto no servidor:

```bash
# Copie do .env.example e configure com valores de produção
cp .env.example .env.prod
```

## 🔄 Workflows Disponíveis

### 1. CI/CD Pipeline (`ci-cd.yaml`)

**Triggers:**
- Push para `main`, `master`, `develop`
- Pull requests para `main`, `master`

**Jobs:**
- **Security**: Análise de segurança com Horusec
- **Validate Frontend**: Lint e type-check do frontend
- **Validate Backend**: Testes do backend
- **Build Frontend**: Build do Next.js
- **Build Backend**: Build do Express
- **Deploy Dev**: Deploy automático para desenvolvimento (branch `develop`)
- **Deploy Prod**: Deploy automático para produção (branch `main`)

### 2. Auto Release (`create-release.yaml`)

**Triggers:**
- Agendado: Segunda a quinta, 10:15 BRT
- Manual: workflow_dispatch

**Funcionalidade:**
- Cria releases automáticas com versionamento incremental
- Gera notas de release automaticamente

### 3. Deploy VPS (`deploy.yaml`)

**Triggers:**
- Manual com opções de ambiente e branch
- Push para `develop`

**Funcionalidade:**
- Deploy via SSH para VPS
- Suporte a Docker Compose
- Health checks automáticos

## 🐳 Docker

### Desenvolvimento Local

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Produção

```bash
# Usar arquivo de produção
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps
```

## 🔍 Health Checks

- **Backend**: `http://localhost:3001/health`
- **Frontend**: `http://localhost:3000`
- **Nginx**: `http://localhost` (se configurado)

## 📝 Scripts Úteis

### Frontend (`/front`)
```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm run start    # Iniciar produção
npm run lint     # Linter
```

### Backend (`/back`)
```bash
npm run dev              # Desenvolvimento
npm run build            # Build para produção
npm run start            # Iniciar produção
npm run test             # Testes
npm run test:coverage    # Testes com cobertura
```

## 🚨 Troubleshooting

### Erro de Build Frontend
- Verifique se `output: 'standalone'` está no `next.config.mjs`
- Confirme que as variáveis `NEXT_PUBLIC_*` estão configuradas

### Erro de Health Check
- Verifique se o endpoint `/health` está respondendo
- Confirme que as portas estão corretas (3001 para API, 3000 para frontend)

### Erro de Deploy
- Verifique se o arquivo `.env.prod` existe no servidor
- Confirme que as secrets do GitHub estão configuradas
- Verifique se o SSH está funcionando

## 📚 Próximos Passos

1. Configure as secrets no GitHub
2. Teste o workflow em uma branch de desenvolvimento
3. Configure o servidor de produção
4. Ajuste as configurações conforme necessário

## 🔗 Links Úteis

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)