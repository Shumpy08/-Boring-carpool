import {
  bigint,
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  university: varchar("university", { length: 160 }),
  homeArea: varchar("homeArea", { length: 160 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export const rides = mysqlTable(
  "rides",
  {
    id: serial("id").primaryKey(),
    driverId: bigint("driverId", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id),
    origin: varchar("origin", { length: 160 }).notNull(),
    destination: varchar("destination", { length: 160 }).notNull(),
    departureAt: timestamp("departureAt").notNull(),
    seatsTotal: int("seatsTotal").notNull(),
    seatsAvailable: int("seatsAvailable").notNull(),
    contributionYen: int("contributionYen").notNull().default(0),
    luggage: mysqlEnum("luggage", ["none", "small", "large"])
      .notNull()
      .default("small"),
    notes: text("notes"),
    university: varchar("university", { length: 160 }),
    isSample: boolean("isSample").notNull().default(false),
    status: mysqlEnum("status", ["open", "full", "cancelled", "completed"])
      .notNull()
      .default("open"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    departureIdx: index("rides_departure_idx").on(table.departureAt),
    routeIdx: index("rides_route_idx").on(table.origin, table.destination),
  }),
);

export const bookings = mysqlTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    rideId: bigint("rideId", { mode: "number", unsigned: true })
      .notNull()
      .references(() => rides.id),
    passengerId: bigint("passengerId", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id),
    note: varchar("note", { length: 280 }),
    status: mysqlEnum("status", [
      "requested",
      "approved",
      "declined",
      "cancelled",
    ])
      .notNull()
      .default("requested"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ridePassengerUnique: uniqueIndex("bookings_ride_passenger_unique").on(
      table.rideId,
      table.passengerId,
    ),
    passengerIdx: index("bookings_passenger_idx").on(table.passengerId),
    rideIdx: index("bookings_ride_idx").on(table.rideId),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = typeof rides.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
