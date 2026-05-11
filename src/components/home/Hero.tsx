import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame, MapPin } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[88vh] sm:min-h-screen flex items-center -mt-20 pt-20 overflow-hidden bg-[color:var(--color-forno)]">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=2400&q=80"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.55]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--color-forno)] via-[color:var(--color-forno)]/70 to-[color:var(--color-forno)]/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-forno)]/85 via-transparent to-transparent" />
      </div>

      <div className="container-wide w-full py-20 sm:py-32">
        <div className="max-w-2xl text-[color:var(--color-pane)]">
          <div className="flex items-center gap-3 mb-6">
            <span className="block h-px w-10 bg-[color:var(--color-olivolio)]" />
            <span className="text-[0.7rem] uppercase tracking-[0.32em] text-[color:var(--color-olivolio)] font-medium">
              Pizzeria napoletana · Vestfold · est. 1987
            </span>
          </div>

          <h1 className="font-display text-[2.75rem] sm:text-[3.75rem] lg:text-[4.75rem] leading-[1.02] text-balance">
            Napolitansk pizza.<br />
            Norsk by.{" "}
            <span className="display-italic text-[color:var(--color-olivolio)]">Trettini år.</span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-stone-200/90 max-w-xl leading-relaxed text-pretty">
            Vedfyrt steinovn fra Acunto i Napoli, 72 timers heving, og en oppskrift
            som har gått i arv siden Antonio åpnet i Nedre Langgate i 1987.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 py-6 text-base shadow-lg shadow-black/30"
            >
              <Link href="/bestill">Bestill nå</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 text-base bg-transparent border-stone-300/40 text-[color:var(--color-pane)] hover:bg-[color:var(--color-pane)]/10 hover:text-[color:var(--color-pane)]"
            >
              <Link href="/meny">Se menyen</Link>
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl">
            <Stat icon={<Flame className="h-4 w-4" />} label="485°C steinovn" sub="90 sek. pr. pizza" />
            <Stat icon={<span className="text-sm">72h</span>} label="Heving" sub="Rosarias deig" />
            <Stat icon={<MapPin className="h-4 w-4" />} label="3 avdelinger" sub="Vestfold" />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div aria-hidden className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-stone-300/60">
        <span className="text-[0.65rem] uppercase tracking-[0.3em]">Bla videre</span>
        <span className="block h-10 w-px bg-stone-300/40" />
      </div>
    </section>
  );
}

function Stat({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[color:var(--color-olivolio)] mb-1">
        {icon}
      </div>
      <div className="font-display text-xl leading-tight">{label}</div>
      <div className="text-xs text-stone-300/70 mt-0.5">{sub}</div>
    </div>
  );
}
