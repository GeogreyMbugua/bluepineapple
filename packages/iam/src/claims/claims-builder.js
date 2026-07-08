import { userRepository } from "@blue-pineapple/database";
import { PERMISSIONS } from "@blue-pineapple/shared/rbac";
export class ClaimsBuilder {
    async build(userId, sessionId) {
        const user = await userRepository.findByIdWithRolesAndPermissions(userId);
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }
        const roles = user.roles;
        const rawPermissions = user.permissions;
        const permissions = this.resolvePermissions(rawPermissions, roles);
        const claims = {
            sub: user.id,
            sessionId,
            roles,
            permissions,
            userType: this.deriveUserType(user),
            email: user.email ?? undefined,
            phone: user.phone ?? undefined,
        };
        return Object.freeze(claims);
    }
    resolvePermissions(rawPermissions, roles) {
        const isSuperAdmin = roles.includes("SUPER_ADMIN");
        if (isSuperAdmin) {
            return [...PERMISSIONS];
        }
        return rawPermissions;
    }
    deriveUserType(user) {
        if (user.roles.includes("ADMIN"))
            return "ADMIN";
        if (user.roles.includes("PARTNER"))
            return "PARTNER";
        return user.email ? "USER" : "GUEST";
    }
}
export const claimsBuilder = new ClaimsBuilder();
