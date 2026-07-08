import { prisma } from "../client";

export class CancellationPolicyRepository {
  async findById(id: string) {
    return prisma.cancellationPolicy.findUnique({ where: { id } });
  }

  async findApplicable(
    experienceId?: string,
    partnerId?: string,
    corporateId?: string,
    _hoursBefore?: number
  ) {
    const now = new Date();
    return prisma.cancellationPolicy.findFirst({
      where: {
        isActive: true,
        effectiveFrom: { lte: now },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: now } },
        ],
        ...(experienceId ? { experienceId } : { experienceId: null }),
        ...(partnerId ? { partnerId } : { partnerId: null }),
        ...(corporateId ? { corporateId } : { corporateId: null }),
      },
      orderBy: { priority: "desc" },
    });
  }

  async findDefault(experienceId?: string) {
    return prisma.cancellationPolicy.findFirst({
      where: {
        isDefault: true,
        isActive: true,
        ...(experienceId ? { experienceId } : { experienceId: null }),
      },
      orderBy: { priority: "desc" },
    });
  }

  async findByExperience(experienceId: string) {
    return prisma.cancellationPolicy.findMany({
      where: { experienceId, isActive: true },
      orderBy: { priority: "desc" },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    experienceId?: string;
    partnerId?: string;
    corporateId?: string;
    windowType: string;
    hoursBefore: number;
    refundPercentage: number;
    penaltyAmount?: number;
    penaltyType?: string;
    administrativeFee?: number;
    allowRefund?: boolean;
    isDefault?: boolean;
    priority?: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
  }) {
    return prisma.cancellationPolicy.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        experienceId: data.experienceId ?? null,
        partnerId: data.partnerId ?? null,
        corporateId: data.corporateId ?? null,
        windowType: data.windowType as any,
        hoursBefore: data.hoursBefore,
        refundPercentage: data.refundPercentage.toString(),
        penaltyAmount: data.penaltyAmount?.toString(),
        penaltyType: data.penaltyType ?? "PERCENTAGE",
        administrativeFee: data.administrativeFee?.toString(),
        allowRefund: data.allowRefund ?? true,
        isDefault: data.isDefault ?? false,
        priority: data.priority ?? 0,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo ?? null,
      } as any,
    });
  }
}

export const cancellationPolicyRepository = new CancellationPolicyRepository();
