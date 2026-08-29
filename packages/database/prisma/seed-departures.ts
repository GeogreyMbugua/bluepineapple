import { prisma } from "../src/index";

async function seedDepartures() {
  const route = await prisma.route.findFirst();
  const experience = await prisma.experience.findFirst();
  const vessel = await prisma.vessel.findFirst();

  if (!route || !experience || !vessel) {
    console.log("Missing seed data");
    return;
  }

  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const departureDateTime = new Date(`${dateStr}T06:30:00.000Z`);
    const id = `${route.id}-${departureDateTime.toISOString()}`;

    const departure = await prisma.departure.upsert({
      where: { id },
      update: {},
      create: {
        id,
        routeId: route.id,
        experienceId: experience.id,
        vesselId: vessel.id,
        departureDateTime,
        totalCapacity: 35,
        onlineCapacity: 20,
        onlineBookedSeats: 0,
        availableCapacity: 35,
        bookedSeats: 0,
        status: "SCHEDULED",
      },
    });
    console.log("Created:", departure.id);
  }
}

seedDepartures();
