/**
 * Lightweight anti-spam for the public forms:
 *  - honeypot field that real users never see or fill;
 *  - minimum time between the form being shown and submitted;
 *  - per-IP sliding-window rate limit (in memory, so per server instance —
 *    good enough against casual abuse; move to Redis/Upstash if it's ever needed);
 *  - optional Cloudflare Turnstile when TURNSTILE_SECRET_KEY is set.
 */

import { HONEYPOT_FIELD, RENDERED_AT_FIELD, TURNSTILE_FIELD } from "./form-fields";

export { HONEYPOT_FIELD, RENDERED_AT_FIELD, TURNSTILE_FIELD };

export const MIN_FILL_MS = 3_000;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;
/** Submissions per IP per window. Override with RATE_LIMIT_MAX (e.g. for e2e runs, where every request is 127.0.0.1). */
const RATE_LIMIT = { max: Number(process.env.RATE_LIMIT_MAX) || 5, windowMs: 10 * 60 * 1000 };

export type SpamVerdict = "ok" | "honeypot" | "tooFast" | "rateLimited" | "captcha";

export function checkHoneypot(formData: FormData): boolean {
  const v = formData.get(HONEYPOT_FIELD);
  return typeof v === "string" && v.trim() !== "";
}

export function checkTiming(formData: FormData, now = Date.now()): boolean {
  const renderedAt = Number(formData.get(RENDERED_AT_FIELD));
  if (!Number.isFinite(renderedAt) || renderedAt <= 0) return false;
  const elapsed = now - renderedAt;
  return elapsed >= MIN_FILL_MS && elapsed <= MAX_FORM_AGE_MS;
}

const hits = new Map<string, number[]>();

export function rateLimit(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Keep the map from growing without bound on long-lived instances.
  if (hits.size > 10_000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(k);
  }
  return true;
}

export function resetRateLimit() {
  hits.clear();
}

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY ?? "", response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("[turnstile] verification failed", err);
    return false;
  }
}

export async function checkSpam(formData: FormData, ip: string): Promise<SpamVerdict> {
  if (checkHoneypot(formData)) return "honeypot";
  if (!checkTiming(formData)) return "tooFast";
  if (turnstileEnabled()) {
    const token = formData.get(TURNSTILE_FIELD);
    if (typeof token !== "string" || !(await verifyTurnstile(token, ip))) return "captcha";
  }
  // Checked last so rejected bot posts don't eat into a real visitor's quota.
  if (!rateLimit(ip)) return "rateLimited";
  return "ok";
}
