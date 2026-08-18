import 'dotenv/config';
import { prisma } from '../src/index';

async function verify() {
  const user = await prisma.user.findUnique({
    where: { email: 'bluepineappleholdings@gmail.com' },
    include: { roles: { include: { role: true } } },
  });

  if (!user) {
    console.log('❌ User not found');
    process.exit(1);
  }

  const roles = user.roles.map(r => r.role.name);
  console.log(`User: ${user.email}`);
  console.log(`ClerkUserId: ${user.clerkUserId}`);
  console.log(`Roles: ${roles.join(', ')}`);
  console.log(`Has ADMIN: ${roles.includes('ADMIN')}`);

  await prisma.$disconnect();
}

verify();
