#!/bin/bash

# Script de verificação pré-deploy
# Execute este script para verificar se tudo está configurado corretamente

set -e

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
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Contadores
ERRORS=0
WARNINGS=0

# Função para incrementar erros
add_error() {
    print_error "$1"
    ((ERRORS++))
}

# Função para incrementar warnings
add_warning() {
    print_warning "$1"
    ((WARNINGS++))
}

echo "🔍 Verificando configuração de deploy..."
echo ""

# 1. Verificar estrutura do projeto
print_header "Estrutura do Projeto"

if [ -f "package.json" ]; then
    print_success "package.json encontrado na raiz"
else
    add_error "package.json não encontrado na raiz"
fi

if [ -d "back" ] && [ -f "back/package.json" ]; then
    print_success "Backend encontrado (back/)"
else
    add_error "Diretório backend (back/) não encontrado ou sem package.json"
fi

if [ -d "front" ] && [ -f "front/package.json" ]; then
    print_success "Frontend encontrado (front/)"
else
    add_error "Diretório frontend (front/) não encontrado ou sem package.json"
fi

# 2. Verificar Dockerfiles
print_header "Dockerfiles"

if [ -f "back/Dockerfile" ]; then
    print_success "Dockerfile do backend encontrado"
else
    add_error "back/Dockerfile não encontrado"
fi

if [ -f "front/Dockerfile" ]; then
    print_success "Dockerfile do frontend encontrado"
else
    add_error "front/Dockerfile não encontrado"
fi

# 3. Verificar configuração do Next.js
print_header "Configuração Next.js"

if [ -f "front/next.config.mjs" ]; then
    if grep -q "output: 'standalone'" "front/next.config.mjs"; then
        print_success "Next.js configurado para output standalone"
    else
        add_error "Next.js não está configurado para output standalone"
    fi
else
    add_warning "next.config.mjs não encontrado"
fi

# 4. Verificar GitHub Actions
print_header "GitHub Actions"

if [ -f ".github/workflows/deploy.yml" ]; then
    print_success "Workflow de deploy encontrado"
    
    # Verificar se o caminho está correto
    if grep -q "/opt/app-booking" ".github/workflows/deploy.yml"; then
        print_success "Caminho de deploy configurado corretamente"
    else
        add_warning "Verifique se o caminho de deploy está correto no workflow"
    fi
else
    add_error "Workflow de deploy (.github/workflows/deploy.yml) não encontrado"
fi

# 5. Verificar docker-compose
print_header "Docker Compose"

if [ -f "docker-compose.prod.yml" ]; then
    print_success "docker-compose.prod.yml encontrado"
else
    add_warning "docker-compose.prod.yml não encontrado (será criado pelo script de setup)"
fi

if [ -f "nginx.conf" ]; then
    print_success "nginx.conf encontrado"
else
    add_warning "nginx.conf não encontrado (será criado pelo script de setup)"
fi

# 6. Verificar scripts de setup
print_header "Scripts de Setup"

if [ -f "setup-vps.sh" ]; then
    print_success "Script de setup da VPS encontrado"
    if [ -x "setup-vps.sh" ]; then
        print_success "Script de setup é executável"
    else
        add_warning "Script de setup não é executável (execute: chmod +x setup-vps.sh)"
    fi
else
    add_error "setup-vps.sh não encontrado"
fi

# 7. Verificar documentação
print_header "Documentação"

if [ -f "VPS_SETUP_GUIDE.md" ]; then
    print_success "Guia de setup da VPS encontrado"
else
    add_warning "VPS_SETUP_GUIDE.md não encontrado"
fi

if [ -f "DEPLOY_README.md" ]; then
    print_success "README de deploy encontrado"
else
    add_warning "DEPLOY_README.md não encontrado"
fi

if [ -f ".env.example" ]; then
    print_success "Arquivo de exemplo de variáveis encontrado"
else
    add_warning ".env.example não encontrado"
fi

# 8. Verificar dependências do backend
print_header "Dependências Backend"

if [ -f "back/package.json" ]; then
    cd back
    
    # Verificar scripts necessários
    if grep -q '"build"' package.json; then
        print_success "Script 'build' encontrado no backend"
    else
        add_error "Script 'build' não encontrado no package.json do backend"
    fi
    
    if grep -q '"start"' package.json; then
        print_success "Script 'start' encontrado no backend"
    else
        add_error "Script 'start' não encontrado no package.json do backend"
    fi
    
    if grep -q '"test"' package.json; then
        print_success "Script 'test' encontrado no backend"
    else
        add_warning "Script 'test' não encontrado no package.json do backend"
    fi
    
    cd ..
fi

# 9. Verificar dependências do frontend
print_header "Dependências Frontend"

if [ -f "front/package.json" ]; then
    cd front
    
    # Verificar scripts necessários
    if grep -q '"build"' package.json; then
        print_success "Script 'build' encontrado no frontend"
    else
        add_error "Script 'build' não encontrado no package.json do frontend"
    fi
    
    if grep -q '"start"' package.json; then
        print_success "Script 'start' encontrado no frontend"
    else
        add_error "Script 'start' não encontrado no package.json do frontend"
    fi
    
    # Verificar se Next.js está instalado
    if grep -q '"next"' package.json; then
        print_success "Next.js encontrado nas dependências"
    else
        add_error "Next.js não encontrado nas dependências do frontend"
    fi
    
    cd ..
fi

# 10. Verificar Git
print_header "Configuração Git"

if [ -d ".git" ]; then
    print_success "Repositório Git inicializado"
    
    # Verificar se há commits
    if git log --oneline -1 &>/dev/null; then
        print_success "Repositório tem commits"
    else
        add_warning "Repositório não tem commits ainda"
    fi
    
    # Verificar remote
    if git remote -v | grep -q "origin"; then
        print_success "Remote 'origin' configurado"
        REMOTE_URL=$(git remote get-url origin)
        if [[ $REMOTE_URL == *"github.com"* ]]; then
            print_success "Remote aponta para GitHub"
        else
            add_warning "Remote não aponta para GitHub: $REMOTE_URL"
        fi
    else
        add_error "Remote 'origin' não configurado"
    fi
else
    add_error "Não é um repositório Git"
fi

# 11. Verificar arquivos sensíveis
print_header "Segurança"

# Verificar se arquivos .env estão no .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        print_success "Arquivos .env estão no .gitignore"
    else
        add_warning "Adicione arquivos .env ao .gitignore"
    fi
else
    add_warning ".gitignore não encontrado"
fi

# Verificar se não há arquivos .env commitados
if git ls-files | grep -q "\.env$"; then
    add_error "Arquivos .env estão sendo versionados! Remova-os do Git"
else
    print_success "Nenhum arquivo .env está sendo versionado"
fi

# Resumo final
print_header "Resumo"

echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    print_success "🎉 Tudo configurado corretamente! Pronto para deploy."
elif [ $ERRORS -eq 0 ]; then
    print_warning "⚠️  Configuração OK com $WARNINGS aviso(s). Revise os itens acima."
else
    print_error "❌ Encontrados $ERRORS erro(s) e $WARNINGS aviso(s). Corrija antes do deploy."
fi

echo ""
print_status "📋 Próximos passos:"
echo "1. Corrija os erros encontrados (se houver)"
echo "2. Execute o script setup-vps.sh na sua VPS"
echo "3. Configure os GitHub Secrets"
echo "4. Faça push para a branch main para iniciar o deploy"
echo ""
print_status "📚 Consulte DEPLOY_README.md para instruções detalhadas"

exit $ERRORS