import { guestRepository } from "@blue-pineapple/database";
import { auditService } from "../audit/audit.service";
import { eventBus } from "../events";
import type { CreateGuestInput, UpdateGuestInput } from "./guest.validators";
import type { GuestCreatedEvent, GuestUpdatedEvent } from "./guest.events";

export class GuestService {
  async resolveGuest(data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  }): Promise<{ id: string; isNew: boolean }> {
    const identifier = data.email || data.phone;
    if (!identifier) {
      const guest = await guestRepository.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email ?? null,
        phone: data.phone ?? null,
        totalVisits: 1,
        firstVisitAt: new Date(),
        lastVisitAt: new Date(),
      });

      auditService.logRoleAssigned("system", guest.id, "GUEST_CREATED");

      const guestCreatedPayload: { guestId: string; firstName: string; lastName: string; email?: string; phone?: string } = {
        guestId: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
      };
      if (guest.email) guestCreatedPayload.email = guest.email;
      if (guest.phone) guestCreatedPayload.phone = guest.phone;
      eventBus.emit("guest.created", guestCreatedPayload as GuestCreatedEvent);

      return { id: guest.id, isNew: true };
    }

    const existing = await guestRepository.findByIdentifier(identifier);
    if (existing) {
      const updated = await guestRepository.incrementVisit(existing.id);

      eventBus.emit("guest.updated", { guestId: updated.id } as GuestUpdatedEvent);

      return { id: updated.id, isNew: false };
    }

    const guest = await guestRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      totalVisits: 1,
      firstVisitAt: new Date(),
      lastVisitAt: new Date(),
    });

    auditService.logRoleAssigned("system", guest.id, "GUEST_CREATED");

    const guestCreatedPayload: { guestId: string; firstName: string; lastName: string; email?: string; phone?: string } = {
      guestId: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
    };
    if (guest.email) guestCreatedPayload.email = guest.email;
    if (guest.phone) guestCreatedPayload.phone = guest.phone;
    eventBus.emit("guest.created", guestCreatedPayload as GuestCreatedEvent);

    return { id: guest.id, isNew: true };
  }

  async createGuest(data: CreateGuestInput) {
    const guest = await guestRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      idNumber: data.idNumber ?? null,
      nationality: data.nationality ?? null,
      country: data.country ?? null,
      dateOfBirth: data.dateOfBirth,
      specialRequests: data.specialRequests ?? null,
      notes: data.notes ?? null,
      marketingOptIn: data.marketingOptIn,
      totalVisits: 0,
    } as any);

    auditService.logRoleAssigned("system", guest.id, "GUEST_CREATED");

    const guestCreatedPayload: { guestId: string; firstName: string; lastName: string; email?: string; phone?: string } = {
      guestId: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
    };
    if (guest.email) guestCreatedPayload.email = guest.email;
    if (guest.phone) guestCreatedPayload.phone = guest.phone;
    eventBus.emit("guest.created", guestCreatedPayload as GuestCreatedEvent);

    return guest;
  }

  async updateGuest(id: string, data: UpdateGuestInput) {
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
    } as any);

    auditService.logRoleAssigned("system", id, "GUEST_UPDATED");

    eventBus.emit("guest.updated", { guestId: id } as GuestUpdatedEvent);

    return updated;
  }

  async getGuest(id: string) {
    return guestRepository.findById(id);
  }

  async searchGuests(query: string) {
    return guestRepository.search(query);
  }

  async getGuestHistory(guestId: string) {
    return guestRepository.findBookingHistory(guestId);
  }

  async listGuests(limit = 100, offset = 0) {
    return guestRepository.list(limit, offset);
  }
}

export const guestService = new GuestService();
