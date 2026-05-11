import type { Metadata } from "next";
import { fetchMenu } from "@/lib/lettbestilt";
import { getRestaurantStatus, isOrderingOpen } from "@/lib/opening-hours";
import { OrderClient } from "@/components/order/OrderClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bestill napolitansk pizza",
  description:
    "Bestill ekte napolitansk pizza fra Napoli Pizzeria — hent i Tønsberg, Nøtterøy eller Sandefjord, eller få levert.",
  alternates: { canonical: "/bestill" },
};

export default async function OrderPage() {
  const data = await fetchMenu({ cache: "no-store" });
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
          <p className="eyebrow mb-4">Ordina online</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground text-balance max-w-3xl leading-[1.05]">
            Bestill <span className="display-italic">napolitansk pizza</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl text-base sm:text-lg">
            Velg avdeling, sammensett din pizza, og hent — eller få levert. Vi har den
            klar 15 minutter etter bestilling.
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
          </div>
        </div>
      </section>

      <OrderClient data={data} orderingOpen={orderingOpen} closedReason={closedReason} />
    </div>
  );
}
