import { prisma } from "../client";
import type {
  CustomerPreference,
  Prisma,
} from "@prisma/client";

export class CustomerPreferenceRepository {
  async findById(id: string) {
    return prisma.customerPreference.findUnique({ where: { id } });
  }

  async findByCustomer(customerId: string) {
    return prisma.customerPreference.findMany({
      where: { customerId },
    });
  }

  async findByCategory(customerId: string, category: string) {
    return prisma.customerPreference.findMany({
      where: { customerId, category },
    });
  }

  async findOneByUnique(customerId: string, category: string, key: string) {
    return prisma.customerPreference.findFirst({
      where: { customerId, category, key },
    });
  }

  async create(data: Prisma.CustomerPreferenceCreateInput): Promise<CustomerPreference> {
    return prisma.customerPreference.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.CustomerPreferenceUpdateInput
  ): Promise<CustomerPreference> {
    return prisma.customerPreference.update({ where: { id }, data });
  }

  async upsert(customerId: string, category: string, key: string, value: string, metadata?: any) {
    const existing = await this.findOneByUnique(customerId, category, key);
    if (existing) {
      return prisma.customerPreference.update({
        where: { id: existing.id },
        data: { value, metadata },
      });
    }
    return prisma.customerPreference.create({
      data: { customerId, category, key, value, metadata } as any,
    });
  }

  async delete(id: string) {
    return prisma.customerPreference.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerPreference.deleteMany({ where: { customerId } });
  }
}

export const customerPreferenceRepository = new CustomerPreferenceRepository();
