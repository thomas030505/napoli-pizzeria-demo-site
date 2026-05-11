/**
 * Zustand cart store — copy into src/store/cart.ts in the new project.
 * Persists to localStorage keyed by `<slug>-cart`.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  lineId: string;          // unique per cart entry (productId+variantId+addons hash)
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;       // øre, base + variant
  addons: Array<{ id: string; name: string; price: number }>;
  quantity: number;
  notes?: string;
};

type CartState = {
  lines: CartLine[];
  lastAddedAt: number;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  removeLine: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
};

const SLUG = process.env.NEXT_PUBLIC_SLUG ?? "restaurant";

function makeLineId(line: Omit<CartLine, "lineId">): string {
  const addonIds = [...line.addons.map((a) => a.id)].sort().join(",");
  return `${line.productId}:${line.variantId ?? ""}:${addonIds}:${line.notes ?? ""}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      lastAddedAt: 0,
      addLine: (line) => {
        const lineId = makeLineId(line);
        set((state) => {
          const existing = state.lines.find((l) => l.lineId === lineId);
          const now = Date.now();
          if (existing) {
            return {
              lastAddedAt: now,
              lines: state.lines.map((l) =>
                l.lineId === lineId ? { ...l, quantity: l.quantity + line.quantity } : l
              ),
            };
          }
          return {
            lastAddedAt: now,
            lines: [...state.lines, { ...line, lineId }],
          };
        });
      },
      removeLine: (lineId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.lineId !== lineId) })),
      updateQuantity: (lineId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.lineId !== lineId)
              : state.lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
        })),
      clear: () => set({ lines: [] }),
      subtotal: () =>
        get().lines.reduce((sum, l) => {
          const addonTotal = l.addons.reduce((a, x) => a + x.price, 0);
          return sum + (l.unitPrice + addonTotal) * l.quantity;
        }, 0),
    }),
    {
      name: `${SLUG}-cart`,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
