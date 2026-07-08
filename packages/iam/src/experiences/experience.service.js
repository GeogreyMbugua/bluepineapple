import { experienceRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
export class ExperienceService {
    async createExperience(data) {
        const existing = await experienceRepository.findBySlug(data.slug);
        if (existing) {
            throw new Error(`Experience with slug "${data.slug}" already exists`);
        }
        const experience = await experienceRepository.create({
            name: data.name,
            slug: data.slug,
            description: data.description,
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
            meta: data.meta,
        });
        await auditService.logRoleAssigned("system", experience.id, "EXPERIENCE_CREATED");
        eventBus.emit("experience.created", {
            experienceId: experience.id,
            name: experience.name,
            slug: experience.slug,
            category: experience.category,
        });
        return { id: experience.id, slug: experience.slug };
    }
    async updateExperience(id, data) {
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
        const updated = await experienceRepository.update(id, data);
        await auditService.logRoleAssigned("system", updated.id, "EXPERIENCE_UPDATED");
        eventBus.emit("experience.updated", { experienceId: id });
        return updated;
    }
    async activateExperience(id) {
        const updated = await experienceRepository.update(id, { isActive: true });
        await auditService.logRoleAssigned("system", updated.id, "EXPERIENCE_ACTIVATED");
        eventBus.emit("experience.activated", { experienceId: id });
        return updated;
    }
    async deactivateExperience(id) {
        const updated = await experienceRepository.update(id, { isActive: false });
        await auditService.logRoleAssigned("system", updated.id, "EXPERIENCE_DEACTIVATED");
        eventBus.emit("experience.deactivated", { experienceId: id });
        return updated;
    }
    async findById(id) {
        return experienceRepository.findWithRoutes(id);
    }
    async findBySlug(slug) {
        const exp = await experienceRepository.findBySlug(slug);
        if (!exp)
            return null;
        return experienceRepository.findWithRoutes(exp.id);
    }
    async getFeatured() {
        return experienceRepository.findFeatured();
    }
    async getActive() {
        return experienceRepository.findActive();
    }
    async listByCategory(category) {
        return experienceRepository.listByCategory(category);
    }
    async search(input) {
        return experienceRepository.search(input.query);
    }
}
export const experienceService = new ExperienceService();
