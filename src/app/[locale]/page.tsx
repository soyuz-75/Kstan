import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { business } from "@content/business";
import { galleryKeys, images, type ImageKey } from "@content/images";
import { rooms } from "@content/rooms";
import type { Locale } from "@content/types";
import { venues } from "@content/venues";
import { Gallery } from "@/components/Gallery";
import { BagIcon, CarIcon, ChatIcon, MoonIcon, PhoneIcon, PinIcon, TreeIcon } from "@/components/icons";
import { MapEmbed } from "@/components/MapEmbed";
import { Photo } from "@/components/Photo";
import { RoomCard } from "@/components/RoomCard";
import { VenueList } from "@/components/VenueList";
import { Link } from "@/i18n/navigation";
import type { StaticPathname } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    ...pageMetadata({ locale, href: "/", title: t("metaTitle"), description: t("metaDescription") }),
    title: { absolute: t("metaTitle") },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const tContacts = await getTranslations({ locale, namespace: "contacts" });

  const facts = [
    { icon: <PinIcon />, title: t("facts.distance"), text: t("facts.distanceText") },
    { icon: <TreeIcon />, title: t("facts.forest"), text: t("facts.forestText") },
    { icon: <CarIcon />, title: t("facts.parking"), text: t("facts.parkingText") },
    { icon: <MoonIcon />, title: t("facts.open"), text: t("facts.openText") },
  ];

  const sections: { href: StaticPathname; title: string; text: string; image: ImageKey }[] = [
    { href: "/gotel", title: tn("hotel"), text: t("cards.hotel"), image: "exteriorStreet" },
    { href: "/restoran", title: tn("restaurant"), text: t("cards.restaurant"), image: "restaurantGazebo" },
    { href: "/bankety", title: tn("banquets"), text: t("cards.banquets"), image: "banquetHall" },
    { href: "/sauna-na-drovakh", title: tn("sauna"), text: t("cards.sauna"), image: "sauna" },
  ];

  const gallery = galleryKeys.map((k) => ({ ...images[k], alt: images[k].alt[locale] }));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-pine-900 text-cream-50">
        <Photo id="hero" locale={locale} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-pine-900/95 via-pine-900/45 to-pine-900/10" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-pine-900/70 via-pine-900/20 to-transparent md:block" />
        <div className="container-page pb-14 pt-32 sm:pb-20">
          <p className="eyebrow text-wood-300">{t("eyebrow")}</p>
          <h1 className="mt-3 max-w-3xl text-5xl sm:text-7xl">{t("title")}</h1>
          <p className="mt-5 max-w-xl text-lg text-cream-100">{t("lead")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/bronyuvannya" className="btn btn-primary">
              {tn("bookRoom")}
            </Link>
            <Link href="/bronyuvannya/stolyk" className="btn btn-outline text-cream-50">
              {tn("bookTable")}
            </Link>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section aria-label={t("sectionsTitle")} className="border-b border-cream-200 bg-cream-50">
        <ul className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {facts.map((f) => (
            <li key={f.title} className="flex gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine-50 text-pine-700">{f.icon}</span>
              <div>
                <p className="font-semibold text-pine-900">{f.title}</p>
                <p className="text-sm text-ink-muted">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Hotel / Restaurant / Banquets / Sauna */}
      <Section title={t("sectionsTitle")}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="group block h-full overflow-hidden rounded-2xl bg-cream-50 shadow-card">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Photo
                    id={s.image}
                    locale={locale}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-2xl text-pine-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{s.text}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Rooms */}
      <Section title={tn("hotel")} link={{ href: "/gotel", label: tc("viewAll") }} tone="cream">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {rooms.map((room) => (
            <RoomCard key={room.slug} room={room} locale={locale} />
          ))}
        </div>
      </Section>

      {/* Houses and gazebos */}
      <Section title={t("venuesTitle")} lead={t("venuesLead")} link={{ href: "/restoran", label: tc("learnMore") }}>
        <VenueList venues={venues.slice(0, 6)} locale={locale} />
      </Section>

      {/* Gallery strip */}
      <Section title={t("galleryTitle")} link={{ href: "/fotogalereya", label: tc("viewAll") }} tone="cream">
        <Gallery items={gallery} variant="strip" />
      </Section>

      {/* Order delivery (ChoiceQR) */}
      <section className="container-page py-8">
        <div className="flex flex-col items-start gap-5 rounded-3xl bg-pine-800 p-8 text-cream-50 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-wood-600 text-white">
              <BagIcon />
            </span>
            <div>
              <h2 className="text-3xl">{tc("orderDelivery")}</h2>
              <p className="mt-2 max-w-xl text-cream-200">{tc("orderDeliveryText")}</p>
            </div>
          </div>
          <a href={business.orderingUrl} className="btn btn-primary shrink-0" rel="noopener" target="_blank">
            {tc("orderDelivery")}
          </a>
        </div>
      </section>

      {/* Reviews: link out rather than invent quotes */}
      <Section title={t("reviewsTitle")} lead={t("reviewsLead")}>
        <div className="flex flex-wrap gap-3">
          <a href={business.googleMapsUrl} className="btn btn-pine" rel="noopener" target="_blank">
            {t("reviewsCta")}
          </a>
          <a href={business.social.instagram} className="btn btn-outline text-pine-800" rel="noopener" target="_blank">
            {tc("instagram")}
          </a>
        </div>
      </Section>

      {/* Map + contacts */}
      <Section title={t("mapTitle")} tone="cream">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-ink">
              <PinIcon className="mt-0.5 shrink-0 text-wood-700" />
              {business.address.street[locale]}, {business.address.locality[locale]} · {business.distanceFromCity[locale]}
            </p>
            {business.phones.map((p) => (
              <a key={p.e164} href={`tel:${p.e164}`} className="flex items-center gap-2 font-semibold text-pine-800 hover:text-wood-700">
                <PhoneIcon className="text-wood-700" /> {p.display}
              </a>
            ))}
            <a href={business.social.viber} className="flex items-center gap-2 text-pine-800 hover:text-wood-700">
              <ChatIcon className="text-wood-700" /> {tc("writeViber")}
            </a>
            <a href={business.googleMapsUrl} className="btn btn-pine" rel="noopener" target="_blank">
              {tc("openInMaps")}
            </a>
          </div>
          <MapEmbed locale={locale} title={tContacts("mapTitle")} className="h-80 lg:h-96" />
        </div>
      </Section>
    </>
  );
}

function Section({
  title,
  lead,
  link,
  tone,
  children,
}: {
  title: string;
  lead?: string;
  link?: { href: StaticPathname; label: string };
  tone?: "cream";
  children: ReactNode;
}) {
  return (
    <section className={tone === "cream" ? "bg-cream-200/60" : ""}>
      <div className="container-page py-14 sm:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl text-pine-900 sm:text-5xl">{title}</h2>
            {lead && <p className="mt-3 max-w-2xl text-ink-muted">{lead}</p>}
          </div>
          {link && (
            <Link href={link.href} className="font-semibold text-wood-700 underline-offset-4 hover:underline">
              {link.label} →
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
