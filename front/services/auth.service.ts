import { fetchApi, fetchWithAuth, } from "@/hooks/api";
import { createToken } from "@/hooks/token";
import { CreateUser, EditUser, ListUser, User } from "@/types";
import { createUser } from "@/hooks/user";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/react-query';

const URI = "/user"

export const AuthService = {
    register: async (data: CreateUser): Promise<CreateUser> => {
        try {
            const res = await fetchWithAuth<CreateUser>("/user", { method: "POST", data: data });
            return res;
        } catch (error: any) {
            throw new Error(error.message);
        }
    },
    login: async (email: string, password: string, session: boolean) => {
        try {
            const res: any = await fetchApi("/auth/login", { method: "POST", data: { email, password } });
            console.log(res)
            await createToken(res.token, session);
            await createUser(res.user, session);
            return res;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    },

    profile: async (): Promise<User> => {
        try {
            const res = await fetchWithAuth<User>("/auth/profile", { method: "GET" });
            return res;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    },
    sigle: async (id: string): Promise<ListUser> => {
        try {
            const res = await fetchWithAuth<ListUser>("/users/" + id, { method: "GET" });
            return res;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    },
    edit: async (id: string, data: EditUser): Promise<EditUser> => {
        console.log(data)
        try {
            const res = await fetchWithAuth<EditUser>("/user/" + id, {
                method: "PUT", data
            });
            return res;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    },

    exclude: async () => {
        try {
            const res: any = await fetchWithAuth("/user", { method: "DELETE" });
            return res;
        } catch (error) {
            console.log(error)
            throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
        }
    },

    // Hooks do React Query integrados no service
    useProfile: () => {
        return useQuery({
            queryKey: queryKeys.users.profile(),
            queryFn: AuthService.profile,
        });
    },

    useUpdateProfile: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: ({ id, data }: { id: string; data: EditUser }) => 
                AuthService.edit(id, data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() });
            },
        });
    },

    useDeleteAccount: () => {
        const queryClient = useQueryClient();
        
        return useMutation({
            mutationFn: AuthService.exclude,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            },
        });
    }
}


