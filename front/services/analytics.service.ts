import { fetchWithAuth, } from "@/hooks/api";
import { Analytics } from "@/types";

const URI = "/analytics"

export const AnalyticsService = {
    analytics: async (): Promise<Analytics> => {
        try {
            return await fetchWithAuth<Analytics>(URI, { method: "GET", });
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    },

    membersAnalytics: async (): Promise<any> => {
        try {
            return await fetchWithAuth<any>(URI + "/members", { method: "GET", });
        }
        catch (error: any) {
            throw new Error(error.message);
        }
    },

    QUERY_KEY: {
        ANALYTICS: "analytics",
        MEMBERS_ANALYTICS: "members-analytics"
    }
}

