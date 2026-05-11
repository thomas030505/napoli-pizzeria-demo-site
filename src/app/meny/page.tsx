import type { Metadata } from "next";
import { fetchMenu } from "@/lib/lettbestilt";
import { LocationPicker } from "@/components/order/LocationPicker";
import { PickerRedirect } from "@/components/order/PickerRedirect";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Meny — velg avdeling",
  description:
    "Hver avdeling har sin egen meny. Velg Tønsberg, Nøtterøy eller Sandefjord for å se hva de serverer.",
  alternates: { canonical: "/meny" },
};

export default async function MenyPickerPage() {
  const data = await fetchMenu({ revalidate: 600 });

  return (
    <>
      <PickerRedirect mode="meny" />
      <section className="bg-[color:var(--color-pane)] border-b border-border">
        <div className="container-wide py-16 sm:py-24">
          <p className="eyebrow mb-4">Il menù</p>
          <h1 className="font-display text-4xl sm:text-6xl leading-tight text-balance max-w-3xl">
            Velg <span className="display-italic">avdeling</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl">
            Tre avdelinger, tre menyer. Klassisk napolitansk på alle — men hver
            har sine egne favoritter.
          </p>
        </div>
      </section>

      <LocationPicker locations={data.restaurant.locations} mode="meny" />
    </>
  );
}
