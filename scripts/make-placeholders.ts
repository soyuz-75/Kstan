/**
 * Generates illustrated placeholder photos (WebP) for every image in
 * content/images.ts that is still marked `placeholder: true`. Real photos
 * simply overwrite the same files later. (Logo and icons: scripts/brand-assets.ts.)
 *
 *   pnpm images:placeholders            # only missing files
 *   pnpm images:placeholders --force    # regenerate all placeholders
 */
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { images, type ImageKey } from "../content/images";

const OUT = path.join(process.cwd(), "public");
const force = process.argv.includes("--force");

type Palette = { skyTop: string; skyBottom: string; far: string; mid: string; near: string; glow: string };

const day: Palette = { skyTop: "#C9D8C4", skyBottom: "#F4EFE3", far: "#9DB09A", mid: "#58765F", near: "#23402F", glow: "#FFF3D1" };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function pine(x: number, base: number, h: number, color: string): string {
  const w = h * 0.36;
  const tiers = 4;
  let d = "";
  for (let i = 0; i < tiers; i++) {
    const top = base - h + (i * h) / (tiers + 0.6);
    const bottom = top + h / 2.1;
    const half = (w / 2) * (0.55 + (i / tiers) * 0.6);
    d += `M${x} ${top} L${x - half} ${bottom} L${x + half} ${bottom} Z `;
  }
  return `<path d="${d}" fill="${color}"/><rect x="${x - h * 0.02}" y="${base - h * 0.12}" width="${h * 0.04}" height="${h * 0.12}" fill="${color}"/>`;
}

function treeLine(r: () => number, W: number, base: number, minH: number, maxH: number, color: string, gap: number): string {
  let out = `<rect x="0" y="${base}" width="${W}" height="1000" fill="${color}"/>`;
  for (let x = -40; x < W + 40; x += gap * (0.6 + r() * 0.8)) out += pine(x, base + 4, minH + r() * (maxH - minH), color);
  return out;
}

function cabin(x: number, base: number, w: number, color: string, windowColor: string): string {
  const h = w * 0.45;
  const roof = w * 0.35;
  const logs = Array.from({ length: 6 }, (_, i) => {
    const y = base - h + (i * h) / 6;
    return `<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`;
  }).join("");
  return `<g>
    <rect x="${x}" y="${base - h}" width="${w}" height="${h}" fill="${color}"/>${logs}
    <path d="M${x - w * 0.08} ${base - h} L${x + w / 2} ${base - h - roof} L${x + w * 1.08} ${base - h} Z" fill="#000" fill-opacity=".45"/>
    <rect x="${x + w * 0.18}" y="${base - h * 0.7}" width="${w * 0.16}" height="${h * 0.3}" fill="${windowColor}"/>
    <rect x="${x + w * 0.66}" y="${base - h * 0.7}" width="${w * 0.16}" height="${h * 0.3}" fill="${windowColor}"/>
    <rect x="${x + w * 0.43}" y="${base - h * 0.62}" width="${w * 0.14}" height="${h * 0.62}" fill="#000" fill-opacity=".35"/>
  </g>`;
}

