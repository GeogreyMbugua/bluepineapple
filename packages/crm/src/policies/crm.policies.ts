import type { AuthUser } from "@blue-pineapple/iam";

export class CRMBasePolicy {
  protected static isOwner(user: AuthUser, ownerId: string): boolean {
    return user.id === ownerId;
  }

  protected static isAdmin(user: AuthUser): boolean {
    return user.roles.includes("SUPER_ADMIN" as any) || user.roles.includes("ADMIN" as any);
  }

  protected static hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.some((p: any) => p.key === permission);
  }
}

export class CustomerPolicy extends CRMBasePolicy {
  static canView(user: AuthUser, customer: { id: string; userId?: string }): boolean {
    if (this.isAdmin(user)) return true;
    return this.isOwner(user, customer.userId ?? customer.id);
  }

  static canEdit(user: AuthUser, customer: { id: string; userId?: string }): boolean {
    if (this.isAdmin(user)) return true;
    return this.isOwner(user, customer.userId ?? customer.id);
  }

  static canViewSensitiveData(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.sensitive.view");
  }

  static canManageSegments(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.segment.manage");
  }

  static canManageLoyalty(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.loyalty.manage");
  }

  static canExportData(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.export");
  }
}

export class SegmentPolicy extends CRMBasePolicy {
  static canView(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.segment.view");
  }

  static canCreate(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.segment.create");
  }

  static canEdit(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.segment.edit");
  }

  static canDelete(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.segment.delete");
  }
}

export class LoyaltyPolicy extends CRMBasePolicy {
  static canView(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.loyalty.view");
  }

  static canManageTiers(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.loyalty.tier.manage");
  }

  static canAdjustPoints(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.loyalty.points.adjust");
  }

  static canViewAccount(user: AuthUser, customerId: string): boolean {
    if (this.isAdmin(user)) return true;
    return this.isOwner(user, customerId);
  }
}

export class InteractionPolicy extends CRMBasePolicy {
  static canCreate(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.interaction.create");
  }

  static canView(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.interaction.view");
  }

  static canEdit(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.interaction.edit");
  }

  static canDelete(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.interaction.delete");
  }
}

export class DocumentPolicy extends CRMBasePolicy {
  static canView(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.document.view");
  }

  static canUpload(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.document.upload");
  }

  static canVerify(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.document.verify");
  }

  static canDelete(user: AuthUser): boolean {
    return this.isAdmin(user) || this.hasPermission(user, "crm.document.delete");
  }
}
