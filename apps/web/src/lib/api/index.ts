/**
 * API utility helpers.
 *
 * Query string builders, header constructors, and other low-level
 * helpers used by the service layer.
 */

/**
 * Build a query string from an object, filtering out undefined values.
 */
export function toQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  }

  const result = searchParams.toString();
  return result ? `?${result}` : '';
}

/**
 * Create authorization headers from a token.
 */
export function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
