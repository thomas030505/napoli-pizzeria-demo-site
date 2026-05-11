import type { Location } from "./lettbestilt";

export function formatPickupAddress(
  loc: Pick<Location, "address" | "postalCode" | "city" | "name">
): string {
  const street = loc.address?.trim();
  const cityLine = [loc.postalCode, loc.city].filter(Boolean).join(" ").trim();
  const streetIsRealAddress = street && street.length > 1 && !/^x+$/i.test(street);
  if (streetIsRealAddress && cityLine) return `${street}, ${cityLine}`;
  if (streetIsRealAddress) return street;
  return cityLine || loc.name;
}
