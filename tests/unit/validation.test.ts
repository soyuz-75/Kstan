import { describe, expect, it } from "vitest";
import {
  eventInquirySchema,
  fieldErrors,
  hotelBookingSchema,
  normalizeUaPhone,
  restaurantWindow,
  tableReservationSchema,
  todayInKyiv,
} from "@/lib/booking/validation";

const TODAY = "2026-10-01"; // a Thursday

describe("normalizeUaPhone", () => {
  it.each([
    ["+380671438864", "+380671438864"],
    ["+380 67 143 88 64", "+380671438864"],
    ["380671438864", "+380671438864"],
    ["067-143-88-64", "+380671438864"],
    ["(067) 143-88-64", "+380671438864"],
    ["(0432) 57-83-31", "+380432578331"],
  ])("normalises %s", (input, expected) => {
    expect(normalizeUaPhone(input)).toBe(expected);
  });

  it.each(["", "12345", "+48123456789", "+3806714388", "0671438864123", "+380071438864", "phone"])("rejects %s", (input) => {
    expect(normalizeUaPhone(input)).toBeNull();
  });
});

describe("todayInKyiv", () => {
  it("uses Kyiv time, not UTC", () => {
    // 22:30 UTC on 1 Oct is already 01:30 on 2 Oct in Kyiv (UTC+3 in summer time).
    expect(todayInKyiv(new Date("2026-10-01T22:30:00Z"))).toBe("2026-10-02");
  });
});

const contact = { name: "Олена", phone: "067 143 88 64", locale: "uk" };

describe("hotelBookingSchema", () => {
  const schema = hotelBookingSchema(TODAY);
  const base = { roomType: "standartnyi-nomer", checkIn: "2026-10-05", checkOut: "2026-10-07", adults: "2", children: "0", ...contact };

  it("accepts a valid request and normalises fields", () => {
    const r = schema.parse({ ...base, email: "", comment: "  " });
    expect(r).toMatchObject({ adults: 2, children: 0, phone: "+380671438864", email: undefined, comment: undefined });
  });

  it("rejects check-in in the past", () => {
    const r = schema.safeParse({ ...base, checkIn: "2026-09-30" });
    expect(r.success).toBe(false);
    expect(fieldErrors(r.error!)).toMatchObject({ checkIn: "past" });
  });

  it("allows check-in today", () => {
    expect(schema.safeParse({ ...base, checkIn: TODAY, checkOut: "2026-10-02" }).success).toBe(true);
  });

  it("requires at least one night", () => {
    const same = schema.safeParse({ ...base, checkOut: base.checkIn });
    expect(fieldErrors(same.error!)).toMatchObject({ checkOut: "checkOutBeforeCheckIn" });
    const inverted = schema.safeParse({ ...base, checkOut: "2026-10-04" });
    expect(fieldErrors(inverted.error!)).toMatchObject({ checkOut: "checkOutBeforeCheckIn" });
  });

  it("caps stays at 30 nights", () => {
    expect(schema.safeParse({ ...base, checkOut: "2026-11-04" }).success).toBe(true);
    expect(fieldErrors(schema.safeParse({ ...base, checkOut: "2026-11-05" }).error!)).toMatchObject({ checkOut: "stayTooLong" });
  });

  it("rejects dates more than a year ahead", () => {
    expect(fieldErrors(schema.safeParse({ ...base, checkIn: "2027-10-05", checkOut: "2027-10-06" }).error!)).toMatchObject({ checkIn: "tooFar" });
  });

  it("rejects impossible calendar dates", () => {
    expect(schema.safeParse({ ...base, checkIn: "2026-02-30" }).success).toBe(false);
  });

  it("enforces room capacity including children", () => {
    // Standard room sleeps 2.
    expect(fieldErrors(schema.safeParse({ ...base, adults: "2", children: "1" }).error!)).toMatchObject({ adults: "capacity" });
    // VIP №22 sleeps 6.
    expect(schema.safeParse({ ...base, roomType: "vip-budynok-22", adults: "4", children: "2" }).success).toBe(true);
    expect(schema.safeParse({ ...base, roomType: "vip-budynok-22", adults: "5", children: "2" }).success).toBe(false);
  });

  it("requires at least one adult and a known room", () => {
    expect(fieldErrors(schema.safeParse({ ...base, adults: "0" }).error!)).toMatchObject({ adults: "min" });
    expect(fieldErrors(schema.safeParse({ ...base, roomType: "penthouse" }).error!)).toMatchObject({ roomType: "roomType" });
  });

  it("validates contact details", () => {
    const r = schema.safeParse({ ...base, name: "A", phone: "12345", email: "not-an-email" });
    expect(fieldErrors(r.error!)).toMatchObject({ name: "name", phone: "phone", email: "email" });
  });
});

describe("tableReservationSchema", () => {
  const schema = tableReservationSchema(TODAY);
  const base = { date: "2026-10-03", time: "19:00", partySize: "4", area: "gazebo", ...contact };

  it("accepts a valid reservation", () => {
    expect(schema.parse(base)).toMatchObject({ partySize: 4, area: "gazebo", time: "19:00" });
  });

  it("keeps reservations within opening hours, last seating an hour before close", () => {
    // Saturday: 09:00–23:30.
    expect(schema.safeParse({ ...base, time: "09:00" }).success).toBe(true);
    expect(schema.safeParse({ ...base, time: "22:30" }).success).toBe(true);
    expect(fieldErrors(schema.safeParse({ ...base, time: "22:45" }).error!)).toMatchObject({ time: "outsideHours" });
    expect(fieldErrors(schema.safeParse({ ...base, time: "08:30" }).error!)).toMatchObject({ time: "outsideHours" });
  });

  it("opens earlier on Thursdays", () => {
    expect(restaurantWindow("2026-10-01")).toEqual({ opens: 7 * 60, closes: 23 * 60 + 30 });
    expect(schema.safeParse({ ...base, date: "2026-10-01", time: "07:30" }).success).toBe(true);
    expect(schema.safeParse({ ...base, date: "2026-10-02", time: "07:30" }).success).toBe(false);
  });

  it("defaults the area and rejects unknown ones", () => {
    expect(schema.parse({ ...base, area: undefined }).area).toBe("any");
    expect(schema.safeParse({ ...base, area: "roof" }).success).toBe(false);
  });
});

describe("eventInquirySchema", () => {
  const schema = eventInquirySchema(TODAY);
  const base = { eventType: "wedding", date: "2027-06-12", guests: "90", venue: "banquet-hall", budget: "900 грн/особа", ...contact };

  it("accepts a valid inquiry", () => {
    expect(schema.parse(base)).toMatchObject({ eventType: "wedding", guests: 90, venue: "banquet-hall" });
  });

  it("treats an empty venue as no preference", () => {
    expect(schema.parse({ ...base, venue: "" }).venue).toBeUndefined();
  });

  it("rejects unknown venues and event types", () => {
    expect(schema.safeParse({ ...base, venue: "moon" }).success).toBe(false);
    expect(fieldErrors(schema.safeParse({ ...base, eventType: "rave" }).error!)).toMatchObject({ eventType: "eventType" });
  });
});
