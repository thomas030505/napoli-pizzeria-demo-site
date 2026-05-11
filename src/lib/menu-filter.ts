import type { Category, Menu, MenuResponse, Product } from "./lettbestilt";

export type FilteredMenu = {
  menus: Menu[];
  categories: Category[];
};

/**
 * Filter the LettBestilt menu response down to a single location.
 *
 * Includes: menus where locationId === null (restaurant-wide) OR matches.
 * Categories are kept only if their menuId belongs to a kept menu.
 * When the same product name appears across multiple kept menus, the menu
 * with the higher priority wins (LettBestilt semantics).
 */
export function filterMenuForLocation(
  data: MenuResponse,
  locationId: string,
): FilteredMenu {
  const menus = data.menus
    .filter((m) => m.locationId === null || m.locationId === locationId)
    .sort((a, b) => b.priority - a.priority);

  const menuIds = new Set(menus.map((m) => m.id));
  const priorityByMenuId = new Map(menus.map((m) => [m.id, m.priority] as const));

  const byKey = new Map<string, Category>();
  for (const c of data.categories) {
    if (!menuIds.has(c.menuId)) continue;
    const key = c.name.trim().toLowerCase();
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...c, products: [...c.products] });
      continue;
    }
    // Merge: dedupe products by name, prefer higher-priority menu's variant
    const existingPrio = priorityByMenuId.get(existing.menuId) ?? 0;
    const incomingPrio = priorityByMenuId.get(c.menuId) ?? 0;
    const winner = incomingPrio > existingPrio ? c : existing;
    const loser = incomingPrio > existingPrio ? existing : c;
    const merged = mergeProducts(winner.products, loser.products);
    byKey.set(key, { ...winner, products: merged });
  }

  const categories = [...byKey.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  return { menus, categories };
}

function mergeProducts(primary: Product[], secondary: Product[]): Product[] {
  const seen = new Set(primary.map((p) => p.name.trim().toLowerCase()));
  const out = [...primary];
  for (const p of secondary) {
    const key = p.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}
