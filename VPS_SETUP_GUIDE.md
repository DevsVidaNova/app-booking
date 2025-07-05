# Guia de Configuração da VPS para Deploy

Este guia irá te ajudar a configurar sua VPS para fazer o deploy automático do projeto app-booking usando Docker e GitHub Actions.

## 1. Preparação da VPS

### 1.1 Conectar na VPS
```bash
ssh root@SEU_IP_DA_VPS
# ou
ssh usuario@SEU_IP_DA_VPS
```

### 1.2 Atualizar o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Instalar dependências básicas
```bash
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

## 2. Instalação do Docker

### 2.1 Instalar Docker
```bash
# Adicionar chave GPG oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório do Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Atualizar e instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

### 2.2 Instalar Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2.3 Configurar usuário para usar Docker
```bash
sudo usermod -aG docker $USER
# Fazer logout e login novamente ou executar:
newgrp docker
```

### 2.4 Verificar instalação
```bash
docker --version
docker-compose --version
```

## 3. Configuração do Projeto na VPS

### 3.1 Criar diretório do projeto
```bash
sudo mkdir -p /opt/app-booking
sudo chown $USER:$USER /opt/app-booking
cd /opt/app-booking
```

### 3.2 Criar arquivo docker-compose.yml para produção
```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Backend API
  api:
    image: SEU_DOCKER_USERNAME/app-booking-backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
    env_file:
      - .env.prod
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Frontend Next.js
  frontend:
    image: SEU_DOCKER_USERNAME/app-booking-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    env_file:
      - .env.prod
    restart: unless-stopped
    depends_on:
      api:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - api
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M

networks:
  default:
    driver: bridge
EOF
```

### 3.3 Criar arquivo de configuração do Nginx
```bash
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream api {
        server api:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;

    server {
        listen 80;
        server_name SEU_DOMINIO.com www.SEU_DOMINIO.com;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://api/health;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend routes
        location / {
            limit_req zone=general burst=50 nodelay;
            proxy_pass http://frontend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://frontend;
        }
    }
}
EOF
```

### 3.4 Criar arquivo de variáveis de ambiente
```bash
cat > .env.prod << 'EOF'
# Supabase Configuration
SUPABASE_URL=sua_supabase_url
SUPABASE_ANON_KEY=sua_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key

# JWT Secret
JWT_SECRET=seu_jwt_secret_muito_seguro

# API URL for frontend
NEXT_PUBLIC_API_URL=http://SEU_DOMINIO.com/api
EOF
```

## 4. Configuração de SSL (Opcional mas Recomendado)

### 4.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 4.2 Obter certificado SSL
```bash
sudo certbot --nginx -d SEU_DOMINIO.com -d www.SEU_DOMINIO.com
```

## 5. Configuração do GitHub Actions

### 5.1 Gerar chave SSH para deploy
```bash
# Na sua VPS, gerar par de chaves
ssh-keygen -t rsa -b 4096 -C "deploy@app-booking" -f ~/.ssh/deploy_key

# Adicionar chave pública ao authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Mostrar chave privada (copie para o GitHub Secrets)
cat ~/.ssh/deploy_key
```

### 5.2 Configurar Secrets no GitHub
Vá para seu repositório no GitHub → Settings → Secrets and variables → Actions

Adicione os seguintes secrets:
- `DOCKER_USERNAME`: Seu username do Docker Hub
- `DOCKER_PASSWORD`: Sua senha do Docker Hub
- `HOST`: IP da sua VPS
- `USERNAME`: Usuário da VPS (ex: ubuntu, root)
- `SSH_KEY`: Conteúdo da chave privada gerada acima

## 6. Atualizar o Workflow do GitHub Actions

O arquivo `.github/workflows/deploy.yml` precisa ser atualizado para usar o caminho correto:

```yaml
- name: Deploy to production
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.USERNAME }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /opt/app-booking
      docker-compose pull
      docker-compose up -d
      docker system prune -f
```

## 7. Scripts Úteis

### 7.1 Script de deploy manual
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "Iniciando deploy..."
cd /opt/app-booking
docker-compose pull
docker-compose up -d
docker system prune -f
echo "Deploy concluído!"
EOF

chmod +x deploy.sh
```

### 7.2 Script de monitoramento
```bash
cat > status.sh << 'EOF'
#!/bin/bash
echo "=== Status dos Containers ==="
docker-compose ps
echo ""
echo "=== Logs recentes ==="
docker-compose logs --tail=20
EOF

chmod +x status.sh
```

## 8. Comandos Úteis

```bash
# Ver logs dos containers
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f nginx

# Reiniciar serviços
docker-compose restart

# Parar todos os serviços
docker-compose down

# Atualizar e reiniciar
docker-compose pull && docker-compose up -d

# Ver status dos containers
docker-compose ps

# Limpar imagens não utilizadas
docker system prune -f
```

## 9. Firewall (Opcional)

```bash
# Configurar UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 10. Monitoramento

### 10.1 Configurar logs do sistema
```bash
# Configurar logrotate para logs do Docker
sudo tee /etc/logrotate.d/docker << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
EOF
```

## Próximos Passos

1. **Substitua os placeholders**: Altere `SEU_DOCKER_USERNAME`, `SEU_DOMINIO.com`, etc. pelos valores reais
2. **Configure as variáveis de ambiente** no arquivo `.env.prod`
3. **Teste o deploy manual** antes de configurar o GitHub Actions
4. **Configure o SSL** se você tiver um domínio
5. **Monitore os logs** após o primeiro deploy

## Troubleshooting

### Problema: Container não inicia
```bash
# Verificar logs
docker-compose logs nome_do_servico

# Verificar se as portas estão em uso
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001
```

### Problema: Erro de permissão
```bash
# Verificar permissões do diretório
ls -la /opt/app-booking

# Corrigir permissões se necessário
sudo chown -R $USER:$USER /opt/app-booking
```

### Problema: Erro de conexão com banco
- Verifique as variáveis de ambiente no `.env.prod`
- Confirme se o Supabase está configurado corretamente
- Teste a conexão manualmente

Este guia deve cobrir toda a configuração necessária para fazer o deploy do seu projeto na VPS!