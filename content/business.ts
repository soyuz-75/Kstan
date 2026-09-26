import type { L10n } from "./types";

/**
 * Single source of truth for NAP (name / address / phone), geo and hours.
 * Everything that prints these — header, footer, contacts page, JSON-LD,
 * notifications — reads from here so the data stays consistent for local SEO.
 *
 * Sources: the legacy k-stan.vn.ua site (phones, address), the business's live
 * ChoiceQR page (coordinates, restaurant hours, Instagram) and the hotels3d.com
 * listing (check-in/out policy, starting price). Values marked CONFIRM should be
 * checked with the staff before launch.
 */
export const business = {
  name: { uk: "Козацький Стан", en: "Kozatskyi Stan" } satisfies L10n,
  legalName: "Козацький Стан",
  tagline: {
    uk: "Готель, ресторан і сауна на дровах у лісі за 3 км від Вінниці",
    en: "Hotel, restaurant and wood-fired sauna in the forest, 3 km from Vinnytsia",
  } satisfies L10n,
  url: process.env.SITE_URL ?? "https://k-stan.vn.ua",

  address: {
    // CONFIRM: the legacy site only says "Вінницька об'їзна"; 23222 comes from ChoiceQR.
    street: { uk: "Вінницька об'їзна дорога", en: "Vinnytsia ring road" } satisfies L10n,
    locality: { uk: "Вінниця", en: "Vinnytsia" } satisfies L10n,
    region: { uk: "Вінницька область", en: "Vinnytsia Oblast" } satisfies L10n,
    postalCode: "23222",
    countryCode: "UA",
  },
  geo: { lat: 49.2595116, lng: 28.4219265 },
  distanceFromCity: { uk: "3 км від Вінниці", en: "3 km from Vinnytsia" } satisfies L10n,

  phones: [
    { display: "(067) 143-88-64", e164: "+380671438864", label: { uk: "Мобільний", en: "Mobile" } },
    { display: "(0432) 578-331", e164: "+380432578331", label: { uk: "Стаціонарний", en: "Landline" } },
  ],
  /** Main number used for click-to-call and messenger links. */
  primaryPhone: "+380671438864",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,

  social: {
    instagram: "https://www.instagram.com/kozatskiy_stan_vn/",
    viber: "viber://chat?number=%2B380671438864",
    // CONFIRM: only enable once staff confirm the number is on Telegram.
    telegram: null as string | null,
  },
  /** Delivery / takeaway / in-restaurant QR ordering is handled by ChoiceQR — we link out. */
  orderingUrl: "https://kozatskiy-stan-vn.choiceqr.com/delivery",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=49.2595116,28.4219265",

  /**
   * Restaurant hours, from ChoiceQR (the current source of truth).
   * Days use schema.org names; `opens`/`closes` are local Kyiv time.
   */
  restaurantHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday", "Sunday"], opens: "09:00", closes: "23:30" },
    { days: ["Thursday"], opens: "07:00", closes: "23:30" },
  ],
  saunaHours: { opens: "10:00", closes: "24:00" },
  hotel: {
    checkIn: "14:00",
    checkOut: "12:00",
    minNights: 1,
    open247: true,
  },
  timezone: "Europe/Kyiv",
  cuisine: ["Ukrainian", "European", "Grill"],
  priceRange: "₴₴",
} as const;

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const weekdayLabels: Record<Weekday, L10n> = {
  Monday: { uk: "Пн", en: "Mon" },
  Tuesday: { uk: "Вт", en: "Tue" },
  Wednesday: { uk: "Ср", en: "Wed" },
  Thursday: { uk: "Чт", en: "Thu" },
  Friday: { uk: "Пт", en: "Fri" },
  Saturday: { uk: "Сб", en: "Sat" },
  Sunday: { uk: "Нд", en: "Sun" },
};
