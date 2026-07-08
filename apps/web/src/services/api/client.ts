/**
 * Client-side API module.
 *
 * Use this in Client Components and client-side hooks. It reads the
 * base URL from the public environment variable.
 */

import { env } from '@/config/env';
import type { ApiRequestConfig } from '@/types/api';
import { fetcher } from './fetcher';

/**
 * Client-side API interface.
 *
 * All client-side data fetching should go through these methods
 * rather than calling fetch() directly.
 */
export const apiClient = {
  get<T>(path: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return fetcher<T>(env.NEXT_PUBLIC_API_URL, path, { ...config, method: 'GET' });
  },

  post<T>(path: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return fetcher<T>(env.NEXT_PUBLIC_API_URL, path, { ...config, method: 'POST', body });
  },

  put<T>(path: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return fetcher<T>(env.NEXT_PUBLIC_API_URL, path, { ...config, method: 'PUT', body });
  },

  patch<T>(path: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return fetcher<T>(env.NEXT_PUBLIC_API_URL, path, { ...config, method: 'PATCH', body });
  },

  delete<T>(path: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return fetcher<T>(env.NEXT_PUBLIC_API_URL, path, { ...config, method: 'DELETE' });
  },
};
