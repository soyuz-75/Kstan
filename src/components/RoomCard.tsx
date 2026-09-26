import { getTranslations } from "next-intl/server";
import { amenityLabels, type RoomType } from "@content/rooms";
import type { Locale } from "@content/types";
import { Link } from "@/i18n/navigation";
import { ArrowRightIcon, UsersIcon } from "./icons";
import { Photo } from "./Photo";

export async function RoomCard({ room, locale }: { room: RoomType; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "hotel" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const href = { pathname: "/gotel/[slug]" as const, params: { slug: room.slug } };
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-cream-50 shadow-card">
      <div className="relative aspect-[2/1] overflow-hidden bg-cream-200">
        <Photo
          id={room.image}
          locale={locale}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-2xl text-pine-900">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {room.name[locale]}
          </Link>
        </h3>
        <p className="mt-2 text-ink-muted">{room.short[locale]}</p>
        <ul className="mt-3 flex flex-wrap gap-2 text-xs text-pine-800">
          {room.amenities.slice(0, 4).map((a) => (
            <li key={a} className="rounded-full bg-pine-50 px-2.5 py-1">
              {amenityLabels[a][locale]}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <UsersIcon width={16} height={16} /> {t("capacity", { count: room.capacity })}
          </p>
          <p className="text-right">
            <span className="font-display text-2xl font-semibold text-wood-700">
              {room.priceFrom ? `${tc("from")} ` : ""}
              {room.basePrice} {tc("uah")}
            </span>
            <span className="block text-xs text-ink-muted">{tc("perNight")}</span>
          </p>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-pine-700">
          {tc("learnMore")} <ArrowRightIcon width={16} height={16} />
        </span>
      </div>
    </article>
  );
}
