import type { AuthUser } from "../../types/auth-user";
import { BasePolicy } from "./base-policy";

interface BookingResource {
  id: string;
  userId: string;
  partnerId: string;
  status: string;
}

export class BookingPolicy extends BasePolicy {
  static canView(user: AuthUser, booking: BookingResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    if (user.roles.includes("PARTNER" as any) && user.id === booking.partnerId) return true;
    return this.isOwner(user, booking.userId);
  }

  static canEdit(user: AuthUser, booking: BookingResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    if (user.roles.includes("PARTNER" as any) && user.id === booking.partnerId) return true;
    return false;
  }

  static canDelete(user: AuthUser, booking: BookingResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    return this.isOwner(user, booking.userId);
  }
}
