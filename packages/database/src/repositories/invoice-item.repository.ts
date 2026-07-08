import { prisma } from "../client";
import {
  InvoiceItem,
  Prisma,
} from "@prisma/client";

export class InvoiceItemRepository {
  async findById(id: string) {
    return prisma.invoiceItem.findUnique({
      where: { id },
      include: { invoice: true },
    });
  }

  async findByInvoice(invoiceId: string) {
    return prisma.invoiceItem.findMany({
      where: { invoiceId },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(data: Prisma.InvoiceItemCreateInput): Promise<InvoiceItem> {
    return prisma.invoiceItem.create({ data: data as any });
  }
}

export const invoiceItemRepository = new InvoiceItemRepository();
