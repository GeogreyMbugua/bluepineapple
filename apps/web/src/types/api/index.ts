/**
 * API request, response, and envelope types.
 *
 * Every API call should return data shaped by these types so the frontend
 * can handle success, pagination, and errors uniformly.
 */

// Existing types to prevent breaking current code
export interface ApiResponse<T> {
  readonly data: T;
  readonly message?: string;
  readonly timestamp: string;
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly pagination: PaginationMeta;
  readonly timestamp: string;
}

export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

export interface ApiErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly ApiValidationError[];
  };
  readonly timestamp: string;
}

export interface ApiValidationError {
  readonly field: string;
  readonly message: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  readonly method?: HttpMethod;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly params?: Record<string, string | number | boolean | undefined>;
  readonly signal?: AbortSignal;
  readonly cache?: RequestCache;
  readonly next?: globalThis.NextFetchRequestConfig;
}

// New shared request/response types requested in Phase 1B
export interface Pagination {
  readonly page: number;
  readonly limit: number;
}

export interface Cursor {
  readonly cursor: string | null;
  readonly limit: number;
}

export interface ErrorResponse {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly ValidationError[];
  };
  readonly timestamp: string;
}

export interface SuccessResponse<T> {
  readonly data: T;
  readonly message?: string;
  readonly timestamp: string;
}

export interface ApiMeta {
  readonly page?: number;
  readonly pageSize?: number;
  readonly totalItems?: number;
  readonly totalPages?: number;
  readonly hasNextPage?: boolean;
  readonly hasPreviousPage?: boolean;
}

export interface ApiList<T> {
  readonly data: readonly T[];
  readonly meta: ApiMeta;
  readonly timestamp: string;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
}
