import type { StaticPathname } from "@/i18n/routing";

export const mainNav: { href: StaticPathname; key: "hotel" | "restaurant" | "menu" | "banquets" | "sauna" | "gallery" | "contacts" }[] = [
  { href: "/gotel", key: "hotel" },
  { href: "/restoran", key: "restaurant" },
  { href: "/menyu", key: "menu" },
  { href: "/bankety", key: "banquets" },
  { href: "/sauna-na-drovakh", key: "sauna" },
  { href: "/fotogalereya", key: "gallery" },
  { href: "/kontakti", key: "contacts" },
];
