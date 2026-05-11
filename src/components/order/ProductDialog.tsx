"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus } from "lucide-react";
import {
  buildAllergenIndex,
  resolveAddonGroups,
  type Allergen,
  type Category,
  type Product,
  type Restaurant,
} from "@/lib/lettbestilt";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/store/cart";
import { toast } from "sonner";

export function ProductDialog({
  product,
  category,
  restaurant,
  allergens,
  open,
  onOpenChange,
}: {
  product: Product;
  category: Category;
  restaurant: Restaurant;
  allergens: Allergen[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const groups = useMemo(
    () => resolveAddonGroups(product, category, restaurant),
    [product, category, restaurant]
  );
  const productAllergens = useMemo(() => {
    const { byCode } = buildAllergenIndex(allergens);
    return product.allergens
      .map((code) => byCode.get(code))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== undefined)
      .sort((a, b) => a.number - b.number);
  }, [allergens, product.allergens]);
  const defaultVariant =
    product.variants.find((v) => v.isDefault) ?? product.variants[0];

  const [variantId, setVariantId] = useState<string | undefined>(
    defaultVariant?.id
  );
  const [selectedAddons, setSelectedAddons] = useState<Record<string, Set<string>>>({});
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  const addLine = useCart((s) => s.addLine);

  const variant = product.variants.find((v) => v.id === variantId);
  const unitPrice = variant ? variant.price : product.basePrice;

  const flatAddons = Object.values(selectedAddons)
    .flatMap((set) => Array.from(set))
    .map((id) =>
      groups
        .flatMap((g) => g.addons.map((a) => ({ ...a, groupId: g.id })))
        .find((a) => a.id === id)
    )
    .filter(Boolean) as Array<{ id: string; name: string; price: number }>;

  const addonsTotal = flatAddons.reduce((sum, a) => sum + a.price, 0);
  const lineTotal = (unitPrice + addonsTotal) * qty;

  const validation = validate(groups, selectedAddons);

  function toggleAddon(groupId: string, addonId: string, single: boolean) {
    setSelectedAddons((prev) => {
      const next = { ...prev };
      const group = groups.find((g) => g.id === groupId)!;
      const cur = new Set(prev[groupId] ?? []);
      if (single) {
        cur.clear();
        cur.add(addonId);
      } else {
        if (cur.has(addonId)) cur.delete(addonId);
        else if (cur.size < group.maxSelect) cur.add(addonId);
      }
      next[groupId] = cur;
      return next;
    });
  }

  function handleAdd() {
    if (!validation.ok) {
      toast.error(validation.message ?? "Velg de påkrevde tilleggene");
      return;
    }
    addLine({
      productId: product.id,
      productName: product.name,
      variantId: variant?.id,
      variantName: variant?.name,
      unitPrice,
      addons: flatAddons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
      quantity: qty,
      notes: notes.trim() || undefined,
    });
    toast.success(`Lagt til ${qty}× ${product.name}`);
    onOpenChange(false);
    setQty(1);
    setNotes("");
    setSelectedAddons({});
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto p-0 gap-0 sm:max-h-[90vh]">
        <div className="relative px-6 pt-7 pb-1">
          <div className="absolute top-0 left-6 h-0.5 w-12 bg-primary" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {category.name}
          </p>
        </div>
        <div className="px-6 pt-2 pb-6 space-y-5">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-2xl">{product.name}</DialogTitle>
            {product.description && (
              <DialogDescription className="text-base text-muted-foreground">
                {product.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {productAllergens.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Inneholder allergener
              </Label>
              <ul className="flex flex-wrap gap-1.5">
                {productAllergens.map(({ number, allergen }) => (
                  <li
                    key={allergen.code}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-2 py-1"
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-secondary/10 text-secondary text-[11px] font-semibold tabular-nums">
                      {number}
                    </span>
                    <span className="text-xs text-foreground">{allergen.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.variants.length > 0 && (
            <div>
              <Label className="text-sm font-semibold mb-3 block">Velg størrelse</Label>
              <RadioGroup
                value={variantId}
                onValueChange={setVariantId}
                className="space-y-2"
              >
                {product.variants
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((v) => (
                    <Label
                      key={v.id}
                      htmlFor={v.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-secondary has-[:checked]:border-secondary has-[:checked]:bg-secondary/5"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id={v.id} value={v.id} />
                        <span className="font-medium">{v.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-secondary">
                        {formatMoney(v.price)}
                      </span>
                    </Label>
                  ))}
              </RadioGroup>
            </div>
          )}

          {groups.map((g) => {
            const selected = selectedAddons[g.id] ?? new Set();
            const single = g.maxSelect === 1;
            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold">
                    {g.name}
                    {g.isRequired && (
                      <span className="ml-1.5 text-xs text-primary">påkrevd</span>
                    )}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {single ? "Velg 1" : `Maks ${g.maxSelect}`}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {g.addons
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((a) => (
                      <Label
                        key={a.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-secondary has-[:checked]:border-secondary has-[:checked]:bg-secondary/5"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type={single ? "radio" : "checkbox"}
                            name={g.id}
                            checked={selected.has(a.id)}
                            onChange={() => toggleAddon(g.id, a.id, single)}
                            className="h-4 w-4 accent-secondary"
                          />
                          <span className="text-sm">{a.name}</span>
                        </div>
                        {a.price > 0 && (
                          <span className="text-xs font-semibold text-muted-foreground">
                            +{formatMoney(a.price)}
                          </span>
                        )}
                      </Label>
                    ))}
                </div>
              </div>
            );
          })}

          <div>
            <Label htmlFor="notes" className="text-sm font-semibold mb-2 block">
              Kommentar (valgfritt)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="F.eks. uten løk, ekstra stekt …"
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="inline-flex items-center rounded-sm border border-border shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-sm h-11 w-11 sm:h-10 sm:w-10 motion-safe:active:scale-90 motion-safe:transition-transform motion-safe:duration-100"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span
                key={qty}
                className="w-9 text-center font-medium tabular-nums motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-150"
              >
                {qty}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-sm h-11 w-11 sm:h-10 sm:w-10 motion-safe:active:scale-90 motion-safe:transition-transform motion-safe:duration-100"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              onClick={handleAdd}
              disabled={!validation.ok}
              className="flex-1 motion-safe:active:scale-[0.98] motion-safe:transition-transform"
            >
              <span className="truncate">
                Legg til — <span key={lineTotal} className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">{formatMoney(lineTotal)}</span>
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function validate(
  groups: ReturnType<typeof resolveAddonGroups>,
  selected: Record<string, Set<string>>
): { ok: boolean; message?: string } {
  for (const g of groups) {
    const cur = selected[g.id]?.size ?? 0;
    if (g.isRequired && cur < g.minSelect) {
      return { ok: false, message: `Velg minst ${g.minSelect} fra "${g.name}"` };
    }
    if (cur > g.maxSelect) {
      return { ok: false, message: `Maks ${g.maxSelect} fra "${g.name}"` };
    }
  }
  return { ok: true };
}
