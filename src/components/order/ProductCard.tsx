"use client";

import { useState } from "react";
import type { Allergen, Category, Product, Restaurant } from "@/lib/lettbestilt";
import { formatMoney } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Flame, Leaf, Plus, Sparkles } from "lucide-react";
import { ProductDialog } from "./ProductDialog";

function minPrice(p: Product): number {
  if (p.variants.length === 0) return p.basePrice;
  return Math.min(...p.variants.map((v) => v.price));
}

export function ProductCard({
  product,
  category,
  restaurant,
  allergens,
}: {
  product: Product;
  category: Category;
  restaurant: Restaurant;
  allergens: Allergen[];
}) {
  const [open, setOpen] = useState(false);
  const hasBadge =
    product.isPopular ||
    product.isRecommended ||
    product.isVegetarian ||
    product.isVegan;
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group relative text-left rounded-sm border border-border bg-card p-4 sm:p-5 flex flex-col hover:border-secondary/50 hover:shadow-md motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] transition-all duration-200 w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      >
        {/* Decorative serif marker */}
        <span
          aria-hidden
          className="absolute top-0 left-4 sm:left-5 h-0.5 w-10 bg-primary group-hover:w-16 transition-[width] duration-300"
        />

        <div className="flex items-start justify-between gap-3 pr-12">
          <h3 className="font-display text-xl leading-tight text-foreground">
            {product.name}
          </h3>
        </div>

        {hasBadge && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.isPopular && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                <Flame className="h-3 w-3" /> Populær
              </span>
            )}
            {product.isRecommended && !product.isPopular && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-accent/15 text-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Anbefalt
              </span>
            )}
            {(product.isVegetarian || product.isVegan) && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-secondary/10 text-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                <Leaf className="h-3 w-3" /> {product.isVegan ? "Vegan" : "Vegetar"}
              </span>
            )}
          </div>
        )}

        {product.description && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Dotted leader between description and price */}
        <div className="mt-auto pt-4 flex items-end gap-3">
          <span className="text-base font-semibold text-foreground tabular-nums whitespace-nowrap">
            {product.variants.length > 0 && (
              <span className="text-xs uppercase tracking-wider text-muted-foreground mr-1">
                Fra
              </span>
            )}
            {formatMoney(minPrice(product))}
          </span>
          <span
            aria-hidden
            className="flex-1 mb-1 border-b border-dotted border-border"
          />
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="absolute right-3 top-3 sm:right-4 sm:top-4 h-10 w-10 sm:h-9 sm:w-9 p-0 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-90 transition-all duration-300 shadow-sm"
          tabIndex={-1}
          aria-label={`Legg til ${product.name}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ProductDialog
        product={product}
        category={category}
        restaurant={restaurant}
        allergens={allergens}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
