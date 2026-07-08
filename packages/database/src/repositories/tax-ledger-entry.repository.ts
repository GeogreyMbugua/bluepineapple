import { prisma } from "../client";
import {
  Prisma,
  TaxLedgerEntry,
} from "@prisma/client";

export class TaxLedgerEntryRepository {
  async findById(id: string) {
    return prisma.taxLedgerEntry.findUnique({ where: { id } });
  }

  async findByEntity(entityId: string, entityType: string) {
    return prisma.taxLedgerEntry.findMany({
      where: { sourceEntityId: entityId, sourceEntityType: entityType },
      orderBy: { postedAt: "desc" },
    });
  }

  async findByJurisdiction(jurisdiction: string) {
    return prisma.taxLedgerEntry.findMany({
      where: { jurisdiction },
      orderBy: { postedAt: "desc" },
    });
  }

  async create(data: Prisma.TaxLedgerEntryCreateInput): Promise<TaxLedgerEntry> {
    return prisma.taxLedgerEntry.create({ data: data as any });
  }
}

export const taxLedgerEntryRepository = new TaxLedgerEntryRepository();
