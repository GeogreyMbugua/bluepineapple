import { apiClient } from '@/services/api';
import type { SuccessResponse, ApiList } from '@/types/api';

export interface PartnerProfile {
  id: string;
  name: string;
  email: string;
  status: string;
}

export const partnersApi = {
  profile: () => apiClient.get<SuccessResponse<PartnerProfile>>('/partners/profile'),

  bookings: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiList<{ id: string; status: string }>>('/partners/bookings', params ? { params } : undefined),

  fleet: () => apiClient.get<ApiList<{ id: string; name: string; status: string }>>('/partners/fleet'),

  analytics: () => apiClient.get<SuccessResponse<{ totalBookings: number; revenue: number }>>(
    '/partners/analytics',
  ),
};