import { QueryClient } from '@tanstack/react-query';

// Configuração otimizada do React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo de cache padrão: 5 minutos
      staleTime: 1000 * 60 * 5,
      // Tempo para garbage collection: 10 minutos
      gcTime: 1000 * 60 * 10,
      // Retry automático em caso de erro
      retry: (failureCount, error: any) => {
        // Não retry em erros 4xx (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Máximo 3 tentativas para outros erros
        return failureCount < 3;
      },
      // Delay entre retries (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch quando a janela ganha foco
      refetchOnWindowFocus: false,
      // Refetch quando reconecta à internet
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry para mutations apenas em erros de rede
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Query keys para organização
export const queryKeys = {
  // Bookings
  bookings: {
    all: ['bookings'] as const,
    lists: () => [...queryKeys.bookings.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.bookings.lists(), filters] as const,
    details: () => [...queryKeys.bookings.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
    calendar: () => [...queryKeys.bookings.all, 'calendar'] as const,
    my: () => [...queryKeys.bookings.all, 'my'] as const,
  },
  // Rooms
  rooms: {
    all: ['rooms'] as const,
    lists: () => [...queryKeys.rooms.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.rooms.lists(), filters] as const,
    details: () => [...queryKeys.rooms.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.rooms.details(), id] as const,
  },
  // Members
  members: {
    all: ['members'] as const,
    lists: () => [...queryKeys.members.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.members.lists(), filters] as const,
    details: () => [...queryKeys.members.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.members.details(), id] as const,
  },
  // Scales
  scales: {
    all: ['scales'] as const,
    lists: () => [...queryKeys.scales.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.scales.lists(), filters] as const,
    details: () => [...queryKeys.scales.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.scales.details(), id] as const,
  },
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },
  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },
} as const;