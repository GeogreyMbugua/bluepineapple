import { prisma } from "../client";
import type {
  CustomerConsent,
  Prisma,
  ConsentChannel,
  ConsentType,
} from "@prisma/client";

export class CustomerConsentRepository {
  async findById(id: string) {
    return prisma.customerConsent.findUnique({ where: { id } });
  }

  async findByCustomer(customerId: string) {
    return prisma.customerConsent.findMany({
      where: { customerId },
    });
  }

  async findOneByUnique(customerId: string, channel: ConsentChannel, consentType: ConsentType) {
    return prisma.customerConsent.findFirst({
      where: { customerId, channel, consentType },
    });
  }

  async isGranted(customerId: string, channel: ConsentChannel, consentType: ConsentType): Promise<boolean> {
    const consent = await prisma.customerConsent.findFirst({
      where: { customerId, channel, consentType, isGranted: true },
    });
    return consent !== null;
  }

  async create(data: Prisma.CustomerConsentCreateInput): Promise<CustomerConsent> {
    return prisma.customerConsent.create({ data: data as any });
  }

  async update(
    id: string,
    data: Prisma.CustomerConsentUpdateInput
  ): Promise<CustomerConsent> {
    return prisma.customerConsent.update({ where: { id }, data });
  }

  async upsert(customerId: string, channel: ConsentChannel, consentType: ConsentType, data: {
    isGranted: boolean;
    ipAddress?: string;
    userAgent?: string;
    consentVersion?: string;
    withdrawnAt?: Date;
  }) {
    const existing = await this.findOneByUnique(customerId, channel, consentType);
    if (existing) {
      return prisma.customerConsent.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.customerConsent.create({
      data: { customerId, channel, consentType, ...data } as any,
    });
  }

  async delete(id: string) {
    return prisma.customerConsent.delete({ where: { id } });
  }

  async deleteByCustomer(customerId: string) {
    return prisma.customerConsent.deleteMany({ where: { customerId } });
  }
}

export const customerConsentRepository = new CustomerConsentRepository();
