import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchOrder } from "@/lib/lettbestilt";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { OrderAutoRefresh } from "./OrderAutoRefresh";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { formatPickupAddress } from "@/lib/format";
import {
  CheckCircle2,
  ChefHat,
  ClipboardCheck,
  CreditCard,
  MapPin,
  PackageCheck,
  Phone,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PAYMENT: "Venter på betaling",
  PENDING: "Mottatt",
  PAID: "Betalt – kjøkkenet starter",
  CONFIRMED: "Bekreftet",
  PREPARING: "Tilberedes nå",
  READY_FOR_PICKUP: "Klar for henting",
  OUT_FOR_DELIVERY: "Underveis til deg",
  COMPLETED: "Fullført",
  CANCELLED: "Avbrutt",
  FAILED: "Feilet",
};

type Tone = "primary" | "secondary" | "accent" | "destructive" | "muted";

const STATUS_TONE: Record<string, Tone> = {
  AWAITING_PAYMENT: "accent",
  PENDING: "primary",
  PAID: "primary",
  CONFIRMED: "primary",
  PREPARING: "primary",
  READY_FOR_PICKUP: "secondary",
  OUT_FOR_DELIVERY: "secondary",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  FAILED: "destructive",
};

const STATUS_ICON = {
  AWAITING_PAYMENT: CreditCard,
  PENDING: ShoppingBag,
  PAID: ClipboardCheck,
  CONFIRMED: ClipboardCheck,
  PREPARING: ChefHat,
  READY_FOR_PICKUP: PackageCheck,
  OUT_FOR_DELIVERY: Truck,
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
  FAILED: XCircle,
} as const;

