import {
  prisma,
  customerAddressRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CustomerPolicy } from "../policies/crm.policies";

export class CustomerAddressService {
  async add(
    customerId: string,
    input: any,
    actorId?: string
  ) {
    CustomerPolicy.canEdit({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any, { id: customerId });

    const address = await customerAddressRepository.create({
      customerId: input.customerId,
      type: input.type,
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      region: input.region,
      country: input.country,
      postalCode: input.postalCode,
      isPrimary: input.isPrimary,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_ADDRESS_ADDED",
      details: { type: input.type, city: input.city },
      actorId: actorId ?? undefined,
    });

    return address;
  }

  async findById(id: string) {
    return customerAddressRepository.findById(id);
  }

  async findByCustomer(customerId: string) {
    return customerAddressRepository.findByCustomer(customerId);
  }

  async update(
    id: string,
    input: any,
    actorId?: string
  ) {
    const address = await customerAddressRepository.findById(id);
    if (!address) {
      throw new Error("Address not found");
    }

    const updated = await customerAddressRepository.update(id, input as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: address.customerId,
      action: "CUSTOMER_ADDRESS_UPDATED",
      details: { addressId: id },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async delete(id: string, actorId?: string) {
    const address = await customerAddressRepository.findById(id);
    if (!address) {
      throw new Error("Address not found");
    }

    await customerAddressRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: address.customerId,
      action: "CUSTOMER_ADDRESS_REMOVED",
      details: { addressId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }

  async setPrimary(customerId: string, id: string, actorId?: string) {
    const address = await customerAddressRepository.findById(id);
    if (!address || address.customerId !== customerId) {
      throw new Error("Address not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.customerAddress.updateMany({
        where: { customerId, isPrimary: true },
        data: { isPrimary: false },
      });
      await tx.customerAddress.update({
        where: { id },
        data: { isPrimary: true },
      });
    });

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_ADDRESS_SET_PRIMARY",
      details: { addressId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }
}

export const customerAddressService = new CustomerAddressService();
