import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { STORY } from "@/content/story";

export const metadata: Metadata = {
  title: "Om oss — Fra Quartieri Spagnoli til Vestfold",
  description:
    "Antonio De Luca åpnet Napoli Pizzeria i Tønsberg i 1987. Tre generasjoner senere bakes samme deig i tre avdelinger i Vestfold.",
  alternates: { canonical: "/om-oss" },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate bg-[color:var(--color-forno)] text-[color:var(--color-pane)] overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1542528180-a1208c5169a5?auto=format&fit=crop&w=2400&q=80"
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-forno)]/70 to-[color:var(--color-forno)]" />
        </div>
        <div className="container-wide py-24 sm:py-36">
          <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--color-olivolio)] mb-5">
            La nostra storia
          </p>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05] max-w-3xl text-balance">
            Fra Quartieri Spagnoli<br />
            <span className="display-italic text-[color:var(--color-olivolio)]">til Vestfold.</span>
          </h1>
          <p className="mt-7 text-stone-200/85 max-w-2xl text-base sm:text-lg leading-relaxed">
            Tre generasjoner. Én oppskrift. Antonio De Luca tok med seg moren
            Rosaria sin deig nordover i 1987 — og deigen står fortsatt i ovnen
            samme måten, hver dag.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-[color:var(--color-pane)] py-24 sm:py-32">
        <div className="container-page">
          <p className="eyebrow mb-3">Tre kapitler</p>
          <h2 className="font-display text-3xl sm:text-5xl mb-16 text-balance">
            Bygd <span className="display-italic">stein for stein</span>
          </h2>

          <ol className="space-y-20">
            {STORY.paragraphs.map((p) => (
              <li key={p.year} className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-3">
                  <div className="font-display text-6xl sm:text-7xl text-[color:var(--color-pomodoro)] leading-none">
                    {p.year}
                  </div>
                  <div className="mt-3 gold-rule w-20" />
                </div>
                <div className="lg:col-span-9">
                  <h3 className="font-display text-2xl sm:text-3xl mb-4">{p.title}</h3>
                  <p className="text-[color:var(--color-stone-700)] leading-relaxed text-base sm:text-lg max-w-2xl text-pretty">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-[color:var(--color-paper)] border-y border-border py-28">
        <div className="container-page max-w-3xl text-center">
          <span aria-hidden className="font-display text-7xl text-[color:var(--color-olivolio)] leading-none">
            &ldquo;
          </span>
          <blockquote className="display-italic text-3xl sm:text-4xl lg:text-5xl text-[color:var(--color-forno)] leading-tight text-balance -mt-6">
            {STORY.quote}
          </blockquote>
          <footer className="mt-8 text-xs uppercase tracking-[0.22em] text-[color:var(--color-stone-700)]">
            — {STORY.quoteAuthor} · Grunnlegger, 1987
          </footer>
        </div>
      </section>

      {/* Ingredients */}
      <section className="bg-[color:var(--color-pane)] py-24 sm:py-32">
        <div className="container-wide grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-3">Le materie prime</p>
            <h2 className="font-display text-3xl sm:text-5xl leading-tight text-balance">
              Råvarene <span className="display-italic">vi velger</span>
            </h2>
            <p className="mt-5 text-[color:var(--color-stone-700)] leading-relaxed max-w-md">
              Det meste flys inn fra Campania to ganger i uka. Resten — basilikum,
              salater, melk — har vi fra lokale leverandører i Vestfold.
            </p>
          </div>
          <ul className="lg:col-span-7 divide-y divide-border border-y border-border">
            {STORY.ingredients.map((i) => (
              <li key={i.name} className="py-5 flex items-baseline justify-between gap-4">
                <span className="font-display text-xl sm:text-2xl">{i.name}</span>
                <span className="text-sm text-muted-foreground text-right shrink-0">
                  {i.origin}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[color:var(--color-paper)] border-t border-border py-20">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-balance">
            Smak forskjellen 39 år gjør.
          </h2>
          <div className="mt-8">
            <Button asChild size="lg" className="rounded-full px-10 py-7">
              <Link href="/bestill">Bestill nå</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
