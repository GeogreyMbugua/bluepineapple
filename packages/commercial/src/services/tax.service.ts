import { prisma } from "@blue-pineapple/database";
import {
  taxRuleRepository,
  taxCalculationRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { TaxPolicy } from "../policies";
import type { TaxCalculatedEvent } from "../events/commercial.events";
import type { TaxCharge } from "../domain/commercial.types";

export class TaxService {
  private convertTaxRule(rule: any): any {
    if (!rule) return rule;
    const converted: any = { ...rule };
    if (rule.rate !== undefined && rule.rate !== null) {
      converted.rate = Number(rule.rate);
    }
    return converted;
  }

  async createTaxRule(input: any, actorId?: string) {
    TaxPolicy.assertValidType(input.type);
    if (input.jurisdiction) {
      TaxPolicy.isValidJurisdiction(input.jurisdiction);
    }

    const rule = await taxRuleRepository.create(input);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: rule.id,
      action: "TAX_RULE_CREATED",
      details: { name: rule.name, type: rule.type, jurisdiction: rule.jurisdiction },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("tax.rule.activated", {
      taxRuleId: rule.id,
      taxName: rule.name,
      type: rule.type,
      jurisdiction: rule.jurisdiction,
    });

    return this.convertTaxRule(rule);
  }

  async findActiveRules(jurisdiction?: string) {
    const rules = await taxRuleRepository.findActive(jurisdiction);
    return rules.map((r: any) => this.convertTaxRule(r));
  }

  async calculateTaxes(
    taxableAmount: number,
    context: any,
    actorId?: string
  ): Promise<TaxCharge[]> {
    const rules = await taxRuleRepository.findActive(context?.jurisdiction);
    const applicableRules = rules.filter((rule: any) =>
      TaxPolicy.isApplicable(rule, context)
    );

    if (applicableRules.length === 0) {
      return [];
    }

    const calculations = await prisma.$transaction(async (tx) => {
      const created: any[] = [];

      for (const rule of applicableRules) {
        let taxAmount: number;
        if (rule.isInclusive) {
          const rate = Number(rule.rate) / 100;
          taxAmount = taxableAmount - taxableAmount / (1 + rate);
        } else if (rule.isPercentage) {
          taxAmount = (taxableAmount * Number(rule.rate)) / 100;
        } else {
          taxAmount = Number(rule.rate);
        }

        const calculation = await tx.taxCalculation.create({
          data: {
            taxRuleId: rule.id,
            bookingId: context?.bookingId,
            quoteId: context?.quoteId,
            taxableAmount: taxableAmount.toFixed(2),
            taxAmount: taxAmount.toFixed(2),
            currency: context?.currency ?? "KES",
          },
        });

        created.push({
          ...calculation,
          taxAmount: Number(calculation.taxAmount),
          taxableAmount: Number(calculation.taxableAmount),
          taxRule: rule,
        });
      }

      return created;
    });

    const totalTax = calculations.reduce((sum, c) => sum + c.taxAmount, 0);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: calculations[0]?.id ?? "",
      action: "TAX_CALCULATED",
      details: {
        taxableAmount,
        count: calculations.length,
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("tax.calculated", {
      taxCalculationId: calculations[0]?.id ?? "",
      bookingId: context?.bookingId,
      taxAmount: totalTax,
      currency: context?.currency ?? "KES",
    } as TaxCalculatedEvent);

    return calculations.map((c) => ({
      taxRuleId: c.taxRuleId,
      taxName: c.taxRule.name,
      rate: Number(c.taxRule.rate),
      taxableAmount: c.taxableAmount,
      taxAmount: c.taxAmount,
      isInclusive: c.taxRule.isInclusive,
      jurisdiction: c.taxRule.jurisdiction,
    })) as TaxCharge[];
  }

  async findDefaultRule(jurisdiction: string) {
    const rule = await taxRuleRepository.findDefault(jurisdiction);
    return this.convertTaxRule(rule);
  }

  async findById(id: string) {
    const rule = await taxRuleRepository.findById(id);
    return this.convertTaxRule(rule);
  }
}

export const taxService = new TaxService();
