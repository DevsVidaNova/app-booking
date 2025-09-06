# Dockerfile principal para VPS
# Este arquivo serve como exemplo - use docker-compose diretamente

FROM nginx:alpine

# Copia configuração do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor portas
EXPOSE 80 443

# Comando padrão
CMD ["nginx", "-g", "daemon off;"]
