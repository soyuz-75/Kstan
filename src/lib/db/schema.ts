import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Reservation tables. The public site only inserts rows (status = pending);
 * the phase-2 staff tool (/admin) will read and update them, so every table
 * carries a status, a human-friendly ref code and created/updated timestamps.
 */

export const bookingStatus = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "completed"]);
export const bookingSource = pgEnum("booking_source", ["website", "phone", "walk_in", "admin", "other"]);
export const siteLocale = pgEnum("site_locale", ["uk", "en"]);
export const tableArea = pgEnum("table_area", ["any", "hall", "gazebo", "house", "terrace"]);
export const eventType = pgEnum("event_type", ["wedding", "birthday", "corporate", "christening", "other"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const contact = {
  name: varchar("name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 254 }),
  comment: text("comment"),
  locale: siteLocale("locale").notNull().default("uk"),
};

export const roomTypes = pgTable("room_types", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  nameUk: varchar("name_uk", { length: 160 }).notNull(),
  nameEn: varchar("name_en", { length: 160 }).notNull(),
  capacity: integer("capacity").notNull(),
  /** How many physical rooms/houses of this type exist. Availability is checked against this. */
  unitsCount: integer("units_count").notNull(),
  /** Price per night, UAH. */
  basePrice: integer("base_price").notNull(),
  amenities: jsonb("amenities").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const hotelBookings = pgTable(
  "hotel_bookings",
  {
    id: serial("id").primaryKey(),
    ref: varchar("ref", { length: 16 }).notNull().unique(),
    roomTypeId: integer("room_type_id")
      .notNull()
      .references(() => roomTypes.id),
    checkIn: date("check_in", { mode: "string" }).notNull(),
    checkOut: date("check_out", { mode: "string" }).notNull(),
    adults: integer("adults").notNull(),
    children: integer("children").notNull().default(0),
    ...contact,
    status: bookingStatus("status").notNull().default("pending"),
    source: bookingSource("source").notNull().default("website"),
    ...timestamps,
  },
  (t) => [
    index("hotel_bookings_room_dates_idx").on(t.roomTypeId, t.checkIn, t.checkOut),
    index("hotel_bookings_status_idx").on(t.status),
    check("hotel_bookings_dates_chk", sql`${t.checkOut} > ${t.checkIn}`),
    check("hotel_bookings_adults_chk", sql`${t.adults} >= 1`),
  ],
);

export const tableReservations = pgTable(
  "table_reservations",
  {
    id: serial("id").primaryKey(),
    ref: varchar("ref", { length: 16 }).notNull().unique(),
    date: date("date", { mode: "string" }).notNull(),
    time: time("time").notNull(),
    partySize: integer("party_size").notNull(),
    area: tableArea("area").notNull().default("any"),
    ...contact,
    status: bookingStatus("status").notNull().default("pending"),
    source: bookingSource("source").notNull().default("website"),
    ...timestamps,
  },
  (t) => [index("table_reservations_date_idx").on(t.date), index("table_reservations_status_idx").on(t.status)],
);

export const eventInquiries = pgTable(
  "event_inquiries",
  {
    id: serial("id").primaryKey(),
    ref: varchar("ref", { length: 16 }).notNull().unique(),
    eventType: eventType("event_type").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    guests: integer("guests").notNull(),
    /** Venue id from content/venues.ts, or null for "no preference". */
    venue: varchar("venue", { length: 60 }),
    /** Free-text budget as the guest wrote it (e.g. "800 грн/особа"). */
    budget: varchar("budget", { length: 120 }),
    ...contact,
    status: bookingStatus("status").notNull().default("pending"),
    source: bookingSource("source").notNull().default("website"),
    ...timestamps,
  },
  (t) => [index("event_inquiries_date_idx").on(t.date), index("event_inquiries_status_idx").on(t.status)],
);

export type RoomTypeRow = typeof roomTypes.$inferSelect;
export type HotelBookingRow = typeof hotelBookings.$inferSelect;
export type NewHotelBooking = typeof hotelBookings.$inferInsert;
export type TableReservationRow = typeof tableReservations.$inferSelect;
export type EventInquiryRow = typeof eventInquiries.$inferSelect;
