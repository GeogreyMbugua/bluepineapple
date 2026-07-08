import { prisma } from "../client";
import {
  Prisma,
  Wallet,
  WalletType,
} from "@prisma/client";

export class WalletRepository {
  async findById(id: string) {
    return prisma.wallet.findUnique({
      where: { id },
      include: { transactions: true, ledgerEntries: true },
    });
  }

  async findByReference(reference: string) {
    return prisma.wallet.findUnique({
      where: { walletReference: reference },
      include: { transactions: true, ledgerEntries: true },
    });
  }

  async findByOwner(ownerId: string, ownerType: string) {
    return prisma.wallet.findMany({
      where: { ownerId, ownerType },
      orderBy: { createdAt: "desc" },
      include: { transactions: true },
    });
  }

  async findByType(type: WalletType) {
    return prisma.wallet.findMany({
      where: { walletType: type },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.WalletCreateInput): Promise<Wallet> {
    return prisma.wallet.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.WalletUpdateInput
  ): Promise<Wallet> {
    return prisma.wallet.update({ where: { id }, data });
  }
}

export const walletRepository = new WalletRepository();
