import type { Metadata } from "next";
import { business } from "@content/business";
import type { AppLocale } from "@/i18n/routing";
import { absoluteUrl, languageAlternates, localizedPath } from "./urls";

type PageMetaInput = {
  locale: AppLocale;
  href: Parameters<typeof localizedPath>[0];
  title: string;
  description: string;
  /** Path of the social preview image; defaults to the generated per-locale OG image. */
  image?: string;
  noindex?: boolean;
};

/** Canonical, hreflang, Open Graph and Twitter tags for one page. */
export function pageMetadata({ locale, href, title, description, image, noindex }: PageMetaInput): Metadata {
  const url = absoluteUrl(localizedPath(href, locale));
  const siteName = business.name[locale];
  // Set explicitly: a page-level `openGraph` object replaces the one from the opengraph-image file.
  const ogPath = image ?? (locale === "uk" ? "/opengraph-image/" : `/${locale}/opengraph-image/`);
  const images = [{ url: absoluteUrl(ogPath), width: 1200, height: 630, alt: siteName, type: "image/jpeg" }];
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(href) },
    openGraph: {
      type: "website",
      url,
      siteName,
      title,
      description,
      locale: locale === "uk" ? "uk_UA" : "en_US",
      alternateLocale: locale === "uk" ? ["en_US"] : ["uk_UA"],
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
