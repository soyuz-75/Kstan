"use server";

import { and, eq, gt, inArray, lt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { after } from "next/server";
import type { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { getDb } from "@/lib/db";
import { eventInquiries, hotelBookings, roomTypes, tableReservations } from "@/lib/db/schema";
import { notifyNewBooking, type BookingNotice } from "@/lib/notify";
import { checkSpam } from "./antispam";
import { ACTIVE_STATUSES, isAvailable } from "./availability";
import { generateRef, type RefKind } from "./ref";
import { eventInquirySchema, fieldErrors, hotelBookingSchema, tableReservationSchema } from "./validation";

export type FormState = {
  status: "idle" | "error";
  /** Field name → i18n key under form.errors. */
  fieldErrors?: Record<string, string>;
  /** i18n key under form.errors for a form-level message. */
  formError?: string;
  /** Echo of submitted values so the form can be re-filled after a server round trip. */
  values?: Record<string, string>;
  /** Changes on every response; forms use it as a React key to re-mount fields with `values`. */
  nonce?: number;
};

/** Namespace for pg_advisory_xact_lock so hotel availability checks are serialised per room type. */
const HOTEL_LOCK_NS = 4_201;

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

function fail(state: Omit<FormState, "status" | "nonce">): FormState {
  return { status: "error", nonce: Date.now(), ...state };
}

function echo(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && !k.startsWith("$")) out[k] = v;
  return out;
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

/** Runs an insert with a fresh ref, retrying on the (very unlikely) ref collision. */
async function withRef<T>(kind: RefKind, insert: (ref: string) => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await insert(generateRef(kind));
    } catch (err) {
      if (attempt < 3 && isUniqueViolation(err)) continue;
      throw err;
    }
  }
}

type Parsed<S extends z.ZodType> = { ok: true; data: z.infer<S> } | { ok: false; state: FormState };

async function guard<S extends z.ZodType>(schema: S, formData: FormData): Promise<Parsed<S>> {
  const values = echo(formData);
  const verdict = await checkSpam(formData, await clientIp());
  if (verdict !== "ok") {
    return { ok: false, state: fail({ formError: verdict === "rateLimited" ? "rateLimited" : "spam", values }) };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, state: fail({ fieldErrors: fieldErrors(parsed.error), values }) };
  return { ok: true, data: parsed.data };
}

function finish(notice: BookingNotice, locale: "uk" | "en"): never {
  after(() => notifyNewBooking(notice));
  return redirect({ href: { pathname: "/bronyuvannya/dyakuyemo", query: { ref: notice.ref } }, locale });
}

export async function submitHotelBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await guard(hotelBookingSchema(), formData);
  if (!result.ok) return result.state;
  const data = result.data;
  const values = echo(formData);

  let ref: string | null;
  try {
    const db = getDb();
    ref = await db.transaction(async (tx) => {
      const [room] = await tx.select().from(roomTypes).where(eq(roomTypes.slug, data.roomType)).limit(1);
      if (!room || !room.active) return null;
      await tx.execute(sql`select pg_advisory_xact_lock(${HOTEL_LOCK_NS}, ${room.id})`);
      const overlapping = await tx
        .select({ checkIn: hotelBookings.checkIn, checkOut: hotelBookings.checkOut })
        .from(hotelBookings)
        .where(
          and(
            eq(hotelBookings.roomTypeId, room.id),
            inArray(hotelBookings.status, [...ACTIVE_STATUSES]),
            lt(hotelBookings.checkIn, data.checkOut),
            gt(hotelBookings.checkOut, data.checkIn),
          ),
        );
      if (!isAvailable(overlapping, data, room.unitsCount)) return null;
      // Nested transaction = savepoint, so a ref collision can be retried without aborting the outer one.
      return withRef("hotel", (newRef) =>
        tx.transaction(async (sp) => {
          await sp.insert(hotelBookings).values({
          ref: newRef,
          roomTypeId: room.id,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          adults: data.adults,
          children: data.children,
          name: data.name,
          phone: data.phone,
          email: data.email ?? null,
          comment: data.comment ?? null,
          locale: data.locale,
          });
          return newRef;
        }),
      );
    });
  } catch (err) {
    console.error("[booking:hotel] failed", err);
    return fail({ formError: "server", values });
  }

  if (!ref) return fail({ formError: "unavailable", values });
  return finish({ kind: "hotel", ref, data }, data.locale);
}

export async function submitTableReservation(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await guard(tableReservationSchema(), formData);
  if (!result.ok) return result.state;
  const data = result.data;

  let ref: string;
  try {
    ref = await withRef("table", async (newRef) => {
      await getDb()
        .insert(tableReservations)
        .values({
          ref: newRef,
          date: data.date,
          time: data.time,
          partySize: data.partySize,
          area: data.area,
          name: data.name,
          phone: data.phone,
          email: data.email ?? null,
          comment: data.comment ?? null,
          locale: data.locale,
        });
      return newRef;
    });
  } catch (err) {
    console.error("[booking:table] failed", err);
    return fail({ formError: "server", values: echo(formData) });
  }
  return finish({ kind: "table", ref, data }, data.locale);
}

export async function submitEventInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const result = await guard(eventInquirySchema(), formData);
  if (!result.ok) return result.state;
  const data = result.data;

  let ref: string;
  try {
    ref = await withRef("event", async (newRef) => {
      await getDb()
        .insert(eventInquiries)
        .values({
          ref: newRef,
          eventType: data.eventType,
          date: data.date,
          guests: data.guests,
          venue: data.venue ?? null,
          budget: data.budget ?? null,
          name: data.name,
          phone: data.phone,
          email: data.email ?? null,
          comment: data.comment ?? null,
          locale: data.locale,
        });
      return newRef;
    });
  } catch (err) {
    console.error("[booking:event] failed", err);
    return fail({ formError: "server", values: echo(formData) });
  }
  return finish({ kind: "event", ref, data }, data.locale);
}
