/**
 * Class name merge utility.
 *
 * Filters falsy values and joins class names. Lightweight alternative
 * to clsx/classnames — no external dependency needed.
 */
export function cn(...inputs: ReadonlyArray<string | boolean | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}
