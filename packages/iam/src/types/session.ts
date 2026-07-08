import type { Role } from "./roles";
import type { Permission } from "./permissions";

/**
 * SessionUser — the authenticated user record stored in a server-side session
 * or attached to a request context after successful authentication.
 *
 * Role and permission fields use the strictly-typed unions derived from
 * @blue-pineapple/shared so the session contract is always in sync with the
 * canonical RBAC definitions.
 */
export interface SessionUser {
  id: string;
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status: string;
  roles: Role[];
  permissions: Permission[];
}

/**
 * Session — wrapper containing the authenticated user and session metadata.
 */
export interface Session {
  user: SessionUser;
  sessionId: string;
  expiresAt: Date;
}
