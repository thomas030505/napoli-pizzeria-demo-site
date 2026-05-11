import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { STORY } from "@/content/story";

export function AboutTeaser() {
  return (
    <section className="py-24 sm:py-32 bg-[color:var(--color-pane)]">
      <div className="container-wide">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <p className="eyebrow mb-4">La famiglia</p>
            <h2 className="font-display text-3xl sm:text-5xl leading-[1.05] text-balance">
              Tre generasjoner.<br />
              <span className="display-italic">Én oppskrift.</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-[color:var(--color-stone-700)] leading-relaxed max-w-lg">
              Antonio De Luca åpnet en liten pizzeria i Nedre Langgate i 1987 med
              moren Rosarias deig-oppskrift i kofferten. I dag driver barnebarnet
              Giulia avdelingen i Sandefjord — med nøyaktig samme deig.
            </p>

            <blockquote className="mt-10 border-l-2 border-[color:var(--color-olivolio)] pl-6">
              <p className="display-italic text-xl sm:text-2xl text-[color:var(--color-forno)] leading-snug text-balance">
                &ldquo;{STORY.quote}&rdquo;
              </p>
              <footer className="mt-3 text-xs uppercase tracking-[0.22em] text-[color:var(--color-stone-700)]">
                — {STORY.quoteAuthor}, grunnlegger
              </footer>
            </blockquote>

            <div className="mt-10">
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/om-oss">Les hele historien →</Link>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative aspect-[4/5] max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <Image
                src="https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=1200&q=80"
                alt="Pizzaiolo strekker en deig foran vedfyrt steinovn"
                fill
                sizes="(min-width:1024px) 40vw, 80vw"
                className="object-cover rounded-sm"
              />
              {/* Decorative offset frame */}
              <div aria-hidden className="absolute inset-0 -translate-x-4 -translate-y-4 sm:-translate-x-6 sm:-translate-y-6 -z-10 border border-[color:var(--color-olivolio)]/60 rounded-sm" />
              {/* Year badge */}
              <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-[color:var(--color-pomodoro)] text-[color:var(--color-pane)] px-6 py-4 rounded-sm shadow-xl">
                <div className="font-display text-3xl leading-none">1987</div>
                <div className="text-[0.6rem] uppercase tracking-[0.25em] mt-1">Anno fondazione</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
