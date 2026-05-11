"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MapPin, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/store/cart";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CheckoutForm } from "./CheckoutForm";
import type { HoursOverride, Location, OpeningHour, UpsellConfig } from "@/lib/lettbestilt";

function useHasMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function CartSheet({
  upsell,
  orderingOpen,
  closedReason,
  locations,
  openingHours,
  hoursOverrides,
  prepMinutes,
}: {
  upsell: UpsellConfig | null;
  orderingOpen: boolean;
  closedReason: string | null;
  locations: Location[];
  openingHours: OpeningHour[];
  hoursOverrides: HoursOverride[];
  prepMinutes: number;
}) {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const removeLine = useCart((s) => s.removeLine);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const lastAddedAt = useCart((s) => s.lastAddedAt);
  const [open, setOpen] = useState(false);
  const hydrated = useHasMounted();
  const [checkout, setCheckout] = useState(false);
  const [bumping, setBumping] = useState(false);
  const firstRunRef = useRef(true);

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (!lastAddedAt) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBumping(true);
    const t = setTimeout(() => setBumping(false), 450);
    return () => clearTimeout(t);
  }, [lastAddedAt]);

  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const primaryLocation = locations[0];
  const street = primaryLocation?.address?.trim();
  const streetIsReal = !!street && street.length > 1 && !/^x+$/i.test(street);
  const pickupHeadline = primaryLocation
    ? streetIsReal
      ? `Hent på ${street}`
      : `Hent på ${
          [primaryLocation.postalCode, primaryLocation.city].filter(Boolean).join(" ") ||
          primaryLocation.name
        }`
    : "Henting";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className={`fixed z-30 shadow-lg rounded-sm h-13 sm:h-14 px-5 sm:px-6 left-4 right-4 sm:left-auto sm:right-8 bottom-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-8 transition-transform duration-200 motion-safe:active:scale-[0.97] ${
            bumping ? "motion-safe:[animation:var(--animate-cart-bump)]" : ""
          }`}
        >
          <ShoppingBag className="h-5 w-5 mr-2" />
          {hydrated ? `Handlekurv (${count})` : "Handlekurv"}
          {hydrated && count > 0 && (
            <span
              key={subtotal}
              className="ml-2 font-semibold motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
            >
              {formatMoney(subtotal)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-background"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-display text-2xl">
            {checkout ? "Bestilling" : "Handlekurv"}
          </SheetTitle>
        </SheetHeader>

        {!checkout && primaryLocation && locations.length === 1 && (
          <div className="px-6 py-3 bg-secondary/8 border-b border-secondary/15 flex items-start gap-2.5">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-secondary text-secondary-foreground">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <div className="text-sm leading-tight">
              <p className="font-medium text-foreground">{pickupHeadline}</p>
              {streetIsReal && primaryLocation.postalCode && primaryLocation.city && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {primaryLocation.postalCode} {primaryLocation.city}
                </p>
              )}
            </div>
          </div>
        )}

        {!checkout ? (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {!hydrated || lines.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Handlekurven er tom.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {lines.map((l, idx) => {
                    const lineUnit = l.unitPrice + l.addons.reduce((a, b) => a + b.price, 0);
                    return (
                      <li
                        key={l.lineId}
                        className="rounded-lg border border-border bg-card p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300"
                        style={
                          idx < 8
                            ? { animationDelay: `${idx * 30}ms`, animationFillMode: "both" }
                            : undefined
                        }
                      >
                        <div className="flex justify-between gap-3 mb-1">
                          <h4 className="font-medium leading-snug">{l.productName}</h4>
                          <span
                            key={lineUnit * l.quantity}
                            className="font-semibold text-secondary whitespace-nowrap motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200"
                          >
                            {formatMoney(lineUnit * l.quantity)}
                          </span>
                        </div>
                        {l.variantName && (
                          <p className="text-xs text-muted-foreground">{l.variantName}</p>
                        )}
                        {l.addons.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            + {l.addons.map((a) => a.name).join(", ")}
                          </p>
                        )}
                        {l.notes && (
                          <p className="text-xs italic text-muted-foreground mt-1">
                            «{l.notes}»
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center rounded-sm border border-border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-sm motion-safe:active:scale-90 motion-safe:transition-transform motion-safe:duration-100"
                              onClick={() => updateQuantity(l.lineId, l.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span
                              key={l.quantity}
                              className="w-8 text-center text-sm font-medium tabular-nums motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-150"
                            >
                              {l.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-sm motion-safe:active:scale-90 motion-safe:transition-transform motion-safe:duration-100"
                              onClick={() => updateQuantity(l.lineId, l.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive motion-safe:active:scale-95 motion-safe:transition-transform"
                            onClick={() => removeLine(l.lineId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {upsell && upsell.isActive && upsell.products.length > 0 && hydrated && lines.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Andre bestilte også dette!
                  </h4>
                  <div className="space-y-2">
                    {upsell.products.slice(0, 3).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          useCart.getState().addLine({
                            productId: p.id,
                            productName: p.name,
                            unitPrice: p.basePrice,
                            addons: [],
                            quantity: 1,
                          });
                        }}
                        className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 hover:border-secondary/50 transition-all text-left motion-safe:active:scale-[0.98]"
                      >
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-sm text-secondary">
                          + {formatMoney(p.basePrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3 bg-stone-100/60">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Sum</span>
                <span
                  key={subtotal}
                  className="font-semibold text-foreground motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200"
                >
                  {hydrated ? formatMoney(subtotal) : "—"}
                </span>
              </div>
              {!orderingOpen && closedReason && (
                <p className="text-xs text-center text-muted-foreground bg-background rounded-md p-2">
                  {closedReason}
                </p>
              )}
              <Button
                size="lg"
                className="w-full motion-safe:active:scale-[0.98] motion-safe:transition-transform"
                disabled={!hydrated || lines.length === 0 || !orderingOpen}
                onClick={() => setCheckout(true)}
              >
                {orderingOpen ? "Til bestilling" : "Stengt for nettbestilling"}
              </Button>
            </div>
          </>
        ) : (
          <CheckoutForm
            onBack={() => setCheckout(false)}
            onClose={() => setOpen(false)}
            locations={locations}
            openingHours={openingHours}
            hoursOverrides={hoursOverrides}
            prepMinutes={prepMinutes}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

