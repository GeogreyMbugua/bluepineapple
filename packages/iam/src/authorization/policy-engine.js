/**
 * PolicyEngine coordinates the registration and evaluation of fine-grained
 * authorization policies (ABAC).
 */
export class PolicyEngine {
    policies = new Map();
    /**
     * Register a new policy.
     */
    register(policy) {
        if (this.policies.has(policy.name)) {
            throw new Error(`Policy with name "${policy.name}" is already registered.`);
        }
        this.policies.set(policy.name, policy);
    }
    /**
     * Evaluate a registered policy against a user and context.
     * If the policy is not registered, it defaults to fail-secure (returns false).
     */
    async evaluate(policyName, user, context) {
        const policy = this.policies.get(policyName);
        if (!policy) {
            // Fail-secure: unregistered policies are denied.
            return false;
        }
        try {
            const result = await policy.condition(user, context);
            return result;
        }
        catch (error) {
            // Fail-secure: errors in evaluation result in denial.
            console.error(`Error evaluating policy "${policyName}":`, error);
            return false;
        }
    }
    /**
     * Evaluate a registered policy and throw ForbiddenError if evaluation fails.
     */
    async assert(policyName, user, context, customErrorMessage) {
        const isAllowed = await this.evaluate(policyName, user, context);
        if (!isAllowed) {
            const { ForbiddenError } = await import("./errors");
            throw new ForbiddenError(customErrorMessage ?? `Policy "${policyName}" evaluation denied access.`);
        }
    }
}
// Export a default singleton instance for application-wide use
export const policyEngine = new PolicyEngine();
