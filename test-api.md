# Teste da API - Debug do Erro 405

## URLs para Testar

### 1. Health Check (deve funcionar)
```
GET http://j4ck0ko0s4wsw04sok04g0wg.82.29.60.192.sslip.io/health
```

### 2. Login (problema atual)
```
POST http://j4ck0ko0s4wsw04sok04g0wg.82.29.60.192.sslip.io/auth/login
Content-Type: application/json

{
  "email": "teste@teste.com",
  "password": "123456"
}
```

### 3. Teste direto do backend (se acessível)
```
POST http://j4ck0ko0s4wsw04sok04g0wg.82.29.60.192.sslip.io:3001/auth/login
Content-Type: application/json

{
  "email": "teste@teste.com", 
  "password": "123456"
}
```

## Possíveis Causas do Erro 405

1. **Nginx não está redirecionando corretamente** - A rota `/auth/login` não está sendo enviada para o backend
2. **Backend não está rodando** - O container do backend pode não estar funcionando
3. **Problema de CORS** - Requisições preflight estão falhando
4. **Configuração de rede** - Os containers não conseguem se comunicar

## Comandos para Debug no Coolify

```bash
# Verificar logs do nginx
docker logs <nginx-container-id>

# Verificar logs do backend
docker logs <api-container-id>

# Verificar se o backend está respondendo
curl -X GET http://localhost:3001/health

# Testar rota de login diretamente no backend
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","password":"123456"}'
```

## Próximos Passos

1. Testar o health check primeiro
2. Verificar logs dos containers
3. Testar acesso direto ao backend (porta 3001)
4. Ajustar configuração do nginx se necessário
