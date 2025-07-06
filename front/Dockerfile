FROM node:20-alpine

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
