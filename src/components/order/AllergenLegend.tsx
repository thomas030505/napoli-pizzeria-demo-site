import { buildAllergenIndex, type Allergen } from "@/lib/lettbestilt";

export function AllergenLegend({ allergens }: { allergens: Allergen[] }) {
  if (!allergens || allergens.length === 0) return null;
  const { ordered } = buildAllergenIndex(allergens);

  return (
    <section
      aria-labelledby="allergen-heading"
      className="container-page pt-2 pb-36 sm:pb-32"
    >
      <div className="border-t border-border pt-8 sm:pt-10">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="h-px w-8 bg-primary/40" />
        </div>
        <h2
          id="allergen-heading"
          className="font-display text-2xl sm:text-3xl text-foreground"
        >
          Allergener
        </h2>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Hver rett er merket med tall som viser hvilke allergener den inneholder.
          Spør gjerne personalet ved tvil eller ved særskilte behov.
        </p>

        <ul className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {ordered.map(({ number, allergen }) => (
            <li
              key={allergen.code}
              className="flex items-center gap-2.5 rounded-sm border border-border bg-card px-3 py-2"
            >
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-secondary/10 text-secondary text-xs font-semibold tabular-nums">
                {number}
              </span>
              <span className="text-sm text-foreground truncate">
                {allergen.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
