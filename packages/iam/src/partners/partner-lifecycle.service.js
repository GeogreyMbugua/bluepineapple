import { partnerRepository } from "@blue-pineapple/database";
import { userLifecycleService } from "../users/user-lifecycle.service";
import { sessionRevocationService } from "../auth/revocation/session-revocation.service";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
export class PartnerLifecycleService {
    async activatePartner(partnerId, actorId = null) {
        const partner = await partnerRepository.findById(partnerId);
        if (!partner)
            throw new Error("Partner not found");
        await partnerRepository.update(partnerId, { status: "ACTIVE" });
        await userLifecycleService.activateUser(partner.userId, actorId);
        await auditService.logRoleAssigned(actorId, partner.userId, "PARTNER_ACTIVATED");
        eventBus.emit("partner.activated", { partnerId, userId: partner.userId });
    }
    async suspendPartner(partnerId, actorId = null, reason) {
        const partner = await partnerRepository.findById(partnerId);
        if (!partner)
            throw new Error("Partner not found");
        await partnerRepository.update(partnerId, { status: "SUSPENDED" });
        await userLifecycleService.suspendUser(partner.userId, actorId);
        await sessionRevocationService.revoke(partner.userId, "PARTNER_TERMINATED", reason);
        await auditService.logRoleRemoved(actorId, partner.userId, "PARTNER_SUSPENDED");
        eventBus.emit("partner.suspended", { partnerId, userId: partner.userId, reason });
    }
    async terminatePartner(partnerId, actorId = null, reason) {
        const partner = await partnerRepository.findById(partnerId);
        if (!partner)
            throw new Error("Partner not found");
        await partnerRepository.update(partnerId, { status: "TERMINATED" });
        await userLifecycleService.terminateUser(partner.userId, actorId);
        await sessionRevocationService.revoke(partner.userId, "PARTNER_TERMINATED", reason);
        await auditService.logRoleRemoved(actorId, partner.userId, "PARTNER_TERMINATED");
        eventBus.emit("partner.terminated", { partnerId, userId: partner.userId, reason });
    }
}
export const partnerLifecycleService = new PartnerLifecycleService();
