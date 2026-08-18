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
      bookings: { select: { id: true, totalGuests: true } },
    },
    orderBy: { departureDateTime: 'asc' },
  });

  const vessels = await prisma.vessel.findMany();
  const vesselMap = new Map(vessels.map(v => [v.id, v.name]));

  console.log(`Fort Jesus departures: ${departures.length}\n`);
  for (const dep of departures) {
    const vessel = vesselMap.get(dep.vesselId) ?? 'Unknown';
    const utcHour = dep.departureDateTime.getUTCHours();
    const utcMin = dep.departureDateTime.getUTCMinutes();
    const utcTime = `${String(utcHour).padStart(2, '0')}:${String(utcMin).padStart(2, '0')}`;
    const eatTime = `${String((utcHour + 3) % 24).padStart(2, '0')}:${String(utcMin).padStart(2, '0')}`;
    const totalGuests = dep.bookings.reduce((sum, b) => sum + b.totalGuests, 0);
    console.log(`  ${dep.departureDateTime.toISOString().split('T')[0]} UTC:${utcTime} EAT:${eatTime} - ${vessel} - ${totalGuests} guests - ${dep.bookings.length} bookings`);
  }

  await prisma.$disconnect();
}

verify();
