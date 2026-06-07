"use client";

import { useMemo, useState } from "react";
import type { MenuResponse } from "@/lib/lettbestilt";
import { ProductCard } from "./ProductCard";
import { CartSheet } from "./CartSheet";
import { AllergenLegend } from "./AllergenLegend";

export function OrderClient({
  data,
  orderingOpen,
  closedReason,
}: {
  data: MenuResponse;
  orderingOpen: boolean;
  closedReason: string | null;
}) {
  const sortedCategories = useMemo(
    () => [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [data.categories]
  );
  const [activeId, setActiveId] = useState(sortedCategories[0]?.id);

  return (
    <>
      <nav
        aria-label="Kategorier"
        className="sticky top-16 sm:top-20 z-30 border-b border-border bg-background/92 backdrop-blur-md shadow-[0_1px_0_0_rgba(31,27,23,0.04)]"
      >
        <div className="container-page py-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex gap-2 whitespace-nowrap">
            {sortedCategories.map((c) => (
              <li key={c.id}>
                <a
                  href={`#cat-${c.id}`}
                  onClick={() => setActiveId(c.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium border transition-all duration-200 motion-safe:active:scale-95 ${
                    activeId === c.id
                      ? "bg-secondary text-secondary-foreground border-secondary shadow-sm shadow-secondary/20"
                      : "text-foreground/70 border-border bg-card hover:text-secondary hover:border-secondary/40 hover:bg-secondary/5"
                  }`}
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="container-page py-8 sm:py-10 space-y-10 sm:space-y-12 pb-36 sm:pb-32">
        {sortedCategories.map((c, idx) => (
          <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-36 sm:scroll-mt-40">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      idx % 2 === 0 ? "bg-primary" : "bg-secondary"
                    }`}
                  />
                  <span
                    className={`h-px w-8 ${
                      idx % 2 === 0 ? "bg-primary/40" : "bg-secondary/40"
                    }`}
                  />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-foreground">
                  {c.name}
                </h2>
                {c.description && (
                  <p className="text-muted-foreground mt-1 max-w-2xl">{c.description}</p>
                )}
              </div>
              <span className="hidden sm:inline-flex shrink-0 text-xs text-muted-foreground tabular-nums">
                {c.products.length} retter
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[...c.products]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    category={c}
                    restaurant={data.restaurant}
                    allergens={data.allergens}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>

      <AllergenLegend allergens={data.allergens} />

      <CartSheet
        upsell={data.upsell}
        orderingOpen={orderingOpen}
        closedReason={closedReason}
        locations={data.restaurant.locations}
        openingHours={data.restaurant.openingHours}
        hoursOverrides={data.restaurant.hoursOverrides}
        prepMinutes={data.restaurant.defaultPrepMinutes}
        payment={data.restaurant.payment}
      />
    </>
  );
}
