import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TABLES_TO_PRESERVE = [
  'User', 'PartnerProfile', 'Vessel', 'VesselMaintenanceLog',
  'Experience', 'ExperienceRoute', 'Route', 'RouteStop',
  'Departure', 'BlockedDate',
  'Role', 'Permission', 'UserRole', 'RolePermission',
  'Session', 'OtpToken', 'AuthLog', 'PartnerReward', 'RewardRule',
  'PartnerPayoutAccount', 'PartnerStatusHistory',
  'Voyage', 'VoyageTimeline', 'Journey',
];

const TABLES_TO_DELETE = [
  'auth_logs',
  'booking_status_history',
  'booking_guests',
  'reward_transactions',
  'commercial_summaries',
  'commercial_audit_logs',
  'finance_audit_logs',
  'bookings',
  'quote_items',
  'quotes',
  'reservation_holds',
  'promotion_usages',
  'cancellation_policies',
  'refund_calculations',
  'payment_provider_responses',
  'payment_intents',
  'payments',
  'ledger_entries',
  'wallet_transactions',
  'invoice_items',
  'refund_requests',
  'settlement_items',
  'journal_entry_items',
];

const isDryRun = !process.argv.includes('--execute');

async function getCount(tableName: string): Promise<number> {
  const query = `SELECT COUNT(*)::text as count FROM "${tableName}"`;
  const result = await prisma.$queryRawUnsafe<[{ count: string }]>(query);
  return result.length > 0 ? parseInt(result[0].count, 10) : 0;
}

async function cleanup() {
  console.log('\n=== Database Cleanup Script ===');
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes will be made)' : 'EXECUTE (destructive)'}`);
  console.log('');

  const allTableResults = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE '_prisma%'
      AND tablename NOT LIKE 'pg_%'
  `;
  const allTables = allTableResults.map((r) => r.tablename);

  const tablesToDelete = TABLES_TO_DELETE.filter((t) =>
    allTables.includes(t) && !TABLES_TO_PRESERVE.includes(t)
  );

  console.log(`Preserving: ${TABLES_TO_PRESERVE.join(', ')}`);
  console.log('');

  console.log('Tables selected for cleanup:');
  let totalRows = 0;
  const deleteCounts: Array<{ table: string; count: number }> = [];

  for (const table of tablesToDelete) {
    const count = await getCount(table);
    deleteCounts.push({ table, count });
    totalRows += count;
    console.log(`  ${table.padEnd(30)} ${count} rows`);
  }

  console.log('');
  console.log(`Total rows to delete: ${totalRows}`);
  console.log('');

  if (!isDryRun) {
    console.log('Truncating tables...');

    const truncateTables = deleteCounts
      .filter((d) => d.count > 0)
      .map((d) => `"${d.table}"`)
      .join(', ');

    const query = `TRUNCATE TABLE ${truncateTables} RESTART IDENTITY CASCADE`;
    await prisma.$executeRawUnsafe(query);

    for (const { table, count } of deleteCounts) {
      if (count > 0) {
        console.log(`  Truncated ${table} (${count} rows)`);
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`  Rows to delete:        ${totalRows}`);
  console.log(`  Auth logs:             ${deleteCounts.find((d) => d.table === 'auth_logs')?.count ?? 0}`);
  console.log(`  Bookings:              ${deleteCounts.find((d) => d.table === 'bookings')?.count ?? 0}`);
  console.log(`  Booking-related data:  ${['booking_status_history', 'booking_guests', 'reward_transactions', 'commercial_summaries'].reduce((sum, t) => sum + (deleteCounts.find((d) => d.table === t)?.count ?? 0), 0)}`);
  console.log(`  Preserved entities:    User, PartnerProfile, Vessel, Experience, Departure, Role, Permission, RewardRule, etc.`);

  if (isDryRun) {
    console.log('\nDRY RUN - no data was deleted.');
    console.log('Run with --execute to perform the cleanup.');
  } else {
    console.log('\nCleanup complete.');
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
