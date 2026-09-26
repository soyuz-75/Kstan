import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import { hotelFaq } from "@content/faq";
import { rooms } from "@content/rooms";
import type { Locale } from "@content/types";
import { Faq } from "@/components/Faq";
import { CheckIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { RoomCard } from "@/components/RoomCard";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export async function generateMetadata({ params }: PageProps<"/[locale]/gotel">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "hotel" });
  return pageMetadata({ locale, href: "/gotel", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function HotelPage({ params }: PageProps<"/[locale]/gotel">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "hotel" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const policy = [
    tc("checkInOut", { checkIn: business.hotel.checkIn, checkOut: business.hotel.checkOut }),
    t("policyMinStay"),
    t("policyPayment"),
  ];

  return (
    <>
      <PageHeader
        locale={locale}
        title={t("title")}
        lead={t("lead")}
        image="exteriorStreet"
        crumbs={[crumb("/", locale, tn("home")), crumb("/gotel", locale, t("title"))]}
      >
        <Link href="/bronyuvannya" className="btn btn-primary mt-8">
          {tn("bookRoom")}
        </Link>
      </PageHeader>

      <section className="container-page py-14">
        <h2 className="text-4xl text-pine-900">{t("roomsTitle")}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {rooms.map((room) => (
            <RoomCard key={room.slug} room={room} locale={locale} />
          ))}
        </div>
      </section>

      <section className="bg-cream-200/60">
        <div className="container-page py-12">
          <h2 className="text-3xl text-pine-900">{t("policyTitle")}</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {policy.map((p) => (
              <li key={p} className="flex items-start gap-2 rounded-xl bg-cream-50 p-4">
                <CheckIcon className="mt-0.5 shrink-0 text-pine-600" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Faq items={hotelFaq} locale={locale} title={t("faqTitle")} />
    </>
  );
}
