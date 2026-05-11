import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchMenu } from "@/lib/lettbestilt";
import { formatOpeningHoursTable } from "@/lib/opening-hours";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Lokasjoner — Tønsberg, Nøtterøy, Sandefjord",
  description:
    "Tre avdelinger i Vestfold: Tønsberg sentrum, Teie torg på Nøtterøy, og Jernbanealléen i Sandefjord. Adresse, åpningstider og kart.",
  alternates: { canonical: "/lokasjoner" },
};

const VENUE = [
  {
    locationId: "loc-napoli-1",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80",
    tagline: "Der det hele startet — flaggskipet i sentrum.",
  },
  {
    locationId: "loc-napoli-2",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
    tagline: "Familievennlig nabolagsbar på Teie.",
  },
  {
    locationId: "loc-napoli-3",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    tagline: "Et steinkast fra jernbanestasjonen.",
  },
];

export default async function LocationsPage() {
  const data = await fetchMenu({ revalidate: 600 });
  const phone = data.restaurant.phone ?? "+47 33 00 00 00";
  const hours = formatOpeningHoursTable(data.restaurant.openingHours);

  return (
    <>
      <section className="bg-[color:var(--color-pane)] border-b border-border py-16 sm:py-24">
        <div className="container-wide">
          <p className="eyebrow mb-4">Le sedi</p>
          <h1 className="font-display text-4xl sm:text-6xl leading-tight text-balance max-w-3xl">
            Tre <span className="display-italic">avdelinger</span> i Vestfold
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl">
            Samme deig. Samme ovn. Samme oppskrifter siden 1987 — på tre adresser.
          </p>
        </div>
      </section>

      <section className="bg-[color:var(--color-paper)] py-20 sm:py-28">
        <div className="container-wide space-y-24">
          {data.restaurant.locations.map((loc, i) => {
            const meta = VENUE.find((v) => v.locationId === loc.id) ?? VENUE[i] ?? VENUE[0];
            const mapQuery = encodeURIComponent(`${loc.address}, ${loc.postalCode} ${loc.city}, Norge`);
            return (
              <article
                key={loc.id}
                id={loc.id}
                className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start scroll-mt-28"
              >
                <div className="lg:col-span-7">
                  <div className="relative aspect-[16/10] rounded-sm overflow-hidden">
                    <Image
                      src={meta.image}
                      alt={`${loc.name} interiør`}
                      fill
                      sizes="(min-width:1024px) 60vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-6 relative aspect-[16/9] rounded-sm overflow-hidden border border-border">
                    <iframe
                      title={`Kart over ${loc.name}`}
                      src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                      className="absolute inset-0 w-full h-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>

                <div className="lg:col-span-5 lg:sticky lg:top-28">
                  <p className="eyebrow mb-3">{loc.city}</p>
                  <h2 className="font-display text-3xl sm:text-4xl">{loc.name}</h2>
                  <p className="mt-3 display-italic text-lg text-[color:var(--color-stone-700)]">
                    {meta.tagline}
                  </p>

                  <ul className="mt-8 space-y-4 text-[color:var(--color-stone-700)]">
                    <li className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                      <span>{loc.address}<br />{loc.postalCode} {loc.city}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Phone className="h-5 w-5 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                      <a href={`tel:${(loc.phone ?? phone).replace(/\s/g, "")}`} className="hover:text-[color:var(--color-pomodoro)]">
                        {loc.phone ?? phone}
                      </a>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="h-5 w-5 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                      <div>
                        <div>Hver dag 10:00 — 22:00</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Nettbestilling stenger kl. 21
                        </div>
                      </div>
                    </li>
                  </ul>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild className="rounded-full px-6">
                      <Link href="/bestill">Bestill herfra</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full px-6">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Veibeskrivelse
                      </a>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {hours.length > 0 && (
          <div className="container-page mt-24 max-w-md mx-auto text-center">
            <p className="eyebrow mb-3">Åpningstider</p>
            <ul className="mt-4 space-y-1 text-sm">
              {hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.day}</span>
                  <span className="tabular-nums">{h.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
