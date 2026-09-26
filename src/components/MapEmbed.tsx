import { business } from "@content/business";
import type { Locale } from "@content/types";

/** Google Maps embed (no API key needed), lazy-loaded so it never blocks first paint. */
export function MapEmbed({ locale, title, className }: { locale: Locale; title: string; className?: string }) {
  const { lat, lng } = business.geo;
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=14&hl=${locale}&output=embed`;
  return (
    <div className={`overflow-hidden rounded-2xl border border-cream-300 bg-cream-200 ${className ?? ""}`}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-80 w-full border-0"
        allowFullScreen
      />
    </div>
  );
}
