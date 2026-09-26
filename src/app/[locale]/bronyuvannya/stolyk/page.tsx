import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@content/types";
import { BookingLayout } from "@/components/BookingLayout";
import { TableReservationForm } from "@/components/forms/TableReservationForm";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/bronyuvannya/stolyk">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "booking" });
  return pageMetadata({ locale, href: "/bronyuvannya/stolyk", title: t("tableMetaTitle"), description: t("tableMetaDescription") });
}

export default async function TableBookingPage({ params }: PageProps<"/[locale]/bronyuvannya/stolyk">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "booking" });
  return (
    <BookingLayout locale={locale} active="table" title={t("tableTitle")}>
      <TableReservationForm />
    </BookingLayout>
  );
}
