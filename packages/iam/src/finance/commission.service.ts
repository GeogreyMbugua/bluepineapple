import { commissionRuleRepository, commissionCalculationRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";

export class CommissionService {
  async calculateCommission(partnerId: string, bookingId: string, baseAmount: number): Promise<{ id: string; commissionAmount: number } | null> {
    const rule = await commissionRuleRepository.findDefault("BOOKING");
    if (!rule) {
      return null;
    }

    const commissionAmount = rule.isPercentage
      ? (baseAmount * Number(rule.rate)) / 100
      : Number(rule.fixedAmount ?? 0);

    const calculation = await commissionCalculationRepository.create({
      commissionRuleId: rule.id,
      bookingId,
      partnerId,
      baseAmount,
      commissionAmount,
      currency: "KES",
      status: "CALCULATED",
    });

    auditService.logRoleAssigned("system", calculation.id, "COMMISSION_CALCULATED");

    return { id: calculation.id, commissionAmount };
  }

  async getPartnerCommissions(partnerId: string, limit = 50) {
    return commissionCalculationRepository.findByPartner(partnerId, limit);
  }

  async getBookingCommissions(bookingId: string) {
    return commissionCalculationRepository.findByBooking(bookingId);
  }
}

export const commissionService = new CommissionService();
