#!/bin/bash

# Script para configurar SSL com Let's Encrypt
# Execute: chmod +x setup-ssl.sh && ./setup-ssl.sh

set -e

echo "🔒 Configurando SSL com Let's Encrypt..."

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute como root: sudo ./setup-ssl.sh"
    exit 1
fi

# Instalar Certbot
echo "📦 Instalando Certbot..."
apt update
apt install -y certbot python3-certbot-nginx

# Criar diretório para certificados
echo "📁 Criando diretório para certificados..."
mkdir -p ./ssl

# Parar containers temporariamente
echo "🛑 Parando containers..."
docker-compose down

# Obter certificados
echo "🔐 Obtendo certificados SSL..."
certbot certonly --standalone \
    --email admin@espacovidanova.com.br \
    --agree-tos \
    --no-eff-email \
    -d espacovidanova.com.br \
    -d www.espacovidanova.com.br \
    -d api.espacovidanova.com.br

# Copiar certificados para o diretório do projeto
echo "📋 Copiando certificados..."
cp /etc/letsencrypt/live/espacovidanova.com.br/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/espacovidanova.com.br/privkey.pem ./ssl/key.pem

# Ajustar permissões
chmod 644 ./ssl/cert.pem
chmod 600 ./ssl/key.pem

# Reiniciar containers
echo "🚀 Reiniciando containers..."
docker-compose up -d

# Configurar renovação automática
echo "⏰ Configurando renovação automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose restart nginx") | crontab -

echo "✅ SSL configurado com sucesso!"
echo "🌐 Acesse: https://espacovidanova.com.br"
echo "🔗 API: https://api.espacovidanova.com.br"
echo "📝 Os certificados serão renovados automaticamente"
