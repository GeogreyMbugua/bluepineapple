import { prisma } from "@blue-pineapple/database";
import {
  commissionSettlementRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { LedgerService } from "./ledger.service";
import type { CommissionSettledEvent } from "../events";

export class CommissionService {
  private static generateSettlementReference(): string {
    return `CMS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async createSettlement(input: {
    partnerId: string;
    commissionRuleId?: string;
    bookingId?: string;
    baseAmount: number;
    commissionAmount: number;
    currency?: string;
    rate: number;
  }, actorId?: string): Promise<{ id: string; commissionReference: string }> {
    const commissionReference = CommissionService.generateSettlementReference();

    const settlement = await prisma.commissionSettlement.create({
      data: {
        commissionReference,
        partnerId: input.partnerId,
        commissionRuleId: input.commissionRuleId,
        bookingId: input.bookingId,
        baseAmount: input.baseAmount.toFixed(2),
        commissionAmount: input.commissionAmount.toFixed(2),
        currency: input.currency ?? "KES",
        rate: input.rate,
        status: "CALCULATED",
      } as any,
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "COMMISSION_SETTLED",
      entityType: "CommissionSettlement",
      entityId: settlement.id,
      newValues: { commissionReference, partnerId: input.partnerId, commissionAmount: input.commissionAmount },
    });

    eventBus.emit("commission.settled", {
      commissionSettlementId: settlement.id,
      commissionReference,
      partnerId: input.partnerId,
      commissionAmount: input.commissionAmount,
      currency: input.currency ?? "KES",
    } as CommissionSettledEvent);

    return { id: settlement.id, commissionReference: settlement.commissionReference };
  }

  async markPaid(settlementId: string, actorId?: string): Promise<void> {
    await prisma.commissionSettlement.update({
      where: { id: settlementId, status: "CALCULATED" },
      data: { status: "PAID", paidAt: new Date() },
    });

    await new LedgerService().postEntry({
      entryType: "CREDIT",
      accountCode: "4100",
      accountName: "Revenue:Partner Fees",
      amount: 0,
      currency: "KES",
      sourceDomain: "FINANCE",
      sourceEntityId: settlementId,
      sourceEntityType: "CommissionSettlement",
      description: "Commission settled outflow",
    }, actorId);
  }

  async findByPartner(partnerId: string, limit = 100) {
    const results = await commissionSettlementRepository.findByPartner(partnerId);
    return results.slice(0, limit);
  }

  async findSettledByPartner(partnerId: string, limit = 100) {
    const results = await commissionSettlementRepository.findByPartner(partnerId);
    return results.filter(r => r.status === "PAID").slice(0, limit);
  }
}

export const commissionService = new CommissionService();
