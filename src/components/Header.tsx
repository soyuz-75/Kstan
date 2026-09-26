import { getTranslations } from "next-intl/server";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { Link } from "@/i18n/navigation";
import { PhoneIcon } from "./icons";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { mainNav } from "./nav";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  return (
    <header className="sticky top-0 z-50 border-b border-cream-200 bg-cream-50/95 backdrop-blur supports-[backdrop-filter]:bg-cream-50/85">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-pine-800 focus:px-4 focus:py-2 focus:text-cream-50"
      >
        {t("skipToContent")}
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link href="/" className="shrink-0">
          <Logo height={64} alt={business.name[locale]} priority className="h-12 w-auto lg:h-16" />
        </Link>

        <nav aria-label={t("home")} className="hidden lg:block">
          <ul className="flex items-center text-[0.95rem] font-medium xl:gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="whitespace-nowrap rounded-full px-2.5 py-2 text-ink hover:bg-cream-200 hover:text-pine-800">
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${business.primaryPhone}`}
            className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-pine-800 hover:bg-cream-200 md:inline-flex"
            aria-label={`${t("call")}: ${business.phones[0].display}`}
          >
            <PhoneIcon width={18} height={18} />
            {/* Number shown where there's room; icon-only from lg up to 2xl, where the nav needs the space. */}
            <span className="lg:hidden 2xl:inline">{business.phones[0].display}</span>
          </a>
          <LocaleSwitcher className="hidden h-11 min-w-11 items-center justify-center rounded-full px-2 text-sm font-bold text-pine-800 hover:bg-cream-200 lg:inline-flex" />
          <Link href="/bronyuvannya" className="btn btn-primary hidden sm:inline-flex">
            {t("book")}
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
