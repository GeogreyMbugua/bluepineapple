import { prisma } from "../client";
import type {
  CustomerContact,
  Prisma,
  ContactType,
} from "@prisma/client";

export class CustomerContactRepository {
  async findById(id: string) {
    return prisma.customerContact.findUnique({ where: { id } });
  }

  async findByCustomer(customerId: string) {
    return prisma.customerContact.findMany({
      where: { customerId },
      orderBy: { isPrimary: "desc" },
    });
  }

  async findPrimary(customerId: string) {
    return prisma.customerContact.findFirst({
      where: { customerId, isPrimary: true },
    });
  }

  async findByType(customerId: string, type: ContactType) {
    return prisma.customerContact.findMany({
      where: { customerId, type },
    });
  }

  async create(data: Prisma.CustomerContactCreateInput): Promise<CustomerContact> {
    return prisma.customerContact.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.CustomerContactUpdateInput
  ): Promise<CustomerContact> {
    return prisma.customerContact.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.customerContact.delete({ where: { id } });
  }

  async findOneByUnique(customerId: string, type: ContactType, value: string) {
    return prisma.customerContact.findFirst({
      where: { customerId, type, value },
    });
  }

  async updateByUnique(
    customerId: string,
    type: ContactType,
    value: string,
    data: Prisma.CustomerContactUpdateInput
  ) {
    return prisma.customerContact.updateMany({
      where: { customerId, type, value },
      data,
    });
  }
}

export const customerContactRepository = new CustomerContactRepository();
