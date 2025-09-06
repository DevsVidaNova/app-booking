import { fetchWithAuth, } from "@/hooks/api";
import { ListMember, CreateMember } from "@/types";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';

const URI = "/members"

export const MembersService = {
    list: async (page: number): Promise<ListMember> => {
        try {
            return await fetchWithAuth<ListMember>(`${URI}?page=${page}`, { method: "GET" });
        } catch (error: any) {
            console.log(error)
            throw new Error(error.message);
        }
    },
    single: async (id: string): Promise<ListMember> => {
        try {
            return await fetchWithAuth<ListMember>(`${URI}/${id}`, { method: "GET" });
        } catch (error: any) {
            console.log(error)
            throw new Error(error.message);
        }
    },
    add: async (data: CreateMember): Promise<CreateMember> => {
        try {
            return await fetchWithAuth<CreateMember>(URI, { method: "POST", data: data });
        } catch (error: any) {
            console.log(error)
            throw new Error(error.message);
        }
    },
    edit: async (id: string, data: CreateMember): Promise<CreateMember> => {
        try {
            return await fetchWithAuth<CreateMember>(`${URI}/${id}`, { method: "PUT", data: data });
        } catch (error: any) {
            console.log(error)
            throw new Error(error.message);
        }
    },
    delete: async (id: string) => {
        try {
            return await fetchWithAuth(`${URI}/${id}`, { method: "DELETE" });
        } catch (error: any) {
            console.log(error)
            throw new Error(error.message);
        }
    },
    search: async (name: string): Promise<ListMember> => {
        try {
            return await fetchWithAuth<ListMember>(`${URI}/search`, { method: "POST", data: { name } });
        } catch (error: any) {
            console.log(error)
            throw new Error(error.message);
        }
    },
    filter: async (name: string): Promise<ListMember> => {
        try {
            return await fetchWithAuth<ListMember>(`${URI}/filter`, { method: "POST", data: { name } });
        } catch (error: any) {
            console.log(error)
            throw new Error(error.message);
        }
    },

    // Hooks do React Query integrados no service
    useList: (page: number = 1) => {
        return useQuery({
            queryKey: queryKeys.members.lists(),
            queryFn: () => MembersService.list(page),
        });
    },

    useSingle: (id: string) => {
        return useQuery({
            queryKey: queryKeys.members.detail(id),
            queryFn: () => MembersService.single(id),
            enabled: !!id,
        });
    },

    useCreate: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: MembersService.add,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
            },
        });
    },

    useUpdate: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: CreateMember }) => 
                MembersService.edit(id, data),
            onSuccess: (_, { id }) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.members.lists() });
            },
        });
    },

    useDelete: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: MembersService.delete,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
            },
        });
    },

    useSearch: (name: string) => {
        return useQuery({
            queryKey: queryKeys.members.list({ search: name }),
            queryFn: () => MembersService.search(name),
            enabled: !!name,
        });
    },

    useFilter: (name: string) => {
        return useQuery({
            queryKey: queryKeys.members.list({ filter: name }),
            queryFn: () => MembersService.filter(name),
            enabled: !!name,
        });
    }
}
