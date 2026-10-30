import { inArray } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { rides, users } from "./schema";

const demoUsers = [
  {
    unionId: "demo-nori-yuki",
    name: "Yuki T.",
    university: "Nagaoka University of Technology",
    homeArea: "Nagaoka",
  },
  {
    unionId: "demo-nori-aoi",
    name: "Aoi S.",
    university: "Nagaoka Institute of Design",
    homeArea: "Nagaoka",
  },
  {
    unionId: "demo-nori-ren",
    name: "Ren K.",
    university: "Niigata University",
    homeArea: "Niigata City",
  },
];

function atJapanTime(daysAhead: number, hour: number, minute = 0) {
  const date = new Date(Date.now() + daysAhead * 86_400_000);
  date.setUTCHours(hour - 9, minute, 0, 0);
  return date;
}

async function seed() {
  const db = getDb();
  console.log("Seeding Nori starter data...");

  const existing = await db
    .select()
    .from(users)
    .where(inArray(users.unionId, demoUsers.map((user) => user.unionId)));

  for (const demoUser of demoUsers) {
    if (!existing.some((user) => user.unionId === demoUser.unionId)) {
      await db.insert(users).values(demoUser);
    }
  }

  const driverRows = await db
    .select()
    .from(users)
    .where(inArray(users.unionId, demoUsers.map((user) => user.unionId)));
  const driverByUnionId = new Map(driverRows.map((user) => [user.unionId, user.id]));

  const starterRides = await db
    .select({ id: rides.id })
    .from(rides)
    .where(inArray(rides.driverId, driverRows.map((user) => user.id)))
    .limit(1);

  if (starterRides.length === 0) {
    await db.insert(rides).values([
      {
        driverId: driverByUnionId.get("demo-nori-yuki")!,
        origin: "Nagaoka Station",
        destination: "Nagaoka University of Technology",
        departureAt: atJapanTime(1, 8, 20),
        seatsTotal: 3,
        seatsAvailable: 2,
        contributionYen: 200,
        luggage: "small",
        university: "Nagaoka University of Technology",
        notes: "Leaving from the Oteguchi exit. A short stop on the way is fine.",
        isSample: true,
      },
      {
        driverId: driverByUnionId.get("demo-nori-aoi")!,
        origin: "Nagaoka Institute of Design",
        destination: "Niigata Station",
        departureAt: atJapanTime(2, 15, 40),
        seatsTotal: 3,
        seatsAvailable: 3,
        contributionYen: 900,
        luggage: "large",
        university: "Nagaoka Institute of Design",
        notes: "Weekend trip. One suitcase per person; tolls and fuel are shared.",
        isSample: true,
      },
      {
        driverId: driverByUnionId.get("demo-nori-ren")!,
        origin: "Niigata University — Igarashi Campus",
        destination: "Nagaoka Station",
        departureAt: atJapanTime(3, 18, 10),
        seatsTotal: 2,
        seatsAvailable: 1,
        contributionYen: 800,
        luggage: "small",
        university: "Niigata University",
        notes: "Meeting near the west gate. Please arrive five minutes early.",
        isSample: true,
      },
      {
        driverId: driverByUnionId.get("demo-nori-yuki")!,
        origin: "Nagaoka Station",
        destination: "Echigo-Yuzawa Station",
        departureAt: atJapanTime(5, 7, 30),
        seatsTotal: 4,
        seatsAvailable: 2,
        contributionYen: 700,
        luggage: "large",
        university: "Nagaoka University of Technology",
        notes: "Early start for a day trip. Ski gear is welcome if it fits safely.",
        isSample: true,
      },
    ]);
  }

  console.log("Starter data ready.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
