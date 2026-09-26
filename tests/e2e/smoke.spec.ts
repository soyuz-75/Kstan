import { expect, test } from "@playwright/test";

const pages = [
  ["/", "uk"],
  ["/en/", "en"],
  ["/gotel/", "uk"],
  ["/en/hotel/vip-budynok-22/", "en"],
  ["/restoran/", "uk"],
  ["/menyu/", "uk"],
  ["/bankety/", "uk"],
  ["/sauna-na-drovakh/", "uk"],
  ["/fotogalereya/", "uk"],
  ["/kontakti/", "uk"],
  ["/bronyuvannya/", "uk"],
  ["/en/booking/event/", "en"],
] as const;

for (const [path, lang] of pages) {
  test(`${path} renders with one h1, canonical and hreflang`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://k-stan.vn.ua${path}`);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    // Organization graph on every page, plus breadcrumbs everywhere except home.
    expect(ld.length).toBeGreaterThanOrEqual(path === "/" || path === "/en/" ? 1 : 2);
    for (const block of ld) expect(() => JSON.parse(block)).not.toThrow();
    // No sideways scrolling on any viewport.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("language switch keeps the page", async ({ page, isMobile }) => {
  await page.goto("/gotel/vip-budynok-22/");
  if (isMobile) await page.getByRole("button", { name: "Відкрити меню" }).click();
  await page.getByRole("link", { name: /English/ }).locator("visible=true").first().click();
  await expect(page).toHaveURL(/\/en\/hotel\/vip-budynok-22\/$/);
});

test("legacy URLs redirect permanently", async ({ request }) => {
  for (const [from, to] of [
    ["/benketna-zala/", "/bankety/"],
    ["/banketna-zala-na-300-osib/", "/bankety/"],
    ["/kotedzhni-budinochki/", "/gotel/"],
    ["/litniy-maydanchik/", "/restoran/"],
    ["/pro-nas/", "/"],
  ]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(308);
    expect(new URL(res.headers().location, "http://x").pathname, from).toBe(to);
  }
});

test("spam section is gone", async ({ request }) => {
  const res = await request.get("/vitannya/z-dnem-narodzhennya/", { maxRedirects: 0 });
  expect(res.status()).toBe(410);
});

test("sitemap lists both locales with alternates", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("<loc>https://k-stan.vn.ua/gotel/vip-budynok-22/</loc>");
  expect(xml).toContain("<loc>https://k-stan.vn.ua/en/hotel/vip-budynok-22/</loc>");
  expect(xml).toContain('hreflang="x-default"');
});
