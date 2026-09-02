export class PartnerPolicy {
  private static readonly ALLOWED_TRANSITIONS: Record<string, readonly string[]> = {
    PENDING: ["ACTIVE", "TERMINATED"],
    ACTIVE: ["SUSPENDED", "TERMINATED"],
    SUSPENDED: ["ACTIVE", "TERMINATED"],
    TERMINATED: ["ACTIVE"],
  };

  static canAcceptBookings(status: string): boolean {
    return status === "ACTIVE";
  }

  static assertCanBook(status: string): void {
    if (!this.canAcceptBookings(status)) {
      throw new Error("Partner account is not active for bookings");
    }
  }

  static canBeSuspended(status: string): boolean {
    return status === "ACTIVE";
  }

  static canBeReactivated(status: string): boolean {
    return status === "SUSPENDED" || status === "TERMINATED";
  }

  static canTransition(status: string, nextStatus: string): boolean {
    return this.ALLOWED_TRANSITIONS[status]?.includes(nextStatus) ?? false;
  }

  static assertTransition(status: string, nextStatus: string): void {
    if (!this.canTransition(status, nextStatus)) {
      throw new Error(`Cannot change partner status from ${status} to ${nextStatus}`);
    }
  }
}
