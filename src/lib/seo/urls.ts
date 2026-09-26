import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

export const SITE_URL = (process.env.SITE_URL ?? "https://k-stan.vn.ua").replace(/\/$/, "");

type Href = Parameters<typeof getPathname>[0]["href"];

function withSlash(path: string): string {
  const [p, q] = path.split("?");
  const slashed = p.endsWith("/") ? p : `${p}/`;
  return q ? `${slashed}?${q}` : slashed;
}

/** Localized path with the trailing slash the site uses, e.g. "/en/hotel/". */
export function localizedPath(href: Href, locale: AppLocale): string {
  return withSlash(getPathname({ href, locale }));
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/** hreflang map for a page: every locale plus x-default (Ukrainian). */
export function languageAlternates(href: Href): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of routing.locales) out[locale] = absoluteUrl(localizedPath(href, locale));
  out["x-default"] = out[routing.defaultLocale];
  return out;
}

/** Breadcrumb entry for a route, with its localized path. */
export function crumb(href: Href, locale: AppLocale, name: string): { name: string; path: string } {
  return { name, path: localizedPath(href, locale) };
}
