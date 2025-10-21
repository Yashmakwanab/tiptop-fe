import api from './api';
import { IpAddress, IpAddressQueryParams, IpAddressResponse } from '@/types/ipAddress';

export const ipAddressApi = {
  // Get all ipAddress with filters and pagination
  getAll: async (params?: IpAddressQueryParams): Promise<IpAddressResponse> => {
    const response = await api.get('/ip-address', { params });
    return response.data;
  },

  // Get single ipAddress by ID
  getById: async (id: string): Promise<IpAddress> => {
    const response = await api.get(`/ip-address/${id}`);
    return response.data;
  },

  // Create new ipAddress
  create: async (data: Omit<IpAddress, '_id' | 'date_entered'>): Promise<IpAddress> => {
    const response = await api.post('/ip-address', data);
    return response.data;
  },

  // Update existing ipAddress
  update: async (id: string, data: Partial<IpAddress>): Promise<IpAddress> => {
    const response = await api.patch(`/ip-address/${id}`, data);
    return response.data;
  },

  // Soft delete ipAddress
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/ip-address/${id}`);
    return response.data;
  },

  // Delete multiple ipAddress
  deleteMany: async (ids: string[]): Promise<{ deletedCount: number }> => {
    const response = await api.post('/ip-address/delete-many', { ids });
    return response.data;
  },
};
