import { Star } from "lucide-react";
import { REVIEWS } from "@/content/reviews";

export function Reviews() {
  return (
    <section className="py-24 sm:py-32 bg-[color:var(--color-paper)] border-y border-border">
      <div className="container-wide">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="eyebrow mb-4">Hva gjestene sier</p>
          <h2 className="font-display text-3xl sm:text-5xl leading-tight text-balance">
            <span className="display-italic">4,8 stjerner</span> på Google
          </h2>
          <div className="mt-4 flex justify-center items-center gap-1.5 text-[color:var(--color-olivolio)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
            <span className="ml-2 text-xs text-[color:var(--color-stone-700)] uppercase tracking-[0.2em]">
              over 340 anmeldelser
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure
              key={r.author}
              className="bg-card border border-border p-7 rounded-sm flex flex-col"
            >
              <div className="flex gap-0.5 text-[color:var(--color-olivolio)] mb-4">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="text-[color:var(--color-forno)] leading-relaxed text-pretty">
                &ldquo;{r.body}&rdquo;
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-border flex items-baseline justify-between">
                <span className="font-medium text-sm">{r.author}</span>
                <span className="text-xs text-muted-foreground">
                  {r.location} · {r.date}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
