import { apiClient } from '@/services/api';
import type { SuccessResponse, ApiList } from '@/types/api';

export interface Voyage {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  assignedVoyageId: string;
}

export const operationsApi = {
  voyages: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiList<Voyage>>('/operations/voyages', params ? { params } : undefined),

    detail: (id: string) => apiClient.get<SuccessResponse<Voyage>>(`/operations/voyages/${id}`),
  },

  crew: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiList<CrewMember>>('/operations/crew', params ? { params } : undefined),
  },

  manifest: (voyageId: string) =>
    apiClient.get<SuccessResponse<{ passengers: unknown[] }>>(`/operations/voyages/${voyageId}/manifest`),
};