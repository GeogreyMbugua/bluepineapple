import { prisma } from "../packages/database/src/client";
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "../packages/shared/src/rbac";

async function bootstrap() {
  console.log("Bootstrapping Blue Pineapple IAM...");

  const adminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN", description: "Full system access" },
  });

  console.log("✓ SUPER_ADMIN role ready");

  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: `Permission: ${key}` },
    });
  }
  console.log(`✓ ${PERMISSIONS.length} permissions seeded`);

  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  console.log("✓ All permissions assigned to SUPER_ADMIN");

  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const adminPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!adminEmail) {
    console.log("⚠ BOOTSTRAP_ADMIN_EMAIL not set. Skipping user creation.");
    console.log("  Run again with: BOOTSTRAP_ADMIN_EMAIL=admin@example.com BOOTSTRAP_ADMIN_PASSWORD=secret pnpm bootstrap:admin");
    await prisma.$disconnect();
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`✓ Admin user already exists: ${adminEmail}`);
    await prisma.$disconnect();
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: adminEmail,
      firstName: "Admin",
      lastName: "User",
      status: "ACTIVE",
      emailVerifiedAt: new Date(),
      roles: { create: { roleId: adminRole.id } },
    },
  });

  console.log(`✓ Admin user created: ${adminEmail} (${user.id})`);
  console.log("\n══ Bootstrap complete. You can now log in with the OTP flow using this email. ══");

  await prisma.$disconnect();
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
