import { RoleQueryParams, RoleResponse } from "@/types/role";
import api from "./api";

export const roleApi = {
    createRole: async (data: { name: string; isActive: boolean }) => {
        const response = await api.post(`/role`, data);
        return response.data;
    },

    getAllRoles: async (params: RoleQueryParams): Promise<RoleResponse> => {
        const response = await api.get(`/role`, { params });
        return response.data;
    },

    getRoleById: async (id: string) => {
        const response = await api.get(`/role/${id}`);
        return response.data;
    },

    updateRole: async (id: string, data: { name: string; isActive: boolean }) => {
        const response = await api.patch(`/role/${id}`, data);
        return response.data;
    },

    deleteRole: async (id: string) => {
        const response = await api.delete(`/role/${id}`);
        return response.data;
    },

    deleteMany: async (ids: string[]): Promise<{ deletedCount: number }> => {
        const response = await api.post('/role/delete-many', { ids });
        return response.data;
    },

    // Permissions
    assignPermissions: async (payload: {roleId: string, permissions: string[]}) => {
        const response = await api.post(`/role-permission/assign`, payload);
        return response.data;
    },

    getRolePermissions: async (roleId: string) => {
        const response = await api.get(`/role-permission/role/${roleId}`);
        return response.data;
    },

    getRoleMenus: async (roleId: string) => {
        const response = await api.get(`/role-permission/role-menus/${roleId}`);
        return response.data;
    },

    getPermissionMatrix: async (roleId: string) => {
        const response = await api.get(`/role-permission/matrix/${roleId}`);
        return response.data;
    },

    getMyMenus: async () => {
        const response = await api.get(`/role-permission/my-menus`);
        return response.data;
    },
};
