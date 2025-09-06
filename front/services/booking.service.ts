import { fetchApi, fetchWithAuth } from "@/hooks/api";
import { ListBooking, CreateBooking, EditBooking } from "@/types";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';

export const BookingsService = {
  list: async (): Promise<ListBooking[]> => {
    try {
      return await fetchApi<ListBooking[]>("/booking", { method: "GET" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao listar reservas");
      }
    }
  },

  listByMonth: async (): Promise<ListBooking[]> => {
    try {
      return await fetchApi<ListBooking[]>("/booking/month", { method: "GET" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao listar reservas");
      }
    }
  },

  listByWeek: async (): Promise<ListBooking[]> => {
    try {
      return await fetchApi<ListBooking[]>("/booking/week", { method: "GET" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao listar reservas");
      }
    }
  },

  listByToday: async (): Promise<ListBooking[]> => {
    try {
      return await fetchApi<ListBooking[]>("/booking/today", { method: "GET" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao listar reservas");
      }
    }
  },

  single: async (id: string): Promise<ListBooking> => {
    try {
      return await fetchWithAuth<ListBooking>(`/booking/${id}`, { method: "GET" });
    } catch (error) {
      console.error("Erro ao buscar reserva:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao buscar reserva");
      }
    }
  },

  listByMe: async (): Promise<ListBooking[]> => {
    try {
      return await fetchWithAuth<ListBooking[]>("/booking/my", { method: "GET" });
    } catch (error) {
      console.error("Erro ao listar minhas reservas:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao listar minhas reservas");
      }
    }
  },

  add: async (data: CreateBooking): Promise<CreateBooking> => {
    try {
      return await fetchWithAuth<CreateBooking>(`/booking`, {
        method: "POST",
        data: data
      });
    } catch (err) {
      console.error("Erro na API addBooking:", err);
      throw new Error("Erro de conexão com o servidor.");
    }
  },

  edit: async (id: string, data: EditBooking): Promise<ListBooking> => {
    try {
      return await fetchWithAuth<ListBooking>(`/booking/${id}`, {
        method: "PUT",
        data: data
      });
    } catch (error) {
      console.error("Erro ao editar reserva:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao editar reserva");
      }
    }
  },

  delete: async (id: string) => {
    try {
      return await fetchWithAuth(`/booking/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Erro ao deletar reserva:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao deletar reserva");
      }
    }
  },

  search: async (userId?: string, date?: string, room?: string, repeat?: string, dayRepeat?: string): Promise<ListBooking[]> => {
    try {
      return await fetchWithAuth<ListBooking[]>(`/booking/filter`, {
        method: "POST",
        data: {
          userId,
          date,
          room,
          repeat,
          dayRepeat
        }
      });
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao buscar reservas");
      }
    }
  },

  listCalendar: async (): Promise<ListBooking[]> => {
    try {
      return await fetchApi<ListBooking[]>("/booking/calendar", { method: "GET" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao listar reservas do calendário");
      }
    }
  },

  QUERY_KEY: {
    LIST: "booking.list",
    GET: (id: string) => ["booking.get", id],
    DELETE: (id: string) => ["booking.delete", id],
    SEARCH: (params?: { userId?: string; date?: string; room?: string; repeat?: string; dayRepeat?: string }) => [
      "booking.search",
      params
    ],
    LIST_CALENDAR: "booking.listCalendar"
  },

  // Hooks do React Query integrados no service
  useList: () => {
    return useQuery({
      queryKey: queryKeys.bookings.lists(),
      queryFn: BookingsService.list,
    });
  },

  useListByMonth: () => {
    return useQuery({
      queryKey: queryKeys.bookings.list({ filter: 'month' }),
      queryFn: BookingsService.listByMonth,
    });
  },

  useListByWeek: () => {
    return useQuery({
      queryKey: queryKeys.bookings.list({ filter: 'week' }),
      queryFn: BookingsService.listByWeek,
    });
  },

  useListByToday: () => {
    return useQuery({
      queryKey: queryKeys.bookings.list({ filter: 'today' }),
      queryFn: BookingsService.listByToday,
    });
  },

  useSingle: (id: string) => {
    return useQuery({
      queryKey: queryKeys.bookings.detail(id),
      queryFn: () => BookingsService.single(id),
      enabled: !!id,
    });
  },

  useListByMe: () => {
    return useQuery({
      queryKey: queryKeys.bookings.my(),
      queryFn: BookingsService.listByMe,
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: BookingsService.add,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: EditBooking }) => 
        BookingsService.edit(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: BookingsService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      },
    });
  },

  useSearch: (params?: { userId?: string; date?: string; room?: string; repeat?: string; dayRepeat?: string }) => {
    return useQuery({
      queryKey: queryKeys.bookings.list({ search: params }),
      queryFn: () => BookingsService.search(params?.userId, params?.date, params?.room, params?.repeat, params?.dayRepeat),
      enabled: !!(params?.userId || params?.date || params?.room || params?.repeat || params?.dayRepeat),
    });
  },

  useListCalendar: () => {
    return useQuery({
      queryKey: queryKeys.bookings.calendar(),
      queryFn: BookingsService.listCalendar,
    });
  }
};





