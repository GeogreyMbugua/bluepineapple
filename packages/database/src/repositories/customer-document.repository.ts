import { prisma } from "../client";
import {
  CustomerDocument,
  Prisma,
  DocumentType,
  DocumentStatus,
} from "@prisma/client";

export class CustomerDocumentRepository {
  async findById(id: string) {
    return prisma.customerDocument.findUnique({ where: { id } });
  }

  async findByCustomer(customerId: string) {
    return prisma.customerDocument.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByType(customerId: string, type: DocumentType) {
    return prisma.customerDocument.findMany({
      where: { customerId, type },
    });
  }

  async findExpiring(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    return prisma.customerDocument.findMany({
      where: {
        expiryDate: { lte: futureDate, gte: new Date() },
        status: { not: DocumentStatus.EXPIRED },
      },
    });
  }

  async create(data: Prisma.CustomerDocumentCreateInput): Promise<CustomerDocument> {
    return prisma.customerDocument.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.CustomerDocumentUpdateInput
  ): Promise<CustomerDocument> {
    return prisma.customerDocument.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.customerDocument.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerDocument.deleteMany({ where: { customerId } });
  }
}

export const customerDocumentRepository = new CustomerDocumentRepository();
