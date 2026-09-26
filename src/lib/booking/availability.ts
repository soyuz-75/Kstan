import { addDays, diffDays } from "./dates";

/**
 * Hotel availability. Stays are half-open ranges [checkIn, checkOut): a guest
 * checking out on the 12th frees the unit for someone checking in on the 12th.
 *
 * A request is available when, on every night of the stay, the number of
 * active bookings covering that night is below the number of units. Counting
 * per night (rather than just counting overlapping bookings) means two short
 * stays that don't overlap each other only use one unit.
 */

export type StayRange = { checkIn: string; checkOut: string };
export type BookingLike = StayRange & { status?: string };

/** Statuses that hold a unit. Cancelled and completed bookings free it. */
export const ACTIVE_STATUSES = ["pending", "confirmed"] as const;

export function isActive(b: BookingLike): boolean {
  return b.status === undefined || (ACTIVE_STATUSES as readonly string[]).includes(b.status);
}

export function overlaps(a: StayRange, b: StayRange): boolean {
  return a.checkIn < b.checkOut && b.checkIn < a.checkOut;
}

/** Each night of a stay, identified by its date (the night of the 10th → "…-10"). */
export function nightsOf(range: StayRange): string[] {
  const n = diffDays(range.checkIn, range.checkOut);
  return Array.from({ length: Math.max(0, n) }, (_, i) => addDays(range.checkIn, i));
}

/** Highest number of active bookings on any single night of `range`. */
export function peakOccupancy(bookings: BookingLike[], range: StayRange): number {
  const relevant = bookings.filter((b) => isActive(b) && overlaps(b, range));
  let peak = 0;
  for (const night of nightsOf(range)) {
    const used = relevant.filter((b) => b.checkIn <= night && night < b.checkOut).length;
    if (used > peak) peak = used;
  }
  return peak;
}

export function isAvailable(bookings: BookingLike[], range: StayRange, unitsCount: number): boolean {
  if (unitsCount <= 0) return false;
  return peakOccupancy(bookings, range) < unitsCount;
}
