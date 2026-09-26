import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Legacy WordPress URLs (from k-stan.vn.ua/sitemap.xml) that no longer exist
 * as their own page. URLs that do still exist (/gotel/, /restoran/, /menyu/,
 * /fotogalereya/, /kontakti/, /sauna-na-drovakh/) are served as-is.
 */
export const legacyRedirects: { source: string; destination: string }[] = [
  { source: "/benketna-zala/", destination: "/bankety/" },
  { source: "/banketna-zala-na-300-osib/", destination: "/bankety/" },
  { source: "/provedennya-vesil-i-benketiv/", destination: "/bankety/" },
  { source: "/kotedzhni-budinochki/", destination: "/gotel/" },
  { source: "/litniy-maydanchik/", destination: "/restoran/" },
  { source: "/pro-nas/", destination: "/" },
  { source: "/vidguki/", destination: "/" },
  { source: "/novini/", destination: "/" },
  { source: "/zavitayte-v-kozackiy-stan-spravzh/", destination: "/" },
  { source: "/kontakty/", destination: "/kontakti/" },
  { source: "/menu/", destination: "/menyu/" },
  { source: "/sauna/", destination: "/sauna-na-drovakh/" },
];

const nextConfig: NextConfig = {
  // Legacy URLs all end in "/", keep that shape so nothing needs a redirect hop.
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, permanent: true }));
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
