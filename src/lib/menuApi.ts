import api from "./api";
import { Menu, MenuQueryParams } from "@/types/menu";

export const menuApi = {
    createMenu: async ( data: { parent: Menu; submenus: Menu[] }) => {
        const response = await api.post(`/menu`, data);
        return response.data;
    },

    getAllMenus: async () => {
        const response = await api.get(`/menu`);
        return response.data;
    },

    getMenuHierarchy: async (params: MenuQueryParams) => {
        const response = await api.get(`/menu/hierarchy`, { params });
        return response.data;
    },

    updateMenu: async (id: string,  data: { parent: Menu; submenus: Menu[] }) => {
        const response = await api.patch(`/menu/${id}`, data);
        return response.data;
    },

    deleteMenu: async (id: string) => {
        const response = await api.delete(`/menu/${id}`);
        return response.data;
    },

    deleteManyMenu: async (ids: string[]): Promise<{ deletedCount: number }> => {
        const response = await api.post('/menu/delete-many', { ids });
        return response.data;
    },
};
