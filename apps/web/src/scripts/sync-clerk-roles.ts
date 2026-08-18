import { prisma } from '@blue-pineapple/database';
import { clerkClient } from '@clerk/nextjs/server';

async function syncExistingUsers() {
  const users = await prisma.user.findMany({
    where: {
      clerkUserId: {
        not: null,
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  console.log(`Found ${users.length} users with Clerk accounts to sync`);

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of users) {
    if (!user.clerkUserId) {
      skipped++;
      continue;
    }

    const roleNames = user.roles.map((ur) => ur.role.name);

    try {
      const client = await clerkClient();
      await client.users.updateUser(user.clerkUserId, {
        publicMetadata: { roles: roleNames },
      });
      console.log(`✓ Synced ${user.email} (${user.clerkUserId}): ${roleNames.join(', ')}`);
      synced++;
    } catch (err) {
      console.error(`✗ Failed to sync ${user.email} (${user.clerkUserId}):`, err);
      failed++;
    }
  }

  console.log(`\nSync complete: ${synced} synced, ${skipped} skipped, ${failed} failed`);
  await prisma.$disconnect();
}

syncExistingUsers().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
