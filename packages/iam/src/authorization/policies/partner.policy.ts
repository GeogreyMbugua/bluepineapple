import type { AuthUser } from "../../types/auth-user";
import { BasePolicy } from "./base-policy";

interface PartnerResource {
  id: string;
  userId: string;
  status: string;
}

export class PartnerPolicy extends BasePolicy {
  static canView(user: AuthUser, partner: PartnerResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    if (user.roles.includes("PARTNER" as any) && user.id === partner.userId) return true;
    return false;
  }

  static canEdit(user: AuthUser, partner: PartnerResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    return user.roles.includes("PARTNER" as any) && user.id === partner.userId;
  }

  static canDelete(user: AuthUser, _partner: PartnerResource): boolean {
    return user.roles.includes("ADMIN" as any);
  }
}
