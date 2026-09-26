import { notFound } from "next/navigation";

// Catch-all so unknown paths render the localized not-found page inside the layout.
export default function CatchAll() {
  notFound();
}
