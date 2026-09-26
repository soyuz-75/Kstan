"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useState } from "react";
import { business } from "@content/business";
import { Link, usePathname } from "@/i18n/navigation";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { mainNav } from "./nav";

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-pine-900 hover:bg-cream-200"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-cream-50 px-4 pb-28 pt-4"
        // Close once the visitor follows any link inside the panel.
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <nav aria-label={t("home")}>
          <ul className="divide-y divide-cream-200">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-4 font-display text-2xl text-pine-900"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/bronyuvannya" className="btn btn-primary">
            {t("bookRoom")}
          </Link>
          <Link href="/bronyuvannya/stolyk" className="btn btn-pine">
            {t("bookTable")}
          </Link>
          <a href={`tel:${business.primaryPhone}`} className="btn btn-outline text-pine-800">
            <PhoneIcon /> {business.phones[0].display}
          </a>
          <LocaleSwitcher className="btn text-pine-800 underline" />
        </div>
      </div>
    </div>
  );
}
