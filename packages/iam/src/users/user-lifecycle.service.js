import { userRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { revokeAllSessions } from "../auth/session.service";
import { claimsService } from "../claims/claims.service";
import { eventBus } from "../events";
export class UserLifecycleService {
    async activateUser(userId, actorId = null) {
        await userRepository.update(userId, { status: "ACTIVE" });
        await auditService.logRoleAssigned(actorId, userId, "ACTIVATE_USER");
        eventBus.emit("user.activated", { userId });
    }
    async suspendUser(userId, actorId = null) {
        await userRepository.update(userId, { status: "SUSPENDED" });
        await revokeAllSessions(userId);
        await claimsService.invalidateClaims(userId);
        await auditService.logRoleRemoved(actorId, userId, "SUSPEND_USER");
        eventBus.emit("user.suspended", { userId });
    }
    async terminateUser(userId, actorId = null) {
        await userRepository.update(userId, { status: "INACTIVE" });
        await revokeAllSessions(userId);
        await claimsService.invalidateClaims(userId);
        await auditService.logRoleRemoved(actorId, userId, "TERMINATE_USER");
        eventBus.emit("user.terminated", { userId });
    }
    async verifyEmail(userId, actorId = null) {
        await userRepository.update(userId, { emailVerifiedAt: new Date() });
        await claimsService.invalidateClaims(userId);
        await auditService.logRoleAssigned(actorId, userId, "VERIFY_EMAIL");
        eventBus.emit("user.verified", { userId, method: "email" });
    }
    async verifyPhone(userId, actorId = null) {
        await userRepository.update(userId, { phoneVerifiedAt: new Date() });
        await claimsService.invalidateClaims(userId);
        await auditService.logRoleAssigned(actorId, userId, "VERIFY_PHONE");
        eventBus.emit("user.verified", { userId, method: "phone" });
    }
    async updateProfile(userId, profile) {
        await userRepository.update(userId, profile);
        await claimsService.invalidateClaims(userId);
    }
}
export const userLifecycleService = new UserLifecycleService();
