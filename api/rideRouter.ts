import { and, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { authedQuery, createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  findDriverRequests,
  findOfferedRides,
  findPassengerTrips,
  findRideById,
  findRides,
} from "./queries/rides";
import { bookings, rides, users } from "@db/schema";

const idInput = z.object({ id: z.number().int().positive() });
const rideInput = z.object({
  origin: z.string().trim().min(2).max(160),
  destination: z.string().trim().min(2).max(160),
  departureAt: z.string().datetime(),
  seatsTotal: z.number().int().min(1).max(6),
  contributionYen: z.number().int().min(0).max(5000),
  luggage: z.enum(["none", "small", "large"]),
  university: z.string().trim().min(2).max(160),
  notes: z.string().trim().max(500).optional(),
});

export const rideRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        origin: z.string().trim().max(160).optional(),
        destination: z.string().trim().max(160).optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
    )
    .query(({ input }) => findRides(input)),

  byId: publicQuery.input(idInput).query(async ({ input }) => {
    const ride = await findRideById(input.id);
    if (!ride) throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
    return ride;
  }),

  create: authedQuery.input(rideInput).mutation(async ({ ctx, input }) => {
    const departureAt = new Date(input.departureAt);
    if (departureAt <= new Date()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a future departure time" });
    }
    if (input.origin.toLowerCase() === input.destination.toLowerCase()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Origin and destination must differ" });
    }

    const db = getDb();
    const [{ id }] = await db
      .insert(rides)
      .values({
        driverId: ctx.user.id,
        origin: input.origin,
        destination: input.destination,
        departureAt,
        seatsTotal: input.seatsTotal,
        seatsAvailable: input.seatsTotal,
        contributionYen: input.contributionYen,
        luggage: input.luggage,
        university: input.university,
        notes: input.notes || null,
      })
      .$returningId();

    await db
      .update(users)
      .set({ university: input.university })
      .where(eq(users.id, ctx.user.id));
    return { id };
  }),

  requestSeat: authedQuery
    .input(z.object({ rideId: z.number().int().positive(), note: z.string().trim().max(280).optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.transaction(async (tx) => {
        const [ride] = await tx.select().from(rides).where(eq(rides.id, input.rideId)).for("update");
        if (!ride) throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
        if (ride.driverId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot book your own ride" });
        }
        if (ride.status !== "open" || ride.seatsAvailable < 1 || ride.departureAt <= new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This ride is no longer accepting requests" });
        }

        const [existing] = await tx
          .select()
          .from(bookings)
          .where(and(eq(bookings.rideId, input.rideId), eq(bookings.passengerId, ctx.user.id)))
          .limit(1);

        if (existing && ["requested", "approved"].includes(existing.status)) {
          throw new TRPCError({ code: "CONFLICT", message: "You already have a request for this ride" });
        }
        if (existing) {
          await tx
            .update(bookings)
            .set({ status: "requested", note: input.note || null })
            .where(eq(bookings.id, existing.id));
        } else {
          await tx.insert(bookings).values({
            rideId: input.rideId,
            passengerId: ctx.user.id,
            note: input.note || null,
          });
        }
      });
      return { success: true };
    }),

  myBookings: authedQuery.query(({ ctx }) => findPassengerTrips(ctx.user.id)),
  myOffers: authedQuery.query(({ ctx }) => findOfferedRides(ctx.user.id)),
  driverRequests: authedQuery.query(({ ctx }) => findDriverRequests(ctx.user.id)),

  approve: authedQuery.input(idInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    await db.transaction(async (tx) => {
      const [booking] = await tx.select().from(bookings).where(eq(bookings.id, input.id)).for("update");
      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
      const [ride] = await tx.select().from(rides).where(eq(rides.id, booking.rideId)).for("update");
      if (!ride || ride.driverId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the driver can approve this request" });
      }
      if (booking.status !== "requested") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This request has already been handled" });
      }
      if (ride.status !== "open" || ride.seatsAvailable < 1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No seats are available" });
      }

      const seatsAvailable = ride.seatsAvailable - 1;
      await tx.update(bookings).set({ status: "approved" }).where(eq(bookings.id, booking.id));
      await tx
        .update(rides)
        .set({ seatsAvailable, status: seatsAvailable === 0 ? "full" : "open" })
        .where(eq(rides.id, ride.id));
    });
    return { success: true };
  }),

  decline: authedQuery.input(idInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, input.id)).limit(1);
    if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Request not found" });
    const [ride] = await db.select().from(rides).where(eq(rides.id, booking.rideId)).limit(1);
    if (!ride || ride.driverId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only the driver can decline this request" });
    }
    if (booking.status !== "requested") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This request has already been handled" });
    }
    await db.update(bookings).set({ status: "declined" }).where(eq(bookings.id, booking.id));
    return { success: true };
  }),

  cancelBooking: authedQuery.input(idInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    await db.transaction(async (tx) => {
      const [booking] = await tx.select().from(bookings).where(eq(bookings.id, input.id)).for("update");
      if (!booking || booking.passengerId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found" });
      }
      if (!["requested", "approved"].includes(booking.status)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This booking is already closed" });
      }
      const [ride] = await tx.select().from(rides).where(eq(rides.id, booking.rideId)).for("update");
      if (booking.status === "approved" && ride && !["cancelled", "completed"].includes(ride.status)) {
        const seatsAvailable = Math.min(ride.seatsTotal, ride.seatsAvailable + 1);
        await tx.update(rides).set({ seatsAvailable, status: "open" }).where(eq(rides.id, ride.id));
      }
      await tx.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, booking.id));
    });
    return { success: true };
  }),

  cancelRide: authedQuery.input(idInput).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [ride] = await db.select().from(rides).where(eq(rides.id, input.id)).limit(1);
    if (!ride || ride.driverId !== ctx.user.id) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Ride not found" });
    }
    if (!["open", "full"].includes(ride.status)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This ride is already closed" });
    }
    await db.update(rides).set({ status: "cancelled" }).where(eq(rides.id, ride.id));
    await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(and(eq(bookings.rideId, ride.id), inArray(bookings.status, ["requested", "approved"])));
    return { success: true };
  }),

  updateProfile: authedQuery
    .input(z.object({ university: z.string().trim().min(2).max(160), homeArea: z.string().trim().max(160).optional() }))
    .mutation(async ({ ctx, input }) => {
      await getDb()
        .update(users)
        .set({ university: input.university, homeArea: input.homeArea || null })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});
