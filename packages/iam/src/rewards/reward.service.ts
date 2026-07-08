import { rewardRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import { RewardPolicy } from "../policies/reward.policy";
import type { CreateRewardRuleInput, UpdateRewardRuleInput } from "./reward.validators";
import type {
  RewardCreatedEvent,
  RewardPaidEvent,
  RewardReversedEvent,
  RewardRuleCreatedEvent,
  RewardRuleUpdatedEvent,
} from "./reward.events";
import type { RewardStatus } from "@prisma/client";

export class RewardService {
  async createRewardRule(data: CreateRewardRuleInput): Promise<{ id: string; version: number }> {
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
    } as RewardRuleCreatedEvent);

    return { id: rule.id, version: rule.version };
  }

  async updateRewardRule(id: string, data: UpdateRewardRuleInput): Promise<void> {
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
    } as any);

    auditService.logRoleAssigned("system", id, "REWARD_RULE_UPDATED");

    eventBus.emit("reward.rule.updated", {
      ruleId: id,
      ruleName: existing.name,
      version: existing.version,
    } as RewardRuleUpdatedEvent);
  }

  async deactivateRule(id: string): Promise<void> {
    await rewardRepository.deactivateRule(id);
    auditService.logRoleAssigned("system", id, "REWARD_RULE_DEACTIVATED");
  }

  async createRewardTransaction(
    partnerId: string,
    bookingId: string,
    ruleId: string,
    pointsEarned: number,
    cashValue: number,
    currency: string,
    description: string
  ): Promise<{ id: string }> {
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
    } as RewardCreatedEvent);

    return { id: transaction.id };
  }

  async markRewardPaid(id: string): Promise<{ id: string; status: RewardStatus }> {
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
    } as RewardPaidEvent);

    return { id: updated.id, status: updated.status };
  }

  async approveReward(id: string): Promise<{ id: string; status: RewardStatus }> {
    const existing = await rewardRepository.findById(id);
    if (!existing) {
      throw new Error("Reward transaction not found");
    }
    RewardPolicy.assertCanApprove(existing.status);

    const updated = await rewardRepository.markApproved(id);

    auditService.logRoleAssigned("system", id, "REWARD_APPROVED");

    return { id: updated.id, status: updated.status };
  }

  async reverseReward(
    id: string,
    reason: string,
    actorId?: string
  ): Promise<{ id: string; status: RewardStatus }> {
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
    } as RewardReversedEvent);

    return { id: updated.id, status: updated.status };
  }

  async getReward(id: string) {
    return rewardRepository.findById(id);
  }

  async getPendingRewards(limit = 100) {
    return rewardRepository.findPendingRewards(limit);
  }

  async getPartnerRewards(partnerId: string, limit = 50, offset = 0) {
    return rewardRepository.findByPartner(partnerId, limit, offset);
  }

  async getRewardsByStatus(status: RewardStatus, limit = 100) {
    return rewardRepository.findByStatus(status, limit);
  }

  async listRules(activeOnly = false) {
    return rewardRepository.listRules(activeOnly);
  }

  async getRuleById(ruleId: string) {
    return rewardRepository.findRuleById(ruleId);
  }
}

export const rewardService = new RewardService();
