"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronLeft, Clock, Loader2, ShoppingBag, Utensils } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/store/cart";
import {
  placeOrder,
  previewAutoCoupon,
  validateCoupon,
  type AutoPromoPreview,
  type CreateOrderInput,
  type HoursOverride,
  type Location,
  type OpeningHour,
} from "@/lib/lettbestilt";
import { getPickupTimeSlots } from "@/lib/opening-hours";
import { toast } from "sonner";

const STRIPE_ENABLED = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true";

export function CheckoutForm({
  onBack,
  onClose,
  locations,
  openingHours,
  hoursOverrides,
  prepMinutes,
  payment,
}: {
  onBack: () => void;
  onClose: () => void;
  locations: Location[];
  openingHours: OpeningHour[];
  hoursOverrides: HoursOverride[];
  prepMinutes: number;
  payment?: { card: boolean; vipps: boolean; cash: boolean };
}) {
  const lines = useCart((s) => s.lines);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const orderType = useCart((s) => s.orderType);
  const setOrderType = useCart((s) => s.setOrderType);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [autoPromo, setAutoPromo] = useState<Extract<AutoPromoPreview, { applies: true }> | null>(null);
  // Resolver hvilke betalingsmetoder som er på basert på dashbordet (eller fall tilbake
  // til Stripe + Cash som før hvis API ikke har returnert payment-feltet ennå).
  const allowedPayment = useMemo(() => {
    if (!payment) {
      return { card: STRIPE_ENABLED, vipps: false, cash: true };
    }
    return payment;
  }, [payment]);
  const initialPaymentMethod: "STRIPE" | "VIPPS" | "CASH" = allowedPayment.card
    ? "STRIPE"
    : allowedPayment.vipps
    ? "VIPPS"
    : "CASH";
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "CASH" | "VIPPS">(
    initialPaymentMethod
  );
  // Hvis flagget for valgt metode skrur seg av (f.eks. API-payload endres), auto-velg neste.
  useEffect(() => {
    if (paymentMethod === "STRIPE" && !allowedPayment.card) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentMethod(allowedPayment.vipps ? "VIPPS" : "CASH");
    } else if (paymentMethod === "VIPPS" && !allowedPayment.vipps) {
      setPaymentMethod(allowedPayment.card ? "STRIPE" : "CASH");
    } else if (paymentMethod === "CASH" && !allowedPayment.cash) {
      setPaymentMethod(allowedPayment.card ? "STRIPE" : "VIPPS");
    }
  }, [allowedPayment, paymentMethod]);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [locationId, setLocationId] = useState<string>(locations[0]?.id ?? "");
  const [pickupTime, setPickupTime] = useState<string>("ASAP");

  const pickupSlots = useMemo(
    () => getPickupTimeSlots(openingHours, hoursOverrides, prepMinutes),
    [openingHours, hoursOverrides, prepMinutes]
  );

  const pickupLabel = useMemo(() => {
    if (pickupTime === "ASAP") return `Så fort som mulig (ca. ${prepMinutes} min)`;
    const slot = pickupSlots.find((s) => s.value === pickupTime);
    return slot ? `Kl. ${slot.label}` : `Så fort som mulig (ca. ${prepMinutes} min)`;
  }, [pickupTime, pickupSlots, prepMinutes]);

  // Stabil fingeravtrykk for kurven så effekten kun trigger ved reelle endringer.
  const cartFingerprint = useMemo(
    () =>
      lines
        .map((l) => {
          const addonTotal = l.addons.reduce((a, x) => a + x.price, 0);
          const lineTotal = (l.unitPrice + addonTotal) * l.quantity;
          return `${l.productId}:${l.variantName ?? ""}:${l.quantity}:${lineTotal}`;
        })
        .join("|"),
    [lines],
  );

  // Forhåndsvis auto-tilbud — server re-evaluerer ved order-create.
  useEffect(() => {
    if (couponDiscount > 0) {
      setAutoPromo(null);
      return;
    }
    if (lines.length === 0 || subtotal <= 0) {
      setAutoPromo(null);
      return;
    }
    const controller = new AbortController();
    const cart = lines.map((l) => {
      const addonTotal = l.addons.reduce((a, x) => a + x.price, 0);
      return {
        productId: l.productId,
        quantity: l.quantity,
        variantName: l.variantName ?? null,
        lineTotal: (l.unitPrice + addonTotal) * l.quantity,
      };
    });
    previewAutoCoupon({
      subtotal,
      ...(locationId ? { locationId } : {}),
      fulfillment: "PICKUP",
      cart,
    })
      .then((res) => {
        if (controller.signal.aborted) return;
        setAutoPromo(res.applies ? res : null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAutoPromo(null);
      });
    return () => controller.abort();
  }, [cartFingerprint, subtotal, locationId, couponDiscount, lines]);

  const effectiveDiscount = couponDiscount > 0 ? couponDiscount : autoPromo?.discount ?? 0;
  const total = subtotal - effectiveDiscount;
  const formValid =
    name.trim().length >= 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    consent &&
    lines.length > 0;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await validateCoupon({
        code: couponCode.trim().toUpperCase(),
        subtotal,
      });
      if (res.valid) {
        setCouponDiscount(res.discount);
        toast.success(`Kupongkode aktivert: -${formatMoney(res.discount)}`);
      } else {
        setCouponDiscount(0);
        setCouponError(reasonToMessage(res.reason));
      }
    } catch {
      setCouponError("Kunne ikke validere kupong. Prøv igjen.");
    } finally {
      setValidatingCoupon(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid || submitting) return;
    setSubmitting(true);
    try {
      const payload: CreateOrderInput = {
        locationId: locationId || undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          addonIds: l.addons.map((a) => a.id),
          quantity: l.quantity,
          notes: l.notes,
        })),
        fulfillment: "PICKUP",
        orderType,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim() || undefined,
        pickupNotes: pickupNotes.trim() || undefined,
        requestedPickupAt:
          orderType === "TAKEAWAY" && pickupTime !== "ASAP" ? pickupTime : undefined,
        couponCode: couponDiscount > 0 ? couponCode.trim().toUpperCase() : undefined,
        paymentMethod,
        locale: "nb",
        consentGivenAt: new Date().toISOString(),
      };
      const res = await placeOrder(payload, window.location.origin);
      if (paymentMethod === "STRIPE") {
        const stripeUrl = (res as { stripeUrl?: unknown }).stripeUrl;
        if (typeof stripeUrl !== "string") {
          throw new Error("Mangler Stripe-betalingslenke. Prøv igjen.");
        }
        clear();
        onClose();
        window.location.href = stripeUrl;
        return;
      }
      if (paymentMethod === "VIPPS") {
        const vippsUrl = (res as { vippsUrl?: unknown }).vippsUrl;
        if (typeof vippsUrl !== "string") {
          throw new Error("Mangler Vipps-betalingslenke. Prøv igjen.");
        }
        clear();
        onClose();
        window.location.href = vippsUrl;
        return;
      }
      clear();
      onClose();
      window.location.href = `/order/${res.publicToken}`;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Bestillingen feilet. Prøv igjen.";
      toast.error(message);
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex flex-col overflow-hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-250"
    >
      <div className="px-6 py-3 border-b border-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Tilbake til kurven
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div>
          <h3 className="font-display text-lg mb-3">Hvor skal du spise?</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOrderType("DINE_IN")}
              aria-pressed={orderType === "DINE_IN"}
              className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-2 font-semibold transition-colors motion-safe:active:scale-[0.98] motion-safe:transition-transform ${
                orderType === "DINE_IN"
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border bg-card text-foreground hover:border-secondary/40"
              }`}
            >
              <Utensils className="h-8 w-8" />
              <span>Sitte i restauranten</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderType("TAKEAWAY")}
              aria-pressed={orderType === "TAKEAWAY"}
              className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-2 font-semibold transition-colors motion-safe:active:scale-[0.98] motion-safe:transition-transform ${
                orderType === "TAKEAWAY"
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border bg-card text-foreground hover:border-secondary/40"
              }`}
            >
              <ShoppingBag className="h-8 w-8" />
              <span>Takeaway</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg mb-1">Kontaktinformasjon</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Vi sender en kvittering på e-post.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Navn *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                maxLength={100}
              />
            </div>
            <div>
              <Label htmlFor="email">E-post *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                autoComplete="tel"
                pattern="\d{8}"
                maxLength={8}
                placeholder="91929910"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg mb-3">
            {orderType === "DINE_IN" ? "Servering" : "Henting"}
          </h3>
          {locations.length > 1 ? (
            <div className="mb-3">
              <Label className="mb-1.5 block">Velg avdeling *</Label>
              <RadioGroup
                value={locationId}
                onValueChange={setLocationId}
                className="space-y-2"
              >
                {locations.map((loc) => (
                  <Label
                    key={loc.id}
                    htmlFor={`loc-${loc.id}`}
                    className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-secondary has-[:checked]:border-secondary has-[:checked]:bg-secondary/5"
                  >
                    <RadioGroupItem id={`loc-${loc.id}`} value={loc.id} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{loc.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {loc.address}, {loc.postalCode} {loc.city}
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          ) : locations[0] ? (
            (() => {
              const loc = locations[0];
              const street = loc.address?.trim();
              const streetIsReal = !!street && street.length > 1 && !/^x+$/i.test(street);
              const cityLine = [loc.postalCode, loc.city].filter(Boolean).join(" ");
              return (
                <div className="mb-3 rounded-lg bg-secondary/8 border border-secondary/15 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                    {orderType === "DINE_IN" ? "Servering" : "Henting"}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {streetIsReal ? street : cityLine || loc.name}
                  </p>
                  {streetIsReal && cityLine && (
                    <p className="text-xs text-muted-foreground mt-0.5">{cityLine}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {orderType === "DINE_IN"
                      ? "Vi bringer maten til bordet."
                      : "Maten står klar når du kommer."}
                  </p>
                </div>
              );
            })()
          ) : (
            <div className="mb-3 rounded-lg bg-secondary/8 border border-secondary/15 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-1">
                {orderType === "DINE_IN" ? "Servering" : "Henting"}
              </p>
              <p className="text-sm font-medium text-foreground">Nedre Langgate 22</p>
              <p className="text-xs text-muted-foreground mt-0.5">3126 Tønsberg</p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {orderType === "DINE_IN"
                  ? "Vi bringer maten til bordet."
                  : "Maten står klar når du kommer."}
              </p>
            </div>
          )}
          {orderType === "TAKEAWAY" && (
          <div className="mb-3">
            <Label htmlFor="pickup-time" className="mb-1.5 block">
              Når vil du hente?
            </Label>
            <Select value={pickupTime} onValueChange={(v) => setPickupTime(v ?? "ASAP")}>
              <SelectTrigger
                id="pickup-time"
                className="w-full h-11 rounded-lg border-input bg-card data-[size=default]:h-11"
              >
                <span className="inline-flex items-center gap-2 flex-1 text-left">
                  <Clock className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="truncate">{pickupLabel}</span>
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="ASAP">
                  Så fort som mulig (ca. {prepMinutes} min)
                </SelectItem>
                {pickupSlots.map((slot) => (
                  <SelectItem key={slot.value} value={slot.value}>
                    Kl. {slot.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {pickupSlots.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Vi setter i gang så fort som mulig.
              </p>
            )}
          </div>
          )}
          <Label htmlFor="pickup-notes">Kommentar (valgfritt)</Label>
          <Textarea
            id="pickup-notes"
            value={pickupNotes}
            onChange={(e) => setPickupNotes(e.target.value)}
            placeholder={
              orderType === "DINE_IN"
                ? "F.eks. allergier, bord-nr …"
                : "F.eks. allergier, parkering …"
            }
            rows={2}
            maxLength={500}
          />
        </div>

        <div>
          <h3 className="font-display text-lg mb-3">Kupongkode</h3>
          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="VELKOMMEN10"
              className="uppercase"
              maxLength={64}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || validatingCoupon}
            >
              {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bruk"}
            </Button>
          </div>
          {couponError && (
            <p className="text-xs text-destructive mt-1.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200">
              {couponError}
            </p>
          )}
          {couponDiscount > 0 && (
            <p className="text-xs text-secondary font-medium mt-1.5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200">
              Aktiv kupong: -{formatMoney(couponDiscount)}
            </p>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg mb-3">Betaling</h3>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as "STRIPE" | "CASH" | "VIPPS")}
            className="space-y-2"
          >
            {allowedPayment.card && (
              <Label
                htmlFor="pay-stripe"
                className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-secondary has-[:checked]:border-secondary has-[:checked]:bg-secondary/5"
              >
                <RadioGroupItem id="pay-stripe" value="STRIPE" />
                <div className="flex-1">
                  <div className="font-medium">Kort på nett</div>
                  <div className="text-xs text-muted-foreground">
                    Betal trygt med Stripe.
                  </div>
                </div>
              </Label>
            )}
            {allowedPayment.vipps && (
              <Label
                htmlFor="pay-vipps"
                className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-secondary has-[:checked]:border-secondary has-[:checked]:bg-secondary/5"
              >
                <RadioGroupItem id="pay-vipps" value="VIPPS" />
                <div className="flex-1">
                  <div className="font-medium">Vipps</div>
                  <div className="text-xs text-muted-foreground">
                    Betal med Vipps på mobil.
                  </div>
                </div>
              </Label>
            )}
            {allowedPayment.cash && (
              <Label
                htmlFor="pay-cash"
                className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-secondary has-[:checked]:border-secondary has-[:checked]:bg-secondary/5"
              >
                <RadioGroupItem id="pay-cash" value="CASH" />
                <div className="flex-1">
                  <div className="font-medium">Betal ved henting</div>
                  <div className="text-xs text-muted-foreground">
                    Kontant eller kort i restauranten.
                  </div>
                </div>
              </Label>
            )}
          </RadioGroup>
        </div>

        <Label className="flex items-start gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-secondary"
          />
          <span className="text-muted-foreground">
            Jeg godtar at Napoli Pizzeria behandler mine kontaktopplysninger for å levere
            denne bestillingen.
          </span>
        </Label>
      </div>

      <div className="border-t border-border px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-3 bg-stone-100/60">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Sum</span>
            <span className="tabular-nums">{formatMoney(subtotal)}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-secondary motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200">
              <span>Kupong</span>
              <span className="tabular-nums">-{formatMoney(couponDiscount)}</span>
            </div>
          )}
          {couponDiscount === 0 && autoPromo && (
            <div className="flex justify-between text-secondary motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200">
              <span>Tilbud{autoPromo.coupon.displayName ? ` (${autoPromo.coupon.displayName})` : ""}</span>
              <span className="tabular-nums">-{formatMoney(autoPromo.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
            <span>Totalt</span>
            <span
              key={total}
              className="tabular-nums motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
            >
              {formatMoney(total)}
            </span>
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full motion-safe:active:scale-[0.98] motion-safe:transition-transform"
          disabled={!formValid || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sender bestilling …
            </>
          ) : paymentMethod === "STRIPE" || paymentMethod === "VIPPS" ? (
            `Gå til betaling — ${formatMoney(total)}`
          ) : (
            `Bekreft bestilling — ${formatMoney(total)}`
          )}
        </Button>
      </div>
    </form>
  );
}

function reasonToMessage(reason: string): string {
  switch (reason) {
    case "UNKNOWN_OR_INACTIVE":
      return "Ukjent eller utgått kupongkode.";
    case "NOT_YET_VALID":
      return "Kupongen er ikke gyldig ennå.";
    case "EXPIRED":
      return "Kupongen er utgått.";
    case "EXHAUSTED":
      return "Kupongen er brukt opp.";
    case "MINIMUM_NOT_MET":
      return "Du må handle for mer for å bruke denne kupongen.";
    case "WRONG_LOCATION":
      return "Kupongen gjelder ikke denne lokasjonen.";
    default:
      return "Kupong ugyldig.";
  }
}
