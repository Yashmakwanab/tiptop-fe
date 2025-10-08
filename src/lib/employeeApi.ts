import api from './api';
import {
  Employee,
  EmployeeQueryParams,
  EmployeeResponse,
  EmployeeStatistics,
} from '@/types/employee';

export const employeeApi = {
  // Get all employees with pagination and filters
  getAll: async (params: EmployeeQueryParams): Promise<EmployeeResponse> => {
    const response = await api.get('/employee', { params });
    return response.data;
  },

  // Get single employee by ID
  getById: async (id: string): Promise<Employee> => {
    const response = await api.get(`/employee/${id}`);
    return response.data;
  },

  // Create new employee
  create: async (data: Partial<Employee>): Promise<Employee> => {
    const response = await api.post('/employee', data);
    return response.data;
  },

  // Update employee
  update: async (id: string, data: Partial<Employee>): Promise<Employee> => {
    const response = await api.patch(`/employee/${id}`, data);
    return response.data;
  },

  // Soft delete employee
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/employee/${id}`);
    return response.data;
  },

  // Permanent delete employee
  permanentDelete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/employee/${id}/permanent`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<EmployeeStatistics> => {
    const response = await api.get('/employee/statistics');
    return response.data;
  },
};