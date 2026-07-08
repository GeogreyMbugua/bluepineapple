/**
 * Server-side API module.
 *
 * Use this in Server Components, Server Actions, and Route Handlers.
 * It supports Next.js cache and revalidation options.
 */

import { env } from '@/config/env';
import type { ApiRequestConfig } from '@/types/api';
import { fetcher } from './fetcher';

/**
 * Server-side API interface.
 *
 * Provides the same methods as the client module but adds support
 * for Next.js `cache` and `next.revalidate` options.
 */
export const apiServer = {
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
