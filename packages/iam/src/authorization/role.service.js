import { hasRole, hasAnyRole, hasAllRoles, isSuperAdmin } from "./has-role";
export class RoleService {
    /**
     * Checks if the user has the specified role.
     */
    hasRole(user, role) {
        return hasRole(user, role);
    }
    /**
     * Checks if the user has any of the specified roles.
     */
    hasAnyRole(user, roles) {
        return hasAnyRole(user, roles);
    }
    /**
     * Checks if the user has all of the specified roles.
     */
    hasAllRoles(user, roles) {
        return hasAllRoles(user, roles);
    }
    /**
     * Checks if the user is a super admin.
     */
    isSuperAdmin(user) {
        return isSuperAdmin(user);
    }
}
export const roleService = new RoleService();
