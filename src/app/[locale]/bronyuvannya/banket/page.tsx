import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@content/types";
import { venues } from "@content/venues";
import { BookingLayout } from "@/components/BookingLayout";
import { EventInquiryForm } from "@/components/forms/EventInquiryForm";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/bronyuvannya/banket">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "booking" });
  return pageMetadata({ locale, href: "/bronyuvannya/banket", title: t("eventMetaTitle"), description: t("eventMetaDescription") });
}

export default async function EventBookingPage({ params }: PageProps<"/[locale]/bronyuvannya/banket">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "booking" });
  const options = venues
    .filter((v) => v.banquet || v.capacity >= 12)
    .map((v) => ({ id: v.id, name: v.name[locale], capacity: v.capacityMax ?? v.capacity }));
  return (
    <BookingLayout locale={locale} active="event" title={t("eventTitle")}>
      <EventInquiryForm venues={options} />
    </BookingLayout>
  );
}
