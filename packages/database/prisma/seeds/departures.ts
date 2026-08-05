export function generateDepartures(startDate: Date = new Date(), days: number = 7): Array<{
  vesselId: string;
  routeId: string;
  experienceId: string;
  departureDateTime: string;
  totalCapacity: number;
  availableCapacity: number;
}> {
  const departures = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    departures.push({
      vesselId: "eb965b12-670e-47e0-9d37-f83d90c7e99d",
      routeId: "FJ-HOHO",
      experienceId: "cd5f3db7-4b89-44c4-9ceb-56d28bf5109f",
      departureDateTime: `${dateStr}T09:30:00`,
      totalCapacity: 35,
      availableCapacity: 35,
    });
  }
  return departures;
}

export const DEPARTURES = generateDepartures();
