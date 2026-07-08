import { prisma } from "@blue-pineapple/database";
import {
  refundRepository,
  paymentRepository,
  refundRequestRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { PaymentService } from "./payment.service";
import { LedgerService } from "./ledger.service";
import { eventBus } from "@blue-pineapple/iam";
import { RefundPolicy, PaymentPolicy } from "../policies";
import type {
  FinanceRefundRequestedEvent,
  FinanceRefundApprovedEvent,
  FinanceRefundCompletedEvent,
  FinanceRefundFailedEvent,
} from "../events";

export class RefundService {
  private static generateReference(): string {
    return `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async createRefundRequest(input: {
    paymentIntentId?: string;
    bookingId?: string;
    paymentId?: string;
    customerId?: string;
    partnerId?: string;
    amount: number;
    currency?: string;
    reason: string;
    metadata?: any;
  }, actorId?: string): Promise<{ id: string; requestReference: string }> {
    PaymentPolicy.assertCanRefund({ status: "CAPTURED" } as any);
    RefundPolicy.assertValidAmount(input.amount, 100000000);

    const requestReference = `RFR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const request = await prisma.refundRequest.create({
      data: {
        requestReference,
        bookingId: input.bookingId,
        paymentIntentId: input.paymentIntentId,
        paymentId: input.paymentId,
        customerId: input.customerId,
        partnerId: input.partnerId,
        amount: input.amount.toFixed(2),
        currency: input.currency ?? "KES",
        status: "PENDING",
        reason: input.reason,
        requestedBy: actorId ?? "system",
        metadata: input.metadata,
      },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "REFUND_REQUESTED",
      entityType: "RefundRequest",
      entityId: request.id,
      oldValues: {},
      newValues: { requestReference, amount: input.amount, paymentId: input.paymentId, reason: input.reason },
    });

    eventBus.emit("finance.refund.requested", {
      financeRefundRequestId: request.id,
      requestReference,
      paymentId: input.paymentId ?? input.paymentIntentId ?? "",
      amount: input.amount,
      currency: input.currency ?? "KES",
      reason: input.reason,
    } as FinanceRefundRequestedEvent);

    return { id: request.id, requestReference: request.requestReference };
  }

  async approveRefund(refundRequestId: string, actorId?: string): Promise<{ id: string; refundReference: string }> {
    const request = await refundRequestRepository.findById(refundRequestId);
    if (!request) throw new Error("Refund request not found");
    RefundPolicy.assertCanApprove(request);

    const refundReference = RefundService.generateReference();
    const payment = await paymentRepository.findById(request.paymentId ?? "");
    if (!payment) throw new Error("Payment not found");

    const refund = await prisma.$transaction(async (tx) => {
      const ref = await tx.refund.create({
        data: {
          refundReference,
          paymentId: payment.id,
          invoiceId: request.bookingId,
          customerId: request.customerId,
          partnerId: request.partnerId,
          amount: request.amount,
          currency: request.currency,
          status: "APPROVED",
          reason: request.reason,
          approvedAt: new Date(),
          metadata: request.metadata as any,
        } as any,
      });

      await tx.refundRequest.update({
        where: { id: refundRequestId, status: "PENDING" },
        data: { status: "APPROVED", approvedAt: new Date(), approvedBy: actorId },
      });

      return ref;
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "REFUND_APPROVED",
      entityType: "Refund",
      entityId: refund.id,
      oldValues: {},
      newValues: { refundReference, amount: Number(refund.amount), status: "APPROVED" },
    });

    eventBus.emit("finance.refund.approved", {
      financeRefundRequestId: refundRequestId,
      refundId: refund.id,
      paymentId: payment.id,
      amount: Number(refund.amount),
      currency: refund.currency,
    } as FinanceRefundApprovedEvent);

    return { id: refund.id, refundReference: refund.refundReference };
  }

  async rejectRefund(refundRequestId: string, reason: string, actorId?: string): Promise<void> {
    const request = await refundRequestRepository.findById(refundRequestId);
    if (!request) throw new Error("Refund request not found");
    RefundPolicy.assertCanReject(request);

    await prisma.refundRequest.update({
      where: { id: refundRequestId, status: "PENDING" },
      data: { status: "REJECTED", rejectedAt: new Date(), rejectionReason: reason },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "REFUND_FAILED",
      entityType: "RefundRequest",
      entityId: refundRequestId,
      oldValues: {},
      newValues: { status: "REJECTED", reason },
    });
  }

  async processRefund(refundId: string, actorId?: string): Promise<void> {
    const refund = await refundRepository.findById(refundId);
    if (!refund) throw new Error("Refund not found");
    RefundPolicy.assertCanProcess(refund);

    const payment = await paymentRepository.findById(refund.paymentId);
    if (!payment) throw new Error("Payment not found");

    try {
      await PaymentService.prototype.refundPayment.call(new PaymentService(), payment.id, refundId, Number(refund.amount), actorId);

      const ledgerService = new LedgerService();
      await ledgerService.postEntry({
        entryType: "CREDIT",
        accountCode: "1020",
        accountName: "Accounts Receivable",
        amount: Number(refund.amount),
        currency: refund.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: refundId,
        sourceEntityType: "Refund",
        description: `Refund processed: ${(refund as any).refundReference ?? refund.id}`,
        refundId,
        paymentId: refund.paymentId,
      }, actorId);

      eventBus.emit("finance.refund.completed", {
        refundId,
        refundReference: (refund as any).refundReference ?? refund.id,
        paymentId: refund.paymentId,
        amount: Number(refund.amount),
        currency: refund.currency,
      } as FinanceRefundCompletedEvent);
    } catch {
      await prisma.refund.update({
        where: { id: refundId },
        data: { status: "FAILED", failureReason: "Unknown error" },
      });

      eventBus.emit("finance.refund.failed", {
        refundId,
        paymentId: refund.paymentId,
        reason: "Unknown error",
      } as FinanceRefundFailedEvent);
    }
  }

  async findById(id: string) {
    return refundRepository.findById(id);
  }

  async findByPayment(paymentId: string) {
    return refundRepository.findByPayment(paymentId);
  }

  async findByCustomer(customerId: string, limit = 100) {
    const results = await refundRepository.findByCustomer(customerId);
    return results.slice(0, limit);
  }

  async findByPartner(partnerId: string, limit = 100) {
    const results = await refundRepository.findByPartner(partnerId);
    return results.slice(0, limit);
  }
}

export const refundService = new RefundService();
