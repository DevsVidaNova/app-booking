import { fetchWithAuth,  } from "@/hooks/api";
import { Analytics } from "@/types";

export const listAnalytics = async (): Promise<Analytics> => {
    try {
        const res = await fetchWithAuth<Analytics>("/analytics", { method: "GET", });
        return res;
    } catch (error: any) {
        throw new Error(error.message);
    }
};