/**
 * Shared fetch wrapper.
 *
 * Both the client-side and server-side API modules delegate to this
 * function. It handles JSON parsing, error mapping, and timeouts.
 */

import { ApiError, NetworkError, parseApiError } from './errors';
import type { ApiRequestConfig } from '@/types/api';

/** Default request timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Build a URL with query parameters.
 */
function buildUrl(base: string, path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, base);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

/**
 * Core fetch function used by both client and server modules.
 *
 * @template T - Expected response body type
 * @param baseUrl - API base URL
 * @param path - Endpoint path (e.g., '/users')
 * @param config - Request configuration
 * @returns Parsed response data
 * @throws {ApiError} on non-2xx responses
 * @throws {NetworkError} on network failures
 */
export async function fetcher<T>(
  baseUrl: string,
  path: string,
  config: ApiRequestConfig = {},
): Promise<T> {
  const { method = 'GET', headers = {}, body, params, signal, cache, next } = config;

  const url = buildUrl(baseUrl, path, params);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  // Merge external signal with our timeout controller
  const mergedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;

  try {
    const init: RequestInit & { next?: globalThis.NextFetchRequestConfig } = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers,
      },
      signal: mergedSignal,
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }
    if (cache !== undefined) {
      init.cache = cache;
    }
    if (next !== undefined) {
      init.next = next;
    }

    const response = await fetch(url, init);

    // Empty response (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw parseApiError(response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new NetworkError('Request timed out.');
    }

    throw new NetworkError(
      error instanceof Error ? error.message : 'An unexpected network error occurred.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
