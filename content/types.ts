export type Locale = "uk" | "en";

/** A string translated into every supported locale. */
export type L10n = Record<Locale, string>;

export function t(value: L10n, locale: Locale): string {
  return value[locale] ?? value.uk;
}
