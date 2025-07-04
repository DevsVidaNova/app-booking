# CBVN - Centro Bíblico Vida Nova

> Sistema de gestão completo para o Centro Bíblico Vida Nova, desenvolvido com Next.js, TypeScript e React Query.

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: Radix UI + Design System customizado
- **Gerenciamento de Estado**: React Query (TanStack Query)
- **Formulários**: React Hook Form + Zod
- **Datas**: date-fns
- **HTTP Client**: Axios
- **Ícones**: Lucide React

## 📁 Estrutura do Projeto

```
├── app/                    # Páginas e rotas (App Router)
│   ├── auth/              # Autenticação
│   ├── dashboard/         # Painel administrativo
│   ├── calendar/          # Calendário de reservas
│   └── ...
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Design System (Button, Input, etc.)
│   └── error-boundary.tsx # Error Boundary global
├── hooks/                 # Hooks customizados
│   ├── api.ts            # Cliente HTTP
│   ├── use-api.ts        # Hooks React Query
│   └── ...
├── lib/                   # Utilitários e configurações
│   ├── constants.ts      # Constantes da aplicação
│   ├── env.ts            # Configurações de ambiente
│   ├── formatters.ts     # Funções de formatação
│   ├── react-query.ts    # Configuração React Query
│   ├── utils.ts          # Utilitários gerais
│   └── validations.ts    # Schemas Zod
├── services/              # Camada de serviços (API calls)
│   ├── booking.service.ts
│   ├── members.service.ts
│   └── ...
├── types/                 # Definições de tipos TypeScript
│   └── index.ts
└── utils/                 # Utilitários diversos
```