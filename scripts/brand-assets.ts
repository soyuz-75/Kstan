/**
 * Builds every logo and icon file from the two real sources in scripts/brand/:
 *
 *  - Logo_KozStan_2017.png   the transparent logo from the old site (200×153)
 *  - instagram-avatar.webp   the round parchment badge from Instagram
 *
 * Outputs:
 *  - public/brand/logo.svg          vector trace of the logo (header). Needs the
 *                                   `potrace` CLI; skipped if missing and the SVG exists.
 *  - public/brand/logo-badge.png    round badge, transparent corners (footer, OG image)
 *  - public/logo.png                512px badge for the JSON-LD `logo`
 *  - src/app/icon.png               favicon
 *  - src/app/apple-icon.png         iOS home-screen icon (opaque, as iOS requires)
 *
 *   pnpm brand
 *
 * If the owner ever supplies the original vector logo, drop it in as
 * public/brand/logo.svg and skip the trace (pass --no-trace).
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "scripts", "brand");
const LOGO_PNG = path.join(SRC, "Logo_KozStan_2017.png");
const AVATAR = path.join(SRC, "instagram-avatar.webp");
const OUT_SVG = path.join(ROOT, "public", "brand", "logo.svg");
const OUT_BADGE = path.join(ROOT, "public", "brand", "logo-badge.png");

const CREAM = "#f7f1e6";

type Rgb = [number, number, number];

/** Traces the 3-colour logo (red ribbon, white lettering, brown fortress/text) into layered SVG paths. */
async function traceLogo() {
  const SCALE = 8;
  const { data: px, info } = await sharp(LOGO_PNG).raw().toBuffer({ resolveWithObject: true });

  // Palette = mean colour of clearly-classified source pixels.
  const sum = { brown: [0, 0, 0, 0], red: [0, 0, 0, 0] };
  for (let i = 0; i < px.length; i += 4) {
    const [r, g, b, a] = [px[i], px[i + 1], px[i + 2], px[i + 3]];
    if (a < 250) continue;
    const k = r > 150 && g < 60 && b < 70 ? "red" : r < 90 && g < 60 && b < 40 ? "brown" : null;
    if (k) sum[k].forEach((_, j) => (sum[k][j] += j < 3 ? [r, g, b][j] : 1));
  }
  const mean = (v: number[]): Rgb => [v[0] / v[3], v[1] / v[3], v[2] / v[3]];
  const ref: Record<"brown" | "red" | "white", Rgb> = { brown: mean(sum.brown), red: mean(sum.red), white: [255, 255, 255] };
  const hex = (c: Rgb) => `#${c.map((x) => Math.round(x).toString(16).padStart(2, "0")).join("")}`;

  // Upscale, then assign each opaque-enough pixel to its nearest palette colour.
  const W = info.width * SCALE;
  const H = info.height * SCALE;
  const { data: up } = await sharp(LOGO_PNG).resize(W, H, { kernel: "lanczos3" }).raw().toBuffer({ resolveWithObject: true });
  const masks = { redwhite: new Uint8Array(W * H), white: new Uint8Array(W * H), brown: new Uint8Array(W * H) };
  for (let p = 0; p < W * H; p++) {
    const i = p * 4;
    if (up[i + 3] < 70) continue; // low cutoff keeps the thin flagpoles
    let best: keyof typeof ref = "brown";
    let bestD = Infinity;
    for (const k of Object.keys(ref) as (keyof typeof ref)[]) {
      const d = (up[i] - ref[k][0]) ** 2 + (up[i + 1] - ref[k][1]) ** 2 + (up[i + 2] - ref[k][2]) ** 2;
      if (d < bestD) [bestD, best] = [d, k];
    }
    if (best === "brown") masks.brown[p] = 1;
    else {
      // The ribbon is traced as one red shape with the white lettering on top, so no hairline gaps.
      masks.redwhite[p] = 1;
      if (best === "white") masks.white[p] = 1;
    }
  }

  const tmp = path.join(os.tmpdir(), `kstan-trace-${process.pid}`);
  mkdirSync(tmp, { recursive: true });
  const fills = { redwhite: hex(ref.red), white: "#ffffff", brown: hex(ref.brown) };
  const layers = (Object.keys(masks) as (keyof typeof masks)[]).map((name) => {
    const m = masks[name];
    const rowBytes = Math.ceil(W / 8);
    const bits = Buffer.alloc(rowBytes * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (m[y * W + x]) bits[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
    const pbm = path.join(tmp, `${name}.pbm`);
    const svg = path.join(tmp, `${name}.svg`);
    writeFileSync(pbm, Buffer.concat([Buffer.from(`P4\n${W} ${H}\n`), bits]));
    execFileSync("potrace", ["-s", "--flat", "-t", "60", "-a", "1.1", "-O", "0.4", "-o", svg, pbm]);
    const g = readFileSync(svg, "utf8").match(/<g transform="([^"]+)"[^>]*>([\s\S]*?)<\/g>/);
    if (!g) throw new Error(`potrace produced no paths for ${name}`);
    return `<g transform="${g[1]}" fill="${fills[name]}">${g[2].replace(/\s+/g, " ").trim()}</g>`;
  });
  rmSync(tmp, { recursive: true, force: true });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Козацький Стан"><title>Козацький Стан</title>${layers.join("")}</svg>\n`;
  writeFileSync(OUT_SVG, svg);
  console.log(`logo.svg ${(svg.length / 1024).toFixed(1)} KB`);
}

/** Finds the parchment circle inside Instagram's grey ring and cuts it out with transparent corners. */
async function cutBadge(): Promise<Buffer> {
  const { data, info } = await sharp(AVATAR).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const warm = (x: number, y: number) => {
    const i = (y * W + x) * 3;
    return data[i] - data[i + 2] > 10; // parchment, red and brown all lean warm; the ring and page are neutral
  };

  // Walk inward from outside the ring along 120 rays; the first run of warm pixels is the badge edge.
  const guess = { x: W / 2, y: H / 2 };
  const edge: [number, number][] = [];
  for (let deg = 0; deg < 360; deg += 3) {
    const t = (deg * Math.PI) / 180;
    for (let r = Math.min(W, H) / 2; r > 50; r--) {
      const at = (k: number) => [Math.round(guess.x + (r - k) * Math.cos(t)), Math.round(guess.y + (r - k) * Math.sin(t))] as const;
      if ([0, 1, 2].every((k) => { const [x, y] = at(k); return x >= 0 && y >= 0 && x < W && y < H && warm(x, y); })) {
        edge.push([...at(0)]);
        break;
      }
    }
  }

  // Least-squares circle fit (Kåsa).
  let [sx, sy, sxx, syy, sxy, sxz, syz, sz] = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const [x, y] of edge) {
    const z = x * x + y * y;
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y; sxz += x * z; syz += y * z; sz += z;
  }
  const M = [
    [sxx, sxy, sx, sxz],
    [sxy, syy, sy, syz],
    [sx, sy, edge.length, sz],
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (j === i) continue;
      const f = M[j][i] / M[i][i];
      for (let k = i; k < 4; k++) M[j][k] -= f * M[i][k];
    }
  }
  const cx = M[0][3] / M[0][0] / 2;
  const cy = M[1][3] / M[1][1] / 2;
  const radius = Math.sqrt(M[2][3] / M[2][2] + cx * cx + cy * cy);
  const r = Math.floor(radius) - 3; // stay clear of the anti-aliased ring
  console.log(`badge circle: centre ${cx.toFixed(1)},${cy.toFixed(1)} radius ${radius.toFixed(1)}px`);

  const size = r * 2;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`);
  return sharp(AVATAR)
    .extract({ left: Math.round(cx - r), top: Math.round(cy - r), width: size, height: size })
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function main() {
  mkdirSync(path.dirname(OUT_SVG), { recursive: true });

  if (process.argv.includes("--no-trace")) {
    console.log("logo.svg: kept as is (--no-trace)");
  } else {
    try {
      execFileSync("potrace", ["--version"], { stdio: "ignore" });
      await traceLogo();
    } catch {
      if (!existsSync(OUT_SVG)) throw new Error("potrace is not installed and public/brand/logo.svg is missing");
      console.warn("potrace not found; keeping the existing public/brand/logo.svg");
    }
  }

  const badge = await cutBadge();
  await sharp(badge).resize(512, 512).png({ palette: true, quality: 90, effort: 10 }).toFile(OUT_BADGE);
  await sharp(badge).resize(512, 512).png({ palette: true, quality: 90, effort: 10 }).toFile(path.join(ROOT, "public", "logo.png"));
  await sharp(badge).resize(96, 96).png({ palette: true, quality: 90 }).toFile(path.join(ROOT, "src", "app", "icon.png"));
  // iOS ignores transparency (it paints black), so put the badge on the site's cream.
  const inner = await sharp(badge).resize(164, 164).toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: CREAM } })
    .composite([{ input: inner, left: 8, top: 8 }])
    .png({ palette: true, quality: 90 })
    .toFile(path.join(ROOT, "src", "app", "apple-icon.png"));
  console.log("logo-badge.png, logo.png, icon.png, apple-icon.png written");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
