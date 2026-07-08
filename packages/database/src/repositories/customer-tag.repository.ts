import { prisma } from "../client";
import type {
  CustomerTag,
  Prisma,
} from "@prisma/client";

export class CustomerTagRepository {
  async findById(id: string) {
    return prisma.customerTag.findUnique({ where: { id } });
  }

  async findByCustomer(customerId: string) {
    return prisma.customerTag.findMany({
      where: { customerId },
    });
  }

  async findByTag(tag: string, limit = 100, offset = 0) {
    return prisma.customerTag.findMany({
      where: { tag },
      take: limit,
      skip: offset,
      include: { customer: true },
    });
  }

  async findOneByUnique(customerId: string, tag: string) {
    return prisma.customerTag.findFirst({
      where: { customerId, tag },
    });
  }

  async create(data: Prisma.CustomerTagCreateInput): Promise<CustomerTag> {
    return prisma.customerTag.create({ data: data as any });
  }

  async update(id: string, data: Prisma.CustomerTagUpdateInput) {
    return prisma.customerTag.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.customerTag.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerTag.deleteMany({ where: { customerId } });
  }
}

export const customerTagRepository = new CustomerTagRepository();
