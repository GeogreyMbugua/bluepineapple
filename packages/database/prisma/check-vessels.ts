import 'dotenv/config';
import { prisma } from '../src/index';

async function check() {
  const vessels = await prisma.vessel.findMany();
  console.log('All vessels:');
  vessels.forEach(v => {
    console.log(`  ${v.name} (${v.id}) - ${v.status}`);
  });

  const fortJesus = await prisma.experience.findUnique({
    where: { slug: 'fort-jesus' },
    select: { id: true },
  });

  const depVessels = await prisma.departure.findMany({
    where: { experienceId: fortJesus?.id },
    select: { vesselId: true },
    distinct: ['vesselId'],
  });

  const depVesselIds = depVessels.map(d => d.vesselId);
  console.log('\nVessels used by Fort Jesus departures:');
  for (const vid of depVesselIds) {
    const vessel = vessels.find(v => v.id === vid);
    console.log(`  ${vessel?.name ?? vid} (${vid})`);
  }

  await prisma.$disconnect();
}

check();
