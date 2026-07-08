import {
  prisma,
  customerInteractionRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { InteractionPolicy, CustomerPolicy } from "../policies/crm.policies";

export class CustomerInteractionService {
  async create(input: any, actorId?: string) {
    InteractionPolicy.canCreate({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any);
    CustomerPolicy.canView({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any, { id: input.customerId });

    const interaction = await customerInteractionRepository.create({
      customerId: input.customerId,
      type: input.type,
      direction: input.direction,
      subject: input.subject,
      summary: input.summary,
      details: input.details,
      outcome: input.outcome,
      durationMinutes: input.durationMinutes,
      relatedEntityType: input.relatedEntityType,
      relatedEntityId: input.relatedEntityId,
      metadata: input.metadata,
      createdBy: actorId,
    } as any);

    await customerTimelineRepository.create({
      customerId: input.customerId,
      eventType: "CUSTOMER_UPDATED",
      description: `Interaction logged: ${input.type}${input.subject ? ` - ${input.subject}` : ""}`,
      relatedEntityType: "CustomerInteraction",
      relatedEntityId: interaction.id,
      recordedBy: actorId,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: input.customerId,
      action: "CUSTOMER_INTERACTION_CREATED",
      details: { type: input.type, subject: input.subject },
      actorId: actorId ?? undefined,
    });

    return interaction;
  }

  async findById(id: string) {
    return customerInteractionRepository.findById(id);
  }

  async findByCustomer(customerId: string, limit = 50, offset = 0) {
    return customerInteractionRepository.findByCustomer(customerId, limit, offset);
  }

  async findByType(type: string, limit = 100, offset = 0) {
    return customerInteractionRepository.findByType(type as any, limit, offset);
  }

  async findByEntity(relatedEntityType: string, relatedEntityId: string) {
    return customerInteractionRepository.findByEntity(relatedEntityType, relatedEntityId);
  }

  async update(
    id: string,
    input: any,
    actorId?: string
  ) {
    const interaction = await customerInteractionRepository.findById(id);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    const updated = await customerInteractionRepository.update(id, input as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: interaction.customer.id,
      action: "CUSTOMER_INTERACTION_UPDATED",
      details: { interactionId: id },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async delete(id: string, actorId?: string) {
    const interaction = await customerInteractionRepository.findById(id);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    await customerInteractionRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: interaction.customer.id,
      action: "CUSTOMER_INTERACTION_DELETED",
      details: { interactionId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }
}

export const customerInteractionService = new CustomerInteractionService();
