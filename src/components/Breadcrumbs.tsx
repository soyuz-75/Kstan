import { getTranslations } from "next-intl/server";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "./JsonLd";

export type Crumb = { name: string; path: string };

/** Visible breadcrumb trail plus matching BreadcrumbList JSON-LD. Paths are already localized. */
export async function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const t = await getTranslations("nav");
  const link = tone === "dark" ? "text-cream-100 hover:text-wood-300" : "text-ink-muted hover:text-pine-800";
  const current = tone === "dark" ? "text-cream-50" : "text-ink";
  return (
    <>
      <nav aria-label={t("breadcrumbs")} className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className={current}>
                    {item.name}
                  </span>
                ) : (
                  <>
                    {/* Plain <a>: paths are pre-localized, so they must not be re-prefixed. */}
                    <a href={item.path} className={link}>
                      {item.name}
                    </a>
                    <span aria-hidden className="opacity-60">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
