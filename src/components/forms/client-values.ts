"use client";

import { useSyncExternalStore } from "react";
import { todayInKyiv } from "@/lib/booking/dates";

const noopSubscribe = () => () => {};

// Evaluated once when this module loads in the browser, i.e. roughly when the form appears.
const loadedAt = typeof window === "undefined" ? "" : String(Date.now());

/** Browser-only values: empty during SSR/static rendering, real after hydration. */
export function useFormLoadedAt(): string {
  return useSyncExternalStore(noopSubscribe, () => loadedAt, () => "");
}

export function useTodayInKyiv(): string | undefined {
  return useSyncExternalStore(noopSubscribe, todayInKyiv, () => undefined);
}

/** A query-string parameter, read after hydration so the page can stay statically rendered. */
export function useQueryParam(name: string): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );
}
