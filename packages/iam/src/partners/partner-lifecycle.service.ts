import { prisma } from "@blue-pineapple/database";
import { sessionRevocationService } from "../auth/revocation/session-revocation.service";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import { PartnerPolicy } from "../policies";
import type {
  PartnerActivatedEvent,
  PartnerSuspendedEvent,
  PartnerTerminatedEvent,
} from "./partner.events";

export class PartnerLifecycleService {
  async activatePartner(partnerId: string, actorId: string | null = null): Promise<void> {
    const result = await this.transition(partnerId, "ACTIVE", actorId);
    await auditService.logRoleAssigned(actorId, result.userId, "PARTNER_ACTIVATED");

    eventBus.emit("partner.activated", result as PartnerActivatedEvent);
  }

  async suspendPartner(partnerId: string, actorId: string | null = null, reason?: string): Promise<void> {
    const result = await this.transition(partnerId, "SUSPENDED", actorId, reason);
    await sessionRevocationService.revoke(result.userId, "PARTNER_TERMINATED", reason);
    await auditService.logRoleRemoved(actorId, result.userId, "PARTNER_SUSPENDED");

    eventBus.emit("partner.suspended", { ...result, reason } as PartnerSuspendedEvent);
  }

  async terminatePartner(partnerId: string, actorId: string | null = null, reason?: string): Promise<void> {
    const result = await this.transition(partnerId, "TERMINATED", actorId, reason);
    await sessionRevocationService.revoke(result.userId, "PARTNER_TERMINATED", reason);
    await auditService.logRoleRemoved(actorId, result.userId, "PARTNER_TERMINATED");

    eventBus.emit("partner.terminated", { ...result, reason } as PartnerTerminatedEvent);
  }

  private async transition(
    partnerId: string,
    nextStatus: "PENDING" | "ACTIVE" | "SUSPENDED" | "TERMINATED",
    actorId: string | null,
    reason?: string,
  ): Promise<{ partnerId: string; userId: string }> {
    return prisma.$transaction(async (tx) => {
      const partner = await tx.partnerProfile.findUnique({
        where: { id: partnerId },
      });
      if (!partner) throw new Error("Partner not found");

      PartnerPolicy.assertTransition(partner.status, nextStatus);

      const userStatus =
        nextStatus === "ACTIVE"
          ? "ACTIVE"
          : nextStatus === "SUSPENDED"
            ? "SUSPENDED"
            : nextStatus === "TERMINATED"
              ? "INACTIVE"
              : "PENDING_VERIFICATION";

      await tx.partnerProfile.update({
        where: { id: partnerId },
        data: { status: nextStatus },
      });
      await tx.user.update({
        where: { id: partner.userId },
        data: { status: userStatus },
      });
      await tx.partnerStatusHistory.create({
        data: {
          partnerId,
          oldStatus: partner.status,
          newStatus: nextStatus,
          reason: reason ?? null,
          changedByUserId: actorId,
        },
      });

      return { partnerId, userId: partner.userId };
    });
  }
}

export const partnerLifecycleService = new PartnerLifecycleService();
