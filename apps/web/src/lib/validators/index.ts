/**
 * Common validation helpers.
 *
 * For form-level validation use Zod schemas in feature schemas/ directories.
 * These are lightweight runtime checks for guards and conditionals.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Check if a string looks like a valid email address. */
export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/** Check if a string is non-empty after trimming. */
export function isNonEmpty(value: string | null | undefined): value is string {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/** Check if a value is defined (not null or undefined). */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
