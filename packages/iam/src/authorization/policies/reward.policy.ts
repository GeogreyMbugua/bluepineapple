import type { AuthUser } from "../../types/auth-user";
import { BasePolicy } from "./base-policy";

interface RewardResource {
  id: string;
  ownerId: string;
  status: string;
}

export class RewardPolicy extends BasePolicy {
  static canView(user: AuthUser, reward: RewardResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    return this.isOwner(user, reward.ownerId);
  }

  static canEdit(user: AuthUser, reward: RewardResource): boolean {
    if (user.roles.includes("ADMIN" as any)) return true;
    return this.isOwner(user, reward.ownerId);
  }

  static canDelete(user: AuthUser, _reward: RewardResource): boolean {
    return user.roles.includes("ADMIN" as any);
  }
}
