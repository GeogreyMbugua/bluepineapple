import { prisma } from "../client";
import type {
  CustomerInteraction,
  Prisma,
  InteractionType,
} from "@prisma/client";

export class CustomerInteractionRepository {
  async findById(id: string) {
    return prisma.customerInteraction.findUnique({
      where: { id },
      include: { customer: true },
    });
  }

  async findByCustomer(customerId: string, limit = 50, offset = 0) {
    return prisma.customerInteraction.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findByType(type: InteractionType, limit = 100, offset = 0) {
    return prisma.customerInteraction.findMany({
      where: { type },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findByEntity(relatedEntityType: string, relatedEntityId: string) {
    return prisma.customerInteraction.findMany({
      where: {
        relatedEntityType,
        relatedEntityId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.CustomerInteractionCreateInput): Promise<CustomerInteraction> {
    return prisma.customerInteraction.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.CustomerInteractionUpdateInput
  ): Promise<CustomerInteraction> {
    return prisma.customerInteraction.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.customerInteraction.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerInteraction.deleteMany({ where: { customerId } });
  }
}

export const customerInteractionRepository = new CustomerInteractionRepository();
