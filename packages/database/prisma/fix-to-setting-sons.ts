import 'dotenv/config';
import { prisma } from '../src/index';

async function fix() {
  const settingSons = await prisma.vessel.findFirst({
    where: { name: 'SETTING SONS' },
    select: { id: true },
  });

  if (!settingSons) {
    console.error('SETTING SONS vessel not found');
    process.exit(1);
  }

  const fortJesus = await prisma.experience.findUnique({
    where: { slug: 'fort-jesus' },
    select: { id: true },
  });

  const result = await prisma.departure.updateMany({
    where: { experienceId: fortJesus?.id },
    data: { vesselId: settingSons.id },
  });

  console.log(`✅ Updated ${result.count} Fort Jesus departures to SETTING SONS`);
  await prisma.$disconnect();
}

fix();
