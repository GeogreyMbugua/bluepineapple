import {
  prisma,
  customerTagRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CustomerPolicy } from "../policies/crm.policies";

export class CustomerTagService {
  async add(
    customerId: string,
    tag: string,
    actorId?: string,
    color?: string,
    metadata?: any
  ) {
    CustomerPolicy.canEdit({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any, { id: customerId });

    const existing = await customerTagRepository.findOneByUnique(customerId, tag);
    if (existing) {
      return existing;
    }

    const customerTag = await customerTagRepository.create({
      customerId,
      tag,
      color,
      metadata,
      createdBy: actorId,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_TAG_ADDED",
      details: { tag },
      actorId: actorId ?? undefined,
    });

    return customerTag;
  }

  async findById(id: string) {
    return customerTagRepository.findById(id);
  }

  async findByCustomer(customerId: string) {
    return customerTagRepository.findByCustomer(customerId);
  }

  async findByTag(tag: string, limit = 100, offset = 0) {
    return customerTagRepository.findByTag(tag, limit, offset);
  }

  async remove(customerId: string, tag: string, actorId?: string) {
    const existing = await customerTagRepository.findOneByUnique(customerId, tag);
    if (!existing) {
      throw new Error("Tag not found");
    }

    await customerTagRepository.delete(existing.id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_TAG_REMOVED",
      details: { tag },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }
}

export const customerTagService = new CustomerTagService();
