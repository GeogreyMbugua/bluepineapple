import { prisma } from "../client";
export class UserRepository {
    /**
     * Find a user by their ID.
     */
    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
        });
    }
    /**
     * Find a user by their ID and include their assigned roles and permissions.
     */
    async findByIdWithRolesAndPermissions(id) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user)
            return null;
        // Flatten the roles and permissions into simple arrays of strings
        const roles = user.roles.map((ur) => ur.role.name);
        const permissionKeys = Array.from(new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key))));
        return {
            ...user,
            roles,
            permissions: permissionKeys,
        };
    }
    /**
     * Find a user by their unique email address.
     */
    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
        });
    }
    /**
     * Find a user by their unique phone number.
     */
    async findByPhone(phone) {
        return prisma.user.findUnique({
            where: { phone },
        });
    }
    /**
     * Create a new user.
     */
    async create(data) {
        return prisma.user.create({
            data,
        });
    }
    /**
     * Update an existing user.
     */
    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }
    /**
     * Assign a role to a user.
     */
    async assignRole(userId, roleName) {
        const role = await prisma.role.findUnique({
            where: { name: roleName },
        });
        if (!role) {
            throw new Error(`Role with name "${roleName}" not found.`);
        }
        await prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId,
                    roleId: role.id,
                },
            },
            create: {
                userId,
                roleId: role.id,
            },
            update: {},
        });
    }
    /**
     * Remove a role from a user.
     */
    async removeRole(userId, roleName) {
        const role = await prisma.role.findUnique({
            where: { name: roleName },
        });
        if (!role) {
            throw new Error(`Role with name "${roleName}" not found.`);
        }
        await prisma.userRole.delete({
            where: {
                userId_roleId: {
                    userId,
                    roleId: role.id,
                },
            },
        });
    }
    /**
     * Resolves and returns all permission keys assigned to the user via their roles.
     */
    async getUserPermissions(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                roles: {
                    select: {
                        role: {
                            select: {
                                permissions: {
                                    select: {
                                        permission: {
                                            select: {
                                                key: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user)
            return [];
        const keys = user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.key));
        return Array.from(new Set(keys));
    }
}
export const userRepository = new UserRepository();
