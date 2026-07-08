import type { Role } from "../types/roles";
import type { Permission } from "../types/permissions";

export interface JwtClaims {
  sub: string;
  sessionId: string;

  roles: Role[];
  permissions: Permission[];

  userType: string;

  email?: string;
  phone?: string;
}

export type JwtClaimsBase = Omit<JwtClaims, "sessionId">;
