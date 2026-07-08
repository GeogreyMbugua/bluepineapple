import { prisma, priceListRepository, priceListItemRepository } from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import type { PriceStatus } from "../domain/commercial.types";
import type { PriceListActivatedEvent, PriceListExpiredEvent } from "../events/commercial.events";
import { PricingPolicy } from "../policies";

export class PriceListService {
  async create(input: any, actorId?: string) {
    const priceList = await prisma.$transaction(async (tx) => {
      const created = await tx.priceList.create({
        data: {
          name: input.name,
          description: input.description,
          experienceId: input.experienceId,
          status: input.status ?? "DRAFT",
          effectiveFrom: input.effectiveFrom,
          effectiveTo: input.effectiveTo,
          priority: input.priority ?? 0,
          currency: input.currency ?? "KES",
          createdBy: actorId,
          isActive: input.isActive ?? true,
        },
      });
      for (const item of input.items ?? []) {
        await tx.priceListItem.create({
          data: {
            priceListId: created.id,
            name: item.name,
            description: item.description,
            basePrice: item.basePrice.toString(),
            currency: item.currency ?? "KES",
            customerCategory: item.customerCategory,
            ageGroup: item.ageGroup,
            minGuests: item.minGuests,
            maxGuests: item.maxGuests,
            seatClass: item.seatClass,
            meta: item.meta,
            isActive: true,
          },
        });
      }
      return created;
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: priceList.id,
      action: "PRICE_LIST_CREATED",
      details: { name: priceList.name, status: priceList.status },
      actorId: actorId ?? undefined,
    });

    return priceList;
  }

  async update(id: string, input: any, actorId?: string) {
    const existing = await priceListRepository.findById(id);
    if (!existing) {
      throw new Error("Price list not found");
    }

    const updated = await priceListRepository.update(id, {
      name: input.name,
      description: input.description,
      status: input.status,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      priority: input.priority,
      isActive: input.isActive,
    } as any);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "PRICE_LIST_UPDATED",
      details: { name: updated.name, status: updated.status },
      actorId: actorId ?? undefined,
    });

    return updated;
  }

  async findById(id: string) {
    return priceListRepository.findById(id);
  }

  async findByExperience(experienceId: string) {
    return prisma.priceList.findMany({
      where: { experienceId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveByContext(experienceId: string, date?: Date) {
    return priceListRepository.findActiveByExperience(experienceId, date);
  }

  async activate(id: string, actorId?: string) {
    const priceList = await priceListRepository.findById(id);
    if (!priceList) {
      throw new Error("Price list not found");
    }

    const updated = await priceListRepository.update(id, { status: "ACTIVE", isActive: true } as any);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "PRICE_LIST_ACTIVATED",
      details: { name: updated.name, priority: updated.priority },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("price.list.activated", {
      priceListId: updated.id,
      priceListName: updated.name,
      priority: updated.priority,
    } as PriceListActivatedEvent);

    return updated;
  }

  async expire(id: string, actorId?: string) {
    const priceList = await priceListRepository.findById(id);
    if (!priceList) {
      throw new Error("Price list not found");
    }

    const updated = await priceListRepository.update(id, { status: "EXPIRED", isActive: false } as any);

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: id,
      action: "PRICE_LIST_EXPIRED",
      details: { name: updated.name },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("price.list.expired", {
      priceListId: updated.id,
      priceListName: updated.name,
    } as PriceListExpiredEvent);

    return updated;
  }

  async findByStatus(status: string) {
    return priceListRepository.findByStatus(status as any);
  }

  async findAll() {
    return prisma.priceList.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }
}

export const priceListService = new PriceListService();
