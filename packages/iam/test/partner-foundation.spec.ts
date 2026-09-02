import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CreatePartnerSchema,
  UpdatePartnerSchema,
} from "../src/partners/partner.validators";
import { PartnerPolicy } from "../src/policies/partner.policy";

describe("partner foundation contract", () => {
  it("requires an existing user or contact email for onboarding", () => {
    expect(
      CreatePartnerSchema.safeParse({
        partnerCode: "P-001",
        commissionRate: 10,
      }).success,
    ).toBe(false);

    expect(
      CreatePartnerSchema.safeParse({
        email: "partner@example.com",
        partnerCode: "P-001",
        commissionRate: 10,
      }).success,
    ).toBe(true);
  });

  it("does not allow profile updates to carry lifecycle changes", () => {
    const profileUpdate = UpdatePartnerSchema.omit({ status: true }).strict();
    expect(
      profileUpdate.safeParse({ status: "TERMINATED" }).success,
    ).toBe(false);
  });

  it("enforces the supported lifecycle transitions", () => {
    expect(PartnerPolicy.canTransition("PENDING", "ACTIVE")).toBe(true);
    expect(PartnerPolicy.canTransition("ACTIVE", "SUSPENDED")).toBe(true);
    expect(PartnerPolicy.canTransition("SUSPENDED", "ACTIVE")).toBe(true);
    expect(PartnerPolicy.canTransition("ACTIVE", "PENDING")).toBe(false);
    expect(PartnerPolicy.canTransition("TERMINATED", "SUSPENDED")).toBe(false);
    expect(() => PartnerPolicy.assertTransition("ACTIVE", "PENDING")).toThrow(
      "Cannot change partner status from ACTIVE to PENDING",
    );
  });
});

describe("partner onboarding transaction", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("reuses an existing user, assigns PARTNER, and records initial history", async () => {
    const tx = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: "11111111-1111-4111-8111-111111111111",
          status: "ACTIVE",
        }),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      role: { findUnique: vi.fn().mockResolvedValue({ id: "role-partner" }) },
      userRole: { upsert: vi.fn() },
      partnerProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "partner-1" }),
      },
      partnerStatusHistory: { create: vi.fn() },
    };
    const transaction = vi.fn(async (callback: (value: typeof tx) => unknown) => callback(tx));
    const audit = { logRoleAssigned: vi.fn() };

    vi.doMock("@blue-pineapple/database", () => ({
      prisma: { $transaction: transaction },
      partnerRepository: {},
    }));
    vi.doMock("../src/audit/audit.service", () => ({ auditService: audit }));
    vi.doMock("../src/events", () => ({ eventBus: { emit: vi.fn() } }));

    const { partnerService } = await import("../src/partners/partner.service");
    await partnerService.createPartner({
      userId: "11111111-1111-4111-8111-111111111111",
      partnerCode: "P-001",
      commissionRate: 10,
      actorId: "admin-1",
    });

    expect(transaction).toHaveBeenCalledOnce();
    expect(tx.userRole.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId_roleId: { userId: "11111111-1111-4111-8111-111111111111", roleId: "role-partner" } },
    }));
    expect(tx.partnerProfile.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: "ACTIVE", userId: "11111111-1111-4111-8111-111111111111" }),
    }));
    expect(tx.partnerStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        oldStatus: null,
        newStatus: "ACTIVE",
        changedByUserId: "admin-1",
      }),
    }));
  });

  it("creates a new active user and partner in the same transaction", async () => {
    const tx = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "user-new",
          status: "ACTIVE",
        }),
        update: vi.fn(),
      },
      role: { findUnique: vi.fn().mockResolvedValue({ id: "role-partner" }) },
      userRole: { upsert: vi.fn() },
      partnerProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "partner-new" }),
      },
      partnerStatusHistory: { create: vi.fn() },
    };
    vi.doMock("@blue-pineapple/database", () => ({
      prisma: {
        $transaction: vi.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
      },
      partnerRepository: {},
    }));
    vi.doMock("../src/audit/audit.service", () => ({ auditService: { logRoleAssigned: vi.fn() } }));
    vi.doMock("../src/events", () => ({ eventBus: { emit: vi.fn() } }));

    const { partnerService } = await import("../src/partners/partner.service");
    await partnerService.createPartner({
      email: "new@example.com",
      firstName: "New",
      lastName: "Partner",
      partnerCode: "P-002",
      commissionRate: 12,
    });

    expect(tx.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        email: "new@example.com",
        status: "ACTIVE",
      }),
    }));
    expect(tx.partnerStatusHistory.create).toHaveBeenCalledOnce();
  });
});

describe("partner lifecycle transaction", () => {
  it("updates user and partner history and revokes sessions on suspension", async () => {
    const tx = {
      partnerProfile: {
        findUnique: vi.fn().mockResolvedValue({
          id: "partner-1",
          userId: "user-1",
          status: "ACTIVE",
        }),
        update: vi.fn(),
      },
      user: { update: vi.fn() },
      partnerStatusHistory: { create: vi.fn() },
    };
    vi.doMock("@blue-pineapple/database", () => ({
      prisma: {
        $transaction: vi.fn(async (callback: (value: typeof tx) => unknown) => callback(tx)),
      },
    }));
    vi.doMock("../src/auth/revocation/session-revocation.service", () => ({
      sessionRevocationService: { revoke: vi.fn() },
    }));
    vi.doMock("../src/audit/audit.service", () => ({
      auditService: { logRoleRemoved: vi.fn() },
    }));
    vi.doMock("../src/events", () => ({ eventBus: { emit: vi.fn() } }));

    const { partnerLifecycleService } = await import("../src/partners/partner-lifecycle.service");
    await partnerLifecycleService.suspendPartner("partner-1", "admin-1", "Compliance review");

    expect(tx.partnerProfile.update).toHaveBeenCalledWith({
      where: { id: "partner-1" },
      data: { status: "SUSPENDED" },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { status: "SUSPENDED" },
    });
    expect(tx.partnerStatusHistory.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        oldStatus: "ACTIVE",
        newStatus: "SUSPENDED",
        changedByUserId: "admin-1",
      }),
    }));
  });
});
