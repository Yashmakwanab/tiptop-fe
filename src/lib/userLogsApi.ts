import api from "./api";
import { UserLogsQueryParams, UserLogsResponse } from "@/types/userlogs";

export const userLogsApi = {
    getAllUserLogs: async (params?: UserLogsQueryParams): Promise<UserLogsResponse> => {
        const response = await api.get(`/user-logs`, { params });
        return response.data;
    },
};
