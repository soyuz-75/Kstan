import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tn = useTranslations("nav");
  return (
    <section className="container-page flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl text-wood-600">404</p>
      <h1 className="mt-4 text-4xl text-pine-900">{t("title")}</h1>
      <p className="mt-3 max-w-md text-ink-muted">{t("lead")}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-pine">
          {t("home")}
        </Link>
        <Link href="/bronyuvannya" className="btn btn-primary">
          {tn("bookRoom")}
        </Link>
      </div>
    </section>
  );
}
