import { BasePolicy } from "./base-policy";
export class UserPolicy extends BasePolicy {
    static canView(user, resource) {
        if (user.roles.includes("ADMIN"))
            return true;
        return this.isOwner(user, resource.id);
    }
    static canEdit(user, resource) {
        if (user.roles.includes("ADMIN"))
            return true;
        return this.isOwner(user, resource.id);
    }
    static canSuspend(user, resource) {
        return user.roles.includes("ADMIN");
    }
}
