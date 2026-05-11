import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock } from "lucide-react";
import { fetchMenu, type Location } from "@/lib/lettbestilt";
import { formatOpeningHoursTable, getRestaurantStatus } from "@/lib/opening-hours";

const VENUE_IMAGES = [
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1100&q=80",
];

export async function LocationsBlock() {
  let locations: Location[] = [];
  let hoursTable: ReturnType<typeof formatOpeningHoursTable> = [];
  let phone = "+47 33 00 00 00";
  let isOpen = false;
  try {
    const data = await fetchMenu({ cache: "no-store" });
    locations = data.restaurant.locations;
    hoursTable = formatOpeningHoursTable(data.restaurant.openingHours);
    phone = data.restaurant.phone ?? phone;
    isOpen = getRestaurantStatus(data.restaurant.openingHours, data.restaurant.hoursOverrides).isOpen;
  } catch {
    return null;
  }

  return (
    <section className="py-24 sm:py-32 bg-[color:var(--color-pane)]">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="eyebrow mb-4">Besøk oss</p>
          <h2 className="font-display text-3xl sm:text-5xl leading-tight text-balance">
            Tre avdelinger i <span className="display-italic">Vestfold</span>
          </h2>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm">
            <span
              className={`relative flex h-2.5 w-2.5 ${isOpen ? "" : "opacity-50"}`}
              aria-hidden
            >
              {isOpen && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-basilico)] opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  isOpen ? "bg-[color:var(--color-basilico)]" : "bg-[color:var(--color-stone-500)]"
                }`}
              />
            </span>
            <span className="text-[color:var(--color-stone-700)]">
              {isOpen ? "Åpent nå — vi tar imot bestillinger" : "Stengt akkurat nå"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {locations.map((loc, i) => (
            <article
              key={loc.id}
              className="bg-card border border-border rounded-sm overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[5/3]">
                <Image
                  src={VENUE_IMAGES[i % VENUE_IMAGES.length]}
                  alt={`${loc.name} interiør`}
                  fill
                  sizes="(min-width:1024px) 33vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 bg-[color:var(--color-pane)]/95 text-[color:var(--color-forno)] text-[0.65rem] uppercase tracking-[0.25em] px-3 py-1.5">
                  {loc.city}
                </span>
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <h3 className="font-display text-2xl">{loc.name}</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-[color:var(--color-stone-700)]">
                  <li className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                    <span>
                      {loc.address}, {loc.postalCode} {loc.city}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                    <a href={`tel:${(loc.phone ?? phone).replace(/\s/g, "")}`} className="hover:text-[color:var(--color-pomodoro)]">
                      {loc.phone ?? phone}
                    </a>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Clock className="h-4 w-4 mt-0.5 text-[color:var(--color-pomodoro)] shrink-0" />
                    <span>Hver dag 10–22</span>
                  </li>
                </ul>
                <Link
                  href={`/lokasjoner#${loc.id}`}
                  className="mt-6 inline-flex items-center text-sm text-[color:var(--color-pomodoro)] hover:gap-2 transition-all gap-1"
                >
                  Se kart & detaljer →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {hoursTable.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-stone-700)]">
              Åpningstider · Alle avdelinger
            </p>
            <p className="mt-2 font-display text-xl">Hver dag 10:00 — 22:00</p>
            <p className="mt-1 text-xs text-muted-foreground">Nettbestillingen stenger kl. 21.</p>
          </div>
        )}
      </div>
    </section>
  );
}
