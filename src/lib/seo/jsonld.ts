import { business } from "@content/business";
import type { FaqItem } from "@content/faq";
import { images } from "@content/images";
import { amenityLabels, rooms } from "@content/rooms";
import type { AppLocale } from "@/i18n/routing";
import { absoluteUrl, localizedPath, SITE_URL } from "./urls";

/**
 * schema.org structured data, built entirely from content/business.ts so the
 * name / address / phone match everywhere (header, footer, contacts, JSON-LD).
 */

type Json = Record<string, unknown>;

const ORG_ID = `${SITE_URL}/#organization`;
const HOTEL_ID = `${SITE_URL}/#hotel`;
const RESTAURANT_ID = `${SITE_URL}/#restaurant`;

function postalAddress(locale: AppLocale): Json {
  return {
    "@type": "PostalAddress",
    streetAddress: business.address.street[locale],
    addressLocality: business.address.locality[locale],
    addressRegion: business.address.region[locale],
    postalCode: business.address.postalCode,
    addressCountry: business.address.countryCode,
  };
}

function geo(): Json {
  return { "@type": "GeoCoordinates", latitude: business.geo.lat, longitude: business.geo.lng };
}

function shared(locale: AppLocale): Json {
  return {
    address: postalAddress(locale),
    geo: geo(),
    telephone: business.phones.map((p) => p.e164),
    url: absoluteUrl(localizedPath("/", locale)),
    image: [images.hero, images.exteriorGate, images.banquetHall].map((i) => absoluteUrl(i.src)),
    priceRange: business.priceRange,
    hasMap: business.googleMapsUrl,
    sameAs: [business.social.instagram],
    parentOrganization: { "@id": ORG_ID },
  };
}

export function organizationJsonLd(locale: AppLocale): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": ORG_ID,
        name: business.name[locale],
        alternateName: locale === "uk" ? business.name.en : business.name.uk,
        description: business.tagline[locale],
        url: absoluteUrl(localizedPath("/", locale)),
        logo: absoluteUrl("/logo.png"),
        address: postalAddress(locale),
        geo: geo(),
        telephone: business.phones[0].e164,
        sameAs: [business.social.instagram],
        subOrganization: [{ "@id": HOTEL_ID }, { "@id": RESTAURANT_ID }],
      },
      hotelNode(locale),
      restaurantNode(locale),
    ],
  };
}

function hotelNode(locale: AppLocale): Json {
  const prices = rooms.map((r) => r.basePrice);
  return {
    "@type": "Hotel",
    "@id": HOTEL_ID,
    name: `${business.name[locale]} — ${locale === "uk" ? "готель" : "hotel"}`,
    description: business.tagline[locale],
    ...shared(locale),
    url: absoluteUrl(localizedPath("/gotel", locale)),
    checkinTime: business.hotel.checkIn,
    checkoutTime: business.hotel.checkOut,
    numberOfRooms: rooms.reduce((n, r) => n + r.unitsCount, 0),
    priceRange: `${Math.min(...prices)}–${Math.max(...prices)} UAH`,
    amenityFeature: ["parking", "roomService", "sauna", "tv", "hotWater"].map((key) => ({
      "@type": "LocationFeatureSpecification",
      name: amenityLabels[key as keyof typeof amenityLabels][locale],
      value: true,
    })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
  };
}

function restaurantNode(locale: AppLocale): Json {
  return {
    "@type": "Restaurant",
    "@id": RESTAURANT_ID,
    name: `${business.name[locale]} — ${locale === "uk" ? "ресторан" : "restaurant"}`,
    ...shared(locale),
    url: absoluteUrl(localizedPath("/restoran", locale)),
    servesCuisine: business.cuisine,
    hasMenu: absoluteUrl(localizedPath("/menyu", locale)),
    acceptsReservations: absoluteUrl(localizedPath("/bronyuvannya/stolyk", locale)),
    openingHoursSpecification: business.restaurantHours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faq: FaqItem[], locale: AppLocale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q[locale],
      acceptedAnswer: { "@type": "Answer", text: f.a[locale] },
    })),
  };
}

export function hotelRoomJsonLd(slug: string, locale: AppLocale): Json | null {
  const room = rooms.find((r) => r.slug === slug);
  if (!room) return null;
  return {
    "@context": "https://schema.org",
    "@type": room.kind === "house" ? "House" : "HotelRoom",
    name: room.name[locale],
    description: room.description[locale],
    url: absoluteUrl(localizedPath({ pathname: "/gotel/[slug]", params: { slug } }, locale)),
    image: absoluteUrl(images[room.image].src),
    occupancy: { "@type": "QuantitativeValue", maxValue: room.capacity },
    containedInPlace: { "@id": HOTEL_ID },
    amenityFeature: room.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: amenityLabels[a][locale],
      value: true,
    })),
    offers: {
      "@type": "Offer",
      price: room.basePrice,
      priceCurrency: "UAH",
      unitCode: "DAY",
      availability: "https://schema.org/InStock",
    },
  };
}

/** Serialises JSON-LD for a <script> tag, escaping "<" so content can't close the tag. */
export function jsonLdString(data: Json): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
