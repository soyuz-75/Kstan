import Image from "next/image";

/**
 * Brand marks, built by `pnpm brand` from scripts/brand/:
 *  - Logo: vector trace of the fortress-and-ribbon logo (transparent, for light backgrounds).
 *  - LogoBadge: the round parchment badge used on Instagram (works on any background).
 */

// Intrinsic aspect of the traced logo (viewBox 1600×1224).
const LOGO_RATIO = 1600 / 1224;

export function Logo({ height, alt, priority, className }: { height: number; alt: string; priority?: boolean; className?: string }) {
  return (
    <Image
      src="/brand/logo.svg"
      alt={alt}
      width={Math.round(height * LOGO_RATIO)}
      height={height}
      priority={priority}
      className={className}
    />
  );
}

export function LogoBadge({ size, alt, className }: { size: number; alt: string; className?: string }) {
  return <Image src="/brand/logo-badge.png" alt={alt} width={size} height={size} className={`rounded-full ${className ?? ""}`} />;
}
