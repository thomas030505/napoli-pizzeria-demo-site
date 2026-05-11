import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { fetchMenu, type Category, type Product } from "@/lib/lettbestilt";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { pickFallback } from "@/components/home/PopularDishes";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Meny — Napolitansk pizza, pasta og salater",
  description:
    "Hele menyen til Napoli Pizzeria: vedfyrt pizza, hjemmelaget pasta, salater og dessert. Priser i NOK.",
  alternates: { canonical: "/meny" },
};

export default async function MenuPage() {
  const data = await fetchMenu({ revalidate: 300 });

  // Dedupe categories by name (since menu has duplicates across two menus)
  const seen = new Map<string, Category>();
  for (const c of data.categories) {
    const existing = seen.get(c.name);
    if (!existing) {
      seen.set(c.name, c);
    } else {
      // Merge unique products by name
      const names = new Set(existing.products.map((p) => p.name));
      for (const p of c.products) if (!names.has(p.name)) existing.products.push(p);
    }
  }
  const categories = [...seen.values()].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <section className="bg-[color:var(--color-pane)] border-b border-border">
        <div className="container-wide py-16 sm:py-24">
          <p className="eyebrow mb-4">Il menù</p>
          <h1 className="font-display text-4xl sm:text-6xl leading-tight text-balance max-w-3xl">
            Vår <span className="display-italic">meny</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl">
            Klassisk napolitansk: dobbel sertifisert &lsquo;00&rsquo;-mel, San Marzano-tomater
            DOP, fior di latte og fersk basilikum. Bunnen står i vedovnen i 90 sekunder.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <a
                key={c.id}
                href={`#${slugify(c.name)}`}
                className="inline-flex items-center px-4 py-2 rounded-full border border-border bg-card hover:border-[color:var(--color-pomodoro)] hover:text-[color:var(--color-pomodoro)] transition-colors text-sm"
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-paper)] py-16 sm:py-24">
        <div className="container-wide space-y-20">
          {categories.map((c) => (
            <div key={c.id} id={slugify(c.name)} className="scroll-mt-28">
              <div className="flex items-baseline gap-4 mb-10">
                <h2 className="font-display text-3xl sm:text-4xl">{c.name}</h2>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {c.products.length} retter
                </span>
              </div>

              <ul className="grid gap-8 sm:gap-10 lg:grid-cols-2">
                {c.products.map((p) => (
                  <MenuItem key={p.id} product={p} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="container-wide mt-24 text-center">
          <Button asChild size="lg" className="rounded-full px-10 py-7">
            <Link href="/bestill">Gå til bestilling</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function MenuItem({ product }: { product: Product }) {
  return (
    <li className="flex gap-5 sm:gap-6">
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-sm bg-muted">
        <Image
          src={product.imageUrl ?? pickFallback(product.name)}
          alt={product.name}
          fill
          sizes="120px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <h3 className="font-display text-xl truncate">{product.name}</h3>
          <span aria-hidden className="flex-1 border-b border-dotted border-stone-500/40 translate-y-[-4px]" />
          <span className="font-display text-lg tabular-nums shrink-0">
            {formatMoney(product.basePrice)}
          </span>
        </div>
        {product.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
            {product.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.isPopular && <Tag>Populær</Tag>}
          {product.isVegetarian && <Tag tone="green">Vegetarisk</Tag>}
          {product.isVegan && <Tag tone="green">Vegansk</Tag>}
        </div>
      </div>
    </li>
  );
}

function Tag({ children, tone = "red" }: { children: React.ReactNode; tone?: "red" | "green" }) {
  const color =
    tone === "green"
      ? "bg-[color:var(--color-basilico)]/10 text-[color:var(--color-basilico)]"
      : "bg-[color:var(--color-pomodoro)]/10 text-[color:var(--color-pomodoro)]";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[0.65rem] uppercase tracking-[0.15em] font-medium ${color}`}>
      {children}
    </span>
  );
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
