import {
  prisma,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";

export class CustomerTimelineService {
  async create(input: any, actorId?: string) {
    const timelineEvent = await customerTimelineRepository.create({
      customerId: input.customerId,
      eventType: input.eventType,
      description: input.description,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
      metadata: input.metadata,
      recordedBy: actorId ?? input.recordedBy,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: input.customerId,
      action: "CUSTOMER_TIMELINE_EVENT_CREATED",
      details: { eventType: input.eventType, description: input.description },
      actorId: actorId ?? undefined,
    });

    return timelineEvent;
  }

  async findById(id: string) {
    return customerTimelineRepository.findById(id);
  }

  async findByCustomer(customerId: string, limit = 50, offset = 0) {
    return customerTimelineRepository.findByCustomer(customerId, limit, offset);
  }

  async findByEventType(eventType: string, limit = 100, offset = 0) {
    return customerTimelineRepository.findByEventType(eventType as any, limit, offset);
  }

  async findByEntity(relatedEntityType: string, relatedEntityId: string) {
    return customerTimelineRepository.findByEntity(relatedEntityType, relatedEntityId);
  }
}

export const customerTimelineService = new CustomerTimelineService();
