import { BOOKING_TERMINAL_STATUSES, BOOKING_CANCELLABLE_STATUSES } from "../constants/booking.constants";
import { DEPARTURE_TERMINAL_STATUSES } from "../constants/departure.constants";
export class BookingPolicy {
    static ALLOWED_TRANSITIONS = {
        PENDING: ["CONFIRMED", "CANCELLED", "NO_SHOW"],
        CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
        CANCELLED: [],
        COMPLETED: [],
        NO_SHOW: [],
    };
    static canTransition(from, to) {
        return this.ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
    }
    static assertTransition(from, to) {
        if (!this.canTransition(from, to)) {
            throw new Error(`Invalid booking status transition: ${from} → ${to}`);
        }
    }
    static isTerminal(status) {
        return BOOKING_TERMINAL_STATUSES.includes(status);
    }
    static isCancellable(status) {
        return BOOKING_CANCELLABLE_STATUSES.includes(status);
    }
    static isBookable(status) {
        return status === "SCHEDULED" || status === "BOARDING";
    }
    static isVesselBookable(status) {
        return status === "ACTIVE";
    }
    static isPartnerActive(status) {
        return status === "ACTIVE";
    }
    static isExperienceBookable(isActive) {
        return isActive;
    }
    static assertExperienceBookable(isActive) {
        if (!this.isExperienceBookable(isActive)) {
            throw new Error("Experience is not bookable");
        }
    }
    static canModifyDeparture(status) {
        return status === "SCHEDULED";
    }
    static canModify(bookingStatus, departureStatus) {
        if (this.isTerminal(bookingStatus)) {
            return false;
        }
        if (departureStatus && DEPARTURE_TERMINAL_STATUSES.includes(departureStatus)) {
            return false;
        }
        return true;
    }
    static assertModifiable(bookingStatus, departureStatus) {
        if (!this.canModify(bookingStatus, departureStatus)) {
            const reasons = [];
            if (this.isTerminal(bookingStatus)) {
                reasons.push(`Booking status is terminal (${bookingStatus})`);
            }
            if (departureStatus && DEPARTURE_TERMINAL_STATUSES.includes(departureStatus)) {
                reasons.push(`Departure status is terminal (${departureStatus})`);
            }
            throw new Error(`Cannot modify booking: ${reasons.join("; ")}`);
        }
    }
    static canConfirm(status) {
        return status === "PENDING";
    }
    static canComplete(status) {
        return status === "CONFIRMED";
    }
    static canMarkNoShow(status) {
        return status === "CONFIRMED" || status === "PENDING";
    }
}
