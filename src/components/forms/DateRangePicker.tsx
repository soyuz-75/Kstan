"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { addDays, diffDays } from "@/lib/booking/dates";

type Props = {
  checkIn: string;
  checkOut: string;
  onChange: (range: { checkIn: string; checkOut: string }) => void;
  /** Earliest selectable check-in (today in Kyiv); undefined until mounted. */
  min?: string;
  errors?: { checkIn?: string; checkOut?: string };
};

/**
 * Two native date inputs (best mobile UX and accessibility) with linked
 * constraints: check-out is always at least one night after check-in.
 */
export function DateRangePicker({ checkIn, checkOut, onChange, min, errors = {} }: Props) {
  const t = useTranslations("form");
  const id = useId();
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;

  return (
    <fieldset className="grid grid-cols-2 gap-4">
      <legend className="sr-only">
        {t("checkIn")} / {t("checkOut")}
      </legend>
      <div>
        <label htmlFor={`${id}-in`} className="field-label">
          {t("checkIn")}
        </label>
        <input
          id={`${id}-in`}
          type="date"
          name="checkIn"
          required
          min={min}
          value={checkIn}
          onChange={(e) => {
            const next = e.target.value;
            // Keep check-out after check-in when the guest moves the start date.
            const out = next && (!checkOut || checkOut <= next) ? addDays(next, 1) : checkOut;
            onChange({ checkIn: next, checkOut: out });
          }}
          className="field-input"
          aria-invalid={errors.checkIn ? true : undefined}
          aria-describedby={errors.checkIn ? `${id}-in-error` : undefined}
        />
        {errors.checkIn && (
          <p id={`${id}-in-error`} className="field-error" role="alert">
            {errors.checkIn}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={`${id}-out`} className="field-label">
          {t("checkOut")}
        </label>
        <input
          id={`${id}-out`}
          type="date"
          name="checkOut"
          required
          min={checkIn ? addDays(checkIn, 1) : min}
          value={checkOut}
          onChange={(e) => onChange({ checkIn, checkOut: e.target.value })}
          className="field-input"
          aria-invalid={errors.checkOut ? true : undefined}
          aria-describedby={errors.checkOut ? `${id}-out-error` : `${id}-nights`}
        />
        {errors.checkOut ? (
          <p id={`${id}-out-error`} className="field-error" role="alert">
            {errors.checkOut}
          </p>
        ) : (
          <p id={`${id}-nights`} className="field-hint" aria-live="polite">
            {nights > 0 ? t("nights", { count: nights }) : " "}
          </p>
        )}
      </div>
    </fieldset>
  );
}
