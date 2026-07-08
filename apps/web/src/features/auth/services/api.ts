import type { SuccessResponse } from '@/types/api';
import { apiClient } from '@/services/api';
import type { AuthUser } from '../types';

export const authApi = {
  requestOtp: (data: { channel: 'email' | 'sms'; value: string }) =>
    apiClient.post<SuccessResponse<{ sent: boolean }>>('/auth/otp/request', {
      channel: data.channel,
      value: data.value,
    }),

  verifyOtp: (data: { channel: 'email' | 'sms'; value: string; otp: string }) =>
    apiClient.post<SuccessResponse<{ token: string; refresh_token: string; user: AuthUser }>>(
      '/auth/otp/verify',
      {
        channel: data.channel,
        value: data.value,
        otp: data.otp,
      },
    ),

  refreshSession: () =>
    apiClient.post<SuccessResponse<{ token: string; refresh_token: string; user: AuthUser }>>(
      '/auth/session/refresh',
    ),

  logout: () => apiClient.post<SuccessResponse<null>>('/auth/logout'),

  getCurrentUser: () => apiClient.get<SuccessResponse<AuthUser>>('/auth/me'),
};