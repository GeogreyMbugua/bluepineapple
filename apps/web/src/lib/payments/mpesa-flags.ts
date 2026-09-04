/**
 * M-Pesa Express (STK) feature flags.
 *
 * Fail-closed: STK only runs when the server flag is exactly `true`.
 * Set both on the host when going live with real Daraja production credentials:
 *
 *   MPESA_STK_ENABLED=true
 *   NEXT_PUBLIC_MPESA_STK_ENABLED=true
 *
 * To park the feature on a live site (e.g. sandbox demo ended):
 *
 *   MPESA_STK_ENABLED=false
 *   NEXT_PUBLIC_MPESA_STK_ENABLED=false
 *
 * Then redeploy. Implementation stays in place.
 */

export function isMpesaStkEnabled(): boolean {
  return process.env.MPESA_STK_ENABLED === 'true';
}

/** Client/UI mirror — must match server intent after rebuild. */
export function isMpesaStkEnabledPublic(): boolean {
  return process.env.NEXT_PUBLIC_MPESA_STK_ENABLED === 'true';
}
