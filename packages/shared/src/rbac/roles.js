/**
 * Canonical RBAC role definitions.
 *
 * This is the single source of truth for all roles in the Blue Pineapple
 * platform. All consumers — database seeds, IAM types, middleware — must
 * import from here. Do not duplicate these definitions elsewhere.
 */
export const ROLES = [
    {
        name: "SUPER_ADMIN",
        description: "Full system access",
    },
    {
        name: "ADMIN",
        description: "Platform administrator",
    },
    {
        name: "PARTNER",
        description: "Partner booking access",
    },
    {
        name: "INVESTOR",
        description: "Investment portal access",
    },
    {
        name: "FINANCE_MANAGER",
        description: "Payments and rewards access",
    },
    {
        name: "GUEST",
        description: "Public user",
    },
];
