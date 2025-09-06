# App Booking - Sistema de Reservas

Sistema completo de gerenciamento de reservas e escalas para o Espaço Vida Nova, desenvolvido com arquitetura moderna e tecnologias atuais.

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura de microserviços containerizada com Docker, separando frontend, backend e banco de dados em containers independentes, com Nginx como proxy reverso.

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 14.2.16** - Framework React para aplicações web
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript 5** - Superset do JavaScript com tipagem estática
- **Tailwind CSS 4.0** - Framework CSS utilitário
- **Radix UI** - Biblioteca de componentes acessíveis
- **Framer Motion** - Biblioteca de animações
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **TanStack Query** - Gerenciamento de estado do servidor
- **TanStack Table** - Componentes de tabela avançados
- **FullCalendar** - Componente de calendário
- **Axios** - Cliente HTTP
- **Day.js** - Manipulação de datas
- **Lucide React** - Ícones
- **Sonner** - Sistema de notificações
- **Next Themes** - Gerenciamento de temas

### Backend
- **Node.js 18+** - Runtime JavaScript
- **Express.js 4.21.2** - Framework web para Node.js
- **TypeScript 5.8.3** - Superset do JavaScript com tipagem estática
- **Prisma 6.15.0** - ORM moderno para TypeScript
- **PostgreSQL 16** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **Bcrypt** - Hash de senhas
- **Zod** - Validação de schemas
- **Swagger/OpenAPI** - Documentação da API
- **Nodemailer** - Envio de emails
- **CORS** - Configuração de CORS
- **Day.js** - Manipulação de datas

### DevOps & Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Proxy reverso e servidor web
- **PostgreSQL 16 Alpine** - Banco de dados containerizado
- **SSL/TLS** - Certificados de segurança
- **Let's Encrypt** - Certificados SSL gratuitos

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **Jest** - Framework de testes
- **Supertest** - Testes de API
- **Babel** - Transpilador JavaScript
- **ts-node** - Execução de TypeScript
- **tsx** - Executor TypeScript moderno
- **tsc-alias** - Resolução de aliases TypeScript

## 📁 Estrutura do Projeto

```
app-booking/
├── front/                 # Frontend Next.js
│   ├── app/              # App Router do Next.js
│   ├── components/       # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitários e configurações
│   ├── services/        # Serviços de API
│   └── types/           # Definições de tipos TypeScript
├── back/                # Backend Node.js/Express
│   ├── modules/         # Módulos da aplicação
│   ├── config/          # Configurações
│   ├── utils/           # Utilitários
│   └── prisma/          # Schema e migrações do banco
├── docker-compose.yaml  # Configuração dos containers
├── nginx.conf          # Configuração do Nginx
└── deploy.sh           # Script de deploy
```

## 🗄️ Banco de Dados

O sistema utiliza PostgreSQL com Prisma ORM, contendo as seguintes entidades principais:

- **User** - Usuários do sistema
- **Booking** - Reservas de salas
- **Room** - Salas disponíveis
- **Scale** - Escalas de trabalho
- **Member** - Membros da equipe
- **MemberOnScale** - Relacionamento entre membros e escalas

## 🔧 Funcionalidades

### Frontend
- Dashboard administrativo
- Gerenciamento de reservas
- Calendário interativo
- Gerenciamento de usuários
- Gerenciamento de salas
- Gerenciamento de escalas
- Galeria de fotos
- Sistema de autenticação
- Interface responsiva

### Backend
- API REST completa
- Autenticação JWT
- Validação de dados com Zod
- Documentação automática com Swagger
- Sistema de roles (USER/ADMIN)
- Gerenciamento de reservas
- Gerenciamento de escalas
- Envio de emails

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)

### Desenvolvimento
```bash
# Clone o repositório
git clone <repository-url>
cd app-booking

# Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações

# Inicie os serviços
docker-compose up -d

# Execute as migrações do banco
docker-compose exec api npx prisma migrate deploy
```

### Produção
```bash
# Configure as variáveis de ambiente de produção
# Configure os registros DNS
# Execute o script de deploy
./deploy.sh
```

## 📚 Documentação

- **API**: Disponível em `/api/docs` quando o servidor estiver rodando
- **Variáveis de Ambiente**: Consulte `ENV_VARIABLES.md`
- **Deploy VPS**: Consulte `VPS_DEPLOY.md`
- **Deploy Railway**: Consulte `RAILWAY_DEPLOY.md`

## 🔒 Segurança

- Autenticação JWT
- Hash de senhas com Bcrypt
- Validação de dados com Zod
- Headers de segurança configurados no Nginx
- CORS configurado adequadamente
- Rate limiting implementado

## 📱 Responsividade

O frontend é totalmente responsivo e otimizado para:
- Desktop
- Tablet
- Mobile

## 🌐 Domínios

- **Frontend**: `espacovidanova.com.br`
- **API**: `api.espacovidanova.com.br`

## 📄 Licença

Este projeto é privado e proprietário do Espaço Vida Nova.
