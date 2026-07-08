export class PartnerPolicy {
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
}
