export class ExperiencePolicy {
    static canBeBooked(isActive) {
        return isActive === true;
    }
    static assertBookable(isActive) {
        if (!this.canBeBooked(isActive)) {
            throw new Error("Experience is not bookable (inactive)");
        }
    }
    static canBeAssigned(isActive) {
        return isActive === true;
    }
    static assertAssignable(isActive) {
        if (!this.canBeAssigned(isActive)) {
            throw new Error("Cannot assign inactive experience to departure");
        }
    }
}
