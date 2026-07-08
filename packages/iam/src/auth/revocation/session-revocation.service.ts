import { revokeAllSessions } from "../session.service";
import { auditService } from "../../audit/audit.service";
import { claimsService } from "../../claims/claims.service";
import { permissionResolver } from "../../authorization/resolvers/permission-resolver";
import { eventBus } from "../../events";

export type RevocationScenario = 
  | "USER_SUSPENDED"
  | "USER_TERMINATED"
  | "PASSWORD_RESET"
  | "ROLE_CHANGED"
  | "MANUAL_ADMIN_REVOCATION"
  | "PARTNER_TERMINATED";

export class SessionRevocationService {
  async revoke(userId: string, scenario: RevocationScenario, reason?: string): Promise<void> {
    await revokeAllSessions(userId);
    await claimsService.invalidateClaims(userId);
    await permissionResolver.invalidate(userId);

    await auditService.logSessionRevoked(userId, "", `${scenario}: ${reason || ""}`);

    eventBus.emit("session.revoked.all", {
      userId,
      scenario,
      ...(reason ? { reason } : {}),
    });
  }
}

export const sessionRevocationService = new SessionRevocationService();
