import { prisma } from "../client";
import {
  JournalEntry,
  JournalEntryStatus,
  Prisma,
} from "@prisma/client";

export class JournalEntryRepository {
  async findById(id: string) {
    return prisma.journalEntry.findUnique({
      where: { id },
      include: { items: { include: { account: true } } },
    });
  }

  async findByReference(reference: string) {
    return prisma.journalEntry.findUnique({
      where: { journalReference: reference },
      include: { items: { include: { account: true } } },
    });
  }

  async findByStatus(status: JournalEntryStatus, limit = 100) {
    return prisma.journalEntry.findMany({
      where: { status },
      orderBy: { entryDate: "desc" },
      take: limit,
      include: { items: { include: { account: true } } },
    });
  }

  async create(data: Prisma.JournalEntryCreateInput): Promise<JournalEntry> {
    return prisma.journalEntry.create({ data });
  }

  async update(
    id: string,
    data: Prisma.JournalEntryUpdateInput
  ): Promise<JournalEntry> {
    return prisma.journalEntry.update({ where: { id }, data });
  }
}

export const journalEntryRepository = new JournalEntryRepository();
