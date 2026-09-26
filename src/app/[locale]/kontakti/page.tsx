import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { Hours } from "@/components/Hours";
import { ChatIcon, InstagramIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { MapEmbed } from "@/components/MapEmbed";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export async function generateMetadata({ params }: PageProps<"/[locale]/kontakti">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "contacts" });
  return pageMetadata({ locale, href: "/kontakti", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function ContactsPage({ params }: PageProps<"/[locale]/kontakti">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contacts" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <PageHeader
        locale={locale}
        title={t("title")}
        lead={t("lead")}
        crumbs={[crumb("/", locale, tn("home")), crumb("/kontakti", locale, t("title"))]}
      />
      <section className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-8">
          <div>
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-wood-700">{t("phones")}</h2>
            <ul className="mt-3 space-y-2">
              {business.phones.map((p) => (
                <li key={p.e164}>
                  <a href={`tel:${p.e164}`} className="flex items-center gap-2 text-xl font-semibold text-pine-800 hover:text-wood-700">
                    <PhoneIcon className="text-wood-700" /> {p.display}
                  </a>
                  <span className="ml-7 text-sm text-ink-muted">{p.label[locale]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-wood-700">{t("address")}</h2>
            <address className="mt-3 flex items-start gap-2 not-italic">
              <PinIcon className="mt-0.5 shrink-0 text-wood-700" />
              <span>
                {business.name[locale]}
                <br />
                {business.address.street[locale]}
                <br />
                {business.address.postalCode} {business.address.locality[locale]}, {business.address.region[locale]}
              </span>
            </address>
            <a href={business.googleMapsUrl} className="btn btn-pine mt-4" rel="noopener" target="_blank">
              {tc("openInMaps")}
            </a>
          </div>
          <div>
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-wood-700">{t("social")}</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a href={business.social.viber} className="flex items-center gap-2 text-pine-800 hover:text-wood-700">
                  <ChatIcon className="text-wood-700" /> {tc("writeViber")}
                </a>
              </li>
              <li>
                <a href={business.social.instagram} className="flex items-center gap-2 text-pine-800 hover:text-wood-700" rel="noopener" target="_blank">
                  <InstagramIcon className="text-wood-700" /> Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-wood-700">{tc("hours")}</h2>
            <Hours locale={locale} className="mt-3" />
          </div>
        </div>
        <MapEmbed locale={locale} title={t("mapTitle")} className="h-[28rem] lg:h-full" />
      </section>
    </>
  );
}
