import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { business } from "@content/business";
import { images } from "@content/images";
import type { Locale } from "@content/types";
import { routing } from "@/i18n/routing";

export const alt = "Козацький Стан";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Social preview: the real hero photo with the name and tagline, rendered once
 * at build time. Satori renders PNG (~2 MB with a photo); re-encoding to JPEG
 * keeps it small enough for Viber/Telegram/WhatsApp link previews.
 */
export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = raw === "en" ? "en" : "uk";
  const [display, sans, photo, badge] = await Promise.all([
    readFile(path.join(process.cwd(), "src/app/fonts/CormorantGaramond-SemiBold.ttf")),
    readFile(path.join(process.cwd(), "src/app/fonts/Manrope-Medium.ttf")),
    // Satori can't decode WebP, so hand it a JPEG.
    sharp(path.join(process.cwd(), "public", images.hero.src)).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer(),
    sharp(path.join(process.cwd(), "public/brand/logo-badge.png")).resize(176, 176).png().toBuffer(),
  ]);

  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        <img src={`data:image/jpeg;base64,${photo.toString("base64")}`} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(19,38,28,0.95) 0%, rgba(19,38,28,0.55) 45%, rgba(19,38,28,0.1) 100%)",
          }}
        />
        <img
          src={`data:image/png;base64,${badge.toString("base64")}`}
          width={176}
          height={176}
          alt=""
          style={{ position: "absolute", left: 64, top: 56, borderRadius: 88, border: "6px solid #fdfaf4" }}
        />
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 56, display: "flex", flexDirection: "column", color: "#fdfaf4" }}>
          <div style={{ fontFamily: "Manrope", fontSize: 26, letterSpacing: 4, color: "#e2b26b", textTransform: "uppercase" }}>
            {locale === "uk" ? "Готель · Ресторан · Сауна" : "Hotel · Restaurant · Sauna"}
          </div>
          <div style={{ fontFamily: "Cormorant", fontSize: 96, lineHeight: 1.05, marginTop: 8 }}>{business.name[locale]}</div>
          <div style={{ fontFamily: "Manrope", fontSize: 32, marginTop: 12, color: "#efe5d3" }}>{business.tagline[locale]}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cormorant", data: display, weight: 600, style: "normal" },
        { name: "Manrope", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg" } });
}
