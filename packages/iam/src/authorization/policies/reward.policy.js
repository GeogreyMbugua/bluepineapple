import { BasePolicy } from "./base-policy";
export class RewardPolicy extends BasePolicy {
    static canView(user, reward) {
        if (user.roles.includes("ADMIN"))
            return true;
        return this.isOwner(user, reward.ownerId);
    }
    static canEdit(user, reward) {
        if (user.roles.includes("ADMIN"))
            return true;
        return this.isOwner(user, reward.ownerId);
    }
    static canDelete(user, reward) {
        return user.roles.includes("ADMIN");
    }
}
