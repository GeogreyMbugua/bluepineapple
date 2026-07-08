import type { AuthUser } from "../../types/auth-user";
import { BasePolicy } from "./base-policy";

interface UserResource {
  id: string;
  status: string;
}

export class UserPolicy extends BasePolicy {
  static canView(user: AuthUser, resource: UserResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    return this.isOwner(user, resource.id);
  }

  static canEdit(user: AuthUser, resource: UserResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    return this.isOwner(user, resource.id);
  }

  static canSuspend(user: AuthUser, _resource: UserResource): boolean {
    return user.roles.includes("ADMIN" as any);
  }
}
