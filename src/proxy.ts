import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  // The legacy WordPress install served injected spam under /vitannya/.
  // Answer 410 Gone so search engines drop those URLs quickly.
  if (/^\/vitannya(\/|$)/.test(request.nextUrl.pathname)) {
    return new NextResponse("Gone", { status: 410, headers: { "X-Robots-Tag": "noindex" } });
  }
  return intl(request);
}

export const config = {
  // Skip API routes, Next internals, metadata routes and any file with an extension.
  matcher: ["/((?!api|_next|_vercel|sitemap.xml|robots.txt|.*\\..*).*)"],
};
