import type { AuthUser } from "../types/auth-user";
import { check, type AuthorizeOptions } from "./authorize";
import { policyEngine, type PolicyContext } from "./policy-engine";
import { isSuperAdmin } from "./has-role";

export class AccessControlService {
  /**
   * Determine if the user is authorized based on RBAC (roles/permissions)
   * or a specific ABAC policy.
   *
   * Note: Super admins bypass all checks and are always authorized.
   */
  async isAuthorized(
    user: AuthUser,
    options: AuthorizeOptions & { policyName?: string; policyContext?: PolicyContext }
  ): Promise<boolean> {
    // 1. Super admin bypass
    if (isSuperAdmin(user)) {
      return true;
    }

    // 2. Perform RBAC validation
    const passesRBAC = check(user, options);
    if (!passesRBAC) {
      return false;
    }

    // 3. Perform ABAC validation if policy is specified
    if (options.policyName) {
      const context = options.policyContext ?? {};
      return await policyEngine.evaluate(options.policyName, user, context);
    }

    return true;
  }

  /**
   * Asserts that a check passes, otherwise throws ForbiddenError.
   */
  async assertAuthorized(
    user: AuthUser,
    options: AuthorizeOptions & { policyName?: string; policyContext?: PolicyContext },
    customErrorMessage?: string
  ): Promise<void> {
    const allowed = await this.isAuthorized(user, options);
    if (!allowed) {
      const { ForbiddenError } = await import("./errors");
      throw new ForbiddenError(customErrorMessage ?? "Access denied.");
    }
  }
}

export const accessControlService = new AccessControlService();
