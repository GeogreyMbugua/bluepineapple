import { PrismaClient } from "@prisma/client";
import { ROLES } from "./seeds/roles";
import { PERMISSIONS } from "./seeds/permissions";
import { ROLE_PERMISSIONS } from "./seeds/role-permissions";
const prisma = new PrismaClient();
async function main() {
    console.log("🌱 Seeding RBAC...");
    //
    // Permissions
    //
    for (const key of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { key },
            update: {},
            create: {
                key,
            },
        });
    }
    //
    // Roles
    //
    for (const role of ROLES) {
        await prisma.role.upsert({
            where: {
                name: role.name,
            },
            update: {},
            create: role,
        });
    }
    //
    // Role Permissions
    //
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
        const role = await prisma.role.findUnique({
            where: {
                name: roleName,
            },
        });
        if (!role)
            continue;
        if (permissions.includes("*")) {
            const allPermissions = await prisma.permission.findMany();
            for (const permission of allPermissions) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: role.id,
                            permissionId: permission.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: role.id,
                        permissionId: permission.id,
                    },
                });
            }
            continue;
        }
        for (const permissionKey of permissions) {
            const permission = await prisma.permission.findUnique({
                where: {
                    key: permissionKey,
                },
            });
            if (!permission)
                continue;
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: role.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: role.id,
                    permissionId: permission.id,
                },
            });
        }
    }
    console.log("✅ RBAC seed complete");
}
main()
    .catch((error) => {
    console.error("❌ Seed failed");
    console.error(error);
    throw error;
})
    .finally(async () => {
    await prisma.$disconnect();
});
