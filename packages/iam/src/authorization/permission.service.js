import { hasPermission, hasAnyPermission, hasAllPermissions } from "./has-permission";
export class PermissionService {
    /**
     * Checks if the user has the specified permission.
     */
    hasPermission(user, permission) {
        return hasPermission(user, permission);
    }
    /**
     * Checks if the user has any of the specified permissions.
     */
    hasAnyPermission(user, permissions) {
        return hasAnyPermission(user, permissions);
    }
    /**
     * Checks if the user has all of the specified permissions.
     */
    hasAllPermissions(user, permissions) {
        return hasAllPermissions(user, permissions);
    }
}
export const permissionService = new PermissionService();
