import type { Restaurant } from "./lettbestilt";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://napolipizzeria.lettbestilt.no";

const JSON_LD_ESCAPE = new RegExp("[<>&\\u2028\\u2029]", "g");

export function jsonLdScript(value: unknown): string {
  return JSON.stringify(value).replace(
    JSON_LD_ESCAPE,
    (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"),
  );
}

const DAY_OF_WEEK_SCHEMA = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export function restaurantJsonLd(r: Restaurant) {
  const loc = r.locations[0];
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: r.name,
    description:
      r.description ??
      "Ekte napolitansk pizza fra vedfyrt steinovn siden 1987. Tre avdelinger i Vestfold.",
    url: SITE_URL,
    telephone: r.phone ?? "+47 33 00 00 00",
    email: r.email ?? undefined,
    servesCuisine: r.cuisineType ?? "Italiensk, napolitansk pizza",
    priceRange: "$$",
    address: loc
      ? {
          "@type": "PostalAddress",
          streetAddress: loc.address,
          postalCode: loc.postalCode,
          addressLocality: loc.city,
          addressCountry: loc.country,
        }
      : undefined,
    geo:
      loc?.latitude && loc?.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: loc.latitude,
            longitude: loc.longitude,
          }
        : undefined,
    openingHoursSpecification: r.openingHours
      .filter((h) => !h.isClosed)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_OF_WEEK_SCHEMA[h.dayOfWeek],
        opens: h.opensAt,
        closes: h.closesAt,
      })),
    acceptsReservations: false,
    hasMenu: `${SITE_URL}/meny`,
    sameAs: r.googleReviewUrl ? [r.googleReviewUrl] : undefined,
  };
}
