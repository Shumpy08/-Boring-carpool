import { and, asc, desc, eq, gte, inArray, like, lt } from "drizzle-orm";
import { getDb } from "./connection";
import { bookings, rides, users } from "@db/schema";

const publicRideFields = {
  id: rides.id,
  driverId: rides.driverId,
  origin: rides.origin,
  destination: rides.destination,
  departureAt: rides.departureAt,
  seatsTotal: rides.seatsTotal,
  seatsAvailable: rides.seatsAvailable,
  contributionYen: rides.contributionYen,
  luggage: rides.luggage,
  notes: rides.notes,
  university: rides.university,
  isSample: rides.isSample,
  status: rides.status,
  driverName: users.name,
  driverAvatar: users.avatar,
  driverUniversity: users.university,
};

export async function findRides(filters: {
  origin?: string;
  destination?: string;
  date?: string;
}) {
  const conditions = [
    inArray(rides.status, ["open", "full"]),
    gte(rides.departureAt, new Date()),
  ];

  if (filters.origin) {
    conditions.push(like(rides.origin, `%${filters.origin}%`));
  }
  if (filters.destination) {
    conditions.push(like(rides.destination, `%${filters.destination}%`));
  }
  if (filters.date) {
    conditions.push(gte(rides.departureAt, new Date(`${filters.date}T00:00:00+09:00`)));
    const end = new Date(`${filters.date}T00:00:00+09:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    conditions.push(lt(rides.departureAt, end));
  }

  return getDb()
    .select(publicRideFields)
    .from(rides)
    .innerJoin(users, eq(rides.driverId, users.id))
    .where(and(...conditions))
    .orderBy(asc(rides.departureAt));
}

export async function findRideById(id: number) {
  const [ride] = await getDb()
    .select(publicRideFields)
    .from(rides)
    .innerJoin(users, eq(rides.driverId, users.id))
    .where(eq(rides.id, id))
    .limit(1);
  return ride ?? null;
}

export async function findPassengerTrips(passengerId: number) {
  return getDb()
    .select({
      bookingId: bookings.id,
      bookingStatus: bookings.status,
      bookingNote: bookings.note,
      bookedAt: bookings.createdAt,
      id: rides.id,
      origin: rides.origin,
      destination: rides.destination,
      departureAt: rides.departureAt,
      contributionYen: rides.contributionYen,
      rideStatus: rides.status,
      driverName: users.name,
      driverUniversity: users.university,
    })
    .from(bookings)
    .innerJoin(rides, eq(bookings.rideId, rides.id))
    .innerJoin(users, eq(rides.driverId, users.id))
    .where(eq(bookings.passengerId, passengerId))
    .orderBy(desc(rides.departureAt));
}

export async function findOfferedRides(driverId: number) {
  return getDb()
    .select()
    .from(rides)
    .where(eq(rides.driverId, driverId))
    .orderBy(desc(rides.departureAt));
}

export async function findDriverRequests(driverId: number) {
  return getDb()
    .select({
      bookingId: bookings.id,
      bookingStatus: bookings.status,
      bookingNote: bookings.note,
      requestedAt: bookings.createdAt,
      rideId: rides.id,
      origin: rides.origin,
      destination: rides.destination,
      departureAt: rides.departureAt,
      passengerName: users.name,
      passengerUniversity: users.university,
    })
    .from(bookings)
    .innerJoin(rides, eq(bookings.rideId, rides.id))
    .innerJoin(users, eq(bookings.passengerId, users.id))
    .where(eq(rides.driverId, driverId))
    .orderBy(desc(bookings.createdAt));
}
