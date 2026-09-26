"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const other = locale === "uk" ? "en" : "uk";
  // next-intl returns the internal route template (e.g. "/gotel/[slug]"); params fill it in.
  const pathname = usePathname();
  const params = useParams<{ slug?: string }>();
  const href = (params.slug ? { pathname, params: { slug: params.slug } } : { pathname }) as Parameters<typeof Link>[0]["href"];

  return (
    <Link
      href={href}
      locale={other}
      hrefLang={other}
      lang={other}
      className={className}
      aria-label={`${t("language")}: ${t("switchTo")}`}
    >
      {other.toUpperCase()}
    </Link>
  );
}
