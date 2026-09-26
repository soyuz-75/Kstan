import { getTranslations } from "next-intl/server";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { Link } from "@/i18n/navigation";
import { Hours } from "./Hours";
import { InstagramIcon, PhoneIcon, PinIcon } from "./icons";
import { mainNav } from "./nav";

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tn = await getTranslations({ locale, namespace: "nav" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const year = 2026;

  return (
    <footer className="bg-pine-900 pb-28 pt-14 text-cream-100 lg:pb-10">
      <div className="container-page grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-3xl text-cream-50">{business.name[locale]}</p>
          <p className="mt-3 max-w-xs text-sm text-cream-200">{t("about")}</p>
          <a
            href={business.social.instagram}
            className="mt-4 inline-flex items-center gap-2 text-sm text-wood-300 hover:text-wood-100"
            rel="noopener"
            target="_blank"
          >
            <InstagramIcon /> {tc("instagram")}
          </a>
        </div>

        <nav aria-label={t("nav")}>
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-wood-300">{t("nav")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-cream-100 hover:text-wood-300">
                  {tn(item.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/bronyuvannya" className="text-cream-100 hover:text-wood-300">
                {tn("book")}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-wood-300">{t("contacts")}</h2>
          <address className="mt-4 space-y-3 text-sm not-italic">
            {business.phones.map((p) => (
              <a key={p.e164} href={`tel:${p.e164}`} className="flex items-center gap-2 hover:text-wood-300">
                <PhoneIcon width={16} height={16} /> {p.display}
              </a>
            ))}
            <a href={business.googleMapsUrl} className="flex items-start gap-2 hover:text-wood-300" rel="noopener" target="_blank">
              <PinIcon width={16} height={16} className="mt-0.5 shrink-0" />
              <span>
                {business.address.street[locale]}, {business.address.locality[locale]}, {business.address.postalCode}
              </span>
            </a>
          </address>
        </div>

        <div>
          <h2 className="font-sans text-sm font-bold uppercase tracking-widest text-wood-300">{tc("hours")}</h2>
          <Hours locale={locale} className="mt-4 text-sm" tone="dark" />
        </div>
      </div>
      <div className="container-page mt-12 flex flex-col gap-2 border-t border-pine-700 pt-6 text-xs text-cream-300 sm:flex-row sm:justify-between">
        <p>{t("rights", { year })}</p>
        <Link href="/polityka-konfidentsiynosti" className="hover:text-wood-300">
          {t("privacy")}
        </Link>
      </div>
    </footer>
  );
}
