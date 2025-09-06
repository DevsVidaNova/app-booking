import { fetchApi, fetchWithAuth } from "@/hooks/api";
import { ListRoom, CreateRoom } from "@/types";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';

const URI = '/room'

export const RoomsService = {
  list: async (page: number): Promise<ListRoom> => {
    try {
      return await fetchApi<ListRoom>(`${URI}?page=${page}`, { method: "GET" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao listar salas");
      }
    }
  },

  single: async (id: string): Promise<ListRoom> => {
    try {
      return await fetchApi<ListRoom>(`${URI}/${id}`, { method: "GET" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao buscar sala");
      }
    }
  },

  add: async (data: CreateRoom): Promise<CreateRoom> => {
    try {
      return await fetchWithAuth<CreateRoom>(URI, { method: "POST", data: data });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao criar sala");
      }
    }
  },

  edit: async (id: string, data: CreateRoom): Promise<CreateRoom> => {
    try {
      return await fetchWithAuth<CreateRoom>(`${URI}/${id}`, { method: "PUT", data: data });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao editar sala");
      }
    }
  },

  delete: async (id: string) => {
    try {
      return await fetchWithAuth(`${URI}/${id}`, { method: "DELETE" });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao deletar sala");
      }
    }
  },

  search: async (name: string): Promise<ListRoom> => {
    try {
      return await fetchApi<ListRoom>(`${URI}/search?name=${name}`, {
        method: "GET"
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro desconhecido ao buscar salas");
      }
    }
  },

  QUERY_KEY: {
    LIST: URI,
    GET: (id: string) => [URI, "get", id],
    DELETE: (id: string) => [URI, "delete", id],
    SEARCH: (name: string) => [URI, "search", name]
  },

  // Hooks do React Query integrados no service
  useList: (page: number = 1) => {
    return useQuery({
      queryKey: queryKeys.rooms.lists(),
      queryFn: () => RoomsService.list(page),
    });
  },

  useSingle: (id: string) => {
    return useQuery({
      queryKey: queryKeys.rooms.detail(id),
      queryFn: () => RoomsService.single(id),
      enabled: !!id,
    });
  },

  useCreate: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: RoomsService.add,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      },
    });
  },

  useUpdate: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: CreateRoom }) => 
        RoomsService.edit(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.rooms.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.rooms.lists() });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: RoomsService.delete,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.rooms.all });
      },
    });
  },

  useSearch: (name: string) => {
    return useQuery({
      queryKey: queryKeys.rooms.list({ search: name }),
      queryFn: () => RoomsService.search(name),
      enabled: !!name,
    });
  }
};
