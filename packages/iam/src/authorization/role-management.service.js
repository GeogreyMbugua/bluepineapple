import { userRepository } from "@blue-pineapple/database";
import { permissionResolver } from "./resolvers/permission-resolver";
import { claimsService } from "../claims/claims.service";
import { revokeAllSessions } from "../auth/session.service";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
export class RoleManagementService {
    async assignRole(userId, roleName, actorId = null) {
        await userRepository.assignRole(userId, roleName);
        await revokeAllSessions(userId);
        await claimsService.invalidateClaims(userId);
        await permissionResolver.invalidate(userId);
        await auditService.logRoleAssigned(actorId, userId, roleName);
        eventBus.emit("role.assigned", { userId, role: roleName, assignedBy: actorId ?? "" });
    }
    async removeRole(userId, roleName, actorId = null) {
        await userRepository.removeRole(userId, roleName);
        await revokeAllSessions(userId);
        await claimsService.invalidateClaims(userId);
        await permissionResolver.invalidate(userId);
        await auditService.logRoleRemoved(actorId, userId, roleName);
        eventBus.emit("role.removed", { userId, role: roleName, removedBy: actorId ?? "" });
    }
}
export const roleManagementService = new RoleManagementService();
