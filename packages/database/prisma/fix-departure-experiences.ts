import 'dotenv/config';
import { prisma } from '../src/index';

async function fixDepartures() {
  console.log('🔍 Scanning for departures with mismatched experiences...\n');

  // Get the Fort Jesus experience
  const fortJesus = await prisma.experience.findUnique({
    where: { slug: 'fort-jesus' },
    select: { id: true, name: true },
  });

  if (!fortJesus) {
    console.error('❌ Fort Jesus experience not found in database');
    process.exit(1);
  }

  console.log(`Fort Jesus experience ID: ${fortJesus.id}`);

  // Find all departures on the FJ-HOHO route
  const departures = await prisma.departure.findMany({
    where: { routeId: 'FJ-HOHO' },
    include: {
      experience: { select: { id: true, name: true, slug: true } },
      bookings: {
        where: { source: 'PARTNER' },
        select: { id: true, bookingReference: true, totalGuests: true },
      },
    },
  });

  console.log(`Found ${departures.length} departures on FJ-HOHO route\n`);

  let fixed = 0;
  let skipped = 0;

  for (const dep of departures) {
    const partnerBookings = dep.bookings.length;
    const isFortJesus = dep.experienceId === fortJesus.id;

    if (!isFortJesus && partnerBookings > 0) {
      console.log(`⚠️  Departure ${dep.id} (${dep.departureDateTime.toISOString()})`);
      console.log(`   Current experience: ${dep.experience?.name ?? 'Unknown'} (${dep.experience?.slug ?? 'unknown'})`);
      console.log(`   Partner bookings: ${partnerBookings}`);
      console.log(`   Fixing to Fort Jesus...`);

      await prisma.departure.update({
        where: { id: dep.id },
        data: { experienceId: fortJesus.id },
      });

      fixed++;
    } else if (!isFortJesus) {
      console.log(`ℹ️  Departure ${dep.id} (${dep.departureDateTime.toISOString()})`);
      console.log(`   Experience: ${dep.experience?.name ?? 'Unknown'} — no partner bookings, skipping`);
      skipped++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Fixed:  ${fixed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total:  ${departures.length}`);
}

fixDepartures()
  .catch((error) => {
    console.error('Fix failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
