import type { MetadataRoute } from "next";
import { rooms } from "@content/rooms";
import { routing, type StaticPathname } from "@/i18n/routing";
import { absoluteUrl, languageAlternates, localizedPath } from "@/lib/seo/urls";

type Href = Parameters<typeof localizedPath>[0];

const staticPages: { href: StaticPathname; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { href: "/", priority: 1, changeFrequency: "weekly" },
  { href: "/gotel", priority: 0.9, changeFrequency: "monthly" },
  { href: "/restoran", priority: 0.9, changeFrequency: "monthly" },
  { href: "/menyu", priority: 0.8, changeFrequency: "weekly" },
  { href: "/bankety", priority: 0.9, changeFrequency: "monthly" },
  { href: "/sauna-na-drovakh", priority: 0.8, changeFrequency: "monthly" },
  { href: "/fotogalereya", priority: 0.6, changeFrequency: "monthly" },
  { href: "/kontakti", priority: 0.7, changeFrequency: "yearly" },
  { href: "/bronyuvannya", priority: 0.8, changeFrequency: "yearly" },
  { href: "/bronyuvannya/stolyk", priority: 0.7, changeFrequency: "yearly" },
  { href: "/bronyuvannya/banket", priority: 0.7, changeFrequency: "yearly" },
  { href: "/polityka-konfidentsiynosti", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: { href: Href; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    ...staticPages,
    ...rooms.map((r) => ({
      href: { pathname: "/gotel/[slug]" as const, params: { slug: r.slug } },
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
  ];

  return entries.flatMap((entry) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(localizedPath(entry.href, locale)),
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
      alternates: { languages: languageAlternates(entry.href) },
    })),
  );
}
