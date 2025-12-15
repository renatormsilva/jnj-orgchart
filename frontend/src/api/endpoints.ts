import { apiClient } from './client';
import {
  Person,
  PersonWithRelations,
  PaginatedResponse,
  PersonFilters,
  HierarchyNode,
  Department,
  Manager,
  Statistics,
} from '../types/person';

export const peopleApi = {
  getPeople: async (
    filters: PersonFilters = {},
    page: number = 1,
    limit: number = 25
  ): Promise<PaginatedResponse<Person>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.department) params.append('department', filters.department);
    if (filters.managerId) params.append('managerId', filters.managerId);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);

    const response = await apiClient.get<{success: boolean; data: Person[]; pagination: any}>(
      `/people?${params.toString()}`
    );
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  getPerson: async (id: string): Promise<PersonWithRelations> => {
    const response = await apiClient.get<{success: boolean; data: PersonWithRelations}>(`/people/${id}`);
    return response.data.data;
  },

  getManagementChain: async (id: string): Promise<Person[]> => {
    const response = await apiClient.get<{success: boolean; data: Person[]}>(`/people/${id}/management-chain`);
    return response.data.data;
  },

  getHierarchy: async (): Promise<HierarchyNode> => {
    const response = await apiClient.get<{success: boolean; data: HierarchyNode}>('/hierarchy');
    return response.data.data;
  },

  getDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get<{success: boolean; data: Statistics}>('/statistics');
    return response.data.data.departments;
  },

  getManagers: async (): Promise<Manager[]> => {
    const response = await apiClient.get<{success: boolean; data: any[]}>('/managers');
    return response.data.data.map((person: any) => ({
      id: person.id,
      name: person.name,
      jobTitle: person.jobTitle,
      directReportsCount: person.directReportsCount || 0,
    }));
  },

  getStatistics: async (): Promise<Statistics> => {
    const response = await apiClient.get<{success: boolean; data: Statistics}>('/statistics');
    return response.data.data;
  },
};
