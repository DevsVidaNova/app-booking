# 🚀 Deploy do App Booking

Guia rápido para fazer o deploy do projeto na sua VPS usando Docker e GitHub Actions.

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+ 
- Acesso SSH à VPS
- Conta no Docker Hub
- Repositório no GitHub
- Projeto Supabase configurado

## ⚡ Setup Rápido

### 1. Configurar VPS (Automático)

```bash
# Na sua VPS, execute:
wget https://raw.githubusercontent.com/SEU_USUARIO/app-booking/main/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

Ou copie o arquivo `setup-vps.sh` para sua VPS e execute.

### 2. Configurar Variáveis de Ambiente

```bash
# Na VPS
cd /opt/app-booking
cp .env.prod.template .env.prod
nano .env.prod
```

Preencha com seus dados reais:
```env
DOCKER_USERNAME=seu_docker_username
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=um_secret_muito_seguro_aqui
NEXT_PUBLIC_API_URL=http://SEU_IP_OU_DOMINIO/api
```

### 3. Configurar GitHub Secrets

Vá para: **Repositório → Settings → Secrets and variables → Actions**

Adicione os secrets:
- `DOCKER_USERNAME`: Seu username do Docker Hub
- `DOCKER_PASSWORD`: Sua senha do Docker Hub  
- `HOST`: IP da sua VPS
- `USERNAME`: Usuário da VPS (ex: ubuntu)
- `SSH_KEY`: Chave privada SSH (gerada pelo script)

### 4. Fazer Push e Deploy

```bash
# No seu projeto local
git add .
git commit -m "Configure deploy"
git push origin main
```

O GitHub Actions irá automaticamente:
1. Executar testes
2. Fazer build das imagens Docker
3. Fazer push para Docker Hub
4. Fazer deploy na VPS

## 🔧 Comandos Úteis na VPS

```bash
# Ver status dos containers
cd /opt/app-booking
./status.sh

# Ver logs
./logs.sh all          # Todos os logs
./logs.sh api          # Apenas API
./logs.sh frontend     # Apenas Frontend
./logs.sh nginx        # Apenas Nginx

# Deploy manual
./deploy.sh

# Parar serviços
docker-compose down

# Reiniciar serviços
docker-compose restart

# Atualizar e reiniciar
docker-compose pull && docker-compose up -d
```

## 🌐 Configurar Domínio (Opcional)

### 1. Apontar domínio para VPS
Configure um registro A no seu provedor de domínio:
```
Tipo: A
Nome: @
Valor: IP_DA_SUA_VPS
```

### 2. Configurar SSL
```bash
# Na VPS
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 3. Atualizar nginx.conf
```bash
# Editar nginx.conf e trocar server_name _ por:
server_name seudominio.com www.seudominio.com;
```

### 4. Atualizar .env.prod
```bash
# Trocar NEXT_PUBLIC_API_URL para:
NEXT_PUBLIC_API_URL=https://seudominio.com/api
```

## 🔍 Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs nome_do_container

# Verificar se portas estão em uso
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
```

### Erro de permissão
```bash
# Corrigir permissões
sudo chown -R $USER:$USER /opt/app-booking
```

### Erro de conexão com Supabase
- Verifique as URLs e chaves no `.env.prod`
- Confirme se o Supabase permite conexões da VPS
- Teste as credenciais manualmente

### Deploy falha no GitHub Actions
- Verifique se todos os secrets estão configurados
- Confirme se a chave SSH está correta
- Verifique se o usuário tem permissões Docker

## 📁 Estrutura de Arquivos

```
/opt/app-booking/
├── docker-compose.yml     # Configuração dos containers
├── nginx.conf            # Configuração do proxy reverso
├── .env.prod            # Variáveis de ambiente
├── deploy.sh            # Script de deploy manual
├── status.sh            # Script para ver status
├── logs.sh              # Script para ver logs
└── ssl/                 # Certificados SSL (se configurado)
```

## 🔄 Fluxo de Deploy

1. **Push para main** → Trigger GitHub Actions
2. **Testes** → Backend e Frontend
3. **Build** → Imagens Docker
4. **Push** → Docker Hub
5. **Deploy** → VPS via SSH
6. **Restart** → Containers na VPS

## 📚 Arquivos de Referência

- [`VPS_SETUP_GUIDE.md`](./VPS_SETUP_GUIDE.md) - Guia detalhado de configuração
- [`setup-vps.sh`](./setup-vps.sh) - Script de configuração automática
- [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) - Workflow do GitHub Actions

## 🆘 Suporte

Se encontrar problemas:
1. Consulte o guia detalhado em `VPS_SETUP_GUIDE.md`
2. Verifique os logs com `./logs.sh all`
3. Confirme se todos os secrets estão configurados
4. Teste o deploy manual com `./deploy.sh`

---

**✨ Pronto! Seu projeto está configurado para deploy automático!**