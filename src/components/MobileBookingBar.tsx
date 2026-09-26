import { getTranslations } from "next-intl/server";
import { business } from "@content/business";
import type { Locale } from "@content/types";
import { Link } from "@/i18n/navigation";
import { PhoneIcon } from "./icons";

/** Sticky bottom bar on phones: call + book, always in thumb reach. */
export async function MobileBookingBar({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-300 bg-cream-50/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        <a href={`tel:${business.primaryPhone}`} className="btn btn-pine flex-1" aria-label={`${t("call")}: ${business.phones[0].display}`}>
          <PhoneIcon width={18} height={18} /> {t("call")}
        </a>
        <Link href="/bronyuvannya" className="btn btn-primary flex-[1.4]">
          {t("book")}
        </Link>
      </div>
    </div>
  );
}
