import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ByttAvdelingLink } from "@/components/order/ByttAvdeling";
import { fetchMenu, type Product } from "@/lib/lettbestilt";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { pickFallback } from "@/components/home/PopularDishes";
import { LOCATIONS, findLocationBySlug } from "@/lib/locations";
import { filterMenuForLocation } from "@/lib/menu-filter";

export const revalidate = 300;

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ by: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ by: string }>;
}): Promise<Metadata> {
  const { by } = await params;
  const meta = findLocationBySlug(by);
  if (!meta) return { title: "Meny" };
  return {
    title: `Meny — Napoli Pizzeria ${meta.city}`,
    description: `Hele menyen til Napoli Pizzeria ${meta.city}: vedfyrt pizza, hjemmelaget pasta, salater og dessert.`,
    alternates: { canonical: `/meny/${meta.slug}` },
  };
}

export default async function MenuPage({
  params,
}: {
  params: Promise<{ by: string }>;
}) {
  const { by } = await params;
  const meta = findLocationBySlug(by);
  if (!meta) notFound();

  const data = await fetchMenu({ revalidate: 300 });
  const location = data.restaurant.locations.find((l) => l.id === meta.locationId);
  if (!location) notFound();

  const { categories } = filterMenuForLocation(data, meta.locationId);

  return (
    <>
      <section className="bg-[color:var(--color-pane)] border-b border-border">
        <div className="container-wide py-16 sm:py-24">
          <div className="mb-4 flex items-center gap-3">
            <p className="eyebrow">Il menù</p>
            <span className="text-muted-foreground/50">·</span>
            <p className="text-sm text-muted-foreground">{meta.city}</p>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl leading-tight text-balance max-w-3xl">
            Meny — <span className="display-italic">{location.name}</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl">
            Klassisk napolitansk: dobbel sertifisert &lsquo;00&rsquo;-mel, San
            Marzano-tomater DOP, fior di latte og fersk basilikum. Bunnen står i
            vedovnen i 90 sekunder.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <ByttAvdelingLink mode="meny" />
          </div>
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
        {categories.length === 0 && (
          <div className="container-wide text-center pb-16">
            <p className="font-display text-2xl mb-3">
              Menyen for {location.name} kommer snart.
            </p>
            <p className="text-muted-foreground max-w-md mx-auto">
              I mellomtiden — ring{" "}
              <a
                href={`tel:${(location.phone ?? data.restaurant.phone ?? "").replace(/\s/g, "")}`}
                className="text-[color:var(--color-pomodoro)] hover:underline"
              >
                {location.phone ?? data.restaurant.phone ?? "33 00 00 00"}
              </a>{" "}
              eller velg en annen avdeling.
            </p>
          </div>
        )}
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
            <Link href={`/bestill/${meta.slug}`}>Gå til bestilling</Link>
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
