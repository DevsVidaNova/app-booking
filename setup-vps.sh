#!/bin/bash

# Script de configuração automática da VPS para app-booking
# Execute este script na sua VPS como usuário com privilégios sudo

set -e  # Parar execução em caso de erro

echo "🚀 Iniciando configuração da VPS para app-booking..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root ou com sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Executando como root. Recomendamos usar um usuário com sudo."
    USER_HOME="/root"
    CURRENT_USER="root"
else
    if ! sudo -n true 2>/dev/null; then
        print_error "Este script precisa de privilégios sudo. Execute: sudo $0"
        exit 1
    fi
    USER_HOME="$HOME"
    CURRENT_USER="$USER"
fi

print_status "Usuário atual: $CURRENT_USER"
print_status "Diretório home: $USER_HOME"

# 1. Atualizar sistema
print_status "Atualizando sistema..."
sudo apt update && sudo apt upgrade -y
print_success "Sistema atualizado!"

# 2. Instalar dependências básicas
print_status "Instalando dependências básicas..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release ufw
print_success "Dependências instaladas!"

# 3. Instalar Docker
print_status "Instalando Docker..."
if ! command -v docker &> /dev/null; then
    # Adicionar chave GPG oficial do Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Adicionar repositório do Docker
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Atualizar e instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $CURRENT_USER
    
    print_success "Docker instalado!"
else
    print_warning "Docker já está instalado."
fi

# 4. Instalar Docker Compose
print_status "Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose instalado!"
else
    print_warning "Docker Compose já está instalado."
fi

# 5. Criar diretório do projeto
print_status "Criando diretório do projeto..."
sudo mkdir -p /opt/app-booking
sudo chown $CURRENT_USER:$CURRENT_USER /opt/app-booking
print_success "Diretório criado: /opt/app-booking"

# 6. Configurar firewall
print_status "Configurando firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
print_success "Firewall configurado!"

# 7. Gerar chaves SSH para deploy
print_status "Gerando chaves SSH para deploy..."
SSH_DIR="$USER_HOME/.ssh"
mkdir -p $SSH_DIR
chmod 700 $SSH_DIR

if [ ! -f "$SSH_DIR/deploy_key" ]; then
    ssh-keygen -t rsa -b 4096 -C "deploy@app-booking" -f "$SSH_DIR/deploy_key" -N ""
    cat "$SSH_DIR/deploy_key.pub" >> "$SSH_DIR/authorized_keys"
    chmod 600 "$SSH_DIR/authorized_keys"
    chmod 600 "$SSH_DIR/deploy_key"
    chmod 644 "$SSH_DIR/deploy_key.pub"
    print_success "Chaves SSH geradas!"
else
    print_warning "Chaves SSH já existem."
fi

# 8. Criar arquivos de configuração
print_status "Criando arquivos de configuração..."

cd /opt/app-booking

# Docker Compose para produção
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Backend API
  api:
    image: ${DOCKER_USERNAME}/app-booking-backend:latest
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
    image: ${DOCKER_USERNAME}/app-booking-frontend:latest
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

# Configuração do Nginx
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
        server_name _;

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

# Arquivo de ambiente (template)
cat > .env.prod.template << 'EOF'
# Docker Hub Username
DOCKER_USERNAME=seu_docker_username

# Supabase Configuration
SUPABASE_URL=sua_supabase_url
SUPABASE_ANON_KEY=sua_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_supabase_service_role_key

# JWT Secret (gere um valor seguro)
JWT_SECRET=seu_jwt_secret_muito_seguro

# API URL for frontend (substitua pelo seu domínio ou IP)
NEXT_PUBLIC_API_URL=http://SEU_DOMINIO_OU_IP/api
EOF

# Scripts úteis
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando deploy..."
cd /opt/app-booking
docker-compose pull
docker-compose up -d
docker system prune -f
echo "✅ Deploy concluído!"
EOF

cat > status.sh << 'EOF'
#!/bin/bash
echo "=== Status dos Containers ==="
docker-compose ps
echo ""
echo "=== Logs recentes ==="
docker-compose logs --tail=20
EOF

cat > logs.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Uso: ./logs.sh [api|frontend|nginx|all]"
    echo "Exemplo: ./logs.sh api"
    exit 1
fi

if [ "$1" = "all" ]; then
    docker-compose logs -f
else
    docker-compose logs -f "$1"
fi
EOF

chmod +x deploy.sh status.sh logs.sh

print_success "Arquivos de configuração criados!"

# 9. Configurar logrotate para Docker
print_status "Configurando rotação de logs..."
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
print_success "Rotação de logs configurada!"

# 10. Instalar Certbot (para SSL)
print_status "Instalando Certbot para SSL..."
sudo apt install -y certbot python3-certbot-nginx
print_success "Certbot instalado!"

echo ""
print_success "🎉 Configuração da VPS concluída com sucesso!"
echo ""
print_warning "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. Configure o arquivo .env.prod:"
echo "   cd /opt/app-booking"
echo "   cp .env.prod.template .env.prod"
echo "   nano .env.prod"
echo ""
echo "2. Configure os GitHub Secrets:"
echo "   - DOCKER_USERNAME: Seu username do Docker Hub"
echo "   - DOCKER_PASSWORD: Sua senha do Docker Hub"
echo "   - HOST: $(curl -s ifconfig.me)"
echo "   - USERNAME: $CURRENT_USER"
echo "   - SSH_KEY: (conteúdo da chave privada abaixo)"
echo ""
print_warning "🔑 CHAVE PRIVADA SSH (copie para GitHub Secrets):"
echo "----------------------------------------"
cat "$SSH_DIR/deploy_key"
echo "----------------------------------------"
echo ""
echo "3. Se você tiver um domínio, configure SSL:"
echo "   sudo certbot --nginx -d seudominio.com"
echo ""
echo "4. Teste o deploy manual:"
echo "   cd /opt/app-booking"
echo "   ./deploy.sh"
echo ""
echo "5. Monitore os logs:"
echo "   ./status.sh"
echo "   ./logs.sh all"
echo ""
print_success "✨ Sua VPS está pronta para receber deploys automáticos!"

# Verificar se precisa fazer logout/login para o Docker
if ! groups $CURRENT_USER | grep -q docker; then
    print_warning "⚠️  IMPORTANTE: Faça logout e login novamente para usar o Docker sem sudo"
    print_warning "   ou execute: newgrp docker"
fi