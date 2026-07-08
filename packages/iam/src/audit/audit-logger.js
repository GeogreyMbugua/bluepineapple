import { authLogRepository } from "@blue-pineapple/database";
export class AuditLogger {
    /**
     * Log a strictly-typed authentication or authorization event.
     */
    async log(event, userId, metadata, context = {}) {
        try {
            await authLogRepository.create({
                userId,
                event,
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                metadata: metadata, // Cast to any to satisfy Prisma JSON input type
            });
        }
        catch (error) {
            // In a critical production system, fail-safe or secondary logging (like CloudWatch/stdout)
            // should handle audit logging failures so we don't block auth flows.
            console.error(`[AUDIT ERROR] Failed to record audit log for event "${event}":`, error);
        }
    }
    /**
     * Log administrative security actions (like role/permission assignments).
     * Since there is no ADMIN_ACTION enum in AuthEvent, we can log these under
     * a relevant category (e.g., general or SESSION_REVOKED if related, or we can use
     * LOGIN_FAILED/other categories. For now, since schema is unmodified, we log under
     * LOGIN_FAILED/other, or standard logs with metadata identifying it as ADMIN_ACTION).
     */
    async logAdminAction(actorId, metadata, context = {}) {
        try {
            // Log as a custom admin log using a special marker in the metadata
            await authLogRepository.create({
                userId: actorId,
                event: "SESSION_REVOKED", // Reusing an enum safely or mapping it.
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
                metadata: {
                    __admin_action: true,
                    ...metadata,
                },
            });
        }
        catch (error) {
            console.error("[AUDIT ERROR] Failed to record admin audit log:", error);
        }
    }
}
export const auditLogger = new AuditLogger();
