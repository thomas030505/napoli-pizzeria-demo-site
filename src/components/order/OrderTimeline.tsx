import {
  CheckCircle2,
  ChefHat,
  ClipboardCheck,
  CreditCard,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { OrderStatus } from "@/lib/lettbestilt";

type Step = {
  key: string;
  label: string;
  sublabel: string;
  icon: typeof ShoppingBag;
};

const PICKUP_STEPS: Step[] = [
  { key: "PENDING", label: "Mottatt", sublabel: "Vi har bestillingen din", icon: ShoppingBag },
  { key: "CONFIRMED", label: "Bekreftet", sublabel: "Kjøkkenet starter snart", icon: ClipboardCheck },
  { key: "PREPARING", label: "Tilberedes", sublabel: "Maten lages nå", icon: ChefHat },
  { key: "READY_FOR_PICKUP", label: "Klar", sublabel: "Hent når du kan", icon: PackageCheck },
  { key: "COMPLETED", label: "Hentet", sublabel: "Takk for bestillingen!", icon: CheckCircle2 },
];

const DELIVERY_STEPS: Step[] = [
  { key: "PENDING", label: "Mottatt", sublabel: "Vi har bestillingen din", icon: ShoppingBag },
  { key: "CONFIRMED", label: "Bekreftet", sublabel: "Kjøkkenet starter snart", icon: ClipboardCheck },
  { key: "PREPARING", label: "Tilberedes", sublabel: "Maten lages nå", icon: ChefHat },
  { key: "OUT_FOR_DELIVERY", label: "Underveis", sublabel: "Sjåføren er på vei", icon: Truck },
  { key: "COMPLETED", label: "Levert", sublabel: "Takk for bestillingen!", icon: CheckCircle2 },
];

const PAYMENT_STEP: Step = {
  key: "AWAITING_PAYMENT",
  label: "Betaling",
  sublabel: "Venter på bekreftelse",
  icon: CreditCard,
};

function getStepIndex(status: OrderStatus, steps: Step[]): number {
  // Map raw status -> step index. PAID counts as CONFIRMED progress.
  const normalized: Record<string, string> = {
    AWAITING_PAYMENT: "AWAITING_PAYMENT",
    PENDING: "PENDING",
    PAID: "CONFIRMED",
    CONFIRMED: "CONFIRMED",
    PREPARING: "PREPARING",
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    COMPLETED: "COMPLETED",
  };
  const target = normalized[status];
  const idx = steps.findIndex((s) => s.key === target);
  return idx;
}

export function OrderTimeline({
  status,
  fulfillment,
}: {
  status: OrderStatus;
  fulfillment: "PICKUP" | "DELIVERY";
}) {
  if (status === "CANCELLED" || status === "FAILED") {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <p className="font-display text-lg text-destructive">
          {status === "CANCELLED" ? "Bestillingen er avbrutt" : "Noe gikk galt"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ta kontakt med restauranten dersom dette virker feil.
        </p>
      </div>
    );
  }

  const baseSteps = fulfillment === "DELIVERY" ? DELIVERY_STEPS : PICKUP_STEPS;
  const steps =
    status === "AWAITING_PAYMENT" ? [PAYMENT_STEP, ...baseSteps] : baseSteps;
  const activeIdx = Math.max(0, getStepIndex(status, steps));
  const isComplete = status === "COMPLETED";
  const total = steps.length;
  // Progress fill: percentage between dot centers (0 -> first, 100 -> last)
  const fillPct = total > 1 ? (activeIdx / (total - 1)) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm overflow-hidden">
      {/* Mobile: vertical timeline */}
      <ol className="sm:hidden relative space-y-5">
        <span
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-stone-200"
        />
        <span
          aria-hidden
          className="absolute left-[19px] top-2 w-0.5 bg-gradient-to-b from-primary via-primary to-secondary transition-all duration-700"
          style={{ height: `calc(${fillPct}% * 0.96)` }}
        />
        {steps.map((step, i) => {
          const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
          const Icon = step.icon;
          return (
            <li key={step.key} className="relative pl-12">
              <span
                className={`absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border-2 transition-colors ${
                  state === "done"
                    ? "bg-secondary border-secondary text-secondary-foreground"
                    : state === "active"
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "bg-stone-100 border-stone-200 text-stone-400"
                }`}
              >
                {state === "active" && (
                  <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
                )}
                <Icon className="relative h-4 w-4" strokeWidth={2.5} />
              </span>
              <p
                className={`font-medium leading-tight ${
                  state === "pending" ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {state === "active" ? step.sublabel : state === "done" ? "Ferdig" : "Venter"}
              </p>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal timeline */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* base track */}
          <div className="absolute left-5 right-5 top-5 h-1 rounded-full bg-stone-200" />
          {/* progress fill */}
          <div
            className="absolute left-5 top-5 h-1 rounded-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-700"
            style={{ width: `calc((100% - 2.5rem) * ${fillPct} / 100)` }}
          />
          <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${total}, minmax(0,1fr))` }}>
            {steps.map((step, i) => {
              const state =
                isComplete && i === total - 1
                  ? "done"
                  : i < activeIdx
                  ? "done"
                  : i === activeIdx
                  ? "active"
                  : "pending";
              const Icon = step.icon;
              return (
                <li key={step.key} className="flex flex-col items-center text-center">
                  <span
                    className={`relative grid h-10 w-10 place-items-center rounded-full border-2 transition-all ${
                      state === "done"
                        ? "bg-secondary border-secondary text-secondary-foreground"
                        : state === "active"
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                        : "bg-stone-50 border-stone-200 text-stone-400"
                    }`}
                  >
                    {state === "active" && (
                      <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
                    )}
                    <Icon className="relative h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <p
                    className={`mt-3 text-sm font-medium leading-tight ${
                      state === "pending" ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="hidden md:block text-[11px] text-muted-foreground mt-1 max-w-[120px]">
                    {state === "active"
                      ? step.sublabel
                      : state === "done"
                      ? "Ferdig"
                      : "Venter"}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
