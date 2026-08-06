import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_EMAIL_PATTERNS = [
  '%test%',
  '%example.com%',
  '%demo%',
  '%dummy%',
  '%fake%',
  '%temp%',
  '%noreply%',
  '%placeholder%',
  '%sample%',
  '%debug%',
];

const TEST_BOOKING_REFERENCE_PATTERNS = ['TEST', 'DEBUG', 'DEV', 'SAMPLE', 'DUMMY'];

const isDryRun = !process.argv.includes('--execute');

async function identifyTestBookings() {
  return await prisma.booking.findMany({
    where: {
      OR: [
        { guest: { email: { in: TEST_EMAIL_PATTERNS } } },
        { guest: { email: { startsWith: 'test' } } },
        { bookingReference: { in: TEST_BOOKING_REFERENCE_PATTERNS } },
        { totalAmount: { equals: 0 } },
        { totalGuests: 0 },
      ],
    },
    include: {
      guest: true,
      guests: { take: 1, select: { fullName: true } },
      partner: {
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      },
    },
  });
}

async function identifyTestDepartureIds(bookingDepartureIds: string[]): Promise<string[]> {
  const pastUuidDepartures = await prisma.$queryRaw<
    Array<{ id: string }>
  >`
    SELECT id FROM "departures"
    WHERE "departureDateTime" < NOW()
      AND "id" ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND id NOT IN (
        SELECT DISTINCT "departureId" FROM "bookings"
        WHERE "departureId" IS NOT NULL
      )
  `;

  return [...bookingDepartureIds, ...pastUuidDepartures.map((d) => d.id)];
}

async function cleanup() {
  console.log('\n=== Database Cleanup Script ===');
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'EXECUTE (destructive)'}`);
  console.log('');

  const testBookings = await identifyTestBookings();
  console.log(`Found ${testBookings.length} test booking(s):`);

  const partnerIds = new Set<string>();
  const guestIds = new Set<string>();

  for (const booking of testBookings) {
    const guestName = booking.guest
      ? `${booking.guest.firstName} ${booking.guest.lastName}`
      : booking.guests[0]?.fullName ?? 'N/A';
    const guestEmail = booking.guest?.email ?? 'N/A';
    const partnerName = booking.partner?.user?.email ?? booking.partner?.companyName ?? 'Direct';

    console.log(`  - ${booking.bookingReference} (${booking.totalGuests} guests, KES ${Number(booking.totalAmount)})`);
    console.log(`    Guest: ${guestName} <${guestEmail}>`);
    console.log(`    Partner: ${partnerName}`);
    console.log(`    Status: ${booking.status} / ${booking.paymentStatus}`);
    console.log(`    Created: ${booking.createdAt.toISOString().split('T')[0]}`);
    console.log(`    Source: ${booking.source}`);
    console.log('');

    if (booking.guestId) guestIds.add(booking.guestId);
    if (booking.partnerId) partnerIds.add(booking.partnerId);
  }

  let deletedBookings = 0;
  let deletedGuests = 0;
  let deletedRewardTransactions = 0;
  let deletedCommercialSummaries = 0;
  let deletedBookingStatusHistory = 0;
  let deletedBookingGuests = 0;

  if (testBookings.length > 0 && !isDryRun) {
    const bookingIds = testBookings.map((b) => b.id);

    deletedRewardTransactions = (await prisma.rewardTransaction.deleteMany({
      where: { bookingId: { in: bookingIds } },
    })).count;

    deletedCommercialSummaries = (await prisma.commercialSummary.deleteMany({
      where: { bookingId: { in: bookingIds } },
    })).count;

    deletedBookingGuests = (await prisma.bookingGuest.deleteMany({
      where: { bookingId: { in: bookingIds } },
    })).count;

    deletedBookingStatusHistory = (await prisma.bookingStatusHistory.deleteMany({
      where: { bookingId: { in: bookingIds } },
    })).count;

    deletedBookings = (await prisma.booking.deleteMany({
      where: { id: { in: bookingIds } },
    })).count;

    if (guestIds.size > 0) {
      deletedGuests = (await prisma.guest.deleteMany({
        where: { id: { in: Array.from(guestIds) } },
      })).count;
    }
  }

  const testDepartureIds = await identifyTestDepartureIds(
    testBookings.map((b) => b.departureId)
  );
  console.log(`\nFound ${testDepartureIds.length} test departure(s) to remove:`);
  for (const id of testDepartureIds) {
    const dep = await prisma.departure.findUnique({
      where: { id },
      select: { id: true, departureDateTime: true, totalCapacity: true, bookedSeats: true, status: true },
    });
    if (dep) {
      console.log(
        `  - ${dep.id} (${dep.departureDateTime.toISOString().split('T')[0]}) ` +
        `- ${dep.totalCapacity} seats, ${dep.bookedSeats} booked, ${dep.status}`
      );
    }
  }

  let deletedDepartures = 0;
  if (testDepartureIds.length > 0 && !isDryRun) {
    deletedDepartures = (await prisma.departure.deleteMany({
      where: { id: { in: testDepartureIds } },
    })).count;
  }

  console.log('\n=== Summary ===');
  console.log(`  Bookings to delete:           ${testBookings.length}`);
  console.log(`  Departures to delete:         ${testDepartureIds.length}`);
  console.log(`  Guest records to delete:      ${guestIds.size}`);
  console.log(`  Partners preserved:            ${partnerIds.size}`);
  console.log(`  All users preserved:           yes`);
  console.log('');

  if (!isDryRun) {
    console.log('=== Deleted ===');
    console.log(`  BookingGuests:                ${deletedBookingGuests}`);
    console.log(`  BookingStatusHistory:         ${deletedBookingStatusHistory}`);
    console.log(`  RewardTransactions:           ${deletedRewardTransactions}`);
    console.log(`  CommercialSummaries:          ${deletedCommercialSummaries}`);
    console.log(`  Bookings:                     ${deletedBookings}`);
    console.log(`  Guests:                       ${deletedGuests}`);
    console.log(`  Departures:                   ${deletedDepartures}`);
    console.log('');
    console.log('Cleanup complete.');
  } else {
    console.log('DRY RUN - no data was deleted.');
    console.log('Run with --execute to perform the cleanup.');
  }
}

cleanup()
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
