import { apiClient } from '@/services/api';
import type { SuccessResponse, ApiList } from '@/types/api';
import type { Booking } from '../types';

export const bookingApi = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiList<Booking>>('/bookings', params ? { params } : undefined),

  detail: (id: string) => apiClient.get<SuccessResponse<Booking>>(`/bookings/${id}`),

  create: (data: Omit<Booking, 'id'>) =>
    apiClient.post<SuccessResponse<Booking>>('/bookings', data),

  cancel: (id: string) => apiClient.post<SuccessResponse<null>>(`/bookings/${id}/cancel`),
};