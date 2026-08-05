export const ROUTES = [
  {
    name: "Fort Jesus Hop-On Hop-Off",
    code: "FJ-HOHO",
    description:
      "Hop-on hop-off coastal route from Mtwapa Beach to Fort Jesus with 9 stops along the way. Board at any stop and enjoy the full coastal experience.",
    estimatedDurationMinutes: 480,
    isActive: true,
  },
];

export const ROUTE_STOPS = [
  { name: "Mtwapa Beach", code: "MTW", sequence: 0, isPickupPoint: true, isDropoffPoint: true, notes: "Northernmost stop" },
  { name: "Serena", code: "SER", sequence: 1, isPickupPoint: true, isDropoffPoint: true, notes: "Serena Hotel beach" },
  { name: "Bamburi", code: "BAM", sequence: 2, isPickupPoint: true, isDropoffPoint: true, notes: "Bamburi Beach" },
  { name: "Whitesands", code: "WHT", sequence: 3, isPickupPoint: true, isDropoffPoint: true, notes: "Whitesands Beach Hotel" },
  { name: "Pirates", code: "PIR", sequence: 4, isPickupPoint: true, isDropoffPoint: true, notes: "Pirates Beach" },
  { name: "Mombasa Beach", code: "MOM", sequence: 5, isPickupPoint: true, isDropoffPoint: true, notes: "Main departure point, access via Maasai Bar" },
  { name: "Nyali", code: "NYA", sequence: 6, isPickupPoint: true, isDropoffPoint: true, notes: "Nyali Beach" },
  { name: "English Point", code: "ENG", sequence: 7, isPickupPoint: true, isDropoffPoint: true, notes: "English Point harbour" },
  { name: "Fort Jesus", code: "FJ", sequence: 8, isPickupPoint: true, isDropoffPoint: true, notes: "UNESCO World Heritage Site, final destination" },
];
