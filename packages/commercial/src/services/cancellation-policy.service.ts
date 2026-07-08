import { prisma } from "@blue-pineapple/database";
import { cancellationPolicyRepository } from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CancellationPolicy } from "../policies";
import type { CancellationPolicyCreatedEvent, CancellationPolicyAppliedEvent } from "../events/commercial.events";
import type { CancellationResult } from "../domain/commercial.types";

export class CancellationPolicyService {
  private convertPolicy(policy: any): any {
    if (!policy) return policy;
    const converted: any = { ...policy };
    if (policy.refundPercentage !== undefined && policy.refundPercentage !== null) {
      converted.refundPercentage = Number(policy.refundPercentage);
    }
    if (policy.penaltyAmount !== undefined && policy.penaltyAmount !== null) {
      converted.penaltyAmount = Number(policy.penaltyAmount);
    }
    if (policy.administrativeFee !== undefined && policy.administrativeFee !== null) {
      converted.administrativeFee = Number(policy.administrativeFee);
    }
    return converted;
  }

  async create(input: {
    name: string;
    description?: string;
    experienceId?: string;
    partnerId?: string;
    corporateId?: string;
    windowType: string;
    hoursBefore: number;
    refundPercentage: number;
    penaltyAmount?: number;
    penaltyType?: string;
    administrativeFee?: number;
    allowRefund?: boolean;
    isDefault?: boolean;
    priority?: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
  }, actorId?: string) {
    CancellationPolicy.assertValidWindow(input.windowType);

    if (input.isDefault) {
      const existingDefault = await cancellationPolicyRepository.findDefault(input.experienceId);
      if (existingDefault) {
        throw new Error("Cannot have multiple default policies");
      }
    }

    const policy = await cancellationPolicyRepository.create({
      name: input.name,
      description: input.description,
      experienceId: input.experienceId,
      partnerId: input.partnerId,
      corporateId: input.corporateId,
      windowType: input.windowType,
      hoursBefore: input.hoursBefore,
      refundPercentage: input.refundPercentage,
      penaltyAmount: input.penaltyAmount,
      penaltyType: input.penaltyType,
      administrativeFee: input.administrativeFee,
      allowRefund: input.allowRefund,
      isDefault: input.isDefault,
      priority: input.priority,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: policy.id,
      action: "CANCELLATION_POLICY_CREATED",
      details: { name: policy.name, windowType: policy.windowType },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("cancellation.policy.created", {
      policyId: policy.id,
      policyName: policy.name,
    } as CancellationPolicyCreatedEvent);

    return this.convertPolicy(policy);
  }

  async findById(id: string) {
    const policy = await cancellationPolicyRepository.findById(id);
    return this.convertPolicy(policy);
  }

  async findApplicable(experienceId?: string, partnerId?: string, corporateId?: string, hoursBefore?: number) {
    const policy = await prisma.cancellationPolicy.findFirst({
      where: {
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } },
        ],
        ...(experienceId ? { experienceId } : { experienceId: null }),
        ...(partnerId ? { partnerId } : { partnerId: null }),
        ...(corporateId ? { corporateId } : { corporateId: null }),
        ...(hoursBefore !== undefined ? { hoursBefore: { lte: hoursBefore } } : {}),
      },
      orderBy: { priority: "desc" },
    });
    return this.convertPolicy(policy);
  }

  async findDefault(experienceId?: string) {
    const policy = await cancellationPolicyRepository.findDefault(experienceId);
    return this.convertPolicy(policy);
  }

  async findByExperience(experienceId: string) {
    const policies = await cancellationPolicyRepository.findByExperience(experienceId);
    return policies.map((p: any) => this.convertPolicy(p));
  }

  async evaluateCancellation(bookingCreatedAt: Date, departureDateTime: Date, policyOrId?: any): Promise<CancellationResult> {
    let policy = policyOrId;
    if (typeof policyOrId === "string") {
      policy = await cancellationPolicyRepository.findById(policyOrId);
      if (!policy) {
        throw new Error("Cancellation policy not found");
      }
    }

    const diffMs = departureDateTime.getTime() - bookingCreatedAt.getTime();
    const hoursBefore = Math.floor(diffMs / (1000 * 60 * 60));

    return {
      policyId: policy.id,
      policyName: policy.name,
      hoursBefore,
      refundPercentage: Number(policy.refundPercentage),
      penaltyAmount: policy.penaltyAmount ? Number(policy.penaltyAmount) : 0,
      administrativeFee: policy.administrativeFee ? Number(policy.administrativeFee) : 0,
      refundAmount: 0,
      currency: "KES",
    };
  }
}

export const cancellationPolicyService = new CancellationPolicyService();
