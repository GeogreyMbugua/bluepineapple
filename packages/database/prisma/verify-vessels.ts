import 'dotenv/config';
import { prisma } from '../src/index';

async function verify() {
  const vessels = await prisma.vessel.findMany();
  const hunkyDory = vessels.find(v => v.name === 'HUNKY DORY');
  const settingSons = vessels.find(v => v.name === 'SETTING SONS');

  const fortJesus = await prisma.experience.findUnique({
    where: { slug: 'fort-jesus' },
    select: { id: true },
  });

  const wrongDepartures = await prisma.departure.findMany({
    where: {
      experienceId: fortJesus?.id,
      vesselId: { not: hunkyDory?.id },
    },
    select: {
      id: true,
      departureDateTime: true,
      vesselId: true,
    },
  });

  console.log(`Remaining Fort Jesus departures with wrong vessel: ${wrongDepartures.length}`);
  for (const dep of wrongDepartures) {
    const vessel = vessels.find(v => v.id === dep.vesselId);
    console.log(`  ${dep.id} (${dep.departureDateTime.toISOString()}) - Vessel: ${vessel?.name ?? 'Unknown'}`);
  }

  if (wrongDepartures.length === 0) {
    console.log('✅ All Fort Jesus departures now use HUNKY DORY');
  }

  await prisma.$disconnect();
}

verify();
