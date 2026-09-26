import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { rooms } from "@content/rooms";
import type { Locale } from "@content/types";
import { BookingLayout } from "@/components/BookingLayout";
import { HotelBookingForm, type RoomOption } from "@/components/forms/HotelBookingForm";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/bronyuvannya">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "booking" });
  return pageMetadata({ locale, href: "/bronyuvannya", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function BookingPage({ params }: PageProps<"/[locale]/bronyuvannya">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "booking" });
  const options: RoomOption[] = rooms.map((r) => ({
    slug: r.slug,
    name: r.name[locale],
    capacity: r.capacity,
    basePrice: r.basePrice,
    priceFrom: r.priceFrom,
  }));

  return (
    <BookingLayout locale={locale} active="hotel" title={t("hotelTitle")}>
      <HotelBookingForm rooms={options} />
    </BookingLayout>
  );
}
