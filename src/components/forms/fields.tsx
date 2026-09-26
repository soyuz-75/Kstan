"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { HONEYPOT_FIELD, RENDERED_AT_FIELD } from "@/lib/booking/form-fields";
import type { FormState } from "@/lib/booking/actions";
import { Link } from "@/i18n/navigation";
import { useFormLoadedAt } from "./client-values";

/** Translates an error key from the server (`form.errors.<key>`), falling back to a generic message. */
export function useErrorText() {
  const t = useTranslations("form.errors");
  return (key?: string) => {
    if (!key) return undefined;
    return t.has(key as never) ? t(key as never) : t("server");
  };
}

type FieldShellProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
};

function FieldShell({ id, label, error, hint, optional, children, className }: FieldShellProps) {
  const t = useTranslations("form");
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-muted">({t("optional")})</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = { name: string; label: string; error?: string; hint?: string; optional?: boolean; className?: string };

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({ name, label, error, hint, optional, className, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId() + name;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <input
        id={id}
        name={name}
        className="field-input"
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  error,
  hint,
  optional,
  className,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId() + name;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <select
        id={id}
        name={name}
        className="field-input"
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({ name, label, error, hint, optional, className, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId() + name;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} optional={optional} className={className}>
      <textarea
        id={id}
        name={name}
        rows={3}
        className="field-input"
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...rest}
      />
    </FieldShell>
  );
}

/** Hidden anti-spam inputs: honeypot, render timestamp and (optionally) Cloudflare Turnstile. */
export function AntiSpamFields() {
  // Filled in the browser so the static HTML doesn't bake in the build time.
  const renderedAt = useFormLoadedAt();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || document.querySelector("script[data-turnstile]")) return;
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.dataset.turnstile = "1";
    document.head.appendChild(s);
  }, [siteKey]);

  return (
    <>
      <input type="hidden" name={RENDERED_AT_FIELD} value={renderedAt} readOnly />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {siteKey && <div className="cf-turnstile" data-sitekey={siteKey} />}
    </>
  );
}

export function SubmitButton() {
  const t = useTranslations("form");
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full sm:w-auto sm:min-w-56" disabled={pending} aria-disabled={pending}>
      {pending ? t("submitting") : t("submit")}
    </button>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  const t = useTranslations("form.errors");
  const errorText = useErrorText();
  if (state.status !== "error") return null;
  const message = state.formError ? errorText(state.formError) : t("title");
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}

export function Consent() {
  const t = useTranslations("form");
  return (
    <p className="text-xs text-ink-muted">
      {t.rich("consent", {
        link: (chunks) => (
          <Link href="/polityka-konfidentsiynosti" className="underline hover:text-pine-800">
            {chunks}
          </Link>
        ),
      })}
    </p>
  );
}

/** Shared name / phone / email / comment block. */
export function ContactFields({ state, commentPlaceholder }: { state: FormState; commentPlaceholder?: string }) {
  const t = useTranslations("form");
  const err = useErrorText();
  const v = state.values ?? {};
  const e = state.fieldErrors ?? {};
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField name="name" label={t("name")} autoComplete="name" defaultValue={v.name} error={err(e.name)} maxLength={120} />
      <TextField
        name="phone"
        type="tel"
        label={t("phone")}
        autoComplete="tel"
        inputMode="tel"
        placeholder={t("phonePlaceholder")}
        defaultValue={v.phone}
        error={err(e.phone)}
      />
      <TextField
        name="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        optional
        hint={t("emailHint")}
        defaultValue={v.email}
        error={err(e.email)}
        className="sm:col-span-2"
      />
      <TextAreaField
        name="comment"
        label={t("comment")}
        optional
        placeholder={commentPlaceholder ?? t("commentPlaceholder")}
        defaultValue={v.comment}
        error={err(e.comment)}
        maxLength={1000}
        className="sm:col-span-2"
      />
    </div>
  );
}
