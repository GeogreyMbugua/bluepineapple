import { partnerRepository } from "@blue-pineapple/database";
import { userLifecycleService } from "../users/user-lifecycle.service";
import { sessionRevocationService } from "../auth/revocation/session-revocation.service";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import type {
  PartnerActivatedEvent,
  PartnerSuspendedEvent,
  PartnerTerminatedEvent,
} from "./partner.events";

export class PartnerLifecycleService {
  async activatePartner(partnerId: string, actorId: string | null = null): Promise<void> {
    const partner = await partnerRepository.findById(partnerId);
    if (!partner) throw new Error("Partner not found");

    await partnerRepository.update(partnerId, { status: "ACTIVE" });
    await userLifecycleService.activateUser(partner.userId, actorId);
    await auditService.logRoleAssigned(actorId, partner.userId, "PARTNER_ACTIVATED");

    eventBus.emit("partner.activated", { partnerId, userId: partner.userId } as PartnerActivatedEvent);
  }

  async suspendPartner(partnerId: string, actorId: string | null = null, reason?: string): Promise<void> {
    const partner = await partnerRepository.findById(partnerId);
    if (!partner) throw new Error("Partner not found");

    await partnerRepository.update(partnerId, { status: "SUSPENDED" });
    await userLifecycleService.suspendUser(partner.userId, actorId);
    await sessionRevocationService.revoke(partner.userId, "PARTNER_TERMINATED", reason);
    await auditService.logRoleRemoved(actorId, partner.userId, "PARTNER_SUSPENDED");

    eventBus.emit("partner.suspended", { partnerId, userId: partner.userId, reason } as PartnerSuspendedEvent);
  }

  async terminatePartner(partnerId: string, actorId: string | null = null, reason?: string): Promise<void> {
    const partner = await partnerRepository.findById(partnerId);
    if (!partner) throw new Error("Partner not found");

    await partnerRepository.update(partnerId, { status: "TERMINATED" });
    await userLifecycleService.terminateUser(partner.userId, actorId);
    await sessionRevocationService.revoke(partner.userId, "PARTNER_TERMINATED", reason);
    await auditService.logRoleRemoved(actorId, partner.userId, "PARTNER_TERMINATED");

    eventBus.emit("partner.terminated", { partnerId, userId: partner.userId, reason } as PartnerTerminatedEvent);
  }
}

export const partnerLifecycleService = new PartnerLifecycleService();
