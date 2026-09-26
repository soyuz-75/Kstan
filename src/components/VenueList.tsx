import { getTranslations } from "next-intl/server";
import type { Locale } from "@content/types";
import { areaLabels, type Venue } from "@content/venues";

export async function VenueList({ venues, locale }: { venues: Venue[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "restaurant" });
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {venues.map((v) => (
        <li key={v.id} className="flex items-start justify-between gap-4 rounded-2xl border border-cream-300 bg-cream-50 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-wood-700">{areaLabels[v.area][locale]}</p>
            <h3 className="mt-1 font-display text-xl text-pine-900">{v.name[locale]}</h3>
            {v.note && <p className="mt-1 text-sm text-ink-muted">{v.note[locale]}</p>}
          </div>
          <p className="shrink-0 rounded-full bg-pine-800 px-3 py-1 text-sm font-semibold text-cream-50">
            {v.capacityMax ? t("seatsRange", { min: v.capacity, max: v.capacityMax }) : t("seats", { count: v.capacity })}
          </p>
        </li>
      ))}
    </ul>
  );
}
