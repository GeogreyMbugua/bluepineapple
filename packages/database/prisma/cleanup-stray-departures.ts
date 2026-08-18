import 'dotenv/config';
import { prisma } from '../src/index';

async function cleanup() {
  const fortJesus = await prisma.experience.findUnique({
    where: { slug: 'fort-jesus' },
    select: { id: true },
  });

  const departures = await prisma.departure.findMany({
    where: { experienceId: fortJesus?.id },
    select: {
      id: true,
      departureDateTime: true,
      bookings: { select: { id: true } },
    },
    orderBy: { departureDateTime: 'asc' },
  });

  let deleted = 0;
  for (const dep of departures) {
    const hour = dep.departureDateTime.getUTCHours();
    const minute = dep.departureDateTime.getUTCMinutes();
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    if (timeStr !== '09:30') {
      if (dep.bookings.length > 0) {
        console.log(`Skipping ${dep.id} (${dep.departureDateTime.toISOString()}) - has ${dep.bookings.length} bookings`);
      } else {
        await prisma.departure.delete({ where: { id: dep.id } });
        console.log(`Deleted ${dep.id} (${dep.departureDateTime.toISOString()})`);
        deleted++;
      }
    }
  }

  console.log(`\nDeleted ${deleted} stray departures`);
  await prisma.$disconnect();
}

cleanup();
