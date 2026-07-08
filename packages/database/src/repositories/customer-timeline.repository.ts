import { prisma } from "../client";
import type {
  CustomerTimeline,
  Prisma,
  TimelineEventType,
} from "@prisma/client";

export class CustomerTimelineRepository {
  async findById(id: string) {
    return prisma.customerTimeline.findUnique({ where: { id } });
  }

  async findByCustomer(customerId: string, limit = 50, offset = 0) {
    return prisma.customerTimeline.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findByEventType(eventType: TimelineEventType, limit = 100, offset = 0) {
    return prisma.customerTimeline.findMany({
      where: { eventType },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  async findByEntity(relatedEntityType: string, relatedEntityId: string) {
    return prisma.customerTimeline.findMany({
      where: {
        relatedEntityType,
        relatedEntityId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: Prisma.CustomerTimelineCreateInput): Promise<CustomerTimeline> {
    return prisma.customerTimeline.create({ data: data as any });
  }

  async createMany(events: Prisma.CustomerTimelineCreateManyInput[]) {
    return prisma.customerTimeline.createMany({ data: events as any });
  }

  async delete(id: string) {
    return prisma.customerTimeline.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerTimeline.deleteMany({ where: { customerId } });
  }
}

export const customerTimelineRepository = new CustomerTimelineRepository();
