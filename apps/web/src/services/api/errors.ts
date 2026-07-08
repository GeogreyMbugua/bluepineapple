/**
 * Typed API error classes.
 *
 * All API errors are instances of these classes so consumers can use
 * `instanceof` checks for granular error handling.
 */

/** Base API error */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode: number, code: string = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/** Network-level failure (DNS, timeout, offline) */
export class NetworkError extends ApiError {
  constructor(message: string = 'A network error occurred. Please check your connection.') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/** 401 — authentication required or session expired */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required. Please sign in.') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/** 403 — insufficient permissions */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'You do not have permission to perform this action.') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/** 404 — resource not found */
export class NotFoundError extends ApiError {
  constructor(message: string = 'The requested resource was not found.') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/** 409 — resource conflict */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists or conflicts with current state.') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

/** 429 — rate limit exceeded */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded. Please try again later.') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

/** 500 — internal server error */
export class InternalServerError extends ApiError {
  constructor(message: string = 'An internal server error occurred. Please try again later.') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    this.name = 'InternalServerError';
  }
}

/** 422 — request validation failed */
export class ValidationError extends ApiError {
  readonly fieldErrors: readonly FieldError[];

  constructor(
    message: string = 'Validation failed.',
    fieldErrors: readonly FieldError[] = [],
  ) {
    super(message, 422, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/** Individual field error */
export interface FieldError {
  readonly field: string;
  readonly message: string;
}

/**
 * Parse an HTTP response into the appropriate error class.
 */
export function parseApiError(status: number, body: unknown): ApiError {
  const message =
    typeof body === 'object' && body !== null && 'error' in body
      ? String((body as Record<string, unknown>).error)
      : `Request failed with status ${status}`;

  switch (status) {
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message);
    case 422:
      return new ValidationError(message);
    case 429:
      return new RateLimitError(message);
    case 500:
      return new InternalServerError(message);
    default:
      return new ApiError(message, status);
  }
}
