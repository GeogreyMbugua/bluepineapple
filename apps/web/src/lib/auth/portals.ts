import type { Role } from '@blue-pineapple/iam';

export type Portal = 'admin' | 'partner';

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const satisfies readonly Role[];
export const PARTNER_ROLES = ['PARTNER'] as const satisfies readonly Role[];

const PORTAL_HOME: Record<Portal, string> = {
  admin: '/admin',
  partner: '/partner',
};

export function parsePortal(value: string | null | undefined): Portal | undefined {
  if (value === 'admin' || value === 'partner') return value;
  return undefined;
}

export function getSignInPath(portal?: Portal): string {
  return portal ? `/sign-in?portal=${portal}` : '/sign-in';
}

export function getPortalHome(portal: Portal): string {
  return PORTAL_HOME[portal];
}

export function hasAdminRole(roles: readonly string[]): boolean {
  return roles.some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN');
}

export function hasPartnerRole(roles: readonly string[]): boolean {
  return roles.includes('PARTNER');
}

export function hasPortalRole(roles: readonly string[], portal: Portal): boolean {
  return portal === 'admin' ? hasAdminRole(roles) : hasPartnerRole(roles);
}

export function getPortalRoles(portal: Portal): readonly Role[] {
  return portal === 'admin' ? ADMIN_ROLES : PARTNER_ROLES;
}

/** Route authenticated users to the correct portal based on DB roles. */
export function resolvePortalRedirect(roles: readonly string[]): string | null {
  if (hasAdminRole(roles)) return PORTAL_HOME.admin;
  if (hasPartnerRole(roles)) return PORTAL_HOME.partner;
  return null;
}

export function getRolesFromClerkClaims(
  sessionClaims: Record<string, unknown> | null | undefined,
): string[] {
  const metadata = sessionClaims?.publicMetadata ?? sessionClaims?.public_metadata;
  if (!metadata || typeof metadata !== 'object') return [];

  const roles = (metadata as { roles?: unknown }).roles;
  if (!Array.isArray(roles)) return [];

  return roles.filter((role): role is string => typeof role === 'string');
}
