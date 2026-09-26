"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";

export type GalleryItem = { src: string; alt: string; width: number; height: number };

/** Thumbnail grid with an accessible <dialog> lightbox (Esc, arrows, swipe). */
export function Gallery({ items, variant = "grid" }: { items: GalleryItem[]; variant?: "grid" | "strip" }) {
  const t = useTranslations("gallery");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    dialog.addEventListener("keydown", onKey);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("keydown", onKey);
      dialog.removeEventListener("close", onClose);
    };
  }, [step]);

  const current = index === null ? null : items[index];
  const gridClass =
    variant === "strip"
      ? "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]"
      : "grid grid-cols-2 gap-3 sm:grid-cols-3";

  return (
    <>
      <ul className={gridClass}>
        {items.map((item, i) => (
          <li key={item.src} className={variant === "strip" ? "w-72 shrink-0 snap-start sm:w-80" : ""}>
            <button
              type="button"
              onClick={() => open(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-cream-200"
              aria-label={t("open", { alt: item.alt })}
            >
              <Image
                src={item.src}
                alt=""
                fill
                sizes={variant === "strip" ? "320px" : "(min-width: 640px) 33vw, 50vw"}
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current?.alt}
        className="m-auto h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-black/90"
        onClick={(e) => e.target === e.currentTarget && close()}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="relative h-[80dvh] w-full max-w-6xl">
              <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <p className="text-center text-sm text-cream-100">
              {current.alt} · {t("counter", { index: (index ?? 0) + 1, total: items.length })}
            </p>
            <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full bg-black/50 p-3 text-white" aria-label={t("close")}>
              <CloseIcon width={24} height={24} />
            </button>
            <button type="button" onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white" aria-label={t("prev")}>
              <ChevronLeftIcon width={24} height={24} />
            </button>
            <button type="button" onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white" aria-label={t("next")}>
              <ChevronRightIcon width={24} height={24} />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
