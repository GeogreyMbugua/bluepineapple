export class RoutePolicy {
    static canBeArchived(isActive) {
        return isActive === true;
    }
    static assertArchiveable(isActive) {
        if (!this.canBeArchived(isActive)) {
            throw new Error("Cannot archive a route that is already inactive");
        }
    }
    static isActive(isActive) {
        return isActive === true;
    }
}
