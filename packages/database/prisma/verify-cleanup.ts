import 'dotenv/config';
import { prisma } from '../src/index';

async function verify() {
  const fortJesus = await prisma.experience.findUnique({
    where: { slug: 'fort-jesus' },
    select: { id: true },
  });

  const departures = await prisma.departure.findMany({
    where: { experienceId: fortJesus?.id },
    select: {
      id: true,
      departureDateTime: true,
      vesselId: true,
      bookings: { select: { id: true, bookingReference: true, totalGuests: true } },
    },
    orderBy: { departureDateTime: 'asc' },
  });

  console.log(`Fort Jesus departures: ${departures.length}\n`);
  for (const dep of departures) {
    const time = dep.departureDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    console.log(`  ${dep.departureDateTime.toISOString().split('T')[0]} ${time} - ${dep.bookings.length} bookings`);
  }

  await prisma.$disconnect();
}

verify();
