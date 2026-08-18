import dotenv from 'dotenv';
import { PrismaClient } from "@prisma/client";

dotenv.config();

import { ROLES } from "./seeds/roles";
import { PERMISSIONS } from "./seeds/permissions";
import { ROLE_PERMISSIONS } from "./seeds/role-permissions";
import { USERS } from "./seeds/users";
import { VESSELS } from "./seeds/vessels";
import { EXPERIENCES } from "./seeds/experiences";
import { ROUTES, ROUTE_STOPS } from "./seeds/routes";
import { DEPARTURES } from "./seeds/departures";
import { REWARD_RULES } from "./seeds/reward-rules";
import { REVIEWS } from "./seeds/reviews";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding RBAC...");

  //
  // Permissions
  //
  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: {
        key,
      },
    });
  }

  //
  // Roles
  //
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {},
      create: role,
    });
  }

  //
  // Role Permissions
  //
  for (const [roleName, permissions] of Object.entries(
    ROLE_PERMISSIONS,
  )) {
    const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
    });

    if (!role) continue;

    if ((permissions as readonly string[]).includes("*")) {
      const allPermissions =
        await prisma.permission.findMany();

      for (const permission of allPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }

      continue;
    }

    for (const permissionKey of permissions) {
      const permission =
        await prisma.permission.findUnique({
          where: {
            key: permissionKey,
          },
        });

      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log("✅ RBAC seed complete");

  //
  // Users
  //
  console.log("🌱 Seeding users...");
  for (const user of USERS) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
      },
    });

    for (const roleName of user.roles) {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });
      if (!role) continue;

      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: created.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: created.id,
          roleId: role.id,
        },
      });
    }
  }
  console.log("✅ Users seed complete");

  //
  // Vessels
  //
  console.log("🌱 Seeding vessels...");
  for (const vessel of VESSELS) {
    await prisma.vessel.upsert({
      where: { slug: vessel.slug },
      update: {},
      create: {
        name: vessel.name,
        slug: vessel.slug,
        registration: vessel.registration,
        capacity: vessel.capacity,
        type: vessel.type,
        operatorName: vessel.operatorName,
        ownerName: vessel.ownerName,
        subtitle: vessel.subtitle,
        description: vessel.description,
        hourlyRate: vessel.hourlyRate,
        dailyRate: vessel.dailyRate,
        heroImage: vessel.heroImage,
        images: vessel.images,
        features: vessel.features,
        status: vessel.status,
      },
    });
  }
  console.log("✅ Vessels seed complete");

  //
  // Experiences
  //
  console.log("🌱 Seeding experiences...");
  for (const experience of EXPERIENCES) {
    await prisma.experience.upsert({
      where: { slug: experience.slug },
      update: {},
      create: {
        name: experience.name,
        slug: experience.slug,
        description: experience.description,
        shortDescription: experience.shortDescription,
        durationMinutes: experience.durationMinutes,
        defaultPrice: experience.defaultPrice,
        currency: experience.currency,
        category: experience.category,
        isFeatured: experience.isFeatured,
        isActive: experience.isActive,
        heroImageUrl: experience.heroImageUrl,
        galleryUrls: experience.galleryUrls,
        maxGroupSize: experience.maxGroupSize,
        minGroupSize: experience.minGroupSize,
        highlights: experience.highlights,
        includes: experience.includes,
        requirements: experience.requirements,
      },
    });
  }
  console.log("✅ Experiences seed complete");

  //
  // Routes
  //
  console.log("🌱 Seeding routes...");
  for (const route of ROUTES) {
    await prisma.route.upsert({
      where: { code: route.code },
      update: {},
      create: {
        name: route.name,
        code: route.code,
        description: route.description,
        estimatedDurationMinutes: route.estimatedDurationMinutes,
        isActive: route.isActive,
      },
    });
  }
  console.log("✅ Routes seed complete");

  //
  // Route Stops
  //
  console.log("🌱 Seeding route stops...");
  const createdRoute = await prisma.route.findUnique({ where: { code: "FJ-HOHO" } });
  if (createdRoute) {
    for (const stop of ROUTE_STOPS) {
      await prisma.routeStop.upsert({
        where: { routeId_code: { routeId: createdRoute.id, code: stop.code } },
        update: {},
        create: {
          routeId: createdRoute.id,
          name: stop.name,
          code: stop.code,
          sequence: stop.sequence,
          isPickupPoint: stop.isPickupPoint,
          isDropoffPoint: stop.isDropoffPoint,
          notes: stop.notes,
        },
      });
    }
  }
  console.log("✅ Route stops seed complete");

  //
  // Departures
  //
  console.log("🌱 Seeding departures...");
  const fortJesusExperience = await prisma.experience.findUnique({ where: { slug: "fort-jesus" } });
  const settingSonsVessel = await prisma.vessel.findUnique({ where: { slug: "setting-sons" } });
  if (createdRoute && fortJesusExperience && settingSonsVessel) {
    for (const departure of DEPARTURES) {
      await prisma.departure.upsert({
        where: { id: `${createdRoute.id}-${departure.departureDateTime}` },
        update: {},
        create: {
          vesselId: settingSonsVessel.id,
          routeId: createdRoute.id,
          experienceId: fortJesusExperience.id,
          departureDateTime: new Date(departure.departureDateTime),
          totalCapacity: departure.totalCapacity,
          availableCapacity: departure.availableCapacity,
          status: "SCHEDULED",
        },
      });
    }
  }
  console.log("✅ Departures seed complete");

  //
  // Default Partner for Direct Bookings
  //
  console.log("🌱 Seeding default partner...");
  const directUser = await prisma.user.upsert({
    where: { email: "direct@bluepineapple.com" },
    update: {},
    create: {
      email: "direct@bluepineapple.com",
      firstName: "Direct",
      lastName: "Booking",
      status: "ACTIVE",
    },
  });

  const directPartner = await prisma.partnerProfile.upsert({
    where: { userId: directUser.id },
    update: {},
    create: {
      userId: directUser.id,
      partnerCode: "DIRECT",
      companyName: "Blue Pineapple Direct",
      commissionRate: 0,
      status: "ACTIVE",
    },
  });
  console.log("✅ Default partner seed complete");

  //
  // Reward Rules
  //
  console.log("🌱 Seeding reward rules...");
  for (const rule of REWARD_RULES) {
    await prisma.rewardRule.upsert({
      where: { name: rule.name },
      update: {},
      create: {
        name: rule.name,
        description: rule.description,
        pointsPerBooking: rule.pointsPerBooking,
        cashMultiplier: rule.cashMultiplier,
        currency: rule.currency,
        isActive: rule.isActive,
        effectiveFrom: rule.effectiveFrom,
        effectiveTo: rule.effectiveTo,
        minGuests: rule.minGuests,
        maxGuests: rule.maxGuests,
        experienceIds: rule.experienceIds,
        routeIds: rule.routeIds,
      },
    });
  }
  console.log("✅ Reward rules seed complete");

  //
  // Reviews
  //
  console.log("🌱 Seeding reviews...");
  for (const review of REVIEWS) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {},
      create: review,
    });
  }
  console.log("✅ Reviews seed complete");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed");
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });