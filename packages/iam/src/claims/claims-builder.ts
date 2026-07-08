import type { JwtClaims } from "./claims.types";
import { userRepository } from "@blue-pineapple/database";
import type { Role } from "../types/roles";
import type { Permission } from "../types/permissions";
import { PERMISSIONS } from "@blue-pineapple/shared/rbac";

export class ClaimsBuilder {
  async build(userId: string, sessionId: string): Promise<JwtClaims> {
    const user = await userRepository.findByIdWithRolesAndPermissions(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const roles = user.roles as Role[];
    const rawPermissions = user.permissions as Permission[];
    const permissions = this.resolvePermissions(rawPermissions, roles);

    const claims: JwtClaims = {
      sub: user.id,
      sessionId,
      roles,
      permissions,
      userType: this.deriveUserType(user),
      ...(user.email ? { email: user.email } : {}),
      ...(user.phone ? { phone: user.phone } : {}),
    };

    return Object.freeze(claims);
  }

  private resolvePermissions(rawPermissions: Permission[], roles: Role[]): Permission[] {
    const isSuperAdmin = roles.includes("SUPER_ADMIN");
    if (isSuperAdmin) {
      return [...PERMISSIONS];
    }
    return rawPermissions;
  }

  private deriveUserType(user: { roles: string[]; email?: string | null; phone?: string | null }): string {
    if (user.roles.includes("ADMIN")) return "ADMIN";
    if (user.roles.includes("PARTNER")) return "PARTNER";
    return user.email ? "USER" : "GUEST";
  }
}

export const claimsBuilder = new ClaimsBuilder();
