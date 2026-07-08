import { prisma } from "../client";
import type {
  CustomerSegment,
  Prisma,
  CustomerSegmentAssignment,
} from "@prisma/client";

export class CustomerSegmentRepository {
  async findById(id: string) {
    return prisma.customerSegment.findUnique({ where: { id } });
  }

  async findByCode(code: string) {
    return prisma.customerSegment.findUnique({ where: { code } });
  }

  async findByName(name: string) {
    return prisma.customerSegment.findFirst({ where: { name } });
  }

  async findAll() {
    return prisma.customerSegment.findMany({
      orderBy: { priority: "desc" },
    });
  }

  async findActive() {
    return prisma.customerSegment.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });
  }

  async create(data: Prisma.CustomerSegmentCreateInput): Promise<CustomerSegment> {
    return prisma.customerSegment.create({ data });
  }

  async update(
    id: string,
    data: Prisma.CustomerSegmentUpdateInput
  ): Promise<CustomerSegment> {
    return prisma.customerSegment.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.customerSegment.delete({ where: { id } });
  }
}

export class CustomerSegmentAssignmentRepository {
  async findById(id: string) {
    return prisma.customerSegmentAssignment.findUnique({
      where: { id },
      include: { segment: true, customer: true },
    });
  }

  async findByCustomer(customerId: string) {
    return prisma.customerSegmentAssignment.findMany({
      where: { customerId },
      include: { segment: true },
    });
  }

  async findBySegment(segmentId: string, limit = 100, offset = 0) {
    return prisma.customerSegmentAssignment.findMany({
      where: { segmentId },
      take: limit,
      skip: offset,
      include: { customer: true },
    });
  }

  async findOneByUnique(customerId: string, segmentId: string) {
    return prisma.customerSegmentAssignment.findFirst({
      where: { customerId, segmentId },
    });
  }

  async exists(customerId: string, segmentId: string): Promise<boolean> {
    const result = await prisma.customerSegmentAssignment.findFirst({
      where: {
        customerId,
        segmentId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
    return result !== null;
  }

  async create(data: Prisma.CustomerSegmentAssignmentCreateInput): Promise<CustomerSegmentAssignment> {
    return prisma.customerSegmentAssignment.create({ data: data as any });
  }

  async update(id: string, data: Prisma.CustomerSegmentAssignmentUpdateInput) {
    return prisma.customerSegmentAssignment.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.customerSegmentAssignment.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerSegmentAssignment.deleteMany({ where: { customerId } });
  }

  async deleteExpired() {
    return prisma.customerSegmentAssignment.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}

export const customerSegmentRepository = new CustomerSegmentRepository();
export const customerSegmentAssignmentRepository = new CustomerSegmentAssignmentRepository();
