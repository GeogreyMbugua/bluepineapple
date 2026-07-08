import {
  prisma,
  customerContactRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CustomerPolicy } from "../policies/crm.policies";

export class CustomerContactService {
  async add(
    customerId: string,
    input: any,
    actorId?: string
  ) {
    CustomerPolicy.canEdit({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any, { id: customerId });

    const contact = await customerContactRepository.create({
      customerId: input.customerId,
      type: input.type,
      value: input.value,
      label: input.label,
      isPrimary: input.isPrimary,
      isVerified: input.isVerified,
      purpose: input.purpose,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_CONTACT_ADDED",
      details: { type: input.type, value: input.value },
      actorId: actorId ?? undefined,
    });

    return contact;
  }

  async findById(id: string) {
    return customerContactRepository.findById(id);
  }

  async findByCustomer(customerId: string) {
    return customerContactRepository.findByCustomer(customerId);
  }

  async update(
    id: string,
    input: any,
    actorId?: string
  ) {
    const contact = await customerContactRepository.findById(id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    const updated = await customerContactRepository.update(id, input as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: contact.customerId,
      action: "CUSTOMER_CONTACT_UPDATED",
      details: { contactId: id },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async delete(id: string, actorId?: string) {
    const contact = await customerContactRepository.findById(id);
    if (!contact) {
      throw new Error("Contact not found");
    }

    await customerContactRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: contact.customerId,
      action: "CUSTOMER_CONTACT_REMOVED",
      details: { contactId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }

  async setPrimary(customerId: string, id: string, actorId?: string) {
    const contact = await customerContactRepository.findById(id);
    if (!contact || contact.customerId !== customerId) {
      throw new Error("Contact not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.customerContact.updateMany({
        where: { customerId, isPrimary: true },
        data: { isPrimary: false },
      });
      await tx.customerContact.update({
        where: { id },
        data: { isPrimary: true },
      });
    });

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_CONTACT_SET_PRIMARY",
      details: { contactId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }
}

export const customerContactService = new CustomerContactService();
