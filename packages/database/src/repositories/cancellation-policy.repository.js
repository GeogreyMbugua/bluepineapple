import { prisma } from "../client";
export class CancellationPolicyRepository {
    async findById(id) {
        return prisma.cancellationPolicy.findUnique({ where: { id } });
    }
    async findApplicable(experienceId, partnerId, corporateId, hoursBefore) {
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
    async findDefault(experienceId) {
        return prisma.cancellationPolicy.findFirst({
            where: {
                isDefault: true,
                isActive: true,
                ...(experienceId ? { experienceId } : { experienceId: null }),
            },
            orderBy: { priority: "desc" },
        });
    }
    async findByExperience(experienceId) {
        return prisma.cancellationPolicy.findMany({
            where: { experienceId, isActive: true },
            orderBy: { priority: "desc" },
        });
    }
    async create(data) {
        return prisma.cancellationPolicy.create({
            data: {
                name: data.name,
                description: data.description,
                experienceId: data.experienceId,
                partnerId: data.partnerId,
                corporateId: data.corporateId,
                windowType: data.windowType,
                hoursBefore: data.hoursBefore,
                refundPercentage: data.refundPercentage.toString(),
                penaltyAmount: data.penaltyAmount?.toString(),
                penaltyType: data.penaltyType ?? "PERCENTAGE",
                administrativeFee: data.administrativeFee?.toString(),
                allowRefund: data.allowRefund ?? true,
                isDefault: data.isDefault ?? false,
                priority: data.priority ?? 0,
                effectiveFrom: data.effectiveFrom,
                effectiveTo: data.effectiveTo,
            },
        });
    }
}
export const cancellationPolicyRepository = new CancellationPolicyRepository();
