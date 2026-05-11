export type LocationMeta = {
  slug: string;
  locationId: string;
  city: string;
  image: string;
  tagline: string;
};

export const LOCATIONS: readonly LocationMeta[] = [
  {
    slug: "tonsberg",
    locationId: "loc-napoli-1",
    city: "Tønsberg",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    tagline: "Der det hele startet — flaggskipet i sentrum.",
  },
  {
    slug: "notteroy",
    locationId: "loc-napoli-2",
    city: "Nøtterøy",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
    tagline: "Familievennlig nabolagsbar på Teie.",
  },
  {
    slug: "sandefjord",
    locationId: "loc-napoli-3",
    city: "Sandefjord",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    tagline: "Et steinkast fra jernbanestasjonen.",
  },
] as const;

export function findLocationBySlug(slug: string): LocationMeta | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

export function findLocationById(id: string): LocationMeta | undefined {
  return LOCATIONS.find((l) => l.locationId === id);
}

export const LOCATION_STORAGE_KEY = "napoli.lastLocationSlug";
