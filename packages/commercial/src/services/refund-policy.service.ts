import { prisma } from "@blue-pineapple/database";
import { refundCalculationRepository } from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { RefundPolicy } from "../policies";
import type {
  RefundCalculatedEvent,
  RefundApprovedEvent,
  RefundExecutedEvent,
} from "../events/commercial.events";

export class RefundPolicyService {
  private generateReference(): string {
    return `RC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async calculateRefund(
    bookingId: string,
    originalAmount: number,
    cancellationResult: any,
    currency: string,
    actorId?: string
  ) {
    RefundPolicy.assertCanCalculate(bookingId);

    const existing = await refundCalculationRepository.findByBooking(bookingId);
    const previousNonFinalized = existing.find(
      (r: any) => r.status !== "EXECUTED" && r.status !== "FAILED"
    );
    if (previousNonFinalized) {
      throw new Error("A non-finalized refund already exists for this booking");
    }

    const baseAmount =
      (originalAmount * (cancellationResult.refundPercentage ?? 100)) / 100;
    const penaltyAmount = cancellationResult.penaltyAmount ?? 0;
    const administrativeFee = cancellationResult.administrativeFee ?? 0;
    const refundAmount = baseAmount - penaltyAmount - administrativeFee;

    const refundCalculation = await prisma.$transaction(async (tx) => {
      return tx.refundCalculation.create({
        data: {
          bookingId,
          calculationReference: this.generateReference(),
          baseAmount: baseAmount.toFixed(2),
          penaltyAmount: penaltyAmount.toFixed(2),
          administrativeFee: administrativeFee.toFixed(2),
          refundAmount: refundAmount.toFixed(2),
          currency: currency ?? "KES",
          status: "CALCULATED",
        },
      });
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: refundCalculation.id,
      action: "REFUND_CALCULATED",
      details: {
        bookingId,
        refundAmount: Number(refundCalculation.refundAmount).toFixed(2),
        currency,
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("refund.calculated", {
      refundCalculationId: refundCalculation.id,
      bookingId,
      refundAmount: Number(refundCalculation.refundAmount),
      currency,
    } as RefundCalculatedEvent);

    return refundCalculation;
  }

  async approveRefund(refundCalculationId: string, actorId?: string) {
    const calculation = await refundCalculationRepository.findById(refundCalculationId);
    if (!calculation) {
      throw new Error("Refund calculation not found");
    }
    RefundPolicy.assertCanApprove(calculation);

    const updated = await prisma.refundCalculation.update({
      where: { id: refundCalculationId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: refundCalculationId,
      action: "REFUND_APPROVED",
      details: {
        refundCalculationId,
        refundAmount: Number(updated.refundAmount).toFixed(2),
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("refund.approved", {
      refundCalculationId,
      bookingId: calculation.bookingId,
      refundAmount: Number(updated.refundAmount),
      currency: calculation.currency,
    } as RefundApprovedEvent);

    return updated;
  }

  async executeRefund(
    refundCalculationId: string,
    paymentTransactionId: string,
    actorId?: string
  ) {
    const calculation = await refundCalculationRepository.findById(refundCalculationId);
    if (!calculation) {
      throw new Error("Refund calculation not found");
    }
    RefundPolicy.assertCanExecute(calculation);

    const updated = await prisma.refundCalculation.update({
      where: { id: refundCalculationId },
      data: {
        status: "EXECUTED",
        executedAt: new Date(),
        paymentTransactionId,
      },
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: refundCalculationId,
      action: "REFUND_EXECUTED",
      details: {
        refundCalculationId,
        paymentTransactionId,
        refundAmount: Number(updated.refundAmount).toFixed(2),
      },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("refund.executed", {
      refundCalculationId,
      bookingId: calculation.bookingId,
      refundAmount: Number(updated.refundAmount),
      currency: calculation.currency,
    } as RefundExecutedEvent);

    return updated;
  }

  async findById(id: string) {
    return refundCalculationRepository.findById(id);
  }

  async findByBooking(bookingId: string) {
    return refundCalculationRepository.findByBooking(bookingId);
  }

  async findPending() {
    return refundCalculationRepository.findPending();
  }
}

export const refundPolicyService = new RefundPolicyService();
