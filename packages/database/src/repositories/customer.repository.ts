import { prisma } from "../client";
import type {
  Customer,
  Prisma,
  CustomerStatus,
} from "@prisma/client";

export class CustomerRepository {
  async findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: true,
        addresses: true,
        preferences: true,
        segmentAssignments: { include: { segment: true } },
        tags: true,
        loyaltyAccount: { include: { tier: true } },
      },
    });
  }

  async findByCustomerNumber(customerNumber: string) {
    return prisma.customer.findUnique({
      where: { customerNumber },
    });
  }

  async findByEmail(email: string) {
    return prisma.customer.findFirst({
      where: { email },
    });
  }

  async findByPhone(phone: string) {
    return prisma.customer.findFirst({
      where: { phone },
    });
  }

  async findByIdentifier(identifier: string) {
    return prisma.customer.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { customerNumber: identifier },
          { idNumber: identifier },
        ],
      },
    });
  }

  async create(data: Prisma.CustomerCreateInput): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async update(
    id: string,
    data: Prisma.CustomerUpdateInput
  ): Promise<Customer> {
    return prisma.customer.update({ where: { id }, data });
  }

  async updateIfUnchanged(
    id: string,
    expectedUpdatedAt: Date,
    data: Prisma.CustomerUpdateInput
  ): Promise<Customer | null> {
    try {
      return prisma.customer.update({
        where: { id, updatedAt: expectedUpdatedAt },
        data,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Record to update not found")) {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string) {
    return prisma.customer.delete({ where: { id } });
  }

  async list(limit = 100, offset = 0, status?: CustomerStatus) {
    return prisma.customer.findMany({
      ...(status ? { where: { status } } : {}),
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        loyaltyAccount: { include: { tier: true } },
      },
    });
  }

  async search(query: string, limit = 20) {
    return prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { customerNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      include: {
        loyaltyAccount: { include: { tier: true } },
      },
    });
  }

  async findTopCustomers(limit = 50) {
    return prisma.customer.findMany({
      where: { status: "ACTIVE" },
      orderBy: { lifetimeValue: "desc" },
      take: limit,
    });
  }

  async findBySegment(segmentId: string, limit = 100, offset = 0) {
    return prisma.customer.findMany({
      where: {
        segmentAssignments: {
          some: { segmentId },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        loyaltyAccount: { include: { tier: true } },
      },
    });
  }

  async incrementVisit(id: string) {
    return prisma.customer.update({
      where: { id },
      data: {
        lastVisitAt: new Date(),
      },
    });
  }

  async updateLifetimeValue(id: string, amount: number) {
    return prisma.customer.update({
      where: { id },
      data: {
        lifetimeValue: { increment: amount },
        totalSpend: { increment: amount },
      },
    });
  }

  async incrementBookingCount(id: string) {
    return prisma.customer.update({
      where: { id },
      data: {
        totalBookings: { increment: 1 },
      },
    });
  }

  async updateIntelligence(id: string, data: {
    totalTripsCompleted?: number;
    totalTripsCancelled?: number;
    totalRewardsEarned?: number;
    referralCount?: number;
    outstandingBalance?: number;
    lastBookingAt?: Date;
    firstVisitAt?: Date;
    totalSpend?: number;
    totalBookings?: number;
  }) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  }

  async count(status?: CustomerStatus) {
    return prisma.customer.count({
      ...(status ? { where: { status } } : {}),
    });
  }
}

export const customerRepository = new CustomerRepository();
