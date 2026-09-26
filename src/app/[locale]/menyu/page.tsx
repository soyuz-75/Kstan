import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import { menu, menuUpdatedAt } from "@content/menu";
import type { Locale } from "@content/types";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export async function generateMetadata({ params }: PageProps<"/[locale]/menyu">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "menu" });
  return pageMetadata({ locale, href: "/menyu", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function MenuPage({ params }: PageProps<"/[locale]/menyu">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "menu" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const updated = new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", { dateStyle: "long" }).format(new Date(menuUpdatedAt));

  return (
    <>
      <PageHeader
        locale={locale}
        title={t("title")}
        lead={t("lead")}
        crumbs={[crumb("/", locale, tn("home")), crumb("/menyu", locale, t("title"))]}
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={business.orderingUrl} className="btn btn-primary" rel="noopener" target="_blank">
            {tc("orderDelivery")}
          </a>
          <Link href="/bronyuvannya/stolyk" className="btn btn-pine">
            {tn("bookTable")}
          </Link>
        </div>
      </PageHeader>

      <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 py-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label={t("categories")} className="min-w-0 lg:sticky lg:top-24 lg:h-fit">
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
            {menu.map((cat) => (
              <li key={cat.id} className="shrink-0">
                <a href={`#${cat.id}`} className="block rounded-full bg-cream-50 px-4 py-2 text-sm font-medium text-pine-800 hover:bg-pine-50 lg:rounded-lg">
                  {cat.name[locale]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-12">
          {menu.map((cat) => (
            <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-title`} className="scroll-mt-24">
              <h2 id={`${cat.id}-title`} className="border-b border-cream-300 pb-3 text-3xl text-pine-900">
                {cat.name[locale]}
              </h2>
              <ul className="divide-y divide-cream-200">
                {cat.items.map((item, i) => (
                  <li key={`${item.name.uk}-${i}`} className="flex items-baseline justify-between gap-4 py-3">
                    <div className="min-w-0 break-words">
                      <p className="font-medium text-ink">{item.name[locale]}</p>
                      {item.description && <p className="text-sm text-ink-muted">{item.description[locale]}</p>}
                      {item.weight && <p className="text-xs text-ink-muted">{item.weight}</p>}
                    </div>
                    <p className="shrink-0 font-semibold text-wood-700">
                      {item.price} {tc("uah")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-sm text-ink-muted">
            {t("priceNote")} {t("updated", { date: updated })}
          </p>
        </div>
      </div>
    </>
  );
}
