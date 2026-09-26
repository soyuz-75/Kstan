import { getTranslations } from "next-intl/server";
import { business, weekdayLabels, type Weekday } from "@content/business";
import type { Locale } from "@content/types";

function dayRange(days: readonly string[], locale: Locale): string {
  const labels = days.map((d) => weekdayLabels[d as Weekday][locale]);
  return labels.join(", ");
}

export async function Hours({ locale, className, tone = "light" }: { locale: Locale; className?: string; tone?: "light" | "dark" }) {
  const t = await getTranslations({ locale, namespace: "common" });
  const label = tone === "dark" ? "text-wood-300" : "text-ink-muted";
  return (
    <dl className={`space-y-3 ${className ?? ""}`}>
      <div>
        <dt className={`font-semibold ${label}`}>{t("restaurantHours")}</dt>
        {business.restaurantHours.map((h) => (
          <dd key={h.days.join()}>
            {dayRange(h.days, locale)}: {h.opens}–{h.closes}
          </dd>
        ))}
      </div>
      <div>
        <dt className={`font-semibold ${label}`}>{t("hotelHours")}</dt>
        <dd>
          {t("open247")} · {t("checkInOut", { checkIn: business.hotel.checkIn, checkOut: business.hotel.checkOut })}
        </dd>
      </div>
      <div>
        <dt className={`font-semibold ${label}`}>{t("saunaHours")}</dt>
        <dd>
          {business.saunaHours.opens}–{business.saunaHours.closes}
        </dd>
      </div>
    </dl>
  );
}
