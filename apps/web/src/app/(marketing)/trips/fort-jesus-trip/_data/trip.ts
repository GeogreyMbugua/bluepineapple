export const trip = {
  name: "Fort Jesus Historical Boat Tour",
  tagline: "A premium coastal cruise to Fort Jesus with iconic views and time to explore Old Town.",
  location: "Mombasa, Kenya",
  duration: "8 hours",
  vessel: { name: "Big Boat", href: "https://bprepo.vercel.app/boats/setting-sons" },
  departureTime: "9:30 AM daily",
  priceFrom: 500,
  priceUnit: "Per Person",
  inclusions: ["Return Transport", "Professional Guide", "Fort Entry Tickets", "Bottled Water"],
  whatsapp: {
    reserve: "https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%27d%20like%20to%20book%20the%20Fort%20Jesus",
    question: "https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%20have%20a%20question%20about%20Fort%20Jesus",
    returnTrip:
      "https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%27d%20like%20to%20book%20the%20Fort%20Jesus%20%E2%80%94%20Return%20Trip",
  },
} as const;

// Stops between Mtwapa Beach and Fort Jesus, in order.
export const stops = [
  "Mtwapa Beach",
  "Serena",
  "Bamburi",
  "Whitesands",
  "Pirates",
  "Mombasa Beach",
  "Nyali",
  "English Point",
  "Fort Jesus",
] as const;

export type Stop = (typeof stops)[number];

// Fare by number of stops travelled (index 0 unused, index = stop count).
// 1 stop: 500 · 2 stops: 750 · 3 stops: 1,000 · then +400/stop through 7 · full route (8): 3,000 flat.
export const stopRates = [0, 500, 750, 1000, 1400, 1800, 2200, 2600, 3000] as const;

export const quickFares = [
  { label: "1 stop", price: 500 },
  { label: "2 stops", price: 750 },
  { label: "3 stops", price: 1000 },
  { label: "Full route (8 stops)", price: 3000 },
];

export const timetablePreview = [
  { point: "Depart Mtwapa Beach", time: "9:30 AM daily" },
  { point: "Arrive Mombasa Beach", time: "10:30 AM" },
  { point: "Arrive Fort Jesus", time: "11:30 AM" },
];

export const experience = [
  {
    title: "The Journey",
    description:
      "As the boat glides effortlessly away from the powder-white sands of Mombasa Beach, relax and enjoy the ride. The craft is fully equipped with life jackets, GPS navigation, and CCTV for a safe experience.",
    image: "/assets/experiences/fortjesus/fortstock.webp",
  },
  {
    title: "Coastal Views",
    description:
      "Cruise past Nyali, the pristine waters of Mombasa Marine Park, Likoni, and Shelly Beach. Spot landmarks including Ras Serani Lighthouse, State House, and Mombasa Hospital from the water.",
    image: "/assets/experiences/fortjesus/fort2.webp",
  },
  {
    title: "Fort Jesus",
    description:
      "Arrive at the magnificent Fort Jesus, a UNESCO World Heritage Site. Step ashore and explore Old Town's narrow streets filled with antique treasures and Swahili artistry.",
    image: "/assets/experiences/fortjesus/fort3.webp",
  },
];

export const itinerary = [
  {
    step: 1,
    title: "Depart from Mombasa Beach",
    tag: "Departure point",
    meta: "Access via Maasai Bar",
    description:
      "Step aboard at Mombasa Beach — your captain and crew will brief you on safety before casting off. Life jackets are distributed and the GPS system is confirmed active.",
    image: "/assets/experiences/fortjesus/fortstock.webp",
  },
  {
    step: 2,
    title: "Cruise past Nyali Beach",
    tag: "Scenic",
    description:
      "The boat hugs the coastline past Nyali's white-sand shores. A great moment to settle in, take photos, and feel the ocean breeze. Bamburi Beach is a possible stop on request.",
    image: "/assets/experiences/fortjesus/fort2.webp",
  },
  {
    step: 3,
    title: "Pass Mombasa Marine Park",
    tag: "Protected waters",
    description:
      "Glide over the crystal-clear waters of Mombasa Marine Park. Keep an eye out for marine life — turtles and reef fish are commonly spotted here.",
    image: "/assets/experiences/snorkeling/snorkeling.webp",
  },
  {
    step: 4,
    title: "View Likoni & Shelly Beach",
    tag: "Landmarks",
    description:
      "From the water you'll spot the Likoni ferry crossing, Ras Serani Lighthouse, State House, and Mombasa Hospital — a rare perspective of the city most visitors never see.",
    image: "/assets/experiences/fortjesus/fort3.webp",
  },
  {
    step: 5,
    title: "Arrive at Fort Jesus Harbour",
    tag: "UNESCO World Heritage Site",
    description:
      "Dock at the historic harbour beneath the imposing walls of Fort Jesus. Built by the Portuguese in 1593, the fort commands panoramic views of the old harbour and Mombasa's ancient skyline.",
    image: "/assets/experiences/fortjesus/fortstock.webp",
  },
  {
    step: 6,
    title: "Explore Old Town",
    tag: "~1 hr ashore",
    meta: "Optional",
    description:
      "Step into Old Town's winding streets lined with carved Swahili doorways, antique shops, and the smell of Kenyan coastal spices. A living piece of history that feels entirely apart from modern Mombasa.",
    image: "/assets/experiences/fortjesus/fort2.webp",
  },
];

export const safety = [
  "Life jackets for all passengers",
  "GPS navigation system",
  "CCTV surveillance",
  "Experienced captain with 20+ years experience",
  "Fully insured & certified",
  "European safety standards",
];

export const offers = [
  "10% OFF couple bookings",
  "20% OFF group/family bookings (4+ paying passengers)",
  "50% OFF children 5-15",
  "FREE under 5 years",
];

export const tripDetails = [
  { label: "Departure Point", value: "Hop on at any stop along the route" },
  { label: "Departure Times", value: "9:30 AM daily" },
  { label: "Stops", value: "Mtwapa Beach → Fort Jesus (9 stops)" },
  { label: "Vessel", value: "Big Boat" },
];

export function formatKsh(value: number) {
  return `Ksh ${value.toLocaleString("en-US")}`;
}

export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateBooking(
  origin: Stop,
  destination: Stop,
  adults: number,
  children: number,
  returnTicket: boolean,
) {
  const originIndex = stops.indexOf(origin);
  const destinationIndex = stops.indexOf(destination);
  const stopCount = Math.max(1, destinationIndex - originIndex);
  const baseFare = stopRates[stopCount]!;
  const adultFare = baseFare;
  const childFare = Math.round(baseFare * 0.5);
  const subtotal = adultFare * adults + childFare * children;

  let discountRate = 0;
  const discounts: string[] = [];
  if (adults === 2 && children === 0) {
    discountRate += 0.1;
    discounts.push("10% couple savings");
  }
  if (adults + children >= 4) {
    discountRate += 0.08;
    discounts.push("8% group savings");
  }

  const discounted = Math.round(subtotal * (1 - discountRate));
  const total = returnTicket ? Math.round(discounted * 1.8) : discounted;

  return {
    stopCount,
    adultFare,
    childFare,
    subtotal,
    discountRate,
    discounts,
    total,
    totalLabel: formatKsh(total),
    baseLabel: formatKsh(baseFare),
    adultLabel: formatKsh(adultFare),
    childLabel: formatKsh(childFare),
    discountLabel: discounts.length > 0 ? discounts.join(" • ") : "Standard fare applies",
  };
}
