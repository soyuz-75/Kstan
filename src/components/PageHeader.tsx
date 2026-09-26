import type { ReactNode } from "react";
import type { ImageKey } from "@content/images";
import type { Locale } from "@content/types";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { Photo } from "./Photo";

type Props = {
  locale: Locale;
  title: string;
  lead?: string;
  image?: ImageKey;
  crumbs: Crumb[];
  children?: ReactNode;
};

/** Page intro: breadcrumbs + the page's single H1, optionally over a photo. */
export function PageHeader({ locale, title, lead, image, crumbs, children }: Props) {
  if (image) {
    return (
      <section className="relative isolate overflow-hidden bg-pine-900 text-cream-50">
        <Photo id={image} locale={locale} fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-pine-900/90 via-pine-900/40 to-pine-900/20" />
        <div className="container-page pb-12 pt-6 sm:pb-16">
          <Breadcrumbs items={crumbs} tone="dark" />
          <h1 className="mt-16 max-w-3xl text-4xl sm:mt-24 sm:text-6xl">{title}</h1>
          {lead && <p className="mt-4 max-w-2xl text-lg text-cream-100">{lead}</p>}
          {children}
        </div>
      </section>
    );
  }
  return (
    <section className="border-b border-cream-200 bg-cream-50">
      <div className="container-page pb-10 pt-6">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-8 max-w-3xl text-4xl text-pine-900 sm:text-5xl">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lg text-ink-muted">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
