import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import { amenityLabels, getRoom, rooms } from "@content/rooms";
import type { Locale } from "@content/types";
import { CheckIcon, PhoneIcon, UsersIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Photo } from "@/components/Photo";
import { RoomCard } from "@/components/RoomCard";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { hotelRoomJsonLd } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export const dynamicParams = false;

/** Cuts text to at most `max` chars on a word boundary, adding an ellipsis. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[,;:—–-]$/, "")}…`;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => rooms.map((r) => ({ locale, slug: r.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/gotel/[slug]">): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  const room = getRoom(slug);
  if (!room) return {};
  const tc = await getTranslations({ locale, namespace: "common" });
  const price = `${room.priceFrom ? `${tc("from")} ` : ""}${room.basePrice} ${tc("uah")}`;
  return pageMetadata({
    locale,
    href: { pathname: "/gotel/[slug]", params: { slug } },
    title: `${room.name[locale]} — ${price}`,
    description: clip(`${room.short[locale]} ${room.description[locale]}`, 158),
  });
}

export default async function RoomPage({ params }: PageProps<"/[locale]/gotel/[slug]">) {
  const { locale, slug } = (await params) as { locale: Locale; slug: string };
  setRequestLocale(locale);
  const room = getRoom(slug);
  if (!room) notFound();

  const t = await getTranslations({ locale, namespace: "hotel" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const others = rooms.filter((r) => r.slug !== slug);

  return (
    <>
      <PageHeader
        locale={locale}
        title={room.name[locale]}
        lead={room.short[locale]}
        crumbs={[
          crumb("/", locale, tn("home")),
          crumb("/gotel", locale, t("title")),
          crumb({ pathname: "/gotel/[slug]", params: { slug } }, locale, room.name[locale]),
        ]}
      />

      <section className="container-page grid gap-10 py-12 lg:grid-cols-[3fr_2fr]">
        <div>
          <div className="relative aspect-[2/1] overflow-hidden rounded-2xl bg-cream-200">
            <Photo id={room.image} locale={locale} fill priority sizes="(min-width: 1024px) 700px, 100vw" className="object-cover" />
          </div>
          <p className="mt-8 text-lg leading-relaxed">{room.description[locale]}</p>
          <h2 className="mt-10 text-3xl text-pine-900">{t("amenities")}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {room.amenities.map((a) => (
              <li key={a} className="flex items-center gap-2">
                <CheckIcon className="shrink-0 text-pine-600" /> {amenityLabels[a][locale]}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-2xl bg-cream-50 p-6 shadow-card lg:sticky lg:top-24">
          <p className="font-display text-4xl font-semibold text-wood-700">
            {room.priceFrom ? `${tc("from")} ` : ""}
            {room.basePrice} {tc("uah")}
          </p>
          <p className="text-sm text-ink-muted">{tc("perNight")}</p>
          {room.extras && <p className="mt-2 text-sm font-semibold text-pine-800">{room.extras[locale]}</p>}
          <p className="mt-4 flex items-center gap-2 text-ink-muted">
            <UsersIcon /> {t("capacity", { count: room.capacity })}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {tc("checkInOut", { checkIn: business.hotel.checkIn, checkOut: business.hotel.checkOut })}
          </p>
          <Link href={{ pathname: "/bronyuvannya", query: { room: room.slug } }} className="btn btn-primary mt-6 w-full">
            {t("bookThis")}
          </Link>
          <a href={`tel:${business.primaryPhone}`} className="btn btn-outline mt-3 w-full text-pine-800">
            <PhoneIcon width={18} height={18} /> {business.phones[0].display}
          </a>
        </aside>
      </section>

      <section className="bg-cream-200/60">
        <div className="container-page py-12">
          <h2 className="text-3xl text-pine-900">{t("otherRooms")}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {others.map((r) => (
              <RoomCard key={r.slug} room={r} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={hotelRoomJsonLd(slug, locale)} />
    </>
  );
}
