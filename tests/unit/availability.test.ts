import { describe, expect, it } from "vitest";
import { isAvailable, nightsOf, overlaps, peakOccupancy } from "@/lib/booking/availability";

const stay = (checkIn: string, checkOut: string, status?: string) => ({ checkIn, checkOut, status });

describe("overlaps", () => {
  it("treats stays as half-open ranges", () => {
    expect(overlaps(stay("2026-10-10", "2026-10-12"), stay("2026-10-12", "2026-10-14"))).toBe(false);
    expect(overlaps(stay("2026-10-12", "2026-10-14"), stay("2026-10-10", "2026-10-12"))).toBe(false);
    expect(overlaps(stay("2026-10-10", "2026-10-13"), stay("2026-10-12", "2026-10-14"))).toBe(true);
  });

  it("detects containment both ways", () => {
    expect(overlaps(stay("2026-10-10", "2026-10-20"), stay("2026-10-12", "2026-10-13"))).toBe(true);
    expect(overlaps(stay("2026-10-12", "2026-10-13"), stay("2026-10-10", "2026-10-20"))).toBe(true);
  });
});

describe("nightsOf", () => {
  it("lists each night, crossing month boundaries", () => {
    expect(nightsOf(stay("2026-10-30", "2026-11-02"))).toEqual(["2026-10-30", "2026-10-31", "2026-11-01"]);
  });
  it("returns nothing for empty or inverted ranges", () => {
    expect(nightsOf(stay("2026-10-10", "2026-10-10"))).toEqual([]);
    expect(nightsOf(stay("2026-10-12", "2026-10-10"))).toEqual([]);
  });
});

describe("isAvailable", () => {
  const request = stay("2026-10-10", "2026-10-12");

  it("is available with no bookings", () => {
    expect(isAvailable([], request, 1)).toBe(true);
  });

  it("frees the unit on the check-out day", () => {
    expect(isAvailable([stay("2026-10-08", "2026-10-10", "confirmed")], request, 1)).toBe(true);
    expect(isAvailable([stay("2026-10-12", "2026-10-15", "pending")], request, 1)).toBe(true);
  });

  it("rejects when the only unit is taken", () => {
    expect(isAvailable([stay("2026-10-11", "2026-10-13", "confirmed")], request, 1)).toBe(false);
  });

  it("counts pending requests as holding a unit", () => {
    expect(isAvailable([stay("2026-10-10", "2026-10-11", "pending")], request, 1)).toBe(false);
  });

  it("ignores cancelled and completed bookings", () => {
    const bookings = [stay("2026-10-10", "2026-10-12", "cancelled"), stay("2026-10-09", "2026-10-11", "completed")];
    expect(isAvailable(bookings, request, 1)).toBe(true);
  });

  it("uses per-night peak, so back-to-back stays share one unit", () => {
    // Night of the 10th and night of the 11th are each taken by a different guest — one unit in use each night.
    const bookings = [stay("2026-10-09", "2026-10-11", "confirmed"), stay("2026-10-11", "2026-10-13", "confirmed")];
    expect(peakOccupancy(bookings, request)).toBe(1);
    expect(isAvailable(bookings, request, 2)).toBe(true);
    expect(isAvailable(bookings, request, 1)).toBe(false);
  });

  it("rejects when every unit is used on any single night", () => {
    const bookings = [stay("2026-10-11", "2026-10-12", "confirmed"), stay("2026-10-11", "2026-10-14", "pending")];
    expect(peakOccupancy(bookings, request)).toBe(2);
    expect(isAvailable(bookings, request, 2)).toBe(false);
    expect(isAvailable(bookings, request, 3)).toBe(true);
  });

  it("is never available for a room type with no units", () => {
    expect(isAvailable([], request, 0)).toBe(false);
  });
});
