export class ExperiencePolicy {
  static canBeBooked(isActive: boolean): boolean {
    return isActive === true;
  }

  static assertBookable(isActive: boolean): void {
    if (!this.canBeBooked(isActive)) {
      throw new Error("Experience is not bookable (inactive)");
    }
  }

  static canBeAssigned(isActive: boolean): boolean {
    return isActive === true;
  }

  static assertAssignable(isActive: boolean): void {
    if (!this.canBeAssigned(isActive)) {
      throw new Error("Cannot assign inactive experience to departure");
    }
  }
}
