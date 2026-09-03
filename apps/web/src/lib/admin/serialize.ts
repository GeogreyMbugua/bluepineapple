/** Coerce Prisma Decimal (or similar) to a JSON-safe number. */
export function toPlainNumber(value: unknown): number | null {
  if (value == null) return null;
  return Number(value);
}

/** Coerce Prisma Decimal (or similar) to a JSON-safe string. */
export function toPlainDecimalString(value: unknown): string {
  if (value == null) return '0';
  return String(value);
}
