import { prisma } from "../client";
import {
  JournalEntryItem,
  Prisma,
} from "@prisma/client";

export class JournalEntryItemRepository {
  async findById(id: string) {
    return prisma.journalEntryItem.findUnique({
      where: { id },
      include: { journalEntry: true, account: true },
    });
  }

  async findByJournalEntry(journalEntryId: string) {
    return prisma.journalEntryItem.findMany({
      where: { journalEntryId },
      orderBy: { createdAt: "asc" },
      include: { account: true },
    });
  }

  async create(data: Prisma.JournalEntryItemCreateInput): Promise<JournalEntryItem> {
    return prisma.journalEntryItem.create({ data });
  }
}

export const journalEntryItemRepository = new JournalEntryItemRepository();
