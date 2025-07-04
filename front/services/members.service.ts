import { fetchWithAuth, } from "@/hooks/api";
import { ListMember, CreateMember } from "./types";

export const listMembers = async (page: number): Promise<ListMember> => {
    try {
        return await fetchWithAuth<ListMember>(`/members?page=${page}`, { method: "GET" });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message);
    }
};

export const singleMember = async (id: string): Promise<ListMember> => {
    try {
        return await fetchWithAuth<ListMember>("/members/" + id, { method: "GET", });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message);
    }
};

export const addMember = async (data: CreateMember): Promise<CreateMember> => {
    try {
        return await fetchWithAuth<CreateMember>("/members", { method: "POST", data: data });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message);
    }
};

export const editMember = async (id: string, data: CreateMember): Promise<CreateMember> => {
    try {
        return await fetchWithAuth<CreateMember>(`/members/${id}`, { method: "PUT", data: data });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message);
    }
};

export const deleteMember = async (id: string) => {
    try {
        return await fetchWithAuth(`/members/${id}`, { method: "DELETE" });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message);
    }
};

export const searchMember = async (name: string): Promise<ListMember> => {
    try {
        return await fetchWithAuth<ListMember>("/members/search", {
            method: "POST",
            data: {
                name: name
            }
        });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message);
    }
};

export const filterMember = async (name: string): Promise<ListMember> => {
    try {
        return await fetchWithAuth<ListMember>("/members/filter", {
            method: "POST",
            data: {
                name: name
            }
        });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message);
    }
};

export const getMembersAnalytics = async (): Promise<any> => {
    try {
        return await fetchWithAuth<any>("/members/analytics", {
            method: "GET",
        });
    } catch (error: any) {
        console.log(error)
        throw new Error(error.message);
    }
};