import {
  prisma,
  customerRelationshipRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CustomerPolicy } from "../policies/crm.policies";

export class CustomerRelationshipService {
  async create(
    customerId: string,
    relatedCustomerId: string,
    type: any,
    isEmergency = false,
    isPrimary = false,
    actorId?: string
  ) {
    CustomerPolicy.canEdit({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any, { id: customerId });

    if (customerId === relatedCustomerId) {
      throw new Error("Cannot create relationship with self");
    }

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

    await customerTimelineRepository.create({
      customerId,
      eventType: "CUSTOMER_UPDATED",
      description: `Relationship created: ${type}`,
      relatedEntityType: "CustomerRelationship",
      relatedEntityId: relationship.id,
      recordedBy: actorId,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_RELATIONSHIP_CREATED",
      details: { type, relatedCustomerId },
      actorId: actorId ?? undefined,
    });

    return relationship;
  }

  async findById(id: string) {
    return customerRelationshipRepository.findById(id);
  }

  async findByCustomer(customerId: string) {
    return customerRelationshipRepository.findByCustomer(customerId);
  }

  async getEmergencyContacts(customerId: string) {
    return customerRelationshipRepository.findEmergencyContacts(customerId);
  }

  async delete(id: string, actorId?: string) {
    const relationship = await customerRelationshipRepository.findById(id);
    if (!relationship) {
      throw new Error("Relationship not found");
    }

    await customerRelationshipRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: relationship.customerId,
      action: "CUSTOMER_RELATIONSHIP_DELETED",
      details: { relationshipId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }

  async deleteByCustomer(customerId: string, actorId?: string) {
    await customerRelationshipRepository.deleteByCustomer(customerId);
    return { success: true };
  }
}

export const customerRelationshipService = new CustomerRelationshipService();
