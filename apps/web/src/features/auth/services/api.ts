import type { SuccessResponse } from '@/types/api';
import { apiClient } from '@/services/api';
import type { AuthUser } from '../types';

export const authApi = {
  requestOtp: (data: { identifier: string }) =>
    apiClient.post<SuccessResponse<{ sent: boolean }>>('/auth/otp/request', {
      identifier: data.identifier,
    }),

  verifyOtp: (data: { identifier: string; otpCode: string }) =>
    apiClient.post<SuccessResponse<{ user: AuthUser; expiresAt: number }>>(
      '/auth/otp/verify',
      {
        identifier: data.identifier,
        otpCode: data.otpCode,
      },
    ),

  refreshSession: () =>
    apiClient.post<SuccessResponse<{ user: AuthUser; expiresAt: number }>>(
      '/auth/session/refresh',
    ),

  logout: () => apiClient.post<SuccessResponse<null>>('/auth/logout'),

  getCurrentUser: () => apiClient.get<SuccessResponse<AuthUser>>('/auth/me'),
};
