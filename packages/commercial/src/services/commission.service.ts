import { prisma } from "@blue-pineapple/database";
import {
  commissionRuleRepository,
  commissionCalculationRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CommissionPolicy } from "../policies";
import type {
  CommissionCalculatedEvent,
  CommissionPaidEvent,
} from "../events/commercial.events";
import type { CommissionBreakdown } from "../domain/commercial.types";

export class CommissionService {
  private convertCommissionRule(rule: any): any {
    if (!rule) return rule;
    const converted: any = { ...rule };
    if (rule.rate !== undefined && rule.rate !== null) {
      converted.rate = Number(rule.rate);
    }
    if (rule.fixedAmount !== undefined && rule.fixedAmount !== null) {
      converted.fixedAmount = Number(rule.fixedAmount);
    }
    return converted;
  }

  private convertCommissionCalculation(calc: any): any {
    if (!calc) return calc;
    const converted: any = { ...calc };
    if (calc.baseAmount !== undefined && calc.baseAmount !== null) {
      converted.baseAmount = Number(calc.baseAmount);
    }
    if (calc.commissionAmount !== undefined && calc.commissionAmount !== null) {
      converted.commissionAmount = Number(calc.commissionAmount);
    }
    return converted;
  }

  async createCommissionRule(input: any, actorId?: string) {
    CommissionPolicy.assertValidType(input.type);

    const rule = await commissionRuleRepository.create(input);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: rule.id,
      action: "COMMISSION_RULE_CREATED",
      details: { name: rule.name, type: rule.type },
      actorId: actorId ?? undefined,
    });

    return this.convertCommissionRule(rule);
  }

  async findActiveRules(type?: string) {
    const rules = await commissionRuleRepository.findActive(type);
    return rules.map((r: any) => this.convertCommissionRule(r));
  }

  async calculateCommission(
    bookingId: string,
    baseAmount: number,
    partnerId?: string,
    type?: string,
    actorId?: string
  ): Promise<CommissionBreakdown> {
    const rules = await commissionRuleRepository.findActive(type);
    const rule = rules.find((r: any) => CommissionPolicy.canCalculate(r, baseAmount));
    if (!rule) {
      throw new Error("No applicable commission rule found");
    }

    let commissionAmount: number;
    if (rule.isPercentage) {
      commissionAmount = (baseAmount * Number(rule.rate)) / 100;
    } else {
      commissionAmount = Number(rule.fixedAmount) ?? 0;
    }

    const calculation = await commissionCalculationRepository.create({
      commissionRuleId: rule.id,
      bookingId,
      partnerId,
      baseAmount,
      commissionAmount,
      currency: "KES",
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: calculation.id,
      action: "COMMISSION_CALCULATED",
      details: {
        bookingId,
        commissionAmount: commissionAmount.toFixed(2),
        partnerId,
        type: rule.type,
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("commission.calculated", {
      commissionCalculationId: calculation.id,
      partnerId,
      commissionAmount,
      currency: "KES",
      type: rule.type,
    } as CommissionCalculatedEvent);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.type,
      rate: Number(rule.rate),
      baseAmount,
      commissionAmount,
      currency: "KES",
    };
  }

  async markAsPaid(commissionCalculationId: string, actorId?: string) {
    const calculation = await commissionCalculationRepository.findById(commissionCalculationId);
    if (!calculation) {
      throw new Error("Commission calculation not found");
    }

    const updated = await prisma.commissionCalculation.update({
      where: { id: commissionCalculationId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: commissionCalculationId,
      action: "COMMISSION_PAID",
      details: {
        commissionCalculationId,
        commissionAmount: Number(calculation.commissionAmount).toFixed(2),
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("commission.paid", {
      commissionCalculationId,
      partnerId: calculation.partnerId,
      commissionAmount: Number(calculation.commissionAmount),
      currency: calculation.currency,
    } as CommissionPaidEvent);

    return this.convertCommissionCalculation(updated);
  }

  async findByPartner(partnerId: string) {
    return commissionCalculationRepository.findByPartner(partnerId);
  }

  async findByBooking(bookingId: string) {
    return commissionCalculationRepository.findByBooking(bookingId);
  }

  async findById(id: string) {
    return commissionCalculationRepository.findById(id);
  }
}

export const commissionService = new CommissionService();
