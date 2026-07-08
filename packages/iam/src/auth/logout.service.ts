import { auditService } from "../audit/audit.service";
import { revokeSession } from "./session.service";
import { eventBus } from "../events";

export class LogoutService {
  async logout(userId: string, sessionId: string): Promise<void> {
    await revokeSession(sessionId);
    await auditService.logLogout(userId, sessionId);
    eventBus.emit("session.revoked", { userId, sessionId, reason: "logout" });
  }
}

export const logoutService = new LogoutService();
