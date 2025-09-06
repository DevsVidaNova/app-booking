import { fetchWithAuth } from "@/hooks/api";
import { EditUser, ListUser, CreateUser, User } from "@/types";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';

const URI = "/user"

export const UserService = {
    list: async (page: number): Promise<ListUser> => {
        try {
            return await fetchWithAuth<ListUser>(`${URI}?page=${page}`, { method: "GET" });
        } catch (error: any) {
            throw new Error(error.error);
        }
    },
    single: async (id: string): Promise<User> => {
        try {
            return await fetchWithAuth<User>(`${URI}/${id}`, { method: "GET" });
        } catch (error: any) {
            throw new Error(error.error);
        }
    },
    edit: async (id: string, data: EditUser): Promise<EditUser> => {
        try {
            return await fetchWithAuth<EditUser>(`${URI}/${id}`, { method: "PUT", data: data });
        } catch (error: any) {
            throw new Error(error.error);
        }
    },
    delete: async (id: string): Promise<void> => {
        try {
            return await fetchWithAuth(`${URI}/${id}`, { method: "DELETE" });
        } catch (error: any) {
            throw new Error(error.error);
        }
    },
    resetPassword: async (id: string): Promise<void> => {
        try {
            return await fetchWithAuth(`${URI}/${id}/reset-password`, { method: "PATCH" });
        } catch (error: any) {
            throw new Error(error.error);
        }
    },
    create: async (data: CreateUser): Promise<CreateUser> => {
        try {
            return await fetchWithAuth<CreateUser>(URI, { method: "POST", data: data });
        } catch (error: any) {
            throw new Error(error.error);
        }
    },

    QUERY_KEY: {
        LIST: "list-users",
        SINGLE: "single-user",
        EDIT: "edit-user",
        DELETE: "delete-user",
        RESET_PASSWORD: "reset-password-user",
    },

    // Hooks do React Query integrados no service
    useList: (page: number = 1) => {
        return useQuery({
            queryKey: queryKeys.users.lists(),
            queryFn: () => UserService.list(page),
        });
    },

    useSingle: (id: string) => {
        return useQuery({
            queryKey: queryKeys.users.detail(id),
            queryFn: () => UserService.single(id),
            enabled: !!id,
        });
    },

    useCreate: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: UserService.create,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            },
        });
    },

    useUpdate: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: EditUser }) => 
                UserService.edit(id, data),
            onSuccess: (_, { id }) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
                queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
            },
        });
    },

    useDelete: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: UserService.delete,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            },
        });
    },

    useResetPassword: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: UserService.resetPassword,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            },
        });
    }
}
    