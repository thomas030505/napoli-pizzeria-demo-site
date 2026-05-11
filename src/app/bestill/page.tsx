import type { Metadata } from "next";
import { fetchMenu } from "@/lib/lettbestilt";
import { LocationPicker } from "@/components/order/LocationPicker";
import { PickerRedirect } from "@/components/order/PickerRedirect";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Bestill napolitansk pizza — velg avdeling",
  description:
    "Velg avdeling — Tønsberg, Nøtterøy eller Sandefjord — og bestill ekte napolitansk pizza for henting.",
  alternates: { canonical: "/bestill" },
};

export default async function BestillPickerPage() {
  const data = await fetchMenu({ revalidate: 600 });

  return (
    <div className="bg-background">
      <PickerRedirect mode="bestill" />
      <section className="relative overflow-hidden border-b border-border bg-[color:var(--color-pane)]">
        <div className="container-wide py-14 sm:py-20 relative">
          <p className="eyebrow mb-4">Ordina online</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground text-balance max-w-3xl leading-[1.05]">
            Hvilken <span className="display-italic">avdeling</span> vil du
            bestille fra?
          </h1>
          <p className="mt-5 text-muted-foreground max-w-xl text-base sm:text-lg">
            Hver avdeling har sin egen meny. Velg hvor du vil hente, så viser vi
            det de har klar i dag.
          </p>
        </div>
      </section>

      <LocationPicker locations={data.restaurant.locations} mode="bestill" />
    </div>
  );
}
