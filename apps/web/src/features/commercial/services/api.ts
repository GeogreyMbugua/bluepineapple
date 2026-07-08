import { apiClient } from '@/services/api';
import type { SuccessResponse, ApiList } from '@/types/api';

export interface Pricing {
  id: string;
  experienceId: string;
  price: number;
  currency: string;
}

export interface Quote {
  id: string;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Promo {
  id: string;
  code: string;
  discount: number;
  validFrom: string;
  validTo: string;
}

export const commercialApi = {
  pricing: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiList<Pricing>>('/commercial/pricing', params ? { params } : undefined),
  },

  quotes: {
    create: (data: { experienceIds: string[]; passengers: number }) =>
      apiClient.post<SuccessResponse<Quote>>('/commercial/quotes', data),

    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiList<Quote>>('/commercial/quotes', params ? { params } : undefined),
  },

  promos: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiList<Promo>>('/commercial/promos', params ? { params } : undefined),

    apply: (code: string) => apiClient.post<SuccessResponse<{ discount: number }>>(`/commercial/promos/${code}/apply`),
  },
};