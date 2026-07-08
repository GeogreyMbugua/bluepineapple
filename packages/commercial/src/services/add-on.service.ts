import { prisma, addOnRepository, addOnPriceRepository } from "@blue-pineapple/database";
import { eventBus } from "@blue-pineapple/iam";
import { auditLogger } from "@blue-pineapple/iam/audit/audit-logger";
import type { AddOnCreatedEvent } from "../events/commercial.events";
import { PricingPolicy } from "../policies";

export class AddOnService {
  async create(input: any, actorId?: string) {
    const addOn = await prisma.$transaction(async (tx) => {
      const created = await tx.addOn.create({
        data: {
          name: input.name,
          description: input.description,
          category: input.category,
          experienceId: input.experienceId,
          isPerPerson: input.isPerPerson ?? true,
          metadata: input.metadata,
        },
      });

      for (const price of input.prices ?? []) {
        await tx.addOnPrice.create({
          data: {
            addOnId: created.id,
            name: price.name,
            description: price.description,
            price: price.price.toString(),
            currency: price.currency ?? "KES",
            effectiveFrom: price.effectiveFrom,
            effectiveTo: price.effectiveTo,
            priority: price.priority ?? 0,
            isActive: price.isActive ?? true,
          },
        });
      }

      return created;
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: addOn.id,
      action: "ADD_ON_CREATED",
      details: { name: addOn.name, category: addOn.category },
      actorId: actorId ?? undefined,
    });

    (eventBus as any).emit("addon.created", {
      addOnId: addOn.id,
      addOnName: addOn.name,
      category: addOn.category,
    } as AddOnCreatedEvent);

    return addOn;
  }

  async findById(id: string) {
    return addOnRepository.findById(id);
  }

  async findActive(context: any) {
    return addOnRepository.findActive(context?.experienceId, context?.category);
  }

  async createPrice(addOnId: string, priceInput: any, actorId?: string) {
    const addOn = await addOnRepository.findById(addOnId);
    if (!addOn) {
      throw new Error("Add-on not found");
    }

    const price = await addOnPriceRepository.create({
      addOnId,
      name: priceInput.name,
      description: priceInput.description,
      price: priceInput.price,
      currency: priceInput.currency ?? "KES",
      effectiveFrom: priceInput.effectiveFrom,
      effectiveTo: priceInput.effectiveTo,
      priority: priceInput.priority ?? 0,
      isActive: priceInput.isActive ?? true,
    });

      auditLogger.logAdminAction(actorId ?? "system", {
      targetUserId: addOnId,
      action: "ADD_ON_PRICE_CREATED",
      details: { priceId: price.id, name: price.name },
      actorId: actorId ?? undefined,
    });

    return price;
  }

  async findPrice(addOnId: string, context: any) {
    const prices = await addOnPriceRepository.findByAddOn(addOnId);
    const activePrice = prices.find((p: any) => {
      if (!p.isActive) return false;
      const now = new Date();
      if (p.effectiveFrom && now < p.effectiveFrom) return false;
      if (p.effectiveTo && now > p.effectiveTo) return false;
      return true;
    });
    return activePrice ?? null;
  }
}

export const addOnService = new AddOnService();
