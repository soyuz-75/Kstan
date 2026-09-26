import Link from "next/link";
import "./globals.css";

// Only reached for requests outside the [locale] segment (the proxy normally rewrites everything into it).
export default function RootNotFound() {
  return (
    <html lang="uk">
      <body className="flex min-h-dvh items-center justify-center bg-cream-100 p-6 text-center">
        <div>
          <p className="text-6xl font-semibold text-wood-600">404</p>
          <p className="mt-4 text-lg">Сторінку не знайдено · Page not found</p>
          <Link href="/" className="btn btn-pine mt-6">
            Козацький Стан
          </Link>
        </div>
      </body>
    </html>
  );
}
