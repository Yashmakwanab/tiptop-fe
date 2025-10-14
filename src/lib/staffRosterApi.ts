import api from './api';

export interface StaffRoster {
  _id?: string;
  user_id: string;
  user_name: string;
  roster_type: string;
  slot_id: string;
  slot: string;
  roster_dates: string[]; // Array of date strings in ISO format
  start_time: string;
  end_time: string;
}

export interface RosterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  created_by?: string;
}

export interface RosterResponse {
  data: StaffRoster[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const staffRosterApi = {
  // Get all rosters with filters and pagination
  getAll: async (params?: RosterQueryParams): Promise<RosterResponse> => {
    const response = await api.get('/staff-roster', { params });
    return response.data;
  },

  // Get single roster by ID
  getById: async (id: string): Promise<StaffRoster> => {
    const response = await api.get(`/staff-roster/${id}`);
    return response.data;
  },

  // Create new roster
  create: async (data: Partial<StaffRoster>): Promise<StaffRoster> => {
    const response = await api.post('/staff-roster', data);
    return response.data;
  },

  // Update existing roster
  update: async (id: string, data: Partial<StaffRoster>): Promise<StaffRoster> => {
    const response = await api.patch(`/staff-roster/${id}`, data);
    return response.data;
  },

  // Soft delete roster
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/staff-roster/${id}`);
    return response.data;
  },

  // Delete multiple rosters
  deleteMany: async (ids: string[]): Promise<{ deletedCount: number }> => {
    const response = await api.post('/staff-roster/delete-many', { ids });
    return response.data;
  },
};
