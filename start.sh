#!/bin/sh

# Aguarda o banco de dados estar disponível
echo "Aguardando banco de dados..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "Banco de dados disponível!"

# Executa migrações do Prisma
echo "Executando migrações..."
cd /app/back
npx prisma migrate deploy
npx prisma generate

# Inicia o backend em background
echo "Iniciando backend..."
cd /app/back
npm start &
BACKEND_PID=$!

# Aguarda o backend estar pronto
echo "Aguardando backend..."
while ! curl -f http://localhost:3001/health > /dev/null 2>&1; do
  sleep 1
done
echo "Backend pronto!"

# Inicia o frontend
echo "Iniciando frontend..."
cd /app/front
npm start &
FRONTEND_PID=$!

# Aguarda o frontend estar pronto
echo "Aguardando frontend..."
while ! curl -f http://localhost:3000 > /dev/null 2>&1; do
  sleep 1
done
echo "Frontend pronto!"

# Configura nginx
echo "Configurando nginx..."
nginx -c /app/nginx.conf -g "daemon off;" &
NGINX_PID=$!

# Aguarda qualquer processo terminar
wait $BACKEND_PID $FRONTEND_PID $NGINX_PID
