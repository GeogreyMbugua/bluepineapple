import { rewardRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import { RewardPolicy } from "../policies/reward.policy";
export class RewardService {
    async createRewardRule(data) {
        const rule = await rewardRepository.createRule({
            name: data.name,
            description: data.description,
            pointsPerBooking: data.pointsPerBooking,
            cashMultiplier: data.cashMultiplier,
            currency: data.currency ?? "KES",
            isActive: true,
            effectiveFrom: data.effectiveFrom,
            effectiveTo: data.effectiveTo,
            minGuests: data.minGuests ?? 1,
            maxGuests: data.maxGuests,
            experienceIds: data.experienceIds ?? [],
            routeIds: data.routeIds ?? [],
        });
        auditService.logRoleAssigned("system", rule.id, "REWARD_RULE_CREATED");
        eventBus.emit("reward.rule.created", {
            ruleId: rule.id,
            ruleName: rule.name,
            version: rule.version,
        });
        return { id: rule.id, version: rule.version };
    }
    async updateRewardRule(id, data) {
        const existing = await rewardRepository.findRuleById(id);
        if (!existing) {
            throw new Error("Reward rule not found");
        }
        await rewardRepository.updateRule(id, {
            name: data.name,
            description: data.description,
            pointsPerBooking: data.pointsPerBooking,
            cashMultiplier: data.cashMultiplier,
            currency: data.currency,
            isActive: data.isActive,
            effectiveFrom: data.effectiveFrom,
            effectiveTo: data.effectiveTo,
            minGuests: data.minGuests,
            maxGuests: data.maxGuests,
            experienceIds: data.experienceIds,
            routeIds: data.routeIds,
        });
        auditService.logRoleAssigned("system", id, "REWARD_RULE_UPDATED");
        eventBus.emit("reward.rule.updated", {
            ruleId: id,
            ruleName: existing.name,
            version: existing.version,
        });
    }
    async deactivateRule(id) {
        await rewardRepository.deactivateRule(id);
        auditService.logRoleAssigned("system", id, "REWARD_RULE_DEACTIVATED");
    }
    async createRewardTransaction(partnerId, bookingId, ruleId, pointsEarned, cashValue, currency, description) {
        const transaction = await rewardRepository.create({
            bookingId,
            partnerId,
            ruleId,
            version: 1,
            pointsEarned,
            cashValue,
            currency,
            status: "PENDING",
            description,
            metadata: {
                createdAt: new Date().toISOString(),
            },
        });
        auditService.logRoleAssigned("system", transaction.id, "REWARD_CREATED");
        eventBus.emit("reward.created", {
            rewardId: transaction.id,
            bookingId,
            partnerId,
            pointsEarned,
            cashValue,
        });
        return { id: transaction.id };
    }
    async markRewardPaid(id) {
        const existing = await rewardRepository.findById(id);
        if (!existing) {
            throw new Error("Reward transaction not found");
        }
        RewardPolicy.assertCanMarkPaid(existing.status);
        const updated = await rewardRepository.markPaid(id);
        auditService.logRoleAssigned("system", id, "REWARD_PAID");
        eventBus.emit("reward.paid", {
            rewardId: id,
            partnerId: existing.partnerId,
            pointsEarned: existing.pointsEarned,
            cashValue: existing.cashValue ?? 0,
        });
        return { id: updated.id, status: updated.status };
    }
    async approveReward(id) {
        const existing = await rewardRepository.findById(id);
        if (!existing) {
            throw new Error("Reward transaction not found");
        }
        RewardPolicy.assertCanApprove(existing.status);
        const updated = await rewardRepository.markApproved(id);
        auditService.logRoleAssigned("system", id, "REWARD_APPROVED");
        return { id: updated.id, status: updated.status };
    }
    async reverseReward(id, reason, actorId) {
        const existing = await rewardRepository.findById(id);
        if (!existing) {
            throw new Error("Reward transaction not found");
        }
        RewardPolicy.assertCanReverse(existing.status);
        const updated = await rewardRepository.reverse(id, reason);
        auditService.logRoleAssigned(actorId ?? "system", id, "REWARD_REVERSED");
        eventBus.emit("reward.reversed", {
            rewardId: id,
            partnerId: existing.partnerId,
            reason,
        });
        return { id: updated.id, status: updated.status };
    }
    async getReward(id) {
        return rewardRepository.findById(id);
    }
    async getPendingRewards(limit = 100) {
        return rewardRepository.findPendingRewards(limit);
    }
    async getPartnerRewards(partnerId, limit = 50, offset = 0) {
        return rewardRepository.findByPartner(partnerId, limit, offset);
    }
    async getRewardsByStatus(status, limit = 100) {
        return rewardRepository.findByStatus(status, limit);
    }
    async listRules(activeOnly = false) {
        return rewardRepository.listRules(activeOnly);
    }
    async getRuleById(ruleId) {
        return rewardRepository.findRuleById(ruleId);
    }
}
export const rewardService = new RewardService();
