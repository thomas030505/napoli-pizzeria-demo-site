export function formatMoney(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: ore % 100 === 0 ? 0 : 2,
  }).format(ore / 100);
}

export const toOre = (kr: number) => Math.round(kr * 100);
export const toKr = (ore: number) => ore / 100;
