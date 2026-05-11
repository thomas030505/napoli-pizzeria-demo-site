import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=2400&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[color:var(--color-forno)]/80" />
      </div>

      <div className="container-wide py-28 sm:py-40 text-center text-[color:var(--color-pane)]">
        <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--color-olivolio)] mb-5">
          Pronto?
        </p>
        <h2 className="font-display text-4xl sm:text-6xl leading-tight max-w-3xl mx-auto text-balance">
          Sulten?{" "}
          <span className="display-italic">Pizzaen er ferdig på 15 minutter.</span>
        </h2>
        <p className="mt-6 text-stone-200/85 max-w-xl mx-auto">
          Bestill på nett, hent når du vil — i Tønsberg, Nøtterøy eller Sandefjord.
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="rounded-full px-10 py-7 text-base shadow-xl">
            <Link href="/bestill">Bestill nå</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
