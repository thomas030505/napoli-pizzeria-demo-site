import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { fetchMenu } from "@/lib/lettbestilt";
import { getRestaurantStatus, isOrderingOpen } from "@/lib/opening-hours";
import { OrderClient } from "@/components/order/OrderClient";
import { LOCATIONS, findLocationBySlug } from "@/lib/locations";
import { filterMenuForLocation } from "@/lib/menu-filter";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ by: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ by: string }>;
}): Promise<Metadata> {
  const { by } = await params;
  const meta = findLocationBySlug(by);
  if (!meta) return { title: "Bestill" };
  return {
    title: `Bestill napolitansk pizza i ${meta.city}`,
    description: `Bestill ekte napolitansk pizza fra Napoli Pizzeria ${meta.city} for henting.`,
    alternates: { canonical: `/bestill/${meta.slug}` },
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ by: string }>;
}) {
  const { by } = await params;
  const meta = findLocationBySlug(by);
  if (!meta) notFound();

  const data = await fetchMenu({ cache: "no-store" });
  const location = data.restaurant.locations.find((l) => l.id === meta.locationId);
  if (!location) notFound();

  const filtered = filterMenuForLocation(data, meta.locationId);
  const hasMenu = filtered.categories.length > 0;
  const scopedData = {
    ...data,
    categories: filtered.categories,
    menus: filtered.menus,
    restaurant: {
      ...data.restaurant,
      locations: [location],
    },
  };

  const status = getRestaurantStatus(
    data.restaurant.openingHours,
    data.restaurant.hoursOverrides,
  );
  const orderingOpen = isOrderingOpen(
    data.restaurant.openingHours,
    data.restaurant.hoursOverrides,
  );
  const closedReason = !status.isOpen
    ? status.nextOpenLabel ?? "Vi har stengt akkurat nå."
    : !orderingOpen
    ? "Nettbestillingen stenger én time før kjøkkenet."
    : null;

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border bg-[color:var(--color-pane)]">
        <div className="container-wide py-14 sm:py-20 relative">
          <div className="mb-4 flex items-center gap-3">
            <p className="eyebrow">Ordina online</p>
            <span className="text-muted-foreground/50">·</span>
            <p className="text-sm text-muted-foreground">{meta.city}</p>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground text-balance max-w-3xl leading-[1.05]">
            Bestill fra <span className="display-italic">{location.name}</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl text-base sm:text-lg">
            {location.address}, {location.postalCode} {location.city}. Klar 15
            minutter etter bestilling.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {orderingOpen ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-basilico)]/12 text-[color:var(--color-basilico)] px-4 py-2 text-sm font-medium ring-1 ring-[color:var(--color-basilico)]/25">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-basilico)] opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--color-basilico)]" />
                </span>
                Åpen for nettbestilling
              </span>
            ) : (
              closedReason && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-medium ring-1 ring-primary/20">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {closedReason}
                </span>
              )
            )}
            <Link
              href="/bestill"
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-[color:var(--color-pomodoro)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Bytt avdeling
            </Link>
          </div>
        </div>
      </section>

      {hasMenu ? (
        <OrderClient
          data={scopedData}
          orderingOpen={orderingOpen}
          closedReason={closedReason}
        />
      ) : (
        <section className="container-wide py-20 text-center">
          <p className="font-display text-2xl mb-3">
            Nettbestilling for {location.name} kommer snart.
          </p>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ring oss på{" "}
            <a
              href={`tel:${(location.phone ?? data.restaurant.phone ?? "").replace(/\s/g, "")}`}
              className="text-[color:var(--color-pomodoro)] hover:underline"
            >
              {location.phone ?? data.restaurant.phone ?? "33 00 00 00"}
            </a>{" "}
            for å bestille — eller velg en annen avdeling.
          </p>
          <div className="mt-8">
            <Link
              href="/bestill"
              className="inline-flex items-center gap-1 rounded-full px-5 py-3 text-sm font-medium text-[color:var(--color-pomodoro)] hover:underline"
            >
              <ChevronLeft className="h-4 w-4" />
              Velg en annen avdeling
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
