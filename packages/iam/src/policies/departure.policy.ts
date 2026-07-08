import type { DepartureStatus } from "@prisma/client";
import { DEPARTURE_ACTIVE_STATUSES, DEPARTURE_NON_MODIFIABLE_STATUSES, DEPARTURE_TERMINAL_STATUSES } from "../constants/departure.constants";

export class DeparturePolicy {
  static canPublish(status: DepartureStatus): boolean {
    return status === "SCHEDULED";
  }

  static canCancel(status: DepartureStatus): boolean {
    return !DEPARTURE_TERMINAL_STATUSES.includes(status);
  }

  static canClose(status: DepartureStatus): boolean {
    return status === "DEPARTED";
  }

  static canReschedule(status: DepartureStatus): boolean {
    return status === "SCHEDULED";
  }

  static canAssignVessel(status: DepartureStatus): boolean {
    return !DEPARTURE_NON_MODIFIABLE_STATUSES.includes(status);
  }

  static canAssignRoute(status: DepartureStatus): boolean {
    return !DEPARTURE_NON_MODIFIABLE_STATUSES.includes(status);
  }

  static canAssignExperience(status: DepartureStatus): boolean {
    return !DEPARTURE_NON_MODIFIABLE_STATUSES.includes(status);
  }

  static canUpdate(status: DepartureStatus): boolean {
    return !DEPARTURE_NON_MODIFIABLE_STATUSES.includes(status);
  }

  static isTerminal(status: DepartureStatus): boolean {
    return DEPARTURE_TERMINAL_STATUSES.includes(status);
  }

  static isBookable(status: DepartureStatus): boolean {
    return DEPARTURE_ACTIVE_STATUSES.includes(status);
  }

  static isOperational(status: DepartureStatus): boolean {
    return status === "BOARDING" || status === "DEPARTED";
  }

  static assertModifiable(status: DepartureStatus): void {
    if (this.isTerminal(status)) {
      throw new Error(
        `Cannot modify departure in terminal status: ${status}`
      );
    }
  }

  static assertTransition(from: DepartureStatus, to: DepartureStatus): void {
    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ["BOARDING", "CANCELLED"],
      BOARDING: ["DEPARTED", "CANCELLED"],
      DEPARTED: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[from] ?? [];
    if (!allowed.includes(to)) {
      throw new Error(
        `Invalid departure status transition: ${from} → ${to}. Valid transitions from ${from}: ${allowed.join(", ") || "none"}`
      );
    }
  }
}
