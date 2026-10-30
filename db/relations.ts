import { relations } from "drizzle-orm";
import { bookings, rides, users } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  offeredRides: many(rides),
  bookings: many(bookings),
}));

export const ridesRelations = relations(rides, ({ one, many }) => ({
  driver: one(users, {
    fields: [rides.driverId],
    references: [users.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  ride: one(rides, {
    fields: [bookings.rideId],
    references: [rides.id],
  }),
  passenger: one(users, {
    fields: [bookings.passengerId],
    references: [users.id],
  }),
}));
