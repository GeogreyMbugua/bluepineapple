import { commercialAuditLogRepository } from "@blue-pineapple/database";

export type CommercialAuditAction =
  | "CANCELLATION_POLICY_CREATED"
  | "REFUND_CALCULATED"
  | "REFUND_APPROVED"
  | "REFUND_EXECUTED"
  | "TAX_RULE_CREATED"
  | "TAX_CALCULATED"
  | "COMMISSION_RULE_CREATED"
  | "COMMISSION_CALCULATED"
  | "COMMISSION_PAID"
  | "COMMERCIAL_SUMMARY_GENERATED"
  | "COMMERCIAL_SUMMARY_CONFIRMED"
  | "PRICE_LIST_CREATED"
  | "PRICE_LIST_UPDATED"
  | "PRICE_LIST_ACTIVATED"
  | "PRICE_LIST_EXPIRED"
  | "PROMOTION_CREATED"
  | "PROMOTION_UPDATED"
  | "PROMOTION_USED"
  | "ADD_ON_CREATED"
  | "ADD_ON_PRICE_CREATED"
  | "SEASON_CREATED";

export class CommercialAuditService {
  async log(
    action: CommercialAuditAction,
    entityType: string,
    entityId: string,
    userId?: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return commercialAuditLogRepository.create({
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      metadata,
      ipAddress,
      userAgent,
    });
  }

  async logPriceChange(
    entityId: string,
    oldValues: any,
    newValues: any,
    userId?: string,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.log(
      "PRICE_LIST_UPDATED",
      "PriceList",
      entityId,
      userId,
      oldValues,
      newValues,
      metadata,
      ipAddress,
      userAgent
    );
  }

  async logPromotion(
    entityId: string,
    action: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.log(
      action as CommercialAuditAction,
      "Promotion",
      entityId,
      userId,
      undefined,
      undefined,
      details,
      ipAddress,
      userAgent
    );
  }

  async logQuote(
    entityId: string,
    action: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.log(
      action as CommercialAuditAction,
      "Quote",
      entityId,
      userId,
      undefined,
      undefined,
      details,
      ipAddress,
      userAgent
    );
  }

  async logRefund(
    entityId: string,
    action: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.log(
      action as CommercialAuditAction,
      "RefundCalculation",
      entityId,
      userId,
      undefined,
      undefined,
      details,
      ipAddress,
      userAgent
    );
  }

  async logCommission(
    entityId: string,
    action: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.log(
      action as CommercialAuditAction,
      "CommissionCalculation",
      entityId,
      userId,
      undefined,
      undefined,
      details,
      ipAddress,
      userAgent
    );
  }

  async logTax(
    entityId: string,
    action: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.log(
      action as CommercialAuditAction,
      "TaxCalculation",
      entityId,
      userId,
      undefined,
      undefined,
      details,
      ipAddress,
      userAgent
    );
  }

  async logAddOn(
    entityId: string,
    action: string,
    userId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.log(
      action as CommercialAuditAction,
      "AddOn",
      entityId,
      userId,
      undefined,
      undefined,
      details,
      ipAddress,
      userAgent
    );
  }

  async findHistory(entityType: string, entityId: string, limit = 50) {
    return commercialAuditLogRepository.findByEntity(entityType, entityId, limit);
  }
}

export const commercialAuditService = new CommercialAuditService();
