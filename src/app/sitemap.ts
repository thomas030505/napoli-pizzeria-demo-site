import type { MetadataRoute } from "next";
import { LOCATIONS } from "@/lib/locations";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://napolipizzeria.lettbestilt.no";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const perLocation = LOCATIONS.flatMap((l) => [
    {
      url: `${SITE_URL}/meny/${l.slug}`,
      lastModified: now,
      priority: 0.85,
      changeFrequency: "weekly" as const,
    },
    {
      url: `${SITE_URL}/bestill/${l.slug}`,
      lastModified: now,
      priority: 0.85,
      changeFrequency: "weekly" as const,
    },
  ]);
  return [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE_URL}/meny`, lastModified: now, priority: 0.9, changeFrequency: "weekly" },
    { url: `${SITE_URL}/bestill`, lastModified: now, priority: 0.9, changeFrequency: "weekly" },
    ...perLocation,
    { url: `${SITE_URL}/om-oss`, lastModified: now, priority: 0.6, changeFrequency: "monthly" },
    { url: `${SITE_URL}/lokasjoner`, lastModified: now, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/kontakt`, lastModified: now, priority: 0.6, changeFrequency: "monthly" },
  ];
}
