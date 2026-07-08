import {
  prisma,
  customerPreferenceRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CustomerPolicy } from "../policies/crm.policies";

export class CustomerPreferenceService {
  async upsert(
    customerId: string,
    category: string,
    key: string,
    value: string,
    metadata?: any,
    actorId?: string
  ) {
    CustomerPolicy.canEdit({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any, { id: customerId });

    const preference = await customerPreferenceRepository.upsert(
      customerId,
      category,
      key,
      value,
      metadata
    );

    await customerTimelineRepository.create({
      customerId,
      eventType: "CUSTOMER_UPDATED",
      description: `Preference updated: ${category}.${key}`,
      recordedBy: actorId,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_PREFERENCE_UPDATED",
      details: { category, key, value },
      actorId: actorId ?? undefined,
    });

    return preference;
  }

  async findById(id: string) {
    return customerPreferenceRepository.findById(id);
  }

  async findByCustomer(customerId: string) {
    return customerPreferenceRepository.findByCustomer(customerId);
  }

  async findByCategory(customerId: string, category: string) {
    return customerPreferenceRepository.findByCategory(customerId, category);
  }

  async delete(id: string, actorId?: string) {
    const preference = await customerPreferenceRepository.findById(id);
    if (!preference) {
      throw new Error("Preference not found");
    }

    await customerPreferenceRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: preference.customerId,
      action: "CUSTOMER_PREFERENCE_DELETED",
      details: { preferenceId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }

  async deleteByCustomer(customerId: string, actorId?: string) {
    await customerPreferenceRepository.deleteByCustomer(customerId);
    return { success: true };
  }
}

export const customerPreferenceService = new CustomerPreferenceService();
