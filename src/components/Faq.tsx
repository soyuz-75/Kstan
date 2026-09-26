import type { FaqItem } from "@content/faq";
import type { Locale } from "@content/types";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { JsonLd } from "./JsonLd";

export function Faq({ items, locale, title }: { items: FaqItem[]; locale: Locale; title: string }) {
  return (
    <section aria-labelledby="faq-title" className="container-page py-14">
      <h2 id="faq-title" className="text-3xl text-pine-900 sm:text-4xl">
        {title}
      </h2>
      <div className="mt-6 divide-y divide-cream-300 rounded-2xl border border-cream-300 bg-cream-50">
        {items.map((item) => (
          <details key={item.q.uk} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-pine-900 [&::-webkit-details-marker]:hidden">
              {item.q[locale]}
              <span aria-hidden className="text-xl text-wood-600 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-ink-muted">{item.a[locale]}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(items, locale)} />
    </section>
  );
}
