import { guestRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
export class GuestService {
    async resolveGuest(data) {
        const identifier = data.email || data.phone;
        if (!identifier) {
            const guest = await guestRepository.create({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                totalVisits: 1,
                firstVisitAt: new Date(),
                lastVisitAt: new Date(),
            });
            auditService.logRoleAssigned("system", guest.id, "GUEST_CREATED");
            eventBus.emit("guest.created", {
                guestId: guest.id,
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email ?? undefined,
                phone: guest.phone ?? undefined,
            });
            return { id: guest.id, isNew: true };
        }
        const existing = await guestRepository.findByIdentifier(identifier);
        if (existing) {
            const updated = await guestRepository.incrementVisit(existing.id);
            eventBus.emit("guest.updated", { guestId: updated.id });
            return { id: updated.id, isNew: false };
        }
        const guest = await guestRepository.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            totalVisits: 1,
            firstVisitAt: new Date(),
            lastVisitAt: new Date(),
        });
        auditService.logRoleAssigned("system", guest.id, "GUEST_CREATED");
        eventBus.emit("guest.created", {
            guestId: guest.id,
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email ?? undefined,
            phone: guest.phone ?? undefined,
        });
        return { id: guest.id, isNew: true };
    }
    async createGuest(data) {
        const guest = await guestRepository.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            idNumber: data.idNumber,
            nationality: data.nationality,
            country: data.country,
            dateOfBirth: data.dateOfBirth,
            specialRequests: data.specialRequests,
            notes: data.notes,
            marketingOptIn: data.marketingOptIn,
            totalVisits: 0,
        });
        auditService.logRoleAssigned("system", guest.id, "GUEST_CREATED");
        eventBus.emit("guest.created", {
            guestId: guest.id,
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email ?? undefined,
            phone: guest.phone ?? undefined,
        });
        return guest;
    }
    async updateGuest(id, data) {
        const existing = await guestRepository.findById(id);
        if (!existing) {
            throw new Error("Guest not found");
        }
        const updated = await guestRepository.update(id, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            idNumber: data.idNumber,
            nationality: data.nationality,
            country: data.country,
            dateOfBirth: data.dateOfBirth,
            specialRequests: data.specialRequests,
            notes: data.notes,
            marketingOptIn: data.marketingOptIn,
        });
        auditService.logRoleAssigned("system", id, "GUEST_UPDATED");
        eventBus.emit("guest.updated", { guestId: id });
        return updated;
    }
    async getGuest(id) {
        return guestRepository.findById(id);
    }
    async searchGuests(query) {
        return guestRepository.search(query);
    }
    async getGuestHistory(guestId) {
        return guestRepository.findBookingHistory(guestId);
    }
    async listGuests(limit = 100, offset = 0) {
        return guestRepository.list(limit, offset);
    }
}
export const guestService = new GuestService();
