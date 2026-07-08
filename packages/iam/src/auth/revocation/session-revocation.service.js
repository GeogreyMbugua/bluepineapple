import { revokeAllSessions } from "../session.service";
import { auditService } from "../../audit/audit.service";
import { claimsService } from "../../claims/claims.service";
import { permissionResolver } from "../../authorization/resolvers/permission-resolver";
import { eventBus } from "../../events";
export class SessionRevocationService {
    async revoke(userId, scenario, reason) {
        await revokeAllSessions(userId);
        await claimsService.invalidateClaims(userId);
        await permissionResolver.invalidate(userId);
        const event = "SESSION_REVOKED";
        await auditService.logSessionRevoked(userId, "", `${scenario}: ${reason || ""}`);
        eventBus.emit("session.revoked.all", { userId, scenario, reason });
    }
}
export const sessionRevocationService = new SessionRevocationService();
