import { BasePolicy } from "./base-policy";
export class PartnerPolicy extends BasePolicy {
    static canView(user, partner) {
        if (user.roles.includes("ADMIN"))
            return true;
        if (user.roles.includes("PARTNER") && user.id === partner.userId)
            return true;
        return false;
    }
    static canEdit(user, partner) {
        if (user.roles.includes("ADMIN"))
            return true;
        return user.roles.includes("PARTNER") && user.id === partner.userId;
    }
    static canDelete(user, partner) {
        return user.roles.includes("ADMIN");
    }
}
