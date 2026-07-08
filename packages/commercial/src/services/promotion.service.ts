import { prisma } from "@blue-pineapple/database";
import {
  promotionRepository,
  promotionRuleRepository,
  promotionUsageRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { PromotionPolicy } from "../policies";
import type {
  PromotionApplication,
  PromotionValidationResult,
} from "../domain/commercial.types";

type CreatePromotionInput = {
  name: string;
  description?: string;
  code: string;
  type: string;
  stackability?: string;
  discountValue: number;
  isPercentage?: boolean;
  maxDiscountAmount?: number | null;
  minPurchaseAmount?: number | null;
  maxUsageCount?: number | null;
  perUserLimit?: number | null;
  applicableTo?: any;
  metadata?: any;
  effectiveFrom: Date;
  effectiveTo: Date;
  createdBy?: string | null;
  rules?: Array<{
    ruleType: string;
    conditions: any;
    priority?: number;
    isActive?: boolean;
  }>;
};

type UpdatePromotionInput = {
  name?: string;
  description?: string | null;
  status?: string;
  stackability?: string;
  discountValue?: number;
  isPercentage?: boolean;
  maxDiscountAmount?: number | null;
  minPurchaseAmount?: number | null;
  maxUsageCount?: number | null;
  perUserLimit?: number | null;
  applicableTo?: any;
  metadata?: any;
  effectiveFrom?: Date;
  effectiveTo?: Date;
};

export class PromotionService {
  private convertPromotion(promotion: any): any {
    if (!promotion) return promotion;
    const converted: any = {
      ...promotion,
      discountValue: Number(promotion.discountValue),
      maxDiscountAmount: promotion.maxDiscountAmount
        ? Number(promotion.maxDiscountAmount)
        : undefined,
      minPurchaseAmount: promotion.minPurchaseAmount
        ? Number(promotion.minPurchaseAmount)
        : undefined,
    };
    if (promotion.usages && Array.isArray(promotion.usages)) {
      converted.usages = promotion.usages.map((usage: any) => ({
        ...usage,
        discountApplied: Number(usage.discountApplied),
      }));
    }
    return converted;
  }

  async create(input: CreatePromotionInput, actorId?: string): Promise<any> {
    PromotionPolicy.assertValidType(input.type);

    const existing = await promotionRepository.findByCode(input.code);
    if (existing) {
      throw new Error(`Promotion code ${input.code} already exists`);
    }

    const promotion = await prisma.$transaction(async (tx) => {
      const created = await tx.promotion.create({
        data: {
          name: input.name,
          code: input.code,
          description: input.description,
          type: input.type as any,
          stackability: input.stackability as any,
          discountValue: input.discountValue,
          isPercentage: input.isPercentage,
          maxDiscountAmount: input.maxDiscountAmount,
          minPurchaseAmount: input.minPurchaseAmount,
          maxUsageCount: input.maxUsageCount,
          perUserLimit: input.perUserLimit,
          applicableTo: input.applicableTo as any,
          metadata: input.metadata as any,
          effectiveFrom: input.effectiveFrom,
          effectiveTo: input.effectiveTo,
          createdBy: input.createdBy,
        } as any,
        include: {
          rules: true,
        },
      });

      if (input.rules && input.rules.length > 0) {
        await tx.promotionRule.createMany({
          data: input.rules.map((rule) => ({
            promotionId: created.id,
            ruleType: rule.ruleType as any,
            conditions: rule.conditions,
            priority: rule.priority,
            isActive: rule.isActive,
          })) as any,
        });
      }

      return created;
    });

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: promotion.id,
      action: "PROMOTION_CREATED",
      details: {},
      actorId: actorId ?? undefined,
    });

    eventBus.emit("promotion.created" as any, {
      promotionId: promotion.id,
      promotionName: promotion.name,
      code: promotion.code,
    });

    return this.convertPromotion(promotion);
  }

  async validatePromotion(
    code: string,
    context: any
  ): Promise<PromotionValidationResult> {
    const promotion = await promotionRepository.findByCode(code);

    if (!promotion) {
      const result: PromotionValidationResult = {
        isValid: false,
        reason: "Promotion not found",
      };
      eventBus.emit("promotion.rejected" as any, {
        code,
        reason: "Promotion not found",
      });
      auditLogger.logAdminAction("system", {
        targetUserId: "unknown",
        action: "PROMOTION_REJECTED",
        details: {},
      });
      return result;
    }

    if (!PromotionPolicy.isWithinValidityPeriod(promotion)) {
      const result: PromotionValidationResult = {
        isValid: false,
        reason: "Promotion is not within validity period",
      };
      eventBus.emit("promotion.rejected" as any, {
        code,
        reason: "Promotion is not within validity period",
      });
      return result;
    }

    PromotionPolicy.assertNotExhausted(promotion);

    if (
      promotion.maxUsageCount !== null &&
      promotion.maxUsageCount !== undefined &&
      promotion.usageCount >= promotion.maxUsageCount
    ) {
      const result: PromotionValidationResult = {
        isValid: false,
        reason: "Promotion has been exhausted",
      };
      eventBus.emit("promotion.rejected" as any, {
        code,
        reason: "Promotion has been exhausted",
      });
      return result;
    }

    const bookingAmount = context.bookingAmount;
    if (!PromotionPolicy.canApply(promotion, bookingAmount)) {
      const result: PromotionValidationResult = {
        isValid: false,
        reason: "Promotion cannot be applied to this amount",
      };
      eventBus.emit("promotion.rejected" as any, {
        code,
        reason: "Promotion cannot be applied",
      });
      return result;
    }

    const existingCodes = context.existingPromotionCodes ?? [];
    if (!PromotionPolicy.isStackable(code, existingCodes)) {
      const result: PromotionValidationResult = {
        isValid: false,
        reason: "Promotion is not stackable",
      };
      eventBus.emit("promotion.rejected" as any, {
        code,
        reason: "Promotion is not stackable",
      });
      return result;
    }

    const result: PromotionValidationResult = {
      isValid: true,
      promotion: {
        id: promotion.id,
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        discountValue: Number(promotion.discountValue),
        isPercentage: promotion.isPercentage,
        maxDiscountAmount: promotion.maxDiscountAmount
          ? Number(promotion.maxDiscountAmount)
          : undefined,
      },
    };

    eventBus.emit("promotion.validated" as any, {
      code,
      bookingId: context.bookingId,
      isValid: true,
    });

    return result;
  }

  async applyPromotion(
    code: string,
    bookingId: string,
    context: any,
    actorId?: string
  ): Promise<PromotionApplication | null> {
    const validation = await this.validatePromotion(code, context);
    if (!validation.isValid || !validation.promotion) {
      return null;
    }

    const promotion = await promotionRepository.findByCode(code);
    if (!promotion) {
      return null;
    }

    if (
      promotion.maxUsageCount !== null &&
      promotion.maxUsageCount !== undefined &&
      promotion.usageCount >= promotion.maxUsageCount
    ) {
      throw new Error("Promotion has been exhausted");
    }

    const userId = context.userId;
    if (userId && promotion.perUserLimit) {
      const userUsageCount =
        await promotionUsageRepository.countByUserAndPromotion(
          userId,
          promotion.id
        );
      if (userUsageCount >= promotion.perUserLimit) {
        throw new Error(
          "User has exceeded per-user limit for this promotion"
        );
      }
    }

    const bookingAmount = context.bookingAmount;
    let discountAmount: number;
    if (promotion.isPercentage) {
      discountAmount =
        (bookingAmount * Number(promotion.discountValue)) / 100;
    } else {
      discountAmount = Number(promotion.discountValue);
    }

    if (
      promotion.maxDiscountAmount &&
      discountAmount > Number(promotion.maxDiscountAmount)
    ) {
      discountAmount = Number(promotion.maxDiscountAmount);
    }

    await promotionRepository.incrementUsage(promotion.id);

    await promotionUsageRepository.create({
      promotionId: promotion.id,
      bookingId,
      userId: context.userId,
      guestId: context.guestId,
      partnerId: context.partnerId,
      discountApplied: discountAmount,
      currency: "KES",
    });

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: promotion.id,
      action: "PROMOTION_USED",
      details: {},
      actorId: actorId ?? undefined,
    });

    eventBus.emit("promotion.applied" as any, {
      code: promotion.code,
      bookingId,
      discountAmount,
      currency: "KES",
    });

    return {
      promotionId: promotion.id,
      promotionCode: promotion.code,
      discountType: promotion.isPercentage
        ? "PERCENTAGE"
        : "FIXED_AMOUNT",
      discountValue: Number(promotion.discountValue),
      appliedAmount: discountAmount,
      maxDiscountAmount: promotion.maxDiscountAmount
        ? Number(promotion.maxDiscountAmount)
        : undefined,
      appliedToAmount: bookingAmount,
      description: promotion.description ?? "",
    };
  }

  async findById(id: string): Promise<any> {
    const promotion = await promotionRepository.findById(id);
    return this.convertPromotion(promotion);
  }

  async findByCode(code: string): Promise<any> {
    const promotion = await promotionRepository.findByCode(code);
    return this.convertPromotion(promotion);
  }

  async findActive(date: Date): Promise<any[]> {
    const promotions = await promotionRepository.findActive(date);
    return promotions.map((p) => this.convertPromotion(p));
  }

  async update(
    id: string,
    input: UpdatePromotionInput,
    actorId?: string
  ): Promise<any> {
    const promotion = await promotionRepository.findById(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.stackability !== undefined)
      updateData.stackability = input.stackability;
    if (input.discountValue !== undefined)
      updateData.discountValue = input.discountValue;
    if (input.isPercentage !== undefined)
      updateData.isPercentage = input.isPercentage;
    if (input.maxDiscountAmount !== undefined)
      updateData.maxDiscountAmount = input.maxDiscountAmount;
    if (input.minPurchaseAmount !== undefined)
      updateData.minPurchaseAmount = input.minPurchaseAmount;
    if (input.maxUsageCount !== undefined)
      updateData.maxUsageCount = input.maxUsageCount;
    if (input.perUserLimit !== undefined)
      updateData.perUserLimit = input.perUserLimit;
    if (input.applicableTo !== undefined)
      updateData.applicableTo = input.applicableTo;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;
    if (input.effectiveFrom !== undefined)
      updateData.effectiveFrom = input.effectiveFrom;
    if (input.effectiveTo !== undefined)
      updateData.effectiveTo = input.effectiveTo;

    const updated = await promotionRepository.update(id, updateData);

    if (input.status && input.status !== promotion.status) {
      eventBus.emit("promotion.status.changed" as any, {
        promotionId: id,
        oldStatus: promotion.status,
        newStatus: input.status,
      });
    }

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "PROMOTION_UPDATED",
      details: {},
      actorId: actorId ?? undefined,
    });

    return this.convertPromotion(updated);
  }

  async findByStatus(status: any): Promise<any[]> {
    const promotions = await promotionRepository.findByStatus(status);
    return promotions.map((p) => this.convertPromotion(p));
  }

  async getUsageHistory(promotionId: string): Promise<any[]> {
    const usages = await promotionUsageRepository.findByPromotion(promotionId);
    return usages.map((usage) => ({
      ...usage,
      discountApplied: Number(usage.discountApplied),
    }));
  }

  async getUserUsageHistory(
    userId: string,
    promotionId: string
  ): Promise<any[]> {
    const usages = await promotionUsageRepository.findByUser(
      userId,
      promotionId
    );
    return usages.map((usage) => ({
      ...usage,
      discountApplied: Number(usage.discountApplied),
    }));
  }
}

export const promotionService = new PromotionService();
