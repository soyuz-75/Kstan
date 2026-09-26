import Image from "next/image";
import { images, type ImageKey } from "@content/images";
import type { Locale } from "@content/types";

type Props = {
  id: ImageKey;
  locale: Locale;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Fill the (relatively positioned) parent instead of using intrinsic size. */
  fill?: boolean;
  /** Pass "" for purely decorative uses (e.g. behind a text overlay that repeats the alt). */
  alt?: string;
};

export function Photo({ id, locale, className, sizes = "100vw", priority, fill, alt }: Props) {
  const image = images[id];
  const common = {
    src: image.src,
    alt: alt ?? image.alt[locale],
    sizes,
    priority,
    className,
  };
  return fill ? (
    <Image {...common} fill alt={common.alt} />
  ) : (
    <Image {...common} alt={common.alt} width={image.width} height={image.height} />
  );
}
