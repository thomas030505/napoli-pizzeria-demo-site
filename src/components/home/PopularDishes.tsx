import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchMenu, type Product } from "@/lib/lettbestilt";
import { formatMoney } from "@/lib/money";

export async function PopularDishes() {
  let products: Product[] = [];
  try {
    const data = await fetchMenu({ revalidate: 300 });
    const seen = new Set<string>();
    products = data.categories
      .flatMap((c) => c.products)
      .filter((p) => {
        if (!p.isPopular && !p.isRecommended) return false;
        if (seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
      })
      .slice(0, 4);
  } catch {
    return null;
  }
  if (products.length === 0) return null;

  return (
    <section className="py-24 sm:py-32 bg-[color:var(--color-paper)] border-y border-border">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <p className="eyebrow mb-4">Le specialità</p>
            <h2 className="font-display text-3xl sm:text-5xl leading-tight text-balance">
              Gjestenes <span className="display-italic">favoritter</span>
            </h2>
          </div>
          <Button asChild variant="outline" size="lg" className="rounded-full self-start sm:self-auto">
            <Link href="/meny">Se hele menyen →</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <DishCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DishCard({ product }: { product: Product }) {
  const fallback = pickFallback(product.name);
  return (
    <Link
      href="/bestill"
      className="group block rounded-sm overflow-hidden bg-card border border-border hover:border-[color:var(--color-pomodoro)]/40 transition-colors"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.imageUrl ?? fallback}
          alt={product.name}
          fill
          sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        {product.isPopular && (
          <span className="absolute top-3 left-3 bg-[color:var(--color-pomodoro)] text-[color:var(--color-pane)] text-[0.65rem] uppercase tracking-[0.2em] px-2.5 py-1">
            Populær
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl leading-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <div className="mt-4 flex items-end justify-between">
          <span className="font-display text-lg tabular-nums">{formatMoney(product.basePrice)}</span>
          <span className="text-xs text-[color:var(--color-pomodoro)] group-hover:translate-x-0.5 transition-transform">
            Bestill →
          </span>
        </div>
      </div>
    </Link>
  );
}

function pickFallback(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("margherita")) return "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=900&q=80";
  if (n.includes("diavola") || n.includes("pepperoni")) return "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80";
  if (n.includes("capricciosa") || n.includes("prosciutto")) return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80";
  if (n.includes("vegetar")) return "https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=900&q=80";
  if (n.includes("salat")) return "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=900&q=80";
  if (n.includes("pasta") || n.includes("carbonara") || n.includes("bolognese")) return "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80";
  if (n.includes("lasagne")) return "https://images.unsplash.com/photo-1619895092538-128f4d2b9e74?auto=format&fit=crop&w=900&q=80";
  if (n.includes("tiramisu")) return "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=80";
  return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80";
}

export { pickFallback };
