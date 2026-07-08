import { prisma } from "@blue-pineapple/database";
import {
  walletRepository,
  financeAuditLogRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { WalletPolicy } from "../policies";
import { LedgerService } from "./ledger.service";
import type { WalletCreditedEvent, WalletDebitedEvent } from "../events";

export class WalletService {
  private static generateReference(): string {
    return `WA-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  async createWallet(input: {
    walletType: string;
    ownerId: string;
    ownerType: string;
    currency?: string;
    expiresInDays?: number;
    metadata?: any;
  }, _actorId?: string): Promise<{ id: string; walletReference: string }> {
    const walletReference = WalletService.generateReference();
    const expiresAt = input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000) : undefined;

    const wallet = await prisma.wallet.create({
      data: {
        walletReference,
        walletType: input.walletType as any,
        ownerId: input.ownerId,
        ownerType: input.ownerType,
        currency: input.currency ?? "KES",
        expiresAt,
        metadata: input.metadata,
      },
    });

    return { id: wallet.id, walletReference: wallet.walletReference };
  }

  async credit(walletId: string, amount: number, description: string, actorId?: string, correlationId?: string): Promise<{ transactionReference: string }> {
    const wallet = await walletRepository.findById(walletId);
    if (!wallet) throw new Error("Wallet not found");
    WalletPolicy.assertCanCredit(wallet);

    const transactionReference = `WT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore + amount;

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: balanceAfter.toFixed(2), availableBalance: balanceAfter.toFixed(2), updatedAt: new Date() },
      });

      await tx.walletTransaction.create({
        data: {
          transactionReference,
          walletId,
          transactionType: "CREDIT",
          amount: amount.toFixed(2),
          currency: wallet.currency,
          balanceBefore: balanceBefore.toFixed(2),
          balanceAfter: balanceAfter.toFixed(2),
          description,
          createdBy: actorId,
        },
      });
    });

    await new LedgerService().postEntry({
      entryType: "CREDIT",
      accountCode: "1000",
      accountName: "Bank",
      amount,
      currency: wallet.currency,
      sourceDomain: "FINANCE",
      sourceEntityId: walletId,
      sourceEntityType: "Wallet",
      description: `Wallet credit: ${description}`,
      walletId,
      correlationId,
    }, actorId);

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "WALLET_CREDITED",
      entityType: "Wallet",
      entityId: walletId,
      newValues: { amount, balanceAfter, description },
      metadata: { correlationId },
    });

    eventBus.emit("wallet.credited", {
      walletId,
      walletReference: wallet.walletReference,
      walletType: wallet.walletType,
      amount,
      currency: wallet.currency,
      balanceAfter,
      transactionReference,
    } as WalletCreditedEvent);

    return { transactionReference };
  }

  async debit(walletId: string, amount: number, description: string, actorId?: string, correlationId?: string): Promise<{ transactionReference: string }> {
    const wallet = await walletRepository.findById(walletId);
    if (!wallet) throw new Error("Wallet not found");
    WalletPolicy.assertCanDebit(wallet);

    if (Number(wallet.availableBalance) < amount) {
      throw new Error("Insufficient wallet balance");
    }

    const transactionReference = `WT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const balanceBefore = Number(wallet.availableBalance);
    const balanceAfter = balanceBefore - amount;

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: balanceAfter.toFixed(2), availableBalance: balanceAfter.toFixed(2), updatedAt: new Date() },
      });

      await tx.walletTransaction.create({
        data: {
          transactionReference,
          walletId,
          transactionType: "DEBIT",
          amount: amount.toFixed(2),
          currency: wallet.currency,
          balanceBefore: balanceBefore.toFixed(2),
          balanceAfter: balanceAfter.toFixed(2),
          description,
          createdBy: actorId,
        },
      });
    });

    await new LedgerService().postEntry({
      entryType: "DEBIT",
      accountCode: "1000",
      accountName: "Bank",
      amount,
      currency: wallet.currency,
      sourceDomain: "FINANCE",
      sourceEntityId: walletId,
      sourceEntityType: "Wallet",
      description: `Wallet debit: ${description}`,
      walletId,
      correlationId,
    }, actorId);

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "WALLET_DEBITED",
      entityType: "Wallet",
      entityId: walletId,
      newValues: { amount, balanceAfter, description },
      metadata: { correlationId },
    });

    eventBus.emit("wallet.debited", {
      walletId,
      walletReference: wallet.walletReference,
      walletType: wallet.walletType,
      amount,
      currency: wallet.currency,
      balanceAfter,
      transactionReference,
    } as WalletDebitedEvent);

    return { transactionReference };
  }

  async freeze(walletId: string, actorId?: string): Promise<void> {
    const wallet = await walletRepository.findById(walletId);
    if (!wallet) throw new Error("Wallet not found");
    WalletPolicy.assertCanFreeze(wallet);

    await prisma.wallet.update({
      where: { id: walletId },
      data: { status: "FROZEN", updatedAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "WALLET_FROZEN",
      entityType: "Wallet",
      entityId: walletId,
      newValues: { status: "FROZEN" },
    });
  }

  async unfreeze(walletId: string, actorId?: string): Promise<void> {
    await prisma.wallet.update({
      where: { id: walletId, status: "FROZEN" },
      data: { status: "ACTIVE", updatedAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "WALLET_FROZEN",
      entityType: "Wallet",
      entityId: walletId,
      newValues: { status: "ACTIVE" },
    });
  }

  async close(walletId: string, actorId?: string): Promise<void> {
    const wallet = await walletRepository.findById(walletId);
    if (!wallet) throw new Error("Wallet not found");
    WalletPolicy.assertCanClose(wallet);

    await prisma.wallet.update({
      where: { id: walletId },
      data: { status: "CLOSED", closedAt: new Date(), updatedAt: new Date() },
    });

    await financeAuditLogRepository.create({
      userId: actorId,
      action: "WALLET_CLOSED",
      entityType: "Wallet",
      entityId: walletId,
      newValues: { status: "CLOSED" },
    });
  }

  async findById(id: string) {
    return walletRepository.findById(id);
  }

  async findByOwner(ownerId: string, ownerType: string) {
    return walletRepository.findByOwner(ownerId, ownerType);
  }

  async findByType(walletType: string, limit = 100) {
    const results = await walletRepository.findByType(walletType as any);
    return results.slice(0, limit);
  }
}

export const walletService = new WalletService();
