import { DEPARTURE_ACTIVE_STATUSES, DEPARTURE_NON_MODIFIABLE_STATUSES, DEPARTURE_TERMINAL_STATUSES } from "../constants/departure.constants";
export class DeparturePolicy {
    static canPublish(status) {
        return status === "SCHEDULED";
    }
    static canCancel(status) {
        return !DEPARTURE_TERMINAL_STATUSES.includes(status);
    }
    static canClose(status) {
        return status === "DEPARTED";
    }
    static canReschedule(status) {
        return status === "SCHEDULED";
    }
    static canAssignVessel(status) {
        return !DEPARTURE_NON_MODIFIABLE_STATUSES.includes(status);
    }
    static canAssignRoute(status) {
        return !DEPARTURE_NON_MODIFIABLE_STATUSES.includes(status);
    }
    static canAssignExperience(status) {
        return !DEPARTURE_NON_MODIFIABLE_STATUSES.includes(status);
    }
    static canUpdate(status) {
        return !DEPARTURE_NON_MODIFIABLE_STATUSES.includes(status);
    }
    static isTerminal(status) {
        return DEPARTURE_TERMINAL_STATUSES.includes(status);
    }
    static isBookable(status) {
        return DEPARTURE_ACTIVE_STATUSES.includes(status);
    }
    static isOperational(status) {
        return status === "BOARDING" || status === "DEPARTED";
    }
    static assertModifiable(status) {
        if (this.isTerminal(status)) {
            throw new Error(`Cannot modify departure in terminal status: ${status}`);
        }
    }
    static assertTransition(from, to) {
        const validTransitions = {
            SCHEDULED: ["BOARDING", "CANCELLED"],
            BOARDING: ["DEPARTED", "CANCELLED"],
            DEPARTED: ["COMPLETED", "CANCELLED"],
            COMPLETED: [],
            CANCELLED: [],
        };
        const allowed = validTransitions[from] ?? [];
        if (!allowed.includes(to)) {
            throw new Error(`Invalid departure status transition: ${from} → ${to}. Valid transitions from ${from}: ${allowed.join(", ") || "none"}`);
        }
    }
}
