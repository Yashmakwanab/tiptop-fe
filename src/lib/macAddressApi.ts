import { MacAddress, MacAddressQueryParams, MacAddressResponse } from '@/types/macAddress';
import api from './api';

export const macAddressApi = {
  // Get all macAddress with filters and pagination
  getAll: async (params?: MacAddressQueryParams): Promise<MacAddressResponse> => {
    const response = await api.get('/mac-address', { params });
    return response.data;
  },

  // Get single macAddress by ID
  getById: async (id: string): Promise<MacAddress> => {
    const response = await api.get(`/mac-address/${id}`);
    return response.data;
  },

  // Create new macAddress
  create: async (data: Omit<MacAddress, '_id' | 'date_entered'>): Promise<MacAddress> => {
    const response = await api.post('/mac-address', data);
    return response.data;
  },

  // Update existing macAddress
  update: async (id: string, data: Partial<MacAddress>): Promise<MacAddress> => {
    const response = await api.patch(`/mac-address/${id}`, data);
    return response.data;
  },

  // Soft delete macAddress
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/mac-address/${id}`);
    return response.data;
  },

  // Delete multiple macAddress
  deleteMany: async (ids: string[]): Promise<{ deletedCount: number }> => {
    const response = await api.post('/mac-address/delete-many', { ids });
    return response.data;
  },
};
