import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { business } from "@content/business";
import { galleryKeys, images } from "@content/images";
import type { Locale } from "@content/types";
import { Gallery } from "@/components/Gallery";
import { InstagramIcon } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo/metadata";
import { crumb } from "@/lib/seo/urls";

export async function generateMetadata({ params }: PageProps<"/[locale]/fotogalereya">): Promise<Metadata> {
  const { locale } = (await params) as { locale: Locale };
  const t = await getTranslations({ locale, namespace: "gallery" });
  return pageMetadata({ locale, href: "/fotogalereya", title: t("metaTitle"), description: t("metaDescription") });
}

export default async function GalleryPage({ params }: PageProps<"/[locale]/fotogalereya">) {
  const { locale } = (await params) as { locale: Locale };
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "gallery" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const items = galleryKeys.map((k) => ({ ...images[k], alt: images[k].alt[locale] }));

  return (
    <>
      <PageHeader
        locale={locale}
        title={t("title")}
        lead={t("lead")}
        crumbs={[crumb("/", locale, tn("home")), crumb("/fotogalereya", locale, t("title"))]}
      />
      <section className="container-page py-10">
        <Gallery items={items} />
        <a href={business.social.instagram} className="btn btn-pine mt-10" rel="noopener" target="_blank">
          <InstagramIcon /> {tc("instagram")}
        </a>
      </section>
    </>
  );
}
