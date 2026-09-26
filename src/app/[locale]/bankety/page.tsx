import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { banquetFaq } from "@content/faq";
import type { Locale } from "@content/types";
import { venues } from "@content/venues";
import { Faq } from "@/components/Faq";
import { BedIcon, ChatIcon, FlameIcon, TreeIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { VenueList } from "@/components/VenueList";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export async function generateMetadata({ params }: PageProps<"/[locale]/bankety">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "banquets" });
  return pageMetadata({ locale, href: "/bankety", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function BanquetsPage({ params }: PageProps<"/[locale]/bankety">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "banquets" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tf = await getTranslations({ locale, namespace: "hotel" });

  const features = [
    { icon: <TreeIcon />, title: t("features.ceremony"), text: t("features.ceremonyText") },
    { icon: <FlameIcon />, title: t("features.show"), text: t("features.showText") },
    { icon: <ChatIcon />, title: t("features.host"), text: t("features.hostText") },
    { icon: <BedIcon />, title: t("features.stay"), text: t("features.stayText") },
  ];

  return (
    <>
      <PageHeader
        locale={locale}
        title={t("title")}
        lead={t("lead")}
        image="banquetHall"
        crumbs={[crumb("/", locale, tn("home")), crumb("/bankety", locale, t("title"))]}
      >
        <Link href="/bronyuvannya/banket" className="btn btn-primary mt-8">
          {t("cta")}
        </Link>
      </PageHeader>

      <section className="container-page py-14">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="rounded-2xl bg-cream-50 p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-wood-100 text-wood-700">{f.icon}</span>
              <h2 className="mt-4 text-2xl text-pine-900">{f.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-cream-200/60">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="text-4xl text-pine-900">{t("hallsTitle")}</h2>
            <div className="mt-6">
              <VenueList venues={venues.filter((v) => v.banquet || v.capacity >= 14)} locale={locale} />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Photo id="exteriorPond" locale={locale} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Photo id="exteriorCourtyard" locale={locale} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Faq items={banquetFaq} locale={locale} title={tf("faqTitle")} />

      <section className="container-page pb-16">
        <Link href="/bronyuvannya/banket" className="btn btn-primary">
          {t("cta")}
        </Link>
      </section>
    </>
  );
}
