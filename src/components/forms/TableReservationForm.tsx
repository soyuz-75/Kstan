"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { submitTableReservation, type FormState } from "@/lib/booking/actions";
import { useTodayInKyiv } from "./client-values";
import { AntiSpamFields, Consent, ContactFields, FormAlert, SelectField, SubmitButton, TextField, useErrorText } from "./fields";

const initial: FormState = { status: "idle" };
const areas = ["any", "hall", "gazebo", "house", "terrace"] as const;

export function TableReservationForm() {
  const locale = useLocale();
  const [state, action] = useActionState(submitTableReservation, initial);
  return (
    <form action={action} className="relative space-y-6" noValidate>
      <FormAlert state={state} />
      <input type="hidden" name="locale" value={locale} />
      <AntiSpamFields />
      <TableFields key={state.nonce ?? 0} state={state} />
      <Consent />
      <SubmitButton />
    </form>
  );
}

function TableFields({ state }: { state: FormState }) {
  const t = useTranslations("form");
  const err = useErrorText();
  const today = useTodayInKyiv();
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField name="date" type="date" label={t("date")} min={today} defaultValue={v.date} error={err(e.date)} />
        <TextField name="time" type="time" label={t("time")} step={900} defaultValue={v.time ?? "19:00"} error={err(e.time)} />
        <TextField
          name="partySize"
          type="number"
          label={t("partySize")}
          min={1}
          max={130}
          inputMode="numeric"
          defaultValue={v.partySize ?? "2"}
          error={err(e.partySize)}
        />
      </div>
      <SelectField name="area" label={t("area")} defaultValue={v.area ?? "any"} optional error={err(e.area)}>
        {areas.map((a) => (
          <option key={a} value={a}>
            {t(`areas.${a}`)}
          </option>
        ))}
      </SelectField>
      <ContactFields state={state} commentPlaceholder="" />
    </>
  );
}
