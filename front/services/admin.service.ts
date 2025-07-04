import { fetchWithAuth } from "@/hooks/api";
import { EditUser, ListUser, CreateUser } from "./types";

export const createUser = async (data: CreateUser): Promise<CreateUser> => {
    try {
        return await fetchWithAuth<CreateUser>("/user", { method: "POST", data: data });
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
};
export const listUsers = async (page: number): Promise<ListUser> => {
    try {
        return await fetchWithAuth<ListUser>(`/user?page=${page}`, { method: "GET" });
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
};
export const showUserById = async (id: string): Promise<ListUser> => {
    try {
        return await fetchWithAuth<ListUser>("/user/" + id, { method: "GET", });
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
}
export const editUserById = async (id: string, data: EditUser): Promise<EditUser> => {
    try {
        return await fetchWithAuth<EditUser>(`/user/${id}`, { method: "PUT", data: data });
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
};
export const excludeUserById = async (id: string) => {
    try {
        return await fetchWithAuth(`/user/${id}`, { method: "DELETE" });
    } catch (error) {
        console.log(error)
        throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
    }
};