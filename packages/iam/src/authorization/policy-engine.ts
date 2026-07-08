import type { AuthUser } from "../types/auth-user";

/**
 * Context type for policies. Can contain resource data, request parameters,
 * environment information, etc.
 */
export type PolicyContext = Record<string, any>;

/**
 * A condition function that evaluates whether a user is permitted to perform
 * an action on a resource under given context.
 */
export type PolicyCondition<TContext extends PolicyContext = PolicyContext> = (
  user: AuthUser,
  context: TContext
) => boolean | Promise<boolean>;

/**
 * Definition of a policy.
 */
export interface Policy<TContext extends PolicyContext = PolicyContext> {
  name: string;
  description?: string;
  condition: PolicyCondition<TContext>;
}

/**
 * PolicyEngine coordinates the registration and evaluation of fine-grained
 * authorization policies (ABAC).
 */
export class PolicyEngine {
  private policies = new Map<string, Policy<any>>();

  /**
   * Register a new policy.
   */
  register<TContext extends PolicyContext = PolicyContext>(
    policy: Policy<TContext>
  ): void {
    if (this.policies.has(policy.name)) {
      throw new Error(`Policy with name "${policy.name}" is already registered.`);
    }
    this.policies.set(policy.name, policy);
  }

  /**
   * Evaluate a registered policy against a user and context.
   * If the policy is not registered, it defaults to fail-secure (returns false).
   */
  async evaluate<TContext extends PolicyContext = PolicyContext>(
    policyName: string,
    user: AuthUser,
    context: TContext
  ): Promise<boolean> {
    const policy = this.policies.get(policyName);
    if (!policy) {
      // Fail-secure: unregistered policies are denied.
      return false;
    }

    try {
      const result = await policy.condition(user, context);
      return result;
    } catch (error) {
      // Fail-secure: errors in evaluation result in denial.
      console.error(`Error evaluating policy "${policyName}":`, error);
      return false;
    }
  }

  /**
   * Evaluate a registered policy and throw ForbiddenError if evaluation fails.
   */
  async assert<TContext extends PolicyContext = PolicyContext>(
    policyName: string,
    user: AuthUser,
    context: TContext,
    customErrorMessage?: string
  ): Promise<void> {
    const isAllowed = await this.evaluate(policyName, user, context);
    if (!isAllowed) {
      const { ForbiddenError } = await import("./errors");
      throw new ForbiddenError(customErrorMessage ?? `Policy "${policyName}" evaluation denied access.`);
    }
  }
}

// Export a default singleton instance for application-wide use
export const policyEngine = new PolicyEngine();
