import {
  prisma,
  customerConsentRepository,
  customerTimelineRepository,
} from "@blue-pineapple/database";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import { CustomerPolicy } from "../policies/crm.policies";

export class CustomerConsentService {
  async update(
    customerId: string,
    channel: any,
    consentType: any,
    isGranted: boolean,
    ipAddress?: string,
    userAgent?: string,
    consentVersion?: string,
    actorId?: string
  ) {
    CustomerPolicy.canEdit({ id: actorId ?? "", roles: [] as any, permissions: [] as any } as any, { id: customerId });

    const consent = await customerConsentRepository.upsert(
      customerId,
      channel,
      consentType,
      {
        isGranted,
        ipAddress,
        userAgent,
        consentVersion,
        withdrawnAt: !isGranted ? new Date() : undefined,
      }
    );

    await customerTimelineRepository.create({
      customerId,
      eventType: "CONSENT_UPDATED",
      description: `Consent ${isGranted ? "granted" : "withdrawn"}: ${channel}.${consentType}`,
      recordedBy: actorId,
    } as any);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: customerId,
      action: "CUSTOMER_CONSENT_UPDATED",
      details: { channel, consentType, isGranted },
      actorId: actorId ?? undefined,
    });

    return consent;
  }

  async findOne(customerId: string, channel: any, consentType: any) {
    return customerConsentRepository.findOneByUnique(customerId, channel, consentType);
  }

  async findByCustomer(customerId: string) {
    return customerConsentRepository.findByCustomer(customerId);
  }

  async isGranted(customerId: string, channel: any, consentType: any): Promise<boolean> {
    return customerConsentRepository.isGranted(customerId, channel, consentType);
  }

  async hasMarketingConsent(customerId: string): Promise<boolean> {
    const email = await customerConsentRepository.isGranted(customerId, "EMAIL", "MARKETING_EMAIL");
    const sms = await customerConsentRepository.isGranted(customerId, "SMS", "MARKETING_SMS");
    const whatsapp = await customerConsentRepository.isGranted(customerId, "WHATSAPP", "MARKETING_WHATSAPP");
    return email || sms || whatsapp;
  }

  async delete(id: string, actorId?: string) {
    const consent = await customerConsentRepository.findById(id);
    if (!consent) {
      throw new Error("Consent record not found");
    }

    await customerConsentRepository.delete(id);

    auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: consent.customerId,
      action: "CUSTOMER_CONSENT_DELETED",
      details: { consentId: id },
      actorId: actorId ?? undefined,
    });

    return { success: true };
  }
}

export const customerConsentService = new CustomerConsentService();
