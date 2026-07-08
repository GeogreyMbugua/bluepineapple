import {
  prisma,
  customerSegmentRepository,
  customerSegmentAssignmentRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { SegmentPolicy } from "../policies/crm.policies";

export class CustomerSegmentService {
  async create(input: any, actorId?: string) {
    SegmentPolicy.canCreate({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const segment = await customerSegmentRepository.create({
      name: input.name,
      code: input.code,
      description: input.description,
      color: input.color,
      isSystem: input.isSystem,
      isActive: input.isActive,
      priority: input.priority,
      metadata: input.metadata,
    });

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: segment.id,
      action: "CUSTOMER_SEGMENT_CREATED",
      details: { name: segment.name, code: segment.code },
      actorId: actorId ?? undefined,
    });

    return segment;
  }

  async update(id: string, input: any, actorId?: string) {
    SegmentPolicy.canEdit({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const existing = await customerSegmentRepository.findById(id);
    if (!existing) {
      throw new Error("Segment not found");
    }

    const updated = await customerSegmentRepository.update(id, input);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "CUSTOMER_SEGMENT_UPDATED",
      details: { name: updated.name },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async findById(id: string) {
    return customerSegmentRepository.findById(id);
  }

  async findByCode(code: string) {
    return customerSegmentRepository.findByCode(code);
  }

  async findAll() {
    return customerSegmentRepository.findAll();
  }

  async findActive() {
    return customerSegmentRepository.findActive();
  }

  async delete(id: string, actorId?: string) {
    SegmentPolicy.canDelete({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const segment = await customerSegmentRepository.findById(id);
    if (!segment) {
      throw new Error("Segment not found");
    }

    await customerSegmentRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "CUSTOMER_SEGMENT_DELETED",
      details: { name: segment.name },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }

  async assignCustomer(
    customerId: string,
    segmentId: string,
    actorId?: string,
    expiresAt?: Date
  ) {
    SegmentPolicy.canCreate({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const assignment = await customerSegmentAssignmentRepository.create({
      customerId,
      segmentId,
      assignedBy: actorId,
      expiresAt,
    } as any);

    const segment = await customerSegmentRepository.findById(segmentId);
    const segmentCode = segment?.code ?? "unknown";

    await customerTimelineRepository.create({
      customerId,
      eventType: "SEGMENT_ASSIGNED",
      description: `Assigned to segment: ${segmentCode}`,
      relatedEntityType: "CustomerSegment",
      relatedEntityId: segmentId,
      recordedBy: actorId,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_SEGMENT_ASSIGNED",
      details: { segmentId, segmentCode },
      actorId: actorId ?? undefined,
    });

    return assignment;
  }

  async unassignCustomer(customerId: string, segmentId: string, actorId?: string) {
    SegmentPolicy.canDelete({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);

    const existing = await customerSegmentAssignmentRepository.findOneByUnique(
      customerId,
      segmentId
    );
    if (!existing) {
      throw new Error("Segment assignment not found");
    }
    await customerSegmentAssignmentRepository.delete(existing.id);

    return { success: true };
  }

  async getCustomerSegments(customerId: string) {
    return customerSegmentAssignmentRepository.findByCustomer(customerId);
  }

  async getSegmentCustomers(segmentId: string, limit = 100, offset = 0) {
    return customerSegmentAssignmentRepository.findBySegment(segmentId, limit, offset);
  }
}

export const customerSegmentService = new CustomerSegmentService();
