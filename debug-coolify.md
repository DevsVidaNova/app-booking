# Debug Coolify - Erro 405

## Problema Identificado
O healthcheck está retornando HTML do frontend em vez de JSON do backend, indicando que o nginx não está redirecionando corretamente.

## Possíveis Causas

### 1. Backend não está rodando
- O container `api` pode não estar funcionando
- Verificar logs: `docker logs <api-container-id>`

### 2. Problema de rede entre containers
- Os containers não conseguem se comunicar
- Verificar se estão na mesma rede

### 3. Nginx não consegue resolver o nome `api`
- Problema de DNS interno do Docker

## Soluções Implementadas

### ✅ Configuração Nginx Robusta
- Arquivo: `nginx-robust.conf`
- Timeouts configurados
- Fallback para falhas de conexão
- Keepalive habilitado

### ✅ Dependências de Health Check
- Nginx só inicia após backend e frontend estarem saudáveis
- Evita tentativas de conexão prematura

## Comandos para Debug

```bash
# 1. Verificar se todos os containers estão rodando
docker ps

# 2. Verificar logs do backend
docker logs <api-container-id>

# 3. Verificar logs do nginx
docker logs <nginx-container-id>

# 4. Testar conectividade entre containers
docker exec <nginx-container-id> nslookup api
docker exec <nginx-container-id> curl http://api:3001/health

# 5. Verificar se o backend está respondendo
curl http://localhost:3001/health
```

## Teste Manual

### 1. Health Check
```bash
curl -v http://seu-dominio/health
```
**Esperado**: JSON com status "OK"
**Atual**: HTML do frontend

### 2. Login
```bash
curl -X POST http://seu-dominio/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

## Próximos Passos

1. **Fazer deploy** com a nova configuração `nginx-robust.conf`
2. **Verificar logs** dos containers após o deploy
3. **Testar health check** primeiro
4. **Testar login** depois

## Arquivos Atualizados

- `nginx-robust.conf` - Configuração nginx melhorada
- `coolify.yaml` - Dependências de health check
- `back/server.ts` - CORS e timeouts melhorados
