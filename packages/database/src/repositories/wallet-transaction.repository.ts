import { prisma } from "../client";
import {
  Prisma,
  WalletTransaction,
} from "@prisma/client";

export class WalletTransactionRepository {
  async findById(id: string) {
    return prisma.walletTransaction.findUnique({
      where: { id },
      include: { wallet: true },
    });
  }

  async findByReference(reference: string) {
    return prisma.walletTransaction.findUnique({
      where: { transactionReference: reference },
      include: { wallet: true },
    });
  }

  async findByWalletId(walletId: string) {
    return prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: "desc" },
      include: { wallet: true },
    });
  }

  async create(data: Prisma.WalletTransactionCreateInput): Promise<WalletTransaction> {
    return prisma.walletTransaction.create({ data: data as any });
  }
}

export const walletTransactionRepository = new WalletTransactionRepository();
