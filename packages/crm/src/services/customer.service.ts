import {
  prisma,
  customerRepository,
  customerContactRepository,
  customerTimelineRepository,
  customerTagRepository,
  customerSegmentAssignmentRepository,
  customerRelationshipRepository,
} from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import type {
  CustomerStatusType,
  CreateCustomerSchemaType,
  UpdateCustomerSchemaType,
} from "../validators/crm.schema";
import type {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  CustomerTimelineEvent,
  CustomerTagAddedEvent,
  CustomerSegmentAssignedEvent,
  CustomerRelationshipCreatedEvent,
} from "../events/crm.events";

export class CustomerService {
  async create(input: CreateCustomerSchemaType, actorId?: string) {
    const customer = await prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          displayName: input.displayName,
          email: input.email,
          phone: input.phone,
          alternativePhone: input.alternativePhone,
          dateOfBirth: input.dateOfBirth,
          nationality: input.nationality,
          countryOfResidence: input.countryOfResidence,
          idNumber: input.idNumber,
          idType: input.idType,
          gender: input.gender,
          title: input.title,
          occupation: input.occupation,
          company: input.company,
          source: input.source,
          referrerCustomerId: input.referrerCustomerId,
          marketingOptIn: input.marketingOptIn,
          isCorporate: input.isCorporate,
          isTravelAgent: input.isTravelAgent,
          isVip: input.isVip,
          preferredLanguage: input.preferredLanguage,
          preferredCurrency: input.preferredCurrency,
          notes: input.notes,
          metadata: input.metadata,
          status: input.status,
        },
      });
      await tx.customerTimeline.create({
        data: {
          customerId: created.id,
          eventType: "CUSTOMER_CREATED",
          description: `Customer ${created.firstName} ${created.lastName} created`,
          recordedBy: actorId,
        },
      });
      return created;
    });

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customer.id,
      action: "CUSTOMER_CREATED",
      details: { name: `${customer.firstName} ${customer.lastName}`, email: customer.email },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("customer.created", {
      customerId: customer.id,
      customerNumber: customer.customerNumber,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email ?? undefined,
      phone: customer.phone ?? undefined,
      source: customer.source ?? undefined,
    } as CustomerCreatedEvent);

    return customer;
  }

  async update(id: string, input: UpdateCustomerSchemaType, actorId?: string) {
    const existing = await customerRepository.findById(id);
    if (!existing) {
      throw new Error("Customer not found");
    }

    const updated = await customerRepository.update(id, input as any);

    const changedFields = Object.keys(input).filter((key) => {
      const value = input[key as keyof UpdateCustomerSchemaType];
      return value !== undefined && value !== existing[key as keyof typeof existing];
    });

    if (changedFields.length > 0) {
      await customerTimelineRepository.create({
        customerId: id,
        eventType: "CUSTOMER_UPDATED",
        description: `Customer profile updated: ${changedFields.join(", ")}`,
        recordedBy: actorId,
      } as any);

      auditLogger.logAdminAction(actorId ?? "system", {
        targetUserId: id,
        action: "CUSTOMER_UPDATED",
        details: { changes: changedFields },
        actorId: actorId ?? undefined,
      });

      (eventBus as any).emit("customer.updated", {
        customerId: id,
        changedFields,
      } as CustomerUpdatedEvent);
    }

    return updated;
  }

  async findById(id: string) {
    return customerRepository.findById(id);
  }

  async findByCustomerNumber(customerNumber: string) {
    return customerRepository.findByCustomerNumber(customerNumber);
  }

  async findByIdentifier(identifier: string) {
    return customerRepository.findByIdentifier(identifier);
  }

  async search(query: string, limit = 20) {
    return customerRepository.search(query, limit);
  }

  async list(limit = 100, offset = 0, status?: CustomerStatusType) {
    return customerRepository.list(limit, offset, status);
  }

  async delete(id: string, actorId?: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new Error("Customer not found");
    }

    const result = await customerRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "CUSTOMER_DELETED",
      details: { name: `${customer.firstName} ${customer.lastName}` },
      actorId: actorId ?? undefined,
    });

    return result;
  }

  async addTag(
    customerId: string,
    tag: string,
    actorId?: string
  ) {
    const existing = await customerTagRepository.findOneByUnique(customerId, tag);
    if (existing) {
      return existing;
    }

    const customerTag = await customerTagRepository.create({
      customerId,
      tag,
      createdBy: actorId,
    } as any);

    (eventBus as any).emit("customer.tag.added", {
      customerId,
      tag,
    } as CustomerTagAddedEvent);

    return customerTag;
  }

  async removeTag(customerId: string, tag: string) {
    const existing = await customerTagRepository.findOneByUnique(customerId, tag);
    if (!existing) {
      throw new Error("Tag not found");
    }
    await customerTagRepository.delete(existing.id);
    return { success: true };
  }

  async getTags(customerId: string) {
    return customerTagRepository.findByCustomer(customerId);
  }

  async assignSegment(
    customerId: string,
    segmentId: string,
    actorId?: string,
    expiresAt?: Date
  ) {
    const assignment = await customerSegmentAssignmentRepository.create({
      customerId,
      segmentId,
      assignedBy: actorId,
      expiresAt,
    } as any);

    const segment = await prisma.customerSegment.findUnique({
      where: { id: segmentId },
    });
    const segmentCode = segment?.code ?? "unknown";

    await customerTimelineRepository.create({
      customerId,
      eventType: "SEGMENT_ASSIGNED",
      description: `Assigned to segment: ${segmentCode}`,
      relatedEntityType: "CustomerSegment",
      relatedEntityId: segmentId,
      recordedBy: actorId,
    } as any);

    (eventBus as any).emit("customer.segment.assigned", {
      customerId,
      segmentId,
      segmentCode,
    } as CustomerSegmentAssignedEvent);

    return assignment;
  }

  async removeSegment(customerId: string, segmentId: string) {
    const existing = await customerSegmentAssignmentRepository.findOneByUnique(
      customerId,
      segmentId
    );
    if (!existing) {
      throw new Error("Segment assignment not found");
    }
    await customerSegmentAssignmentRepository.delete(existing.id);

    (eventBus as any).emit("customer.segment.removed", {
      customerId,
      segmentId,
    } as CustomerSegmentAssignedEvent);

    return { success: true };
  }

  async getSegments(customerId: string) {
    return customerSegmentAssignmentRepository.findByCustomer(customerId);
  }

  async addRelationship(
    customerId: string,
    relatedCustomerId: string,
    type: any,
    isEmergency = false,
    isPrimary = false,
    actorId?: string
  ) {
    const existing = await customerRelationshipRepository.findOneByUnique(
      customerId,
      relatedCustomerId,
      type
    );
    if (existing) {
      throw new Error("Relationship already exists");
    }

    const relationship = await customerRelationshipRepository.create({
      customerId,
      relatedCustomerId,
      type,
      isEmergency,
      isPrimary,
    } as any);

    (eventBus as any).emit("customer.relationship.created", {
      relationshipId: relationship.id,
      customerId,
      relatedCustomerId,
      type,
    } as CustomerRelationshipCreatedEvent);

    return relationship;
  }

  async getRelationships(customerId: string) {
    return customerRelationshipRepository.findByCustomer(customerId);
  }

  async getEmergencyContacts(customerId: string) {
    return customerRelationshipRepository.findEmergencyContacts(customerId);
  }

  async addTimelineEvent(
    customerId: string,
    eventType: any,
    description: string,
    relatedEntityType?: string,
    relatedEntityId?: string,
    actorId?: string,
    metadata?: any
  ) {
    const timelineEvent = await customerTimelineRepository.create({
      customerId,
      eventType,
      description,
      relatedEntityType,
      relatedEntityId,
      metadata,
      recordedBy: actorId,
    } as any);

    (eventBus as any).emit("customer.timeline.created", {
      timelineId: timelineEvent.id,
      customerId,
      eventType,
      description,
      relatedEntityType,
      relatedEntityId,
    } as CustomerTimelineEvent);

    if (eventType === "CUSTOMER_RETURNED") {
      await customerRepository.incrementVisit(customerId);
    }

    return timelineEvent;
  }

  async getTimeline(customerId: string, limit = 50, offset = 0) {
    return customerTimelineRepository.findByCustomer(customerId, limit, offset);
  }
}

export const customerService = new CustomerService();
