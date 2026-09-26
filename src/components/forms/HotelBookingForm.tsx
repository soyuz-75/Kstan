"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { submitHotelBooking, type FormState } from "@/lib/booking/actions";
import { diffDays } from "@/lib/booking/dates";
import { useQueryParam, useTodayInKyiv } from "./client-values";
import { DateRangePicker } from "./DateRangePicker";
import { AntiSpamFields, Consent, ContactFields, FormAlert, SelectField, SubmitButton, TextField, useErrorText } from "./fields";

export type RoomOption = { slug: string; name: string; capacity: number; basePrice: number; priceFrom: boolean };

const initial: FormState = { status: "idle" };

export function HotelBookingForm({ rooms }: { rooms: RoomOption[] }) {
  const locale = useLocale();
  const [state, action] = useActionState(submitHotelBooking, initial);
  return (
    <form action={action} className="relative space-y-6" noValidate>
      <FormAlert state={state} />
      <input type="hidden" name="locale" value={locale} />
      <AntiSpamFields />
      {/* Re-mount on every server response so the fields pick up the echoed values. */}
      <HotelFields key={state.nonce ?? 0} state={state} rooms={rooms} />
      <Consent />
      <SubmitButton />
    </form>
  );
}

function HotelFields({ state, rooms }: { state: FormState; rooms: RoomOption[] }) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const err = useErrorText();
  const today = useTodayInKyiv();
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};

  // ?room=<slug> preselects a room (links from the room pages). Read after hydration, so
  // the static HTML shows the default room and switches without any layout shift.
  const requested = useQueryParam("room");
  const fromQuery = rooms.some((r) => r.slug === requested) ? requested : null;
  const [chosen, setRoomSlug] = useState<string | null>(v.roomType ?? null);
  const roomSlug = chosen ?? fromQuery ?? rooms[0].slug;
  const [range, setRange] = useState({ checkIn: v.checkIn ?? "", checkOut: v.checkOut ?? "" });

  const room = rooms.find((r) => r.slug === roomSlug) ?? rooms[0];
  const nights = range.checkIn && range.checkOut ? diffDays(range.checkIn, range.checkOut) : 0;

  return (
    <>
      <SelectField
        name="roomType"
        label={t("roomType")}
        value={roomSlug}
        onChange={(ev) => setRoomSlug(ev.target.value)}
        error={err(e.roomType)}
      >
        {rooms.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.name} — {r.priceFrom ? `${tc("from")} ` : ""}
            {r.basePrice} {tc("uah")}
          </option>
        ))}
      </SelectField>

      <DateRangePicker
        checkIn={range.checkIn}
        checkOut={range.checkOut}
        onChange={setRange}
        min={today}
        errors={{ checkIn: err(e.checkIn), checkOut: err(e.checkOut) }}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          name="adults"
          type="number"
          label={t("adults")}
          min={1}
          max={room.capacity}
          defaultValue={v.adults ?? "2"}
          inputMode="numeric"
          error={err(e.adults)}
        />
        <TextField
          name="children"
          type="number"
          label={t("children")}
          min={0}
          max={room.capacity - 1}
          defaultValue={v.children ?? "0"}
          inputMode="numeric"
          optional
          error={err(e.children)}
        />
      </div>

      {nights > 0 && (
        <p className="rounded-xl bg-pine-50 px-4 py-3 text-sm text-pine-900" aria-live="polite">
          {t("summaryPrice", { price: room.basePrice * nights, nights: t("nights", { count: nights }) })}
        </p>
      )}

      <ContactFields state={state} />
    </>
  );
}
