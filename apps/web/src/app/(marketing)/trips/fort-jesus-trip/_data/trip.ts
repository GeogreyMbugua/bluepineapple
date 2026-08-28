import { calculatePricing, formatKsh } from "../../../../../lib/pricing/engine";

export const stops = [
  "Mtwapa Beach",
  "Serena",
  "Whitesands",
  "Bamburi",
  "Pirates",
  "Mombasa Beach",
  "Nyali",
  "English Point",
  "Fort Jesus",
] as const;

export type Stop = (typeof stops)[number];

export const trip = {
  name: "Fort Jesus Water Taxi",
  tagline: "Hop on along the coast. Arrive at Fort Jesus.",
  location: "Mombasa, Kenya",
  duration: "~2 hours",
  vessel: { name: "Big Boat", href: "https://bprepo.vercel.app/boats/setting-sons" },
  departureTime: "9:30 AM daily",
  priceFrom: 500,
  priceUnit: "Per stop, per guest",
  inclusions: ["Return Transport", "Professional Guide", "Fort Entry Tickets", "Bottled Water"],
  whatsapp: {
    reserve: "https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%27d%20like%20to%20book%20the%20Fort%20Jesus",
    question: "https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%20have%20a%20question%20about%20Fort%20Jesus",
    returnTrip:
      "https://wa.me/254708485978?text=Hi%20Blue%20Pineapple%2C%20I%27d%20like%20to%20book%20the%20Fort%20Jesus%20%E2%80%94%20Return%20Trip",
  },
} as const;

export const quickFares = [
  { label: "1 stop", price: 500 },
  { label: "2 stops", price: 700 },
  { label: "3 stops", price: 1000 },
  { label: "Full route (8 stops)", price: 3000 },
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
    title: "Depart from Mtwapa Beach",
    tag: "Departure point",
    description:
      "Step aboard at Mtwapa Beach at 9:30 AM — your captain and crew will brief you on safety before casting off toward Serena Hotel.",
    image: "/assets/experiences/fortjesus/fortstock.webp",
  },
  {
    step: 2,
    title: "Serena Hotel",
    tag: "Stop 1",
    description:
      "First stop along the coast. A great moment to settle in and feel the ocean breeze as we continue north.",
    image: "/assets/experiences/fortjesus/fort2.webp",
  },
  {
    step: 3,
    title: "Whitesands Hotel",
    tag: "Stop 2",
    description:
      "Pass the white-sand shores of Whitesands. Keep an eye out for marine life in the pristine waters here.",
    image: "/assets/experiences/fortjesus/fort2.webp",
  },
  {
    step: 4,
    title: "Bamburi Beach",
    tag: "Stop 3",
    description:
      "Glide past Bamburi Beach. Possible stop on request for those who want to stretch their legs.",
    image: "/assets/experiences/fortjesus/fort2.webp",
  },
  {
    step: 5,
    title: "Pirates Beach",
    tag: "Stop 4",
    description:
      "Continue past Pirates Beach. The coastline here offers a rare perspective of the city most visitors never see.",
    image: "/assets/experiences/fortjesus/fort3.webp",
  },
  {
    step: 6,
    title: "Arrive at Mombasa Beach",
    tag: "Stop 5 · 10:30 AM",
    description:
      "Arrive at Mombasa Beach. From the water you will spot the Likoni ferry crossing, Ras Serani Lighthouse, State House, and Mombasa Hospital.",
    image: "/assets/experiences/fortjesus/fortstock.webp",
  },
  {
    step: 7,
    title: "Nyali & English Point",
    tag: "Stops 6 & 7",
    description:
      "Cruise past Nyali Beach and English Point. The final stretch toward Fort Jesus offers panoramic views of the old harbour.",
    image: "/assets/experiences/fortjesus/fort3.webp",
  },
  {
    step: 8,
    title: "Arrive at Fort Jesus",
    tag: "Stop 8 · 11:30 AM",
    description:
      "Dock at the historic harbour beneath the imposing walls of Fort Jesus. Built by the Portuguese in 1593, the fort commands panoramic views of Mombasa&apos;s ancient skyline.",
    image: "/assets/experiences/fortjesus/fortstock.webp",
  },
  {
    step: 9,
    title: "Explore Old Town",
    tag: "~1 hr ashore · Optional",
    description:
      "Step into Old Town&apos;s winding streets lined with carved Swahili doorways, antique shops, and the smell of Kenyan coastal spices.",
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
  { label: "Departure Point", value: "Mtwapa Beach — 9:30 AM daily" },
  { label: "Arrival", value: "Fort Jesus — 11:30 AM (advertised)" },
  { label: "Stops", value: "Mtwapa Beach → Fort Jesus (8 travel segments)" },
  { label: "Vessel", value: "Big Boat" },
];

export { formatKsh } from "../../../../../lib/pricing/engine";

export function calculateBooking(
  origin: Stop,
  destination: Stop,
  adults: number,
  children: number,
  infants: number = 0,
  returnTicket: boolean,
) {
  const result = calculatePricing({
    origin,
    destination,
    adults,
    children,
    infants,
    returnTicket,
  });

  return {
    stopCount: result.stopCount,
    baseFare: result.baseFare,
    adultFare: result.oneWayAdultFare,
    childFare: result.oneWayChildFare,
    subtotal: result.subtotal,
    discountRate: result.discountRate,
    discounts: result.appliedDiscounts,
    total: result.total,
    totalLabel: formatKsh(result.total),
    baseLabel: formatKsh(result.baseFare),
    adultLabel: formatKsh(result.oneWayAdultFare),
    childLabel: formatKsh(result.oneWayChildFare),
    discountLabel: result.appliedDiscounts.length > 0 ? result.appliedDiscounts.join(" • ") : "Standard fare applies",
  };
}

export function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
