import { check } from "./authorize";
import { policyEngine } from "./policy-engine";
import { isSuperAdmin } from "./has-role";
export class AccessControlService {
    /**
     * Determine if the user is authorized based on RBAC (roles/permissions)
     * or a specific ABAC policy.
     *
     * Note: Super admins bypass all checks and are always authorized.
     */
    async isAuthorized(user, options) {
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
    async assertAuthorized(user, options, customErrorMessage) {
        const allowed = await this.isAuthorized(user, options);
        if (!allowed) {
            const { ForbiddenError } = await import("./errors");
            throw new ForbiddenError(customErrorMessage ?? "Access denied.");
        }
    }
}
export const accessControlService = new AccessControlService();
