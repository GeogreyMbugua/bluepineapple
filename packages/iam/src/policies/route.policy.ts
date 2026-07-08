export class RoutePolicy {
  static canBeArchived(isActive: boolean): boolean {
    return isActive === true;
  }

  static assertArchiveable(isActive: boolean): void {
    if (!this.canBeArchived(isActive)) {
      throw new Error("Cannot archive a route that is already inactive");
    }
  }

  static isActive(isActive: boolean): boolean {
    return isActive === true;
  }
}
