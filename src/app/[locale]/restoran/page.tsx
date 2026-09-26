import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { venues } from "@content/venues";
import { Hours } from "@/components/Hours";
import { BagIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { VenueList } from "@/components/VenueList";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export async function generateMetadata({ params }: PageProps<"/[locale]/restoran">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "restaurant" });
  return pageMetadata({ locale, href: "/restoran", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function RestaurantPage({ params }: PageProps<"/[locale]/restoran">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "restaurant" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <PageHeader
        locale={locale}
        title={t("title")}
        lead={t("lead")}
        image="restaurantGazebo"
        crumbs={[crumb("/", locale, tn("home")), crumb("/restoran", locale, t("title"))]}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/bronyuvannya/stolyk" className="btn btn-primary">
            {tn("bookTable")}
          </Link>
          <Link href="/menyu" className="btn btn-outline text-cream-50">
            {t("menuCta")}
          </Link>
        </div>
      </PageHeader>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-[2fr_1fr]">
        <div>
          <p className="eyebrow text-wood-700">{t("highlights")}</p>
          <h2 className="mt-4 text-4xl text-pine-900">{t("venuesTitle")}</h2>
          <div className="mt-6">
            <VenueList venues={venues} locale={locale} />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-2xl bg-cream-50 p-6 shadow-card">
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-wood-700">{tc("hours")}</h2>
            <Hours locale={locale} className="mt-4" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Photo id="exteriorPond" locale={locale} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
          </div>
          <a href={business.orderingUrl} className="flex items-center gap-3 rounded-2xl bg-pine-800 p-5 text-cream-50 hover:bg-pine-700" rel="noopener" target="_blank">
            <BagIcon className="shrink-0 text-wood-300" />
            <span>
              <span className="block font-semibold">{tc("orderDelivery")}</span>
              <span className="text-sm text-cream-200">{tc("orderDeliveryText")}</span>
            </span>
          </a>
        </aside>
      </section>
    </>
  );
}
