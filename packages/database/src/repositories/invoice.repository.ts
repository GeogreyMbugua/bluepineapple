import { prisma } from "../client";
import {
  Invoice,
  InvoiceStatus,
  Prisma,
} from "@prisma/client";

export class InvoiceRepository {
  async findById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        ledgerEntries: true,
      },
    });
  }

  async findByReference(reference: string) {
    return prisma.invoice.findUnique({
      where: { invoiceReference: reference },
      include: { items: true, ledgerEntries: true },
    });
  }

  async findByCustomer(customerId: string) {
    return prisma.invoice.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async findByPartner(partnerId: string) {
    return prisma.invoice.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  async findByStatus(status: InvoiceStatus, limit = 100) {
    return prisma.invoice.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { items: true },
    });
  }

  async create(data: Prisma.InvoiceCreateInput): Promise<Invoice> {
    return prisma.invoice.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.InvoiceUpdateInput
  ): Promise<Invoice> {
    return prisma.invoice.update({ where: { id }, data });
  }
}

export const invoiceRepository = new InvoiceRepository();
