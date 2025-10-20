import { Roster, RosterQueryParams, RosterResponse } from '@/types/roster';
import api from './api';

export const rosterApi = {
  // Get all rosters with filters and pagination
  getAll: async (params?: RosterQueryParams): Promise<RosterResponse> => {
    const response = await api.get('/roster', { params });
    return response.data;
  },

  // Get single roster by ID
  getById: async (id: string): Promise<Roster> => {
    const response = await api.get(`/roster/${id}`);
    return response.data;
  },

  // Create new roster
  create: async (data: Omit<Roster, '_id' | 'date_entered'>): Promise<Roster> => {
    const response = await api.post('/roster', data);
    return response.data;
  },

  // Update existing roster
  update: async (id: string, data: Partial<Roster>): Promise<Roster> => {
    const response = await api.patch(`/roster/${id}`, data);
    return response.data;
  },

  // Soft delete roster
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/roster/${id}`);
    return response.data;
  },

  // Delete multiple rosters
  deleteMany: async (ids: string[]): Promise<{ deletedCount: number }> => {
    const response = await api.post('/roster/delete-many', { ids });
    return response.data;
  },
};
