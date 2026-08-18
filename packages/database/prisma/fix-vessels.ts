import 'dotenv/config';
import { prisma } from '../src/index';

async function fixVessels() {
  const vessels = await prisma.vessel.findMany();
  console.log('Available vessels:');
  vessels.forEach(v => {
    console.log(`  ID: ${v.id}, Name: ${v.name}, Status: ${v.status}`);
  });

  const hunkyDory = vessels.find(v => v.name === 'HUNKY DORY');
  const settingSons = vessels.find(v => v.name === 'SETTING SONS');

  if (!hunkyDory) {
    console.error('HUNKY DORY vessel not found');
    process.exit(1);
  }

  console.log(`\nHUNKY DORY ID: ${hunkyDory.id}`);
  if (settingSons) {
    console.log(`SETTING SONS ID: ${settingSons.id}`);
  }

  const fortJesus = await prisma.experience.findUnique({
    where: { slug: 'fort-jesus' },
    select: { id: true },
  });

  if (!fortJesus) {
    console.error('Fort Jesus experience not found');
    process.exit(1);
  }

  const wrongVesselDepartures = await prisma.departure.findMany({
    where: {
      experienceId: fortJesus.id,
      vesselId: { not: hunkyDory.id },
    },
    select: {
      id: true,
      departureDateTime: true,
      vesselId: true,
      bookings: { select: { id: true, bookingReference: true } },
    },
  });

  console.log(`\nFound ${wrongVesselDepartures.length} Fort Jesus departures with wrong vessel:`);
  for (const dep of wrongVesselDepartures) {
    const vessel = vessels.find(v => v.id === dep.vesselId);
    console.log(`  ${dep.id} (${dep.departureDateTime.toISOString()}) - Vessel: ${vessel?.name ?? 'Unknown'} - Bookings: ${dep.bookings.length}`);
  }

  if (wrongVesselDepartures.length > 0) {
    console.log('\nFixing...');
    for (const dep of wrongVesselDepartures) {
      await prisma.departure.update({
        where: { id: dep.id },
        data: { vesselId: hunkyDory.id },
      });
      console.log(`  ✅ Updated ${dep.id} to HUNKY DORY`);
    }
  }

  await prisma.$disconnect();
}

fixVessels();
