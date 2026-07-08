export class BasePolicy {
    static isOwner(user, ownerId) {
        return user.id === ownerId;
    }
}
