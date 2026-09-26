import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { Link } from "@/i18n/navigation";
import { crumb } from "@/lib/seo/urls";
import { PhoneIcon } from "./icons";
import { PageHeader } from "./PageHeader";

type Tab = "hotel" | "table" | "event";
const tabHref = { hotel: "/bronyuvannya", table: "/bronyuvannya/stolyk", event: "/bronyuvannya/banket" } as const;

/** Shared shell for the three booking pages: header, tabs, form card and a call-us aside. */
export async function BookingLayout({ locale, active, title, children }: { locale: Locale; active: Tab; title: string; children: ReactNode }) {
  const t = await getTranslations({ locale, namespace: "booking" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const crumbs = [crumb("/", locale, tn("home")), crumb("/bronyuvannya", locale, t("title"))];
  if (active !== "hotel") crumbs.push(crumb(tabHref[active], locale, title));

  return (
    <>
      <PageHeader locale={locale} title={title} lead={t("lead")} crumbs={crumbs}>
        <nav aria-label={t("title")} className="mt-8">
          <ul className="inline-flex rounded-full bg-cream-200 p-1">
            {(Object.keys(tabHref) as Tab[]).map((tab) => (
              <li key={tab}>
                <Link
                  href={tabHref[tab]}
                  aria-current={tab === active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold ${
                    tab === active ? "bg-pine-800 text-cream-50" : "text-pine-800 hover:bg-cream-100"
                  }`}
                >
                  {t(`tabs.${tab}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl bg-cream-50 p-5 shadow-card sm:p-8">{children}</div>
        <aside className="h-fit rounded-2xl bg-pine-800 p-6 text-cream-50">
          <p className="font-semibold">{t("orCall")}</p>
          <ul className="mt-3 space-y-2">
            {business.phones.map((p) => (
              <li key={p.e164}>
                <a href={`tel:${p.e164}`} className="flex items-center gap-2 text-lg font-semibold hover:text-wood-300">
                  <PhoneIcon className="text-wood-300" /> {p.display}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </>
  );
}
