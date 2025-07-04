# GitHub Actions Configuration

## Workflows

Este projeto possui dois workflows principais:

### 1. Continuous Integration (CI)
- **Arquivo**: `.github/workflows/ci.yml`
- **Trigger**: Push em qualquer branch e Pull Requests para main/master
- **Funcionalidades**:
  - Testa o código em Node.js 18.x e 20.x
  - Executa linting (ESLint)
  - Roda testes com cobertura
  - Faz type checking (TypeScript)
  - Executa scan de segurança com Trivy
  - Upload de cobertura para Codecov

### 2. Deploy
- **Arquivo**: `.github/workflows/deploy.yml`
- **Trigger**: Push para main/master (após CI passar)
- **Funcionalidades**:
  - Executa testes completos
  - Constrói e publica imagens Docker
  - Faz deploy automático para produção

## Secrets Necessários

Para configurar os workflows, você precisa adicionar os seguintes secrets no GitHub:

### Docker Hub
```
DOCKER_USERNAME=seu_usuario_dockerhub
DOCKER_PASSWORD=sua_senha_ou_token_dockerhub
```

### Servidor de Produção
```
HOST=ip_ou_dominio_do_servidor
USERNAME=usuario_ssh
SSH_KEY=chave_privada_ssh_completa
```

### Codecov (Opcional)
```
CODECOV_TOKEN=token_do_codecov
```

## Como Configurar os Secrets

1. Vá para o repositório no GitHub
2. Clique em **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret com o nome exato listado acima

## Estrutura de Deploy

O workflow de deploy assume que você tem:
- Docker e Docker Compose instalados no servidor
- Um arquivo `docker-compose.yml` configurado no servidor
- Acesso SSH configurado com chave pública/privada

## Customização

### Alterar Node.js Versions
Edite a matriz `node-version` nos workflows:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Adicione versões conforme necessário
```

### Alterar Branches de Deploy
Modifique a condição no job de deploy:
```yaml
if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/production'
```

### Adicionar Ambientes
Para múltiplos ambientes (staging, production), duplique o job de deploy com diferentes condições e secrets.

## Scripts Necessários no package.json

Certifique-se de que seus `package.json` tenham os scripts:

### Backend (./back/package.json)
```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts,.js",
    "build": "tsc"
  }
}
```

### Frontend (./front/package.json)
```json
{
  "scripts": {
    "test": "next test",
    "lint": "next lint",
    "build": "next build"
  }
}
```