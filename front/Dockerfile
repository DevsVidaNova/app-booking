FROM node:20-alpine

# Atualiza os pacotes do sistema e instala dumb-init e curl
RUN apk update && apk upgrade && apk add --no-cache dumb-init curl

# Diretório da aplicação
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expor a porta padrão do Next.js dev server
EXPOSE 3000

# Comando padrão: inicia o Next.js em modo dev
CMD ["npm", "run", "dev"]
