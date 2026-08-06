import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fleetPermissions = [
    { key: 'fleet.read', description: 'View fleet and vessels' },
    { key: 'fleet.create', description: 'Create new vessels' },
    { key: 'fleet.manage', description: 'Manage fleet operations (blocked dates, maintenance)' },
  ];

  const superAdminRole = await prisma.role.findUnique({
    where: { name: 'SUPER_ADMIN' },
  });

  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!superAdminRole || !adminRole) {
    throw new Error('SUPER_ADMIN or ADMIN role not found');
  }

  console.log('Adding fleet permissions...');

  for (const { key, description } of fleetPermissions) {
    const perm = await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });

    for (const roleId of [superAdminRole.id, adminRole.id]) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId: perm.id } },
        update: {},
        create: {
          roleId,
          permissionId: perm.id,
        },
      });
    }

    console.log(`  Added/assigned: ${key}`);
  }

  console.log('\nDone. Verifying...');

  const verifyPerms = await prisma.permission.findMany({
    where: { key: { startsWith: 'fleet.' } },
    include: {
      roles: {
        include: {
          role: { select: { name: true } },
        },
      },
    },
  });

  console.log('Fleet permissions:', JSON.stringify(verifyPerms, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
