import type { AuthUser } from '@/features/auth/types';
import { apiClient } from '@/services/api';
import type { SuccessResponse, ApiList } from '@/types/api';

export const crmApi = {
  customers: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiList<AuthUser>>('/customers', params ? { params } : undefined),

    detail: (id: string) => apiClient.get<SuccessResponse<AuthUser>>(`/customers/${id}`),
  },
};