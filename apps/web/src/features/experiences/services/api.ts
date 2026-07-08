import { apiClient } from '@/services/api';
import type { SuccessResponse, ApiList } from '@/types/api';
import type { Experience } from '../types';

export const experiencesApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiList<Experience>>('/experiences', params ? { params } : undefined),

  detail: (id: string) => apiClient.get<SuccessResponse<Experience>>(`/experiences/${id}`),

  search: (searchParams: { query: string; limit?: number }) =>
    apiClient.get<ApiList<Experience>>('/experiences/search', { params: searchParams }),
};