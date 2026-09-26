import { z } from "zod";
import { business } from "@content/business";
import { rooms } from "@content/rooms";
import { venues } from "@content/venues";
import { diffDays, todayInKyiv } from "./dates";

export { addDays, diffDays, todayInKyiv } from "./dates";

/**
 * Zod schemas for the three public forms. Error messages are i18n keys under
 * `form.errors.*` in messages/*.json, so the same schema serves both locales.
 * Schemas are built by functions that take "today" so tests can pin the date.
 */

export const MAX_STAY_NIGHTS = 30;
export const BOOKING_HORIZON_DAYS = 365;
/** Last table reservation starts this many minutes before closing. */
export const LAST_SEATING_MINUTES = 60;

/**
 * Normalises Ukrainian phone numbers to E.164 (+380XXXXXXXXX).
 * Accepts "+380 67 143 88 64", "380671438864", "067-143-88-64", "(0432) 57-83-31".
 * Returns null when the input isn't a Ukrainian number.
 */
export function normalizeUaPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  let national: string | undefined;
  if (/^\+380\d{9}$/.test(digits)) national = digits.slice(4);
  else if (/^380\d{9}$/.test(digits)) national = digits.slice(3);
  else if (/^0\d{9}$/.test(digits)) national = digits.slice(1);
  if (!national || national.startsWith("0")) return null;
  return `+380${national}`;
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date").refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s), "date");

const phone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const normalized = normalizeUaPhone(v);
    if (!normalized) {
      ctx.addIssue({ code: "custom", message: "phone" });
      return z.NEVER;
    }
    return normalized;
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, "tooLong")
    .optional()
    .transform((v) => (v ? v : undefined));

const count = (min: number, max: number) =>
  z.coerce.number({ message: "number" }).int("number").min(min, "min").max(max, "max");

const contactFields = {
  name: z.string().trim().min(2, "name").max(120, "tooLong"),
  phone,
  email: z
    .string()
    .trim()
    .max(254, "tooLong")
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.email("email").optional()),
  comment: optionalText(1000),
  locale: z.enum(["uk", "en"]).default("uk"),
};

function futureDate(today: string) {
  return isoDate
    .refine((d) => d >= today, "past")
    .refine((d) => diffDays(today, d) <= BOOKING_HORIZON_DAYS, "tooFar");
}

export function hotelBookingSchema(today = todayInKyiv()) {
  return z
    .object({
      roomType: z.string().refine((slug) => rooms.some((r) => r.slug === slug), "roomType"),
      checkIn: futureDate(today),
      checkOut: isoDate,
      adults: count(1, 10),
      children: count(0, 10).default(0),
      ...contactFields,
    })
    .superRefine((v, ctx) => {
      const nights = diffDays(v.checkIn, v.checkOut);
      if (nights < business.hotel.minNights) {
        ctx.addIssue({ code: "custom", path: ["checkOut"], message: "checkOutBeforeCheckIn" });
      } else if (nights > MAX_STAY_NIGHTS) {
        ctx.addIssue({ code: "custom", path: ["checkOut"], message: "stayTooLong" });
      }
      const room = rooms.find((r) => r.slug === v.roomType);
      if (room && v.adults + v.children > room.capacity) {
        ctx.addIssue({ code: "custom", path: ["adults"], message: "capacity" });
      }
    });
}

export type HotelBookingInput = z.infer<ReturnType<typeof hotelBookingSchema>>;

const weekdayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Restaurant opening window for a date, in minutes after midnight. */
export function restaurantWindow(isoDay: string): { opens: number; closes: number } {
  const weekday = weekdayOrder[new Date(`${isoDay}T12:00:00Z`).getUTCDay()];
  const hours = business.restaurantHours.find((h) => (h.days as readonly string[]).includes(weekday));
  const fallback = business.restaurantHours[0];
  return { opens: toMinutes((hours ?? fallback).opens), closes: toMinutes((hours ?? fallback).closes) };
}

export function tableReservationSchema(today = todayInKyiv()) {
  return z
    .object({
      date: futureDate(today),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "time"),
      partySize: count(1, 130),
      area: z.enum(["any", "hall", "gazebo", "house", "terrace"]).default("any"),
      ...contactFields,
    })
    .superRefine((v, ctx) => {
      const { opens, closes } = restaurantWindow(v.date);
      const t = toMinutes(v.time);
      if (t < opens || t > closes - LAST_SEATING_MINUTES) {
        ctx.addIssue({ code: "custom", path: ["time"], message: "outsideHours" });
      }
    });
}

export type TableReservationInput = z.infer<ReturnType<typeof tableReservationSchema>>;

export const eventTypes = ["wedding", "birthday", "corporate", "christening", "other"] as const;

export function eventInquirySchema(today = todayInKyiv()) {
  return z.object({
    eventType: z.enum(eventTypes, "eventType"),
    date: futureDate(today),
    guests: count(1, 300),
    venue: z
      .string()
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => v === undefined || venues.some((x) => x.id === v), "venue"),
    budget: optionalText(120),
    ...contactFields,
  });
}

export type EventInquiryInput = z.infer<ReturnType<typeof eventInquirySchema>>;

/** Flattens zod issues to `{ field: messageKey }`, first issue per field wins. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    out[key] ??= issue.message;
  }
  return out;
}
