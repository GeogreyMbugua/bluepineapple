import { partnerRepository, prisma } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import {
  AddPayoutAccountSchema,
  CreatePartnerSchema,
  UpdatePartnerSchema,
  type UpdatePartnerInput,
} from "./partner.validators";

export class PartnerService {
  async createPartner(data: {
    userId?: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    partnerCode: string;
    companyName?: string | null;
    commissionRate: number;
    actorId?: string | null;
  }): Promise<string> {
    const validated = CreatePartnerSchema.parse(data);
    const result = await prisma.$transaction(async (tx) => {
      let user = validated.userId
        ? await tx.user.findUnique({ where: { id: validated.userId } })
        : null;

      if (validated.userId && !user) {
        throw new Error("User not found");
      }

      if (!user && validated.email) {
        user = await tx.user.findFirst({
          where: { email: { equals: validated.email, mode: "insensitive" } },
        });
      }

      if (!user) {
        if (!validated.email) {
          throw new Error("An email or existing user is required");
        }
        user = await tx.user.create({
          data: {
            email: validated.email,
            firstName: validated.firstName || validated.email.split("@")[0] || "Partner",
            lastName: validated.lastName || "Partner",
            phone: validated.phone ?? null,
            status: "ACTIVE",
          },
        });
      } else if (user.status !== "ACTIVE") {
        user = await tx.user.update({
          where: { id: user.id },
          data: { status: "ACTIVE" },
        });
      }

      const partnerRole = await tx.role.findUnique({
        where: { name: "PARTNER" },
      });
      if (!partnerRole) {
        throw new Error("PARTNER role not found");
      }

      await tx.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: partnerRole.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: partnerRole.id,
        },
      });

      const existingProfile = await tx.partnerProfile.findUnique({
        where: { userId: user.id },
      });
      if (existingProfile) {
        throw new Error(`User ${user.id} already has a partner profile`);
      }

      const profile = await tx.partnerProfile.create({
        data: {
          userId: user.id,
          partnerCode: validated.partnerCode,
          companyName: validated.companyName ?? null,
          commissionRate: validated.commissionRate,
          status: "ACTIVE",
        },
      });

      await tx.partnerStatusHistory.create({
        data: {
          partnerId: profile.id,
          oldStatus: null,
          newStatus: "ACTIVE",
          reason: "Partner created",
          changedByUserId: data.actorId ?? null,
        },
      });

      return { id: profile.id, userId: user.id };
    });

    await auditService.logRoleAssigned(
      data.actorId ?? null,
      result.userId,
      "PARTNER",
    );

    eventBus.emit("partner.created", {
      partnerId: result.id,
      userId: result.userId,
      partnerCode: validated.partnerCode,
    });

    return result.id;
  }

  async findById(id: string) {
    return partnerRepository.findWithPayoutAccounts(id);
  }

  async findByUserId(userId: string) {
    return partnerRepository.findByUserIdWithUser(userId);
  }

  async findByPartnerCode(partnerCode: string) {
    return partnerRepository.findByPartnerCode(partnerCode);
  }

  async list(params: {
    status?: "PENDING" | "ACTIVE" | "SUSPENDED" | "TERMINATED";
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const filters = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.search ? { search: params.search } : {}),
    };
    const statusCountFilters = params.search ? { search: params.search } : {};
    const statuses = ["ACTIVE", "PENDING", "SUSPENDED", "TERMINATED"] as const;
    const [partners, total, ...statusTotals] = await Promise.all([
      partnerRepository.list({
        ...filters,
        skip: (page - 1) * limit,
        take: limit,
      }),
      partnerRepository.count(filters),
      ...statuses.map((status) =>
        partnerRepository.count({ ...statusCountFilters, status }),
      ),
    ]);

    return {
      partners,
      total,
      page,
      limit,
      statusCounts: Object.fromEntries(
        statuses.map((status, index) => [status, statusTotals[index]]),
      ),
    };
  }

  async updateProfile(
    partnerId: string,
    data: UpdatePartnerInput,
    actorId: string | null = null,
  ) {
    const validated = UpdatePartnerSchema.omit({ status: true }).strict().parse(data);
    const updated = await partnerRepository.update(partnerId, validated);
    await auditService.logRoleAssigned(actorId, updated.userId, "PARTNER_UPDATED");
    return updated;
  }

  async addPayoutAccount(data: { partnerId: string; accountName: string; accountNumber: string; bankName?: string | null; mpesaNumber?: string | null; isDefault?: boolean }) {
    const validated = AddPayoutAccountSchema.parse(data);
    const account = await partnerRepository.addPayoutAccount({
      partner: { connect: { id: validated.partnerId } },
      accountName: validated.accountName,
      accountNumber: validated.accountNumber,
      bankName: validated.bankName ?? null,
      mpesaNumber: validated.mpesaNumber ?? null,
      isDefault: validated.isDefault ?? false,
    });

    if (account.isDefault) {
      await partnerRepository.setDefaultPayoutAccount(account.id, validated.partnerId);
    }

    eventBus.emit("payout.account.added", {
      partnerId: validated.partnerId,
      accountId: account.id,
    });

    return account;
  }

  async removePayoutAccount(accountId: string, partnerId: string) {
    await partnerRepository.removePayoutAccount(accountId, partnerId);
    eventBus.emit("payout.account.removed", { partnerId, accountId });
  }

  async setDefaultPayoutAccount(accountId: string, partnerId: string) {
    await partnerRepository.setDefaultPayoutAccount(accountId, partnerId);
    return partnerRepository.findWithPayoutAccounts(partnerId);
  }

  async listByStatus(status: string) {
    return partnerRepository.listByStatus(status as any);
  }
}

export const partnerService = new PartnerService();
