import { prisma } from "../src/index";

async function cleanupPartners() {
  console.log("🧹 Starting partner data cleanup...");

  // Get ALL partner profiles (not just users with PARTNER role)
  const partnerProfiles = await prisma.partnerProfile.findMany({
    select: { id: true, userId: true, partnerCode: true, companyName: true },
  });

  console.log(`Found ${partnerProfiles.length} partner profiles to remove`);

  if (partnerProfiles.length === 0) {
    console.log("No partners found. Exiting.");
    return;
  }

  const profileIds = partnerProfiles.map((p) => p.id);
  const userIds = partnerProfiles.map((p) => p.userId);

  // Start transaction
  await prisma.$transaction(async (tx) => {
    // 1. Delete reward transactions (must be before bookings due to Restrict)
    const rewardTxCount = await tx.rewardTransaction.deleteMany({
      where: { partnerId: { in: profileIds } },
    });
    console.log(`Deleted ${rewardTxCount.count} reward transactions`);

    // 2. Delete bookings (must be before partner profiles due to Restrict)
    const bookingCount = await tx.booking.deleteMany({
      where: { partnerId: { in: profileIds } },
    });
    console.log(`Deleted ${bookingCount.count} bookings`);

    // 3. Delete partner rewards (cascading from partner)
    const rewardCount = await tx.partnerReward.deleteMany({
      where: { partnerId: { in: profileIds } },
    });
    console.log(`Deleted ${rewardCount.count} partner rewards`);

    // 4. Delete partner payout accounts (cascading from partner)
    const payoutCount = await tx.partnerPayoutAccount.deleteMany({
      where: { partnerId: { in: profileIds } },
    });
    console.log(`Deleted ${payoutCount.count} payout accounts`);

    // 5. Delete partner status history (cascading from partner)
    const statusCount = await tx.partnerStatusHistory.deleteMany({
      where: { partnerId: { in: profileIds } },
    });
    console.log(`Deleted ${statusCount.count} status history records`);

    // 6. Delete partner profiles
    const profileDeleteCount = await tx.partnerProfile.deleteMany({
      where: { id: { in: profileIds } },
    });
    console.log(`Deleted ${profileDeleteCount.count} partner profiles`);

    // 7. Delete user roles for these users
    const roleCount = await tx.userRole.deleteMany({
      where: { userId: { in: userIds } },
    });
    console.log(`Deleted ${roleCount.count} user role assignments`);

    // 8. Delete partner users
    const userCount = await tx.user.deleteMany({
      where: { id: { in: userIds } },
    });
    console.log(`Deleted ${userCount.count} partner users`);
  });

  console.log("✅ Partner data cleanup complete");
}

cleanupPartners()
  .catch((error) => {
    console.error("❌ Cleanup failed:", error);
    process.exit(1);
  });
