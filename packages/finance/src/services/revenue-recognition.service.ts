import { prisma } from "@blue-pineapple/database";
import {
  revenueRecognitionRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { LedgerService } from "./ledger.service";
import type { RevenueRecognizedEvent, RevenueDeferredEvent } from "../events";

export class RevenueRecognitionService {
  private static generateReference(): string {
    return `RR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async create(input: {
    invoiceId?: string;
    paymentId?: string;
    contractValue: number;
    currency?: string;
    recognitionSchedule?: any;
  }, actorId?: string): Promise<{ id: string; recognitionReference: string }> {
    const recognitionReference = RevenueRecognitionService.generateReference();
    const recognition = await prisma.revenueRecognition.create({
      data: {
        recognitionReference,
        invoiceId: input.invoiceId,
        paymentId: input.paymentId,
        contractValue: input.contractValue.toFixed(2),
        recognizedRevenue: "0",
        deferredRevenue: input.contractValue.toFixed(2),
        currency: input.currency ?? "KES",
        status: "PENDING",
        recognitionSchedule: input.recognitionSchedule,
      },
    });

    await new LedgerService().postEntry({
      entryType: "CREDIT",
      accountCode: "2200",
      accountName: "Deferred Revenue",
      amount: input.contractValue,
      currency: input.currency ?? "KES",
      sourceDomain: "FINANCE",
      sourceEntityId: recognition.id,
      sourceEntityType: "RevenueRecognition",
      description: `Deferred revenue: ${recognitionReference}`,
    }, actorId);

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "REVENUE_DEFERRED",
      entityType: "RevenueRecognition",
      entityId: recognition.id,
      newValues: { recognitionReference, contractValue: input.contractValue, deferredRevenue: input.contractValue },
    });

    eventBus.emit("revenue.deferred", {
      revenueRecognitionId: recognition.id,
      recognitionReference,
      invoiceId: input.invoiceId,
      deferredAmount: input.contractValue,
      currency: input.currency ?? "KES",
      deferredAt: new Date().toISOString(),
    } as RevenueDeferredEvent);

    return { id: recognition.id, recognitionReference: recognition.recognitionReference };
  }

  async recognizeRevenue(recognitionId: string, amount: number, actorId?: string): Promise<void> {
    const recognition = await revenueRecognitionRepository.findById(recognitionId);
    if (!recognition) throw new Error("Revenue recognition not found");

    const remaining = Number(recognition.deferredRevenue) - amount;
    if (remaining < 0) throw new Error("Recognition amount exceeds deferred revenue");

    await prisma.$transaction(async (tx) => {
      await tx.revenueRecognition.update({
        where: { id: recognitionId },
        data: {
          recognizedRevenue: (Number(recognition.recognizedRevenue) + amount).toFixed(2),
          deferredRevenue: Math.max(0, remaining).toFixed(2),
          status: remaining <= 0.01 ? "RECOGNIZED" : "PENDING",
          recognizedAt: remaining <= 0.01 ? new Date() : undefined,
        },
      });

      await tx.revenueRecognitionEvent.create({
        data: {
          revenueRecognitionId: recognitionId,
          eventType: "RECOGNITION",
          recognizedAmount: amount.toFixed(2),
          currency: recognition.currency,
          eventDate: new Date(),
          description: "Revenue recognized",
        },
      });

      await new LedgerService().postEntry({
        entryType: "DEBIT",
        accountCode: "2200",
        accountName: "Deferred Revenue",
        amount,
        currency: recognition.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: recognitionId,
        sourceEntityType: "RevenueRecognition",
        description: `Revenue recognized: ${recognition.recognitionReference}`,
      }, actorId);

      await new LedgerService().postEntry({
        entryType: "CREDIT",
        accountCode: "4000",
        accountName: "Revenue",
        amount,
        currency: recognition.currency,
        sourceDomain: "FINANCE",
        sourceEntityId: recognitionId,
        sourceEntityType: "RevenueRecognition",
        description: `Revenue recognized: ${recognition.recognitionReference}`,
      }, actorId);
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "REVENUE_RECOGNIZED",
      entityType: "RevenueRecognition",
      entityId: recognitionId,
      newValues: { recognitionReference: recognition.recognitionReference, amount, status: remaining <= 0.01 ? "RECOGNIZED" : "PENDING" },
    });

    eventBus.emit("revenue.recognized", {
      revenueRecognitionId: recognitionId,
      recognitionReference: recognition.recognitionReference,
      invoiceId: recognition.invoiceId,
      recognizedAmount: amount,
      currency: recognition.currency,
      eventDate: new Date().toISOString(),
    } as RevenueRecognizedEvent);
  }

  async deferRevenue(recognitionId: string, actorId?: string): Promise<void> {
    const recognition = await revenueRecognitionRepository.findById(recognitionId);
    if (!recognition) throw new Error("Revenue recognition not found");

    await prisma.revenueRecognition.update({
      where: { id: recognitionId },
      data: { status: "DEFERRED", deferredAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "REVENUE_DEFERRED",
      entityType: "RevenueRecognition",
      entityId: recognitionId,
      newValues: { recognitionReference: recognition.recognitionReference, status: "DEFERRED" },
    });
  }

  async findByInvoice(invoiceId: string) {
    return revenueRecognitionRepository.findByInvoice(invoiceId);
  }

  async findByPayment(paymentId: string) {
    return revenueRecognitionRepository.findByPayment(paymentId);
  }
}

export const revenueRecognitionService = new RevenueRecognitionService();
