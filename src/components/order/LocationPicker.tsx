"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { Location } from "@/lib/lettbestilt";
import { LOCATIONS, LOCATION_STORAGE_KEY } from "@/lib/locations";

type Mode = "bestill" | "meny";

export function LocationPicker({
  locations,
  mode,
}: {
  locations: Location[];
  mode: Mode;
}) {
  const cards = LOCATIONS.map((meta) => {
    const live = locations.find((l) => l.id === meta.locationId);
    return { meta, live };
  }).filter((c) => c.live);

  if (cards.length === 0) {
    // Fallback: API didn't return any matching locations — show meta-only cards
    return (
      <div className="container-wide py-12">
        <p className="text-muted-foreground">
          Ingen avdelinger tilgjengelige akkurat nå. Vennligst prøv igjen om litt.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-[color:var(--color-paper)] py-16 sm:py-24">
      <div className="container-wide">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ meta, live }) => {
            const href = `/${mode}/${meta.slug}`;
            return (
              <Link
                key={meta.slug}
                href={href}
                onClick={() => rememberLocation(meta.slug)}
                className="group block overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--color-pomodoro)] hover:shadow-xl motion-safe:active:scale-[0.99]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={meta.image}
                    alt={`${live!.name} interiør`}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.22em] opacity-90">
                      {meta.city}
                    </p>
                    <h3 className="font-display text-2xl sm:text-3xl mt-1">
                      {live!.name}
                    </h3>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <p className="display-italic text-base text-[color:var(--color-stone-700)]">
                    {meta.tagline}
                  </p>
                  <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[color:var(--color-pomodoro)]" />
                    <span>
                      {live!.address}
                      <br />
                      {live!.postalCode} {live!.city}
                    </span>
                  </div>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-pomodoro)]">
                    {mode === "bestill" ? "Bestill herfra" : "Se menyen"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function rememberLocation(slug: string) {
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, slug);
  } catch {
    // ignore (private mode, storage disabled)
  }
}
