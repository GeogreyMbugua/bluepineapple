import { prisma } from "../client";
import type {
  CustomerRelationship,
  Prisma,
  RelationshipType,
} from "@prisma/client";

export class CustomerRelationshipRepository {
  async findById(id: string) {
    return prisma.customerRelationship.findUnique({
      where: { id },
      include: {
        customer: true,
        related: true,
      },
    });
  }

  async findByCustomer(customerId: string) {
    return prisma.customerRelationship.findMany({
      where: { customerId },
      include: { related: true },
    });
  }

  async findByRelated(relatedCustomerId: string) {
    return prisma.customerRelationship.findMany({
      where: { relatedCustomerId },
      include: { customer: true },
    });
  }

  async findOneByUnique(customerId: string, relatedCustomerId: string, type: RelationshipType) {
    return prisma.customerRelationship.findFirst({
      where: { customerId, relatedCustomerId, type },
    });
  }

  async findEmergencyContacts(customerId: string) {
    return prisma.customerRelationship.findMany({
      where: { customerId, isEmergency: true },
      include: { related: true },
    });
  }

  async create(data: Prisma.CustomerRelationshipCreateInput): Promise<CustomerRelationship> {
    return prisma.customerRelationship.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.CustomerRelationshipUpdateInput
  ) {
    return prisma.customerRelationship.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.customerRelationship.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerRelationship.deleteMany({ where: { customerId } });
  }

  async deleteBetween(customerId: string, relatedCustomerId: string) {
    return prisma.customerRelationship.deleteMany({
      where: {
        OR: [
          { customerId, relatedCustomerId },
          { customerId: relatedCustomerId, relatedCustomerId: customerId },
        ],
      },
    });
  }
}

export const customerRelationshipRepository = new CustomerRelationshipRepository();