function landscape(seed: number, p: Palette, opts: { cabins?: number; pond?: boolean; path?: boolean; gazebo?: boolean }): string {
  const W = 1600, H = 1000;
  const r = rng(seed);
  let s = `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.skyTop}"/><stop offset="1" stop-color="${p.skyBottom}"/></linearGradient>
    <radialGradient id="sun" cx="0.7" cy="0.35" r="0.35"><stop offset="0" stop-color="${p.glow}" stop-opacity=".9"/><stop offset="1" stop-color="${p.glow}" stop-opacity="0"/></radialGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.skyTop}" stop-opacity=".9"/><stop offset="1" stop-color="${p.mid}"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/><rect width="${W}" height="${H}" fill="url(#sun)"/>`;
  s += treeLine(r, W, 560, 120, 220, p.far, 46);
  s += treeLine(r, W, 660, 200, 330, p.mid, 70);
  if (opts.cabins) {
    for (let i = 0; i < opts.cabins; i++) s += cabin(220 + i * 480 + r() * 80, 800, 300 + r() * 80, "#7A4E27", p.glow);
  }
  if (opts.gazebo) {
    s += `<g fill="#6B4322"><path d="M560 560 L800 460 L1040 560 Z"/><rect x="590" y="560" width="20" height="230"/><rect x="990" y="560" width="20" height="230"/><rect x="790" y="560" width="20" height="230"/><rect x="560" y="700" width="480" height="14"/></g>`;
  }
  if (opts.pond) {
    s += `<ellipse cx="800" cy="860" rx="520" ry="90" fill="#8C8577"/><ellipse cx="800" cy="858" rx="490" ry="76" fill="url(#water)"/>
      <path d="M800 850 C 790 800, 780 780, 800 740 C 820 780, 810 800, 800 850 Z" fill="#fff" fill-opacity=".55"/>`;
  }
  if (opts.path) {
    s += `<path d="M640 1000 C 720 880, 820 800, 800 700 L 840 700 C 870 800, 900 880, 1020 1000 Z" fill="#A89B84"/>`;
    for (let i = 0; i < 40; i++) {
      const t = r();
      const y = 700 + t * 300, half = 20 + t * 170, cx = 820 + (t - 0.5) * 60;
      s += `<ellipse cx="${cx - half + r() * half * 2}" cy="${y}" rx="${6 + t * 16}" ry="${3 + t * 7}" fill="#6F6453" fill-opacity=".5"/>`;
    }
  }
  s += treeLine(r, W, 940, 360, 620, p.near, 180).replace(/<rect x="0" y="940"[^>]*\/>/, `<rect x="0" y="940" width="${W}" height="60" fill="${p.near}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s}</svg>`;
}

function interior(seed: number, kind: "room" | "house" | "sauna" | "hall" | "restaurant" | "food"): string {
  const W = 1600, H = 1000;
  const r = rng(seed);
  const wood = kind === "sauna" ? ["#B9864F", "#A77440"] : ["#8A5A2E", "#7A4D25"];
  let s = `<defs>
    <radialGradient id="lamp" cx="0.5" cy="0.3" r="0.7"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".75"/><stop offset="1" stop-color="#2A1A0C" stop-opacity=".55"/></radialGradient>
  </defs>`;
  for (let y = 0; y < H; y += 58) {
    const c = wood[(y / 58) % 2];
    s += `<rect x="0" y="${y}" width="${W}" height="58" fill="${c}"/><rect x="0" y="${y + 50}" width="${W}" height="8" fill="#000" fill-opacity=".18"/>`;
    for (let k = 0; k < 3; k++) s += `<ellipse cx="${r() * W}" cy="${y + 28}" rx="${20 + r() * 60}" ry="4" fill="#000" fill-opacity=".07"/>`;
  }
  s += `<rect y="800" width="${W}" height="200" fill="#4A2F18"/>`;
  if (kind === "room" || kind === "house") {
    s += `<rect x="420" y="560" width="760" height="260" rx="18" fill="#F4EDE0"/><rect x="420" y="470" width="760" height="110" rx="14" fill="#5B3A1E"/>
      <rect x="470" y="600" width="280" height="80" rx="30" fill="#FFFFFF"/><rect x="850" y="600" width="280" height="80" rx="30" fill="#FFFFFF"/>
      <rect x="420" y="700" width="760" height="120" rx="10" fill="#1F3B2D"/>`;
    if (kind === "house") s += `<path d="M0 0 L800 -120 L1600 0 L1600 120 L0 120 Z" fill="#5B3A1E" transform="translate(0 120)"/>`;
  } else if (kind === "sauna") {
    s += `<rect x="120" y="520" width="1360" height="60" fill="#C99A62"/><rect x="120" y="680" width="1360" height="60" fill="#C99A62"/>
      <rect x="1180" y="360" width="220" height="440" fill="#3A2A1C"/><rect x="1210" y="420" width="160" height="120" fill="#F2A541" fill-opacity=".9"/>`;
  } else if (kind === "hall" || kind === "restaurant") {
    const tables = kind === "hall" ? 5 : 3;
    for (let i = 0; i < tables; i++) {
      const x = 160 + i * (1280 / tables);
      s += `<rect x="${x}" y="650" width="${1280 / tables - 60}" height="40" rx="6" fill="#F7F1E6"/><rect x="${x}" y="690" width="${1280 / tables - 60}" height="110" fill="#E9DFCC"/>`;
      s += `<circle cx="${x + (1280 / tables - 60) / 2}" cy="630" r="16" fill="#F3D28C"/>`;
    }
    for (let i = 0; i < 4; i++) s += `<circle cx="${250 + i * 370}" cy="160" r="26" fill="#FFE2A8"/><line x1="${250 + i * 370}" y1="0" x2="${250 + i * 370}" y2="134" stroke="#2A1A0C" stroke-width="4"/>`;
  } else if (kind === "food") {
    s += `<ellipse cx="800" cy="700" rx="560" ry="200" fill="#5B3A1E"/><ellipse cx="800" cy="680" rx="380" ry="140" fill="#F4EDE0"/>
      <ellipse cx="800" cy="670" rx="300" ry="100" fill="#E6D8BF"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${580 + i * 70}" y="${600 + (i % 2) * 20}" width="46" height="120" rx="20" fill="#8C3B1B" transform="rotate(${-20 + i * 8} ${600 + i * 70} 660)"/>`;
    s += `<ellipse cx="660" cy="720" rx="40" ry="16" fill="#3F6B3A"/><ellipse cx="960" cy="630" rx="36" ry="14" fill="#3F6B3A"/>`;
  }
  s += `<rect width="${W}" height="${H}" fill="url(#lamp)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s}</svg>`;
}

const scenes: Partial<Record<ImageKey, () => string>> = {
  vipHouseSmall: () => landscape(37, day, { cabins: 2 }),
  food: () => interior(101, "food"),
};


async function main() {
  mkdirSync(path.join(OUT, "images"), { recursive: true });
  for (const [key, image] of Object.entries(images) as [ImageKey, (typeof images)[ImageKey]][]) {
    const file = path.join(OUT, image.src);
    if (!image.placeholder) continue;
    if (existsSync(file) && !force) continue;
    const scene = scenes[key];
    if (!scene) throw new Error(`No placeholder scene for "${key}"`);
    await sharp(Buffer.from(scene())).resize(image.width, image.height).webp({ quality: 72 }).toFile(file);
    console.log("placeholder", image.src);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
