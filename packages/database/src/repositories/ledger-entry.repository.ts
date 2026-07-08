import { prisma } from "../client";
import {
  LedgerEntry,
  Prisma,
} from "@prisma/client";

export class LedgerEntryRepository {
  async findById(id: string) {
    return prisma.ledgerEntry.findUnique({
      where: { id },
      include: { invoices: true, wallets: true },
    });
  }

  async findByReference(reference: string) {
    return prisma.ledgerEntry.findUnique({
      where: { entryReference: reference },
      include: { invoices: true, wallets: true },
    });
  }

  async findByAccount(accountCode: string) {
    return prisma.ledgerEntry.findMany({
      where: { accountCode },
      orderBy: { postedAt: "desc" },
    });
  }

  async findByEntity(entityId: string, entityType: string) {
    return prisma.ledgerEntry.findMany({
      where: { sourceEntityId: entityId, sourceEntityType: entityType },
      orderBy: { postedAt: "desc" },
    });
  }

  async findByCorrelation(correlationId: string) {
    return prisma.ledgerEntry.findMany({
      where: { correlationId },
      orderBy: { postedAt: "desc" },
    });
  }

  async findByPeriod(fiscalPeriodId: string) {
    return prisma.ledgerEntry.findMany({
      where: { fiscalPeriodId },
      orderBy: { postedAt: "desc" },
    });
  }

  async create(data: Prisma.LedgerEntryCreateInput): Promise<LedgerEntry> {
    return prisma.ledgerEntry.create({ data: data as any });
  }
}

export const ledgerEntryRepository = new LedgerEntryRepository();