const STATUS_TAGLINE: Record<string, string> = {
  AWAITING_PAYMENT: "Fullfør betalingen så går vi i gang.",
  PENDING: "Vi har sendt bestillingen videre til kjøkkenet.",
  PAID: "Betaling mottatt – kjøkkenet starter snart.",
  CONFIRMED: "Bekreftet av kjøkkenet. Vi varmer opp ovnen.",
  PREPARING: "Pizzaen er i ovnen og griller, kebab spinner. 🔥",
  READY_FOR_PICKUP: "Maten din står klar – kom innom når det passer.",
  OUT_FOR_DELIVERY: "Sjåføren er på vei med bestillingen.",
  COMPLETED: "Takk for at du valgte Napoli Pizzeria. Vel bekomme!",
  CANCELLED: "Bestillingen ble avbrutt.",
  FAILED: "Noe gikk galt med bestillingen.",
};

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let order;
  try {
    order = await fetchOrder(token);
  } catch {
    notFound();
  }

  const statusLabel = STATUS_LABEL[order.status] ?? order.status;
  const statusTagline = STATUS_TAGLINE[order.status] ?? "";
  const tone: Tone = STATUS_TONE[order.status] ?? "primary";
  const StatusIcon = STATUS_ICON[order.status as keyof typeof STATUS_ICON] ?? ShoppingBag;
  const isLive = !["COMPLETED", "CANCELLED", "FAILED"].includes(order.status);
  const isReady = order.status === "READY_FOR_PICKUP";
  const isComplete = order.status === "COMPLETED";
  const etaSource = order.requestedPickupAt ?? order.estimatedReadyAt;
  const eta = etaSource
    ? new Date(etaSource).toLocaleTimeString("nb-NO", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Oslo",
      })
    : null;
  const etaLabel = isReady ? "Klar fra" : "Klar ca.";

  const toneClasses: Record<Tone, { bg: string; ring: string; text: string; dot: string; gradient: string }> = {
    primary: {
      bg: "bg-primary/10",
      ring: "ring-primary/20",
      text: "text-primary",
      dot: "bg-primary",
      gradient: "from-primary/15 via-primary/5 to-transparent",
    },
    secondary: {
      bg: "bg-secondary/10",
      ring: "ring-secondary/25",
      text: "text-secondary",
      dot: "bg-secondary",
      gradient: "from-secondary/20 via-secondary/5 to-transparent",
    },
    accent: {
      bg: "bg-accent/10",
      ring: "ring-accent/25",
      text: "text-accent",
      dot: "bg-accent",
      gradient: "from-accent/15 via-accent/5 to-transparent",
    },
    destructive: {
      bg: "bg-destructive/10",
      ring: "ring-destructive/25",
      text: "text-destructive",
      dot: "bg-destructive",
      gradient: "from-destructive/15 via-destructive/5 to-transparent",
    },
    muted: {
      bg: "bg-muted",
      ring: "ring-border",
      text: "text-muted-foreground",
      dot: "bg-muted-foreground",
      gradient: "from-muted via-transparent to-transparent",
    },
  };
  const t = toneClasses[tone];

  return (
    <div className="min-h-screen bg-background">
      {isLive && <OrderAutoRefresh intervalMs={10_000} />}

      {/* Hero header with tone-driven gradient */}
      <div
        className={`relative overflow-hidden border-b border-border bg-gradient-to-b ${t.gradient}`}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "16px 16px",
            color: "currentColor",
          }}
        />
        <div className="container-page max-w-2xl pt-10 sm:pt-14 pb-6 relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span>Bestilling #{order.orderNumber}</span>
            {isLive && (
              <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-secondary/15 text-secondary px-2 py-0.5 text-[10px]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
                </span>
                Live
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl mt-2 text-balance">
            {order.restaurant.trackingHeaderText ??
              (isComplete
                ? "Takk for besøket!"
                : isReady
                ? "Maten er klar 🎉"
                : "Takk for bestillingen!")}
          </h1>
          {order.customer?.name && (
            <p className="text-muted-foreground mt-1">
              Hei {order.customer.name.split(" ")[0]} – her er statusen din.
            </p>
          )}
        </div>
      </div>

      <main className="container-page max-w-2xl py-6 sm:py-8 space-y-6">
        {/* Status hero card */}
        <section
          className={`relative overflow-hidden rounded-2xl ring-1 ${t.ring} ${t.bg} p-6 sm:p-7`}
        >
          <div className="flex items-start gap-4">
            <span
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${t.dot} text-white shadow-lg`}
            >
              <StatusIcon className="h-7 w-7" strokeWidth={2.25} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <p className={`font-display text-2xl sm:text-3xl mt-0.5 ${t.text}`}>
                {statusLabel}
              </p>
              {statusTagline && (
                <p className="text-sm text-foreground/70 mt-1.5">{statusTagline}</p>
              )}
            </div>
            {order.restaurant.trackingShowEta && eta && !isComplete && (
              <div className="text-right shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {etaLabel}
                </p>
                <p className={`font-display text-2xl mt-0.5 ${t.text} tabular-nums`}>
                  {eta}
                </p>
              </div>
            )}
          </div>

          {order.restaurant.trackingPickupInstructions && isReady && (
            <div className="mt-5 rounded-xl bg-background/70 border border-border p-3.5 text-sm text-foreground whitespace-pre-line">
              {order.restaurant.trackingPickupInstructions}
            </div>
          )}
        </section>

        {/* Progress timeline */}
        <OrderTimeline status={order.status} fulfillment={order.fulfillment} />

        {/* Pickup / location card */}
        {order.location && (() => {
          const formattedAddress = formatPickupAddress(order.location);
          const phone = order.location.phone?.trim();
          const hasRealPhone = !!phone && phone.length > 1 && !/^x+$/i.test(phone);
          const hasCoords =
            typeof order.location.latitude === "number" &&
            typeof order.location.longitude === "number";
          const mapQuery = hasCoords
            ? `${order.location.latitude},${order.location.longitude}`
            : formattedAddress;
          const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
          return (
            <section className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-start gap-3 p-5 sm:p-6 bg-secondary/5 border-b border-secondary/15">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                  {order.fulfillment === "DELIVERY" ? (
                    <Truck className="h-5 w-5" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    {order.fulfillment === "DELIVERY" ? "Leveringsadresse" : "Hentested"}
                  </p>
                  <p className="font-medium mt-0.5">{order.location.name}</p>
                  <p className="text-sm text-muted-foreground">{formattedAddress}</p>
                </div>
              </div>
              {hasRealPhone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 p-4 hover:bg-stone-100/60 transition-colors border-b border-border"
                >
                  <Phone className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">{phone}</span>
                  <span className="ml-auto text-xs text-muted-foreground">Ring oss</span>
                </a>
              )}
              <iframe
                src={mapSrc}
                title="Kart til hentested"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-video w-full border-0"
              />
            </section>
          );
        })()}

        {/* Order items */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Din bestilling</h2>
            <span className="text-xs text-muted-foreground">
              {order.items.reduce((s, i) => s + i.quantity, 0)} ting
            </span>
          </div>
          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex gap-3 min-w-0">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary text-xs font-bold tabular-nums">
                    {item.quantity}×
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm leading-snug">
                      {item.productName}
                      {item.variantName && (
                        <span className="text-muted-foreground"> — {item.variantName}</span>
                      )}
                    </p>
                    {item.addons.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        + {item.addons.map((a) => a.name).join(", ")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic">
                        «{item.notes}»
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {formatMoney(item.lineTotal)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-border space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Sum</span>
              <span className="tabular-nums">{formatMoney(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-secondary font-medium">
                <span>Rabatt{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span className="tabular-nums">-{formatMoney(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
              <span>Totalt</span>
              <span className="tabular-nums text-primary">{formatMoney(order.total)}</span>
            </div>
            {order.payment && (
              <p className="text-xs text-muted-foreground pt-2 flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" />
                Betaling:{" "}
                {order.payment.provider === "CASH" ? "Ved henting" : "Stripe"}
                {order.payment.status === "CAPTURED" && (
                  <span className="text-secondary font-medium">· Mottatt</span>
                )}
                {order.payment.status === "AUTHORIZED" && (
                  <span className="text-accent font-medium">· Reservert</span>
                )}
              </p>
            )}
          </div>
        </section>

        {/* Review CTA */}
        {isComplete && order.restaurant.googleReviewUrl && (
          <section className="rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 text-center">
            <p className="font-display text-xl mb-1">Hvordan var maten?</p>
            <p className="text-sm text-muted-foreground mb-4">
              Vi setter veldig pris på en kort anmeldelse på Google.
            </p>
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <a href={order.restaurant.googleReviewUrl} target="_blank" rel="noopener">
                Skriv en anmeldelse
              </a>
            </Button>
          </section>
        )}

        <div className="flex justify-center pt-2 pb-4">
          <Button asChild variant="outline">
            <Link href="/">← Tilbake til forsiden</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
