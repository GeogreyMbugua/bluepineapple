import type { AuthUser } from "../../types/auth-user";

export abstract class BasePolicy {
  protected static isOwner(user: AuthUser, ownerId: string): boolean {
    return user.id === ownerId;
  }
}
