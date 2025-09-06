#!/bin/bash

# Script de Deploy para VPS
# Execute: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 Iniciando deploy do App Booking..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado. Faça logout e login novamente."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado."
fi

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado. Copiando do exemplo..."
    cp env.example .env
    echo "⚠️  Configure o arquivo .env com suas variáveis antes de continuar."
    exit 1
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up -d --build

# Aguardar PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL estar pronto..."
sleep 10

# Executar migrações
echo "🗄️  Executando migrações do banco de dados..."
docker-compose exec -T api npx prisma migrate deploy

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
docker-compose exec -T api npx prisma generate

# Verificar status
echo "📊 Verificando status dos serviços..."
docker-compose ps

# Testar endpoints
echo "🧪 Testando endpoints..."
sleep 5

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ API está funcionando em http://localhost/health"
else
    echo "❌ API não está respondendo"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend está funcionando em http://localhost"
else
    echo "❌ Frontend não está respondendo"
fi

echo "🎉 Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure os registros DNS:"
echo "   A     espacovidanova.com.br     → IP_DO_SEU_VPS"
echo "   A     www.espacovidanova.com.br → IP_DO_SEU_VPS"
echo "   A     api.espacovidanova.com.br → IP_DO_SEU_VPS"
echo ""
echo "2. Configure SSL:"
echo "   sudo ./setup-ssl.sh"
echo ""
echo "3. Acesse:"
echo "   🌐 Frontend: https://espacovidanova.com.br"
echo "   🔗 API: https://api.espacovidanova.com.br"
echo ""
echo "📝 Para ver os logs: docker-compose logs -f"
echo "🛑 Para parar: docker-compose down"
