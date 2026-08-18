import 'dotenv/config';
import { prisma } from '../src/index';

async function fix() {
  const fortJesus = await prisma.experience.findUnique({
    where: { slug: 'fort-jesus' },
    select: { id: true },
  });

  const departures = await prisma.departure.findMany({
    where: { experienceId: fortJesus?.id },
    select: { id: true, departureDateTime: true },
  });

  for (const dep of departures) {
    const hour = dep.departureDateTime.getUTCHours();
    const minute = dep.departureDateTime.getUTCMinutes();
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    if (timeStr !== '06:30') {
      const dateStr = dep.departureDateTime.toISOString().split('T')[0];
      const newDateTime = new Date(`${dateStr}T06:30:00.000Z`);
      
      await prisma.departure.update({
        where: { id: dep.id },
        data: { departureDateTime: newDateTime },
      });
      
      console.log(`Fixed ${dep.id}: ${dep.departureDateTime.toISOString()} -> ${newDateTime.toISOString()}`);
    }
  }

  console.log(`\nFixed ${departures.filter(d => {
    const hour = d.departureDateTime.getUTCHours();
    const minute = d.departureDateTime.getUTCMinutes();
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` !== '06:30';
  }).length} departures to 06:30 UTC (09:30 EAT)`);

  await prisma.$disconnect();
}

fix();
