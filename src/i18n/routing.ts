import { defineRouting } from "next-intl/routing";

/**
 * Ukrainian lives at the root (`/gotel/`), English under `/en` with English
 * slugs (`/en/hotel/`). Ukrainian slugs match the legacy WordPress URLs where
 * a page still exists, so old links and rankings keep working.
 */
export const routing = defineRouting({
  locales: ["uk", "en"],
  defaultLocale: "uk",
  localePrefix: "as-needed",
  // Always serve the URL's language; never redirect crawlers by Accept-Language.
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/gotel": { uk: "/gotel", en: "/hotel" },
    "/gotel/[slug]": { uk: "/gotel/[slug]", en: "/hotel/[slug]" },
    "/restoran": { uk: "/restoran", en: "/restaurant" },
    "/menyu": { uk: "/menyu", en: "/menu" },
    "/bankety": { uk: "/bankety", en: "/banquets" },
    "/sauna-na-drovakh": { uk: "/sauna-na-drovakh", en: "/sauna" },
    "/fotogalereya": { uk: "/fotogalereya", en: "/gallery" },
    "/kontakti": { uk: "/kontakti", en: "/contacts" },
    "/bronyuvannya": { uk: "/bronyuvannya", en: "/booking" },
    "/bronyuvannya/stolyk": { uk: "/bronyuvannya/stolyk", en: "/booking/table" },
    "/bronyuvannya/banket": { uk: "/bronyuvannya/banket", en: "/booking/event" },
    "/bronyuvannya/dyakuyemo": { uk: "/bronyuvannya/dyakuyemo", en: "/booking/thank-you" },
    "/polityka-konfidentsiynosti": { uk: "/polityka-konfidentsiynosti", en: "/privacy-policy" },
  },
});

export type AppLocale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
/** Routes that need no params, i.e. usable as a plain `href` string. */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}]${string}`>;
