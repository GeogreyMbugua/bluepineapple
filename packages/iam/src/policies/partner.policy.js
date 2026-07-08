export class PartnerPolicy {
    static canAcceptBookings(status) {
        return status === "ACTIVE";
    }
    static assertCanBook(status) {
        if (!this.canAcceptBookings(status)) {
            throw new Error("Partner account is not active for bookings");
        }
    }
    static canBeSuspended(status) {
        return status === "ACTIVE";
    }
    static canBeReactivated(status) {
        return status === "SUSPENDED" || status === "TERMINATED";
    }
}
