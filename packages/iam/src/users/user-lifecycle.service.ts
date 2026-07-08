import { userRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { revokeAllSessions } from "../auth/session.service";
import { claimsService } from "../claims/claims.service";
import { eventBus } from "../events";
import type { UserProfileUpdate } from "./user.types";

export class UserLifecycleService {
  async activateUser(userId: string, actorId: string | null = null): Promise<void> {
    await userRepository.update(userId, { status: "ACTIVE" });
    await auditService.logRoleAssigned(actorId, userId, "ACTIVATE_USER");
    eventBus.emit("user.activated", { userId });
  }

  async suspendUser(userId: string, actorId: string | null = null): Promise<void> {
    await userRepository.update(userId, { status: "SUSPENDED" });
    await revokeAllSessions(userId);
    await claimsService.invalidateClaims(userId);
    await auditService.logRoleRemoved(actorId, userId, "SUSPEND_USER");
    eventBus.emit("user.suspended", { userId });
  }

  async terminateUser(userId: string, actorId: string | null = null): Promise<void> {
    await userRepository.update(userId, { status: "INACTIVE" });
    await revokeAllSessions(userId);
    await claimsService.invalidateClaims(userId);
    await auditService.logRoleRemoved(actorId, userId, "TERMINATE_USER");
    eventBus.emit("user.terminated", { userId });
  }

  async verifyEmail(userId: string, actorId: string | null = null): Promise<void> {
    await userRepository.update(userId, { emailVerifiedAt: new Date() });
    await claimsService.invalidateClaims(userId);
    await auditService.logRoleAssigned(actorId, userId, "VERIFY_EMAIL");
    eventBus.emit("user.verified", { userId, method: "email" });
  }

  async verifyPhone(userId: string, actorId: string | null = null): Promise<void> {
    await userRepository.update(userId, { phoneVerifiedAt: new Date() });
    await claimsService.invalidateClaims(userId);
    await auditService.logRoleAssigned(actorId, userId, "VERIFY_PHONE");
    eventBus.emit("user.verified", { userId, method: "phone" });
  }

  async updateProfile(userId: string, profile: UserProfileUpdate): Promise<void> {
    await userRepository.update(userId, profile);
    await claimsService.invalidateClaims(userId);
  }
}

export const userLifecycleService = new UserLifecycleService();
