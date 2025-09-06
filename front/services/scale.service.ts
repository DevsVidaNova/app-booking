import { fetchWithAuth, } from "@/hooks/api";
import { ListScale, SingleScale, CreateScale, Pagination } from "@/types";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';

const URI = "/scale";

export const ScaleService = {
    list: async (page: number): Promise<{scales: SingleScale[]; pagination: Pagination }> => {
        try {
            return await fetchWithAuth<{ scales: SingleScale[]; pagination: Pagination }>(`${URI}?page=${page}`, { method: "GET" });
        } catch (error) {
            console.log(error)
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Erro desconhecido ao listar escalas");
            }
        }
    },

    single: async (id: string): Promise<SingleScale> => {
        try {
            return await fetchWithAuth<SingleScale>(`${URI}/${id}`, { method: "GET" });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Erro desconhecido ao buscar escala");
            }
        }
    },

    duplicate: async (id: string): Promise<SingleScale> => {
        try {
            return await fetchWithAuth<SingleScale>(`${URI}/duplicate/${id}`, { method: "POST" });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Erro desconhecido ao duplicar escala");
            }
        }
    },

    add: async (data: CreateScale): Promise<CreateScale> => {
        try {
            return await fetchWithAuth<CreateScale>(URI, { method: "POST", data: data });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Erro desconhecido ao criar escala");
            }
        }
    },

    edit: async (id: string, data: CreateScale): Promise<CreateScale> => {
        try {
            return await fetchWithAuth<CreateScale>(`${URI}/${id}`, { method: "PUT", data: data });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Erro desconhecido ao editar escala");
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
                throw new Error("Erro desconhecido ao deletar escala");
            }
        }
    },

    confirm: async (id: string, confirmed: boolean) => {
        try {
            return await fetchWithAuth(`${URI}/confirm`, {
                method: "POST", 
                data: {
                    scaleId: id,
                    confirmed: confirmed
                } 
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Erro desconhecido ao confirmar escala");
            }
        }
    },

    search: async (name: string): Promise<ListScale> => {
        try {
            return await fetchWithAuth<ListScale>(`${URI}/search`, {
                method: "POST",
                data: {
                    name: name
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("Erro desconhecido ao buscar escalas");
            }
        }
    },

    // Hooks do React Query integrados no service
    useList: (page: number = 1) => {
        return useQuery({
            queryKey: queryKeys.scales.lists(),
            queryFn: () => ScaleService.list(page),
        });
    },

    useSingle: (id: string) => {
        return useQuery({
            queryKey: queryKeys.scales.detail(id),
            queryFn: () => ScaleService.single(id),
            enabled: !!id,
        });
    },

    useCreate: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: ScaleService.add,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.scales.all });
            },
        });
    },

    useUpdate: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: CreateScale }) => 
                ScaleService.edit(id, data),
            onSuccess: (_, { id }) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.scales.detail(id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.scales.lists() });
            },
        });
    },

    useDelete: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: ScaleService.delete,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.scales.all });
            },
        });
    },

    useDuplicate: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: ScaleService.duplicate,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.scales.all });
            },
        });
    },

    useConfirm: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: ({ id, confirmed }: { id: string; confirmed: boolean }) => 
                ScaleService.confirm(id, confirmed),
            onSuccess: (_, { id }) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.scales.detail(id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.scales.lists() });
            },
        });
    },

    useSearch: (name: string) => {
        return useQuery({
            queryKey: queryKeys.scales.list({ search: name }),
            queryFn: () => ScaleService.search(name),
            enabled: !!name,
        });
    }
};