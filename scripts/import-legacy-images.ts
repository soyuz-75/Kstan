/**
 * Pulls the real photos from the two places they exist today and converts them
 * to WebP in public/images/:
 *
 *  1. hotels3d.com listing — exterior + standard / VIP №18 / VIP №22 room views.
 *     Only 400×200 previews are public there; the full-res 360° panoramas live on
 *     3d-tours.com.ua (tour: /company/ukraine/vinitsa/horeka/kozackiy_stan/).
 *  2. k-stan.vn.ua homepage — the 1920×1080 forest/log-cabin photos. The site
 *     sits behind a JS cookie check, so this uses headless Chromium.
 *
 *   pnpm images:import                # both sources
 *   pnpm images:import --only=hotels3d
 *
 * Each source fails independently. Known files land under the names used in
 * content/images.ts; any new homepage photo is saved as legacy-home-N.webp.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";
import sharp from "sharp";

const OUT = path.join(process.cwd(), "public", "images");
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

/** hotels3d.com file → our file name (keys in content/images.ts). */
/** Homepage slider files (wp-content/uploads/2015/11/…) → our file names. */
const HOMEPAGE: Record<string, string> = {
  "home-1-1.jpg": "hero-korchma",
  "home-9.jpg": "exterior-street",
  "home-4.jpg": "exterior-gate",
  "home-3.jpg": "exterior-cottages",
  "home-2.jpg": "exterior-courtyard",
  "home-6.jpg": "exterior-pond",
};

/** Full-size photos linked from inner pages (the gallery page itself has none). */
const INNER_PAGES: Record<string, string> = {
  "https://k-stan.vn.ua/wp-content/uploads/2015/10/zala-4.jpg": "banquet-hall",
  "https://k-stan.vn.ua/wp-content/uploads/2015/10/restoran-12.jpg": "restaurant-gazebo",
};

const HOTELS3D: Record<string, string> = {
  "https://hotels3d.com/images/vinnitsa/kozatskiy_stan.jpg": "exterior-korchma",
  "https://hotels3d.com/images/vinnitsa/hotel/kozatskiy_stan/room-1785.jpg": "room-standard",
  "https://hotels3d.com/images/vinnitsa/hotel/kozatskiy_stan/room-1786.jpg": "vip-house-18",
  "https://hotels3d.com/images/vinnitsa/hotel/kozatskiy_stan/room-1787.jpg": "vip-house",
};

async function save(buf: Buffer, name: string, maxWidth = 2400) {
  const file = path.join(OUT, `${name}.webp`);
  const info = await sharp(buf).resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 82 }).toFile(file);
  console.log(`  ${name}.webp ${info.width}×${info.height}`);
  return info;
}

async function importHotels3d(page: Page) {
  console.log("hotels3d.com");
  // The listing page must be visited first; direct image hits without a browser UA get 403.
  await page.goto("https://hotels3d.com/vinnitsa/hotel/kozatskiy_stan/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  for (const [url, name] of Object.entries(HOTELS3D)) {
    const res = await page.request.get(url, { headers: { Referer: page.url() } });
    if (!res.ok() || !(res.headers()["content-type"] ?? "").startsWith("image/")) {
      console.warn(`  skip ${url}: HTTP ${res.status()}`);
      continue;
    }
    await save(await res.body(), name);
  }
}

async function importHomepage(page: Page) {
  console.log("k-stan.vn.ua");
  const res = await page.goto("https://k-stan.vn.ua/", { waitUntil: "networkidle", timeout: 60_000 });
  // First hit may be the cookie-check page that reloads itself.
  await page.waitForTimeout(3_000);
  if (!res || res.status() >= 500) throw new Error(`homepage returned HTTP ${res?.status()}`);

  const urls = await page.evaluate(() => {
    const found = new Set<string>();
    document.querySelectorAll("img").forEach((img) => {
      const best = img.getAttribute("data-src") || img.currentSrc || img.src;
      if (best) found.add(new URL(best, location.href).href);
      img.getAttribute("srcset")?.split(",").forEach((c) => found.add(new URL(c.trim().split(" ")[0], location.href).href));
    });
    document.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage.match(/url\("?(.*?)"?\)/);
      if (bg) found.add(new URL(bg[1], location.href).href);
    });
    return [...found].filter((u) => /wp-content\/uploads\/.+\.(jpe?g|png|webp)$/i.test(u));
  });

  const manifest: { url: string; file: string; width: number; height: number }[] = [];
  let n = 0;
  for (const url of urls) {
    const r = await page.request.get(url);
    if (!r.ok()) continue;
    const buf = await r.body();
    const meta = await sharp(buf).metadata();
    if ((meta.width ?? 0) < 1200) continue; // logos, icons, thumbnails
    const name = HOMEPAGE[url.split("/").pop() ?? ""] ?? `legacy-home-${++n}`;
    const info = await save(buf, name);
    manifest.push({ url, file: `/images/${name}.webp`, width: info.width, height: info.height });
  }
  for (const [url, name] of Object.entries(INNER_PAGES)) {
    const r = await page.request.get(url);
    if (r.ok()) await save(await r.body(), name);
    else console.warn(`  skip ${url}: HTTP ${r.status()}`);
  }
  console.log(`  ${manifest.length} homepage photos`, manifest);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({
    proxy,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  const page = await (await browser.newContext({ userAgent: UA })).newPage();
  let failed = false;
  const sources: [string, (p: Page) => Promise<void>][] = [
    ["hotels3d", importHotels3d],
    ["home", importHomepage],
  ];
  for (const [name, run] of sources) {
    if (only && only !== name) continue;
    try {
      await run(page);
    } catch (err) {
      failed = true;
      console.error(`  ${name} failed: ${(err as Error).message}`);
    }
  }
  await browser.close();
  if (failed) process.exitCode = 1;
}

main();
