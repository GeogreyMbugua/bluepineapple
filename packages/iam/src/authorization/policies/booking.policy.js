import { BasePolicy } from "./base-policy";
export class BookingPolicy extends BasePolicy {
    static canView(user, booking) {
        if (user.roles.includes("ADMIN"))
            return true;
        if (user.roles.includes("PARTNER") && user.id === booking.partnerId)
            return true;
        return this.isOwner(user, booking.userId);
    }
    static canEdit(user, booking) {
        if (user.roles.includes("ADMIN"))
            return true;
        if (user.roles.includes("PARTNER") && user.id === booking.partnerId)
            return true;
        return false;
    }
    static canDelete(user, booking) {
        if (user.roles.includes("ADMIN"))
            return true;
        return this.isOwner(user, booking.userId);
    }
}
