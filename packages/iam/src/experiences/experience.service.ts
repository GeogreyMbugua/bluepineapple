import { experienceRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import type { CreateExperienceInput, UpdateExperienceInput, ExperienceSearchInput } from "./experience.validators";
import type {
  ExperienceCreatedEvent,
  ExperienceUpdatedEvent,
  ExperienceActivatedEvent,
  ExperienceDeactivatedEvent,
} from "./experience.events";

export class ExperienceService {
  async createExperience(data: CreateExperienceInput): Promise<{ id: string; slug: string }> {
    const existing = await experienceRepository.findBySlug(data.slug);
    if (existing) {
      throw new Error(`Experience with slug "${data.slug}" already exists`);
    }

    const experience = await experienceRepository.create({
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      shortDescription: data.shortDescription,
      durationMinutes: data.durationMinutes,
      defaultPrice: data.defaultPrice,
      currency: data.currency ?? "KES",
      category: data.category,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      heroImageUrl: data.heroImageUrl,
      galleryUrls: data.galleryUrls,
      maxGroupSize: data.maxGroupSize,
      minGroupSize: data.minGroupSize,
      requirements: data.requirements,
      includes: data.includes,
      highlights: data.highlights,
      meta: data.meta as any,
    } as any);

    await auditService.logRoleAssigned("system", experience.id, "EXPERIENCE_CREATED");

    eventBus.emit("experience.created", {
      experienceId: experience.id,
      name: experience.name,
      slug: experience.slug,
      category: experience.category,
    } as ExperienceCreatedEvent);

    return { id: experience.id, slug: experience.slug };
  }

  async updateExperience(id: string, data: UpdateExperienceInput) {
    const exists = await experienceRepository.findById(id);
    if (!exists) {
      throw new Error("Experience not found");
    }

    if (data.slug && data.slug !== exists.slug) {
      const slugTaken = await experienceRepository.findBySlug(data.slug);
      if (slugTaken) {
        throw new Error(`Slug "${data.slug}" is already in use`);
      }
    }

    const updated = await experienceRepository.update(id, data as any);

    await auditService.logRoleAssigned("system", updated.id, "EXPERIENCE_UPDATED");

    eventBus.emit("experience.updated", { experienceId: id } as ExperienceUpdatedEvent);

    return updated;
  }

  async activateExperience(id: string) {
    const updated = await experienceRepository.update(id, { isActive: true });
    await auditService.logRoleAssigned("system", updated.id, "EXPERIENCE_ACTIVATED");
    eventBus.emit("experience.activated", { experienceId: id } as ExperienceActivatedEvent);
    return updated;
  }

  async deactivateExperience(id: string) {
    const updated = await experienceRepository.update(id, { isActive: false });
    await auditService.logRoleAssigned("system", updated.id, "EXPERIENCE_DEACTIVATED");
    eventBus.emit("experience.deactivated", { experienceId: id } as ExperienceDeactivatedEvent);
    return updated;
  }

  async findById(id: string) {
    return experienceRepository.findWithRoutes(id);
  }

  async findBySlug(slug: string) {
    const exp = await experienceRepository.findBySlug(slug);
    if (!exp) return null;
    return experienceRepository.findWithRoutes(exp.id);
  }

  async getFeatured() {
    return experienceRepository.findFeatured();
  }

  async getActive() {
    return experienceRepository.findActive();
  }

  async listByCategory(category: string) {
    return experienceRepository.listByCategory(category as any);
  }

  async search(input: ExperienceSearchInput) {
    return experienceRepository.search(input.query);
  }
}

export const experienceService = new ExperienceService();
