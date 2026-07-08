import type { BookingStatus, DepartureStatus } from "@prisma/client";
import { BOOKING_TERMINAL_STATUSES, BOOKING_CANCELLABLE_STATUSES } from "../constants/booking.constants";
import { DEPARTURE_TERMINAL_STATUSES } from "../constants/departure.constants";

export class BookingPolicy {
  private static readonly ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    PENDING: ["CONFIRMED", "CANCELLED", "NO_SHOW"],
    CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
    CANCELLED: [],
    COMPLETED: [],
    NO_SHOW: [],
  };

  static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static assertTransition(from: BookingStatus, to: BookingStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(
        `Invalid booking status transition: ${from} → ${to}`
      );
    }
  }

  static isTerminal(status: BookingStatus): boolean {
    return BOOKING_TERMINAL_STATUSES.includes(status);
  }

  static isCancellable(status: BookingStatus): boolean {
    return BOOKING_CANCELLABLE_STATUSES.includes(status);
  }

  static isBookable(status: DepartureStatus): boolean {
    return status === "SCHEDULED" || status === "BOARDING";
  }

  static isVesselBookable(status: string): boolean {
    return status === "ACTIVE";
  }

  static isPartnerActive(status: string): boolean {
    return status === "ACTIVE";
  }

  static isExperienceBookable(isActive: boolean): boolean {
    return isActive;
  }

  static assertExperienceBookable(isActive: boolean): void {
    if (!this.isExperienceBookable(isActive)) {
      throw new Error("Experience is not bookable");
    }
  }

  static canModifyDeparture(status: DepartureStatus): boolean {
    return status === "SCHEDULED";
  }

  static canModify(bookingStatus: BookingStatus, departureStatus: DepartureStatus | null): boolean {
    if (this.isTerminal(bookingStatus)) {
      return false;
    }
    if (departureStatus && DEPARTURE_TERMINAL_STATUSES.includes(departureStatus)) {
      return false;
    }
    return true;
  }

  static assertModifiable(bookingStatus: BookingStatus, departureStatus: DepartureStatus | null): void {
    if (!this.canModify(bookingStatus, departureStatus)) {
      const reasons: string[] = [];
      if (this.isTerminal(bookingStatus)) {
        reasons.push(`Booking status is terminal (${bookingStatus})`);
      }
      if (departureStatus && DEPARTURE_TERMINAL_STATUSES.includes(departureStatus)) {
        reasons.push(`Departure status is terminal (${departureStatus})`);
      }
      throw new Error(`Cannot modify booking: ${reasons.join("; ")}`);
    }
  }

  static canConfirm(status: BookingStatus): boolean {
    return status === "PENDING";
  }

  static canComplete(status: BookingStatus): boolean {
    return status === "CONFIRMED";
  }

  static canMarkNoShow(status: BookingStatus): boolean {
    return status === "CONFIRMED" || status === "PENDING";
  }
}
