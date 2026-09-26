import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { saunaInfo } from "@content/venues";
import { CheckIcon, ClockIcon, PhoneIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export async function generateMetadata({ params }: PageProps<"/[locale]/sauna-na-drovakh">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "sauna" });
  return pageMetadata({ locale, href: "/sauna-na-drovakh", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function SaunaPage({ params }: PageProps<"/[locale]/sauna-na-drovakh">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "sauna" });
  const tn = await getTranslations({ locale, namespace: "nav" });

  const features = ["guests", "pool", "rest", "balcony", "tea"] as const;

  return (
    <>
      <PageHeader
        locale={locale}
        title={t("title")}
        lead={t("lead")}
        crumbs={[crumb("/", locale, tn("home")), crumb("/sauna-na-drovakh", locale, t("title"))]}
      />
      <section className="container-page grid gap-10 py-12 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream-200">
          <Photo id="sauna" locale={locale} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 rounded-xl bg-cream-50 p-4">
                <CheckIcon className="shrink-0 text-pine-600" /> {t(`features.${f}`)}
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl bg-pine-800 p-6 text-cream-50">
            <p className="font-display text-4xl font-semibold text-wood-300">{t("price", { price: saunaInfo.pricePerHour })}</p>
            <p className="mt-1 text-cream-200">
              {t("extraGuest", { price: saunaInfo.extraGuestPrice, count: saunaInfo.includedGuests })}
            </p>
            <p className="mt-4 flex items-center gap-2">
              <ClockIcon className="text-wood-300" />
              {t("hoursValue", { opens: business.saunaHours.opens, closes: business.saunaHours.closes })}
            </p>
            <a href={`tel:${business.primaryPhone}`} className="btn btn-primary mt-6 w-full sm:w-auto">
              <PhoneIcon width={18} height={18} /> {t("bookCta")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
