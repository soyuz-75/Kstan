import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { CheckIcon, PhoneIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { refKind } from "@/lib/booking/ref";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/bronyuvannya/dyakuyemo">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "booking" });
  return pageMetadata({
    locale,
    href: "/bronyuvannya/dyakuyemo",
    title: t("thanksMetaTitle"),
    description: t("thanksLead"),
    noindex: true,
  });
}

export default async function ThankYouPage({ params, searchParams }: PageProps<"/[locale]/bronyuvannya/dyakuyemo">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "booking" });
  const raw = (await searchParams).ref;
  const ref = typeof raw === "string" ? raw.toUpperCase() : "";
  const kind = refKind(ref);

  return (
    <section className="container-page flex flex-col items-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pine-100 text-pine-700">
        <CheckIcon width={32} height={32} />
      </span>
      <h1 className="mt-6 text-4xl text-pine-900 sm:text-5xl">{t("thanksTitle")}</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-muted">{t("thanksLead")}</p>
      {kind && (
        <div className="mt-8 rounded-2xl border border-cream-300 bg-cream-50 px-8 py-6">
          <p className="text-sm text-ink-muted">
            {t(`thanksKind.${kind}`)} · {t("thanksRef")}
          </p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-widest text-pine-900" data-testid="booking-ref">
            {ref}
          </p>
          <p className="mt-2 text-sm text-ink-muted">{t("thanksRefHint")}</p>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href={`tel:${business.primaryPhone}`} className="btn btn-pine">
          <PhoneIcon width={18} height={18} /> {business.phones[0].display}
        </a>
        <Link href="/" className="btn btn-outline text-pine-800">
          {t("thanksHome")}
        </Link>
      </div>
    </section>
  );
}
