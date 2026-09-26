"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { submitEventInquiry, type FormState } from "@/lib/booking/actions";
import { useTodayInKyiv } from "./client-values";
import { AntiSpamFields, Consent, ContactFields, FormAlert, SelectField, SubmitButton, TextField, useErrorText } from "./fields";

const initial: FormState = { status: "idle" };
const eventTypes = ["wedding", "birthday", "corporate", "christening", "other"] as const;

export type VenueOption = { id: string; name: string; capacity: number };

export function EventInquiryForm({ venues }: { venues: VenueOption[] }) {
  const locale = useLocale();
  const [state, action] = useActionState(submitEventInquiry, initial);
  return (
    <form action={action} className="relative space-y-6" noValidate>
      <FormAlert state={state} />
      <input type="hidden" name="locale" value={locale} />
      <AntiSpamFields />
      <EventFields key={state.nonce ?? 0} state={state} venues={venues} />
      <Consent />
      <SubmitButton />
    </form>
  );
}

function EventFields({ state, venues }: { state: FormState; venues: VenueOption[] }) {
  const t = useTranslations("form");
  const err = useErrorText();
  const today = useTodayInKyiv();
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField name="eventType" label={t("eventType")} defaultValue={v.eventType ?? "wedding"} error={err(e.eventType)}>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {t(`eventTypes.${type}`)}
            </option>
          ))}
        </SelectField>
        <TextField name="date" type="date" label={t("date")} min={today} defaultValue={v.date} error={err(e.date)} />
        <TextField
          name="guests"
          type="number"
          label={t("guests")}
          min={1}
          max={300}
          inputMode="numeric"
          defaultValue={v.guests ?? "50"}
          error={err(e.guests)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField name="venue" label={t("venue")} defaultValue={v.venue ?? ""} optional error={err(e.venue)}>
          <option value="">{t("venueAny")}</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name} ({venue.capacity})
            </option>
          ))}
        </SelectField>
        <TextField
          name="budget"
          label={t("budget")}
          optional
          placeholder={t("budgetPlaceholder")}
          defaultValue={v.budget}
          maxLength={120}
          error={err(e.budget)}
        />
      </div>
      <ContactFields state={state} />
    </>
  );
}
